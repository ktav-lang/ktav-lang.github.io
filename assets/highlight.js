// Lightweight, synchronous syntax highlighters for the five formats.
//
// These are line/token scanners, not full parsers — fast enough to run on
// every keystroke behind a transparent <textarea> overlay. The Ktav
// highlighter is derived from the canonical TextMate grammar in
// `editor/grammars/ktav.tmLanguage.json` (the editor / VS Code grammar),
// with two corrections: comments are a single `#` (per spec § 3.4, the
// grammar's `##` is a bug) and the typed markers `:i` / `:f` are coloured
// (the TextMate grammar omits them).
//
// Each highlighter returns an HTML string of <span class="tok-…"> nodes
// for the backdrop <pre>; classes are styled in styles.css.

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ESC[c]);
const span = (cls, text) => `<span class="tok-${cls}">${esc(text)}</span>`;

const INT_RE = /^[+-]?(?:0x[0-9a-fA-F][0-9a-fA-F_]*|0o[0-7][0-7_]*|0b[01][01_]*|\d[\d_]*)$/;
const FLOAT_RE = /^[+-]?\d[\d_]*(?:\.[\d_]+(?:[eE][+-]?\d[\d_]*)?|[eE][+-]?\d[\d_]*)$/;

// ───────────────────────── Ktav ─────────────────────────

function ktavScalar(body) {
    if (body === "true" || body === "false") return span("bool", body);
    if (body === "null") return span("null", body);
    if (INT_RE.test(body) || FLOAT_RE.test(body)) return span("num", body);
    return span("string", body);
}

// Tokenise an inline compound like `{ host: a, port: 80 }` or `[ a, b ]`.
function ktavInline(text) {
    let out = "";
    const re = /([{}\[\],])|([^{}\[\],]+)/g;
    let m;
    while ((m = re.exec(text))) {
        if (m[1]) {
            out += span("punct", m[1]);
        } else {
            const chunk = m[2];
            const lead = chunk.match(/^\s*/)[0];
            const trail = chunk.match(/\s*$/)[0];
            const core = chunk.slice(lead.length, chunk.length - trail.length);
            out += lead;
            if (core) {
                const pm = core.match(/^([^\s:]+(?:\.[^\s:]+)*)(::?)(\s+)(.*)$/);
                if (pm) {
                    out += ktavKeyPath(pm[1]) + span("marker", pm[2]) + pm[3] +
                        (pm[2] === "::" ? span("string", pm[4]) : ktavScalar(pm[4]));
                } else {
                    out += ktavScalar(core);
                }
            }
            out += trail;
        }
    }
    return out;
}

function ktavKeyPath(path) {
    return path
        .split(/(\.)/)
        .map((p) => (p === "." ? span("punct", ".") : span("key", p)))
        .join("");
}

