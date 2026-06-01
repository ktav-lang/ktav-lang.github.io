// Ktav syntax highlighting for CodeMirror 6, driven by the *canonical*
// tree-sitter grammar (compiled to wasm) and its `queries/highlights.scm`.
// No hand-written regex highlighter — the site colours Ktav with the exact
// same grammar the editors/IDEs use, so it can never drift from the spec.
//
// web-tree-sitter loads two wasm files (both vendored, self-contained, no
// CDN): `web-tree-sitter.wasm` (the runtime) and `tree-sitter-ktav.wasm`
// (the grammar). Init is async; until it resolves the editor shows plain
// (uncoloured) text, then a one-shot effect repaints with colour.

import { Parser, Language, Query } from "web-tree-sitter";
import { Decoration, ViewPlugin } from "@codemirror/view";
import { RangeSetBuilder, StateEffect } from "@codemirror/state";

const VENDOR = "vendor/tree-sitter";

let parser = null;
let query = null;
let ready = false;
let started = null;

// Fired at an editor to recompute decorations once the grammar finishes
// loading (the doc itself hasn't changed, so `docChanged` won't trigger it).
const rehighlight = StateEffect.define();

/** Load the runtime + grammar + query exactly once. Idempotent. */
export function initKtav() {
    if (started) return started;
    started = (async () => {
        await Parser.init({ locateFile: (path) => `${VENDOR}/${path}` });
        const lang = await Language.load(`${VENDOR}/tree-sitter-ktav.wasm`);
        const scm = await (await fetch(`${VENDOR}/highlights.scm`)).text();
        parser = new Parser();
        parser.setLanguage(lang);
        query = new Query(lang, scm);
        ready = true;
    })();
    return started;
}

// tree-sitter capture name → site token class (`tok-*`, styled globally in
// build/styles/05-tokens.css). Looked up longest-prefix-first so
// `constant.builtin.boolean` wins over `constant.builtin`.
const CAP_CLASS = {
    "comment": "comment",
    "property": "key",
    "string": "string",
    "string.special": "string",
    "string.escape": "marker",
    "number": "num",
    "number.float": "num",
    "constant.builtin": "null",
    "constant.builtin.boolean": "bool",
    "punctuation.delimiter": "punct",
    "punctuation.special": "marker",
    "punctuation.bracket": "punct",
};

// Node-type overrides for cases the capture name alone can't distinguish:
// multi-line string *bodies* get their own colour, and the `(`/`((` paren
// delimiters (captured as @string by the grammar) read better as punctuation.
const TYPE_CLASS = {
    multiline_stripped: "mstring",
    multiline_verbatim: "mstring",
    open_paren: "punct",
    close_paren: "punct",
    open_dparen: "punct",
    close_dparen: "punct",
    empty_paren: "punct",
    empty_double_paren: "punct",
};

function classFor(type, name) {
    if (TYPE_CLASS[type]) return TYPE_CLASS[type];
    if (CAP_CLASS[name]) return CAP_CLASS[name];
    // progressive fallback: strip trailing `.segment`
    let n = name;
    while (n.includes(".")) {
        n = n.slice(0, n.lastIndexOf("."));
        if (CAP_CLASS[n]) return CAP_CLASS[n];
    }
    return null;
}

const markCache = new Map();
function mark(cls) {
    let d = markCache.get(cls);
    if (!d) { d = Decoration.mark({ class: `tok-${cls}` }); markCache.set(cls, d); }
    return d;
}

function buildDecorations(text) {
    if (!ready || !text) return Decoration.none;
    let tree;
    try {
        tree = parser.parse(text);
    } catch {
        return Decoration.none;
    }
    // Paint a per-character class array (later captures override earlier —
    // tree-sitter yields captures by start offset, so inner tokens like the
    // dotted-key `.` correctly override the surrounding key), then coalesce
    // equal runs into non-overlapping marks for the RangeSetBuilder.
    const n = text.length;
    const cls = new Array(n).fill(null);
    for (const cap of query.captures(tree.rootNode)) {
        const k = classFor(cap.node.type, cap.name);
        if (!k) continue;
        const s = cap.node.startIndex;
        const e = Math.min(cap.node.endIndex, n);
        for (let i = s; i < e; i++) cls[i] = k;
    }
    tree.delete();

    const b = new RangeSetBuilder();
    let i = 0;
    while (i < n) {
        if (cls[i] == null) { i++; continue; }
        let j = i + 1;
        while (j < n && cls[j] === cls[i]) j++;
        b.add(i, j, mark(cls[i]));
        i = j;
    }
    return b.finish();
}

/** CodeMirror extension: colour the document as Ktav via tree-sitter. */
export function ktavHighlight() {
    return ViewPlugin.fromClass(
        class {
            constructor(view) {
                this.decorations = buildDecorations(view.state.doc.toString());
                if (!ready) {
                    initKtav().then(() => {
                        try {
                            view.dispatch({ effects: rehighlight.of(null) });
                        } catch { /* view gone / reconfigured away from ktav */ }
                    });
                }
            }
            update(u) {
                const forced = u.transactions.some((tr) =>
                    tr.effects.some((e) => e.is(rehighlight)));
                if (u.docChanged || forced) {
                    this.decorations = buildDecorations(u.state.doc.toString());
                }
            }
        },
        { decorations: (v) => v.decorations },
    );
}
