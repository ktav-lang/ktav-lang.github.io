// Format conversion hub.
//
// Every conversion goes through a single intermediate representation: a
// plain JavaScript value (object / array / scalar). Each format has a
// `parse` (text -> JS value) and a `serialize` (JS value -> text). To
// convert A -> B we run parse_A then serialize_B. Ktav is backed by the
// official WASM bindings (vendored, self-contained, base64-embedded).
//
//   JSON / YAML / TOML / INI  <-->  (JS value)  <-->  KTAV
//
// Ktav is a *configuration* language: it intentionally does not support
// every shape JSON/YAML can express (e.g. keys are dotted paths, so a
// literal '.' in a key is ambiguous; the root must be an object/array).
// We surface those as non-fatal warnings rather than silently lying.

import ktavInit, {
    loads as ktavLoads,
    dumps as ktavDumps,
} from "../vendor/ktav/ktav.inline.js";
import jsyaml from "../vendor/js-yaml.mjs";
import { parse as tomlParse, stringify as tomlStringify } from "../vendor/smol-toml.mjs";

export const FORMATS = ["json", "yaml", "toml", "ini", "ktav"];

export const FORMAT_LABELS = {
    json: "JSON",
    yaml: "YAML",
    toml: "TOML",
    ini: "INI",
    ktav: "Ktav",
};

// --- WASM warm-up -------------------------------------------------------

let ktavReady = null;
export function ensureKtav() {
    return (ktavReady ??= ktavInit().then(() => undefined));
}

// --- Normalisation ------------------------------------------------------
//
// Different targets cope with different value kinds. We walk the tree
// once before serialisation, coercing the awkward cases and recording
// human-readable warnings about anything lossy.

function isPlainObject(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date);
}

// TomlDate (from smol-toml) and Date both expose toISOString.
function isDateLike(v) {
    return v instanceof Date || (v && typeof v === "object" && typeof v.toISOString === "function" && typeof v.getTime === "function");
}

function sanitize(value, target, warnings) {
    const seen = new Set();
    const walk = (v, path) => {
        if (v === null || v === undefined) {
            if (v === undefined) return undefined;
            if (target === "toml" || target === "ini") {
                warnings.add(`${FORMAT_LABELS[target]} has no null — \`${path || "(root)"}\` became an empty string`);
                return "";
            }
            return null;
        }
        const t = typeof v;
        if (t === "bigint") {
            if (target === "ktav") return v; // ktav keeps big integers verbatim
            if (target === "ini") return v.toString();
            // JSON / YAML / TOML: keep as number if it round-trips, else string
            const n = Number(v);
            if (BigInt(Math.trunc(n)) === v) return n;
            warnings.add(`big integer \`${path}\` exceeds safe range — emitted as a string`);
            return v.toString();
        }
        if (t === "number" || t === "boolean" || t === "string") return v;
        if (isDateLike(v)) {
            const iso = v.toISOString();
            return target === "toml" ? v : iso; // TOML has a native datetime; others get ISO text
        }
        if (Array.isArray(v)) {
            if (seen.has(v)) throw new Error("circular reference in input");
            seen.add(v);
            const out = v.map((item, i) => walk(item, `${path}[${i}]`)).filter((x) => x !== undefined);
            seen.delete(v);
            return out;
        }
        if (isPlainObject(v)) {
            if (seen.has(v)) throw new Error("circular reference in input");
            seen.add(v);
            const out = {};
            for (const [k, val] of Object.entries(v)) {
                const w = walk(val, path ? `${path}.${k}` : k);
                if (w !== undefined) out[k] = w;
            }
            seen.delete(v);
            return out;
        }
        // functions, symbols — shouldn't come out of any parser
        warnings.add(`unsupported value at \`${path}\` was dropped`);
        return undefined;
    };
    return walk(value, "");
}

// Ktav key hygiene. Since spec 0.6.0 a literal `.` or `:` in a key is
// representable — Ktav escapes them (`\.` / `\:`) so the key round-trips
// as a single literal, not a dotted path. Whitespace, `#`, and the
// structural brackets still can't appear in a key; we warn on those.
function auditKtavKeys(value, warnings) {
    const bad = /[\s#{}\[\]]/;
    const walk = (v, path) => {
        if (Array.isArray(v)) {
            v.forEach((item, i) => walk(item, `${path}[${i}]`));
        } else if (isPlainObject(v)) {
            for (const [k, val] of Object.entries(v)) {
                if (k.length === 0) {
                    warnings.add(`empty key encountered — not representable in Ktav`);
                } else if (bad.test(k)) {
                    warnings.add(`key "${k}" contains a character Ktav can't use in a key`);
                }
                walk(val, path ? `${path}.${k}` : k);
            }
        }
    };
    walk(value, "");
}

// --- INI (hand-rolled — small, predictable, dependency-free) -----------

function iniParse(text) {
    const root = {};
    let section = root;
    const setPath = (obj, parts, value) => {
        let cur = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const p = parts[i];
            if (!isPlainObject(cur[p])) cur[p] = {};
            cur = cur[p];
        }
        const last = parts[parts.length - 1];
        if (last.endsWith("[]")) {
            const key = last.slice(0, -2);
            if (!Array.isArray(cur[key])) cur[key] = [];
            cur[key].push(value);
        } else {
            cur[last] = value;
        }
    };
    const unquote = (s) => {
        s = s.trim();
        if (s.length >= 2 && ((s[0] === '"' && s.endsWith('"')) || (s[0] === "'" && s.endsWith("'")))) {
            return s.slice(1, -1);
        }
        return s;
    };
    for (let raw of text.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line[0] === ";" || line[0] === "#") continue;
        const sec = line.match(/^\[(.+?)\]$/);
        if (sec) {
            const parts = sec[1].split(".").map((p) => p.trim());
            let cur = root;
            for (const p of parts) {
                if (!isPlainObject(cur[p])) cur[p] = {};
                cur = cur[p];
            }
            section = cur;
            continue;
        }
        const eq = line.indexOf("=");
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        const value = unquote(line.slice(eq + 1));
        setPath(section, key.split("."), value);
    }
    return root;
}

