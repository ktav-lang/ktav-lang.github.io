// A real code editor for the playground, built on CodeMirror 6 — replacing
// the old transparent-<textarea>-over-<pre> overlay (whose caret drifted out
// of sync with the coloured layer at ligatures / sub-pixel letter-spacing).
// CodeMirror owns the caret, selection and rendering in one DOM tree, so that
// whole class of bug is gone by construction.
//
// Exposes the SAME tiny API the old `editor.js` did (value / setValue /
// setFormat / focus), so swapping it in is a one-line import change in app.js.
//
// Highlighting:
//   • Ktav            → tree-sitter (canonical grammar wasm + highlights.scm)
//   • JSON/YAML       → official CodeMirror language packages
//   • TOML/INI        → CodeMirror legacy stream modes
// All formats share the site's `--t-*` token palette.

import { EditorView, keymap } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import {
    syntaxHighlighting, HighlightStyle, indentUnit,
    bracketMatching, StreamLanguage,
} from "@codemirror/language";
import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { toml } from "@codemirror/legacy-modes/mode/toml";
import { properties } from "@codemirror/legacy-modes/mode/properties";
import { tags as t } from "@lezer/highlight";
import { ktavHighlight, initKtav } from "./cm-ktav.js";

// Tag-based palette for the Lezer-grammar languages (JSON/YAML/TOML/INI),
// mapped onto the same `--t-*` colours the Ktav `tok-*` classes use.
const siteHighlight = HighlightStyle.define([
    { tag: t.comment, color: "var(--t-comment)", fontStyle: "italic" },
    { tag: [t.propertyName, t.labelName, t.definition(t.propertyName)], color: "var(--t-key)" },
    { tag: [t.string, t.special(t.string)], color: "var(--t-string)" },
    { tag: t.number, color: "var(--t-num)" },
    { tag: [t.bool, t.atom], color: "var(--t-bool)", fontWeight: "600" },
    { tag: t.null, color: "var(--t-null)", fontWeight: "600" },
    { tag: t.keyword, color: "var(--t-bool)", fontWeight: "600" },
    {
        tag: [t.punctuation, t.separator, t.bracket, t.squareBracket, t.brace, t.paren, t.angleBracket],
        color: "var(--t-punct)",
    },
    { tag: t.operator, color: "var(--t-marker)", fontWeight: "600" },
    { tag: [t.heading, t.heading1], color: "var(--t-section)", fontWeight: "700" },
]);

// Editor chrome — transparent so the `.editor` container's background and
// rounded border show through; typography matches the rest of the page.
const siteTheme = EditorView.theme({
    "&": {
        height: "100%", width: "100%", maxWidth: "100%",
        backgroundColor: "transparent", color: "var(--ink)", fontSize: "13px",
    },
    "&.cm-focused": { outline: "none" },
    // Horizontal scroll lives *inside* the editor — a long line never widens
    // the box (so the two-column layout doesn't jump as content changes).
    ".cm-scroller": { fontFamily: "var(--mono)", lineHeight: "1.62", overflow: "auto" },
    ".cm-content": {
        padding: "1rem 1.1rem", caretColor: "var(--pink)",
        // single content layer means no overlay desync, but keep columns
        // honest anyway: no ligatures, integer advances.
        fontVariantLigatures: "none",
        fontFeatureSettings: '"liga" 0, "calt" 0',
    },
    ".cm-gutters": { display: "none" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--pink)" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
        backgroundColor: "rgba(167, 139, 250, 0.32)",
    },
});

function langExtension(format) {
    switch (format) {
        case "json": return json();
        case "yaml": return yaml();
        case "toml": return StreamLanguage.define(toml);
        case "ini": return StreamLanguage.define(properties);
        case "ktav": return ktavHighlight();
        default: return [];
    }
}

export function createEditor(root, { format, readOnly = false, value = "", onInput } = {}) {
    root.classList.add("editor");
    // Start loading the Ktav grammar early (idempotent) — it's needed by the
    // output editor on first paint and by the source editor if switched to Ktav.
    initKtav();

    const lang = new Compartment();

    const view = new EditorView({
        parent: root,
        doc: value,
        extensions: [
            history(),
            keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
            indentUnit.of("  "),
            EditorState.tabSize.of(2),
            bracketMatching(),
            syntaxHighlighting(siteHighlight),
            siteTheme,
            EditorView.updateListener.of((u) => {
                if (u.docChanged) onInput?.(u.state.doc.toString());
            }),
            readOnly ? [EditorState.readOnly.of(true), EditorView.editable.of(false)] : [],
            lang.of(langExtension(format)),
        ],
    });

    return {
        el: root,
        get value() { return view.state.doc.toString(); },
        setValue(v) {
            view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: v ?? "" } });
        },
        setFormat(f) {
            view.dispatch({ effects: lang.reconfigure(langExtension(f)) });
        },
        focus() { view.focus(); },
        view,
    };
}