function highlightKtav(text) {
    const lines = text.split("\n");
    let ml = null; // null | "stripped" | "verbatim"
    const out = lines.map((line) => {
        if (ml) {
            const close = ml === "verbatim" ? /^(\s*)(\)\))(\s*)$/ : /^(\s*)(\))(\s*)$/;
            const c = line.match(close);
            if (c) {
                ml = null;
                return c[1] + span("punct", c[2]) + c[3];
            }
            return span("mstring", line);
        }
        // comment — a line whose first non-space bytes are `##` (spec § 3.4)
        let m = line.match(/^(\s*)(##.*)$/);
        if (m) return m[1] + span("comment", m[2]);
        if (!line.trim()) return line;
        // lone bracket / paren
        m = line.match(/^(\s*)([}\]{\[])(\s*)$/);
        if (m) return m[1] + span("punct", m[2]) + m[3];
        m = line.match(/^(\s*)(\(\(?)(\s*)$/);
        if (m) {
            ml = m[2] === "((" ? "verbatim" : "stripped";
            return m[1] + span("punct", m[2]) + m[3];
        }
        // pair:  key<marker> value   (marker is ':' or the raw '::')
        const KEY = "[^\\s:.\\[\\]{}]+(?:\\.[^\\s:.\\[\\]{}]+)*";
        m = line.match(new RegExp(`^(\\s*)(${KEY})(::|:)(.*)$`));
        if (m) {
            const [, lead, key, marker, rest] = m;
            let head = lead + ktavKeyPath(key) + span("marker", marker);
            return head + ktavValue(marker, rest, (kind) => (ml = kind));
        }
        // array item with the raw marker:  :: value  (literal string)
        m = line.match(/^(\s*)(::)(.*)$/);
        if (m) {
            const [, lead, marker, rest] = m;
            const vlead = rest.match(/^\s*/)[0];
            const body = rest.slice(vlead.length);
            return lead + span("marker", marker) + vlead + span("string", body);
        }
        // array scalar / value line
        const t = line.trim();
        const lead = line.match(/^\s*/)[0];
        const trail = line.match(/\s*$/)[0];
        if (/^\{.*\}$/.test(t) || /^\[.*\]$/.test(t)) return lead + ktavInline(t) + trail;
        return lead + ktavScalar(t) + trail;
    });
    return out.join("\n");
}

// Render the value portion of a `key<marker> …` line.
function ktavValue(marker, rest, setMultiline) {
    const lead = rest.match(/^\s*/)[0];
    const trail = rest.match(/\s*$/)[0];
    const body = rest.slice(lead.length, rest.length - trail.length);
    const wrap = (s) => lead + s + trail;
    if (body === "") return rest;
    if (marker === "::") return wrap(span("string", body));
    // plain ':' — value type is inferred from its lexical form (spec § 5.2)
    if (body === "(" || body === "((") {
        setMultiline(body === "((" ? "verbatim" : "stripped");
        return wrap(span("punct", body));
    }
    if (body === "{" || body === "[") return wrap(span("punct", body));
    if (/^\{.*\}$/.test(body) || /^\[.*\]$/.test(body)) return wrap(ktavInline(body));
    return wrap(ktavScalar(body));
}

// ───────────────────────── JSON ─────────────────────────

function highlightJson(text) {
    let out = "";
    const re = /(\s+)|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b)|(\bnull\b)|([{}\[\],:])|(.)/g;
    let m;
    while ((m = re.exec(text))) {
        if (m[1]) out += m[1];
        else if (m[2]) {
            // key if the next non-space char is ':'
            const after = text.slice(re.lastIndex).match(/^\s*:/);
            out += span(after ? "key" : "string", m[2]);
        } else if (m[3]) out += span("num", m[3]);
        else if (m[4]) out += span("bool", m[4]);
        else if (m[5]) out += span("null", m[5]);
        else if (m[6]) out += span("punct", m[6]);
        else out += esc(m[7]);
    }
    return out;
}

// ───────────────────────── YAML ─────────────────────────