function iniStringify(value) {
    if (!isPlainObject(value)) {
        throw new Error("INI top level must be an object (a section map)");
    }
    const esc = (s) => {
        const str = String(s);
        return /[\n;#=]/.test(str) || str.trim() !== str ? JSON.stringify(str) : str;
    };
    const scalarLines = [];
    const sections = [];
    const emitScalars = (obj, prefix, out) => {
        for (const [k, v] of Object.entries(obj)) {
            if (v === null || v === undefined) continue;
            if (Array.isArray(v)) {
                if (v.some((x) => x && typeof x === "object")) {
                    throw new Error(`INI can't represent an array of objects ("${prefix}${k}")`);
                }
                for (const item of v) out.push(`${k}[] = ${esc(item)}`);
            } else if (typeof v !== "object") {
                out.push(`${k} = ${esc(v)}`);
            }
        }
    };
    const walk = (obj, path) => {
        const here = [];
        emitScalars(obj, path ? path + "." : "", here);
        if (path === "") {
            scalarLines.push(...here);
        } else if (here.length) {
            sections.push(`[${path}]\n${here.join("\n")}`);
        } else {
            // a section with only nested children still deserves a header
            // only if it has no scalar lines and no children would be empty
        }
        for (const [k, v] of Object.entries(obj)) {
            if (isPlainObject(v)) walk(v, path ? `${path}.${k}` : k);
        }
    };
    walk(value, "");
    return [scalarLines.join("\n"), ...sections].filter(Boolean).join("\n\n") + "\n";
}

// --- Per-format parse / serialize --------------------------------------

const PARSERS = {
    json: (t) => JSON.parse(t),
    yaml: (t) => jsyaml.load(t),
    toml: (t) => tomlParse(t),
    ini: (t) => iniParse(t),
    ktav: (t) => ktavLoads(t),
};

const SERIALIZERS = {
    json: (v) => JSON.stringify(v, null, 2) + "\n",
    yaml: (v) => jsyaml.dump(v, { indent: 2, lineWidth: 100, noRefs: true }),
    toml: (v) => {
        if (!isPlainObject(v)) throw new Error("TOML top level must be a table (object)");
        return tomlStringify(v);
    },
    ini: (v) => iniStringify(v),
    ktav: (v) => ktavDumps(v),
};

/**
 * Convert `text` from `src` format to `dst` format.
 * Returns { ok, output, error, warnings }.
 */
export function convert(src, dst, text) {
    const warnings = new Set();
    if (!text.trim()) return { ok: true, output: "", error: null, warnings: [] };

    let value;
    try {
        value = PARSERS[src](text);
    } catch (e) {
        return { ok: false, output: "", error: `Can't parse ${FORMAT_LABELS[src]}: ${e.message}`, warnings: [] };
    }

    if (src === dst) {
        // still re-serialise so the output is canonicalised
    }

    // Root-shape guard shared by ktav / toml / ini.
    if ((dst === "ktav" || dst === "toml" || dst === "ini") &&
        !(isPlainObject(value) || (dst === "ktav" && Array.isArray(value)))) {
        const kind = Array.isArray(value) ? "an array" : `a ${value === null ? "null" : typeof value}`;
        return {
            ok: false,
            output: "",
            error: `${FORMAT_LABELS[dst]} needs an object${dst === "ktav" ? " or array" : ""} at the top level, but the input is ${kind}.`,
            warnings: [],
        };
    }

    if (dst === "ktav") auditKtavKeys(value, warnings);

    let normalized;
    try {
        normalized = sanitize(value, dst, warnings);
    } catch (e) {
        return { ok: false, output: "", error: e.message, warnings: [...warnings] };
    }

    let output;
    try {
        output = SERIALIZERS[dst](normalized);
    } catch (e) {
        return { ok: false, output: "", error: `Can't emit ${FORMAT_LABELS[dst]}: ${e.message}`, warnings: [...warnings] };
    }

    return { ok: true, output, error: null, warnings: [...warnings] };
}