function yamlScalar(v) {
    const t = v.trim();
    if (!t) return esc(v);
    const lead = v.match(/^\s*/)[0];
    const trail = v.match(/\s*$/)[0];
    let cls = "string";
    if (/^(true|false|yes|no|on|off)$/i.test(t)) cls = "bool";
    else if (/^(null|~)$/i.test(t)) cls = "null";
    else if (INT_RE.test(t) || FLOAT_RE.test(t)) cls = "num";
    else if (/^["'].*["']$/.test(t)) cls = "string";
    return lead + span(cls, t) + trail;
}

function highlightYaml(text) {
    return text.split("\n").map((line) => {
        let m = line.match(/^(\s*)(#.*)$/);
        if (m) return m[1] + span("comment", m[2]);
        if (/^(\s*)(---|\.\.\.)\s*$/.test(line)) return span("punct", line);
        // strip an inline comment (best-effort: ' #' not inside quotes)
        let comment = "";
        const ci = line.search(/\s+#/);
        let body = line;
        if (ci !== -1 && !/["']/.test(line.slice(0, ci))) {
            comment = span("comment", line.slice(ci + line.slice(ci).match(/^\s*/)[0].length));
            const ws = line.slice(ci).match(/^\s*/)[0];
            comment = line.slice(ci, ci + ws.length) + span("comment", line.slice(ci + ws.length));
            body = line.slice(0, ci);
        }
        const dash = body.match(/^(\s*)((?:-\s+)+)?(.*)$/);
        const lead = dash[1];
        const dashPart = dash[2] ? span("punct", dash[2]) : "";
        let content = dash[3];
        // key: value
        const kv = content.match(/^([^\s:][^:]*?)(:)(\s.*|)$/);
        if (kv) {
            return lead + dashPart + span("key", kv[1]) + span("punct", kv[2]) +
                (kv[3] ? yamlScalar(kv[3]) : "") + comment;
        }
        return lead + dashPart + yamlScalar(content) + comment;
    }).join("\n");
}

// ───────────────────────── TOML ─────────────────────────

function tomlValue(v) {
    const lead = v.match(/^\s*/)[0];
    const trail = v.match(/\s*$/)[0];
    const core = v.slice(lead.length, v.length - trail.length);
    if (!core) return v;
    if (/^(\[.*\]|\{.*\})$/.test(core)) {
        // inline array / table — colour brackets + recurse on commas
        return lead + core.replace(/("(?:\\.|[^"\\])*"|'[^']*')|([{}\[\],=])|(\btrue\b|\bfalse\b)|([^,{}\[\]=]+)/g,
            (whole, str, punct, bool, other) => {
                if (str) return span("string", str);
                if (punct) return span("punct", punct);
                if (bool) return span("bool", bool);
                const t = other.trim();
                if (INT_RE.test(t) || FLOAT_RE.test(t)) return span("num", other);
                return other;
            }) + trail;
    }
    let cls = "string";
    if (/^(true|false)$/.test(core)) cls = "bool";
    else if (/^["'].*["']$/.test(core)) cls = "string";
    else if (/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}.*)?$/.test(core)) cls = "num";
    else if (INT_RE.test(core) || FLOAT_RE.test(core)) cls = "num";
    return lead + span(cls, core) + trail;
}

function highlightToml(text) {
    return text.split("\n").map((line) => {
        let m = line.match(/^(\s*)(#.*)$/);
        if (m) return m[1] + span("comment", m[2]);
        m = line.match(/^(\s*)(\[\[?.+?\]\]?)(\s*)$/);
        if (m) return m[1] + span("section", m[2]) + m[3];
        m = line.match(/^(\s*)([^=#]+?)(=)(.*)$/);
        if (m) {
            const key = m[2].replace(/([^\s.]+)|(\.)/g, (w, name, dot) =>
                dot ? span("punct", ".") : span("key", w));
            return m[1] + key + span("punct", m[3]) + tomlValue(m[4]);
        }
        return esc(line);
    }).join("\n");
}

// ───────────────────────── INI ─────────────────────────

function highlightIni(text) {
    return text.split("\n").map((line) => {
        let m = line.match(/^(\s*)([;#].*)$/);
        if (m) return m[1] + span("comment", m[2]);
        m = line.match(/^(\s*)(\[.+?\])(\s*)$/);
        if (m) return m[1] + span("section", m[2]) + m[3];
        m = line.match(/^(\s*)([^=]+?)(=)(.*)$/);
        if (m) {
            return m[1] + span("key", m[2]) + span("punct", m[3]) + span("string", m[4]);
        }
        return esc(line);
    }).join("\n");
}

const HIGHLIGHTERS = {
    json: highlightJson,
    yaml: highlightYaml,
    toml: highlightToml,
    ini: highlightIni,
    ktav: highlightKtav,
};

export function highlight(format, text) {
    const fn = HIGHLIGHTERS[format] || ((t) => esc(t));
    try {
        return fn(text);
    } catch {
        return esc(text);
    }
}
