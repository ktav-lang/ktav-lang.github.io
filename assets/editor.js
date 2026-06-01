// A tiny highlighted code editor: a transparent <textarea> stacked over a
// highlighted <pre>. The textarea owns the caret, selection, and input;
// the <pre> shows colour. Both share identical typography and wrapping so
// glyphs line up exactly. No editor framework, no async, no dependencies.

import { highlight } from "./highlight.js";

export function createEditor(root, { format, readOnly = false, value = "", onInput } = {}) {
    root.classList.add("editor");

    const pre = document.createElement("pre");
    pre.className = "editor-hl";
    pre.setAttribute("aria-hidden", "true");
    const code = document.createElement("code");
    pre.appendChild(code);

    const ta = document.createElement("textarea");
    ta.className = "editor-input";
    ta.spellcheck = false;
    ta.autocapitalize = "off";
    ta.autocomplete = "off";
    ta.setAttribute("autocorrect", "off");
    ta.wrap = "off";
    ta.readOnly = readOnly;
    ta.value = value;

    root.append(pre, ta);

    let fmt = format;

    function render() {
        // Trailing newline guard: a <pre> drops the final newline, so the
        // last empty line of the textarea would have no backdrop. Pad it.
        code.innerHTML = highlight(fmt, ta.value) + "\n";
    }
    function syncScroll() {
        pre.scrollTop = ta.scrollTop;
        pre.scrollLeft = ta.scrollLeft;
    }

    ta.addEventListener("input", () => {
        render();
        syncScroll();
        onInput?.(ta.value);
    });
    ta.addEventListener("scroll", syncScroll, { passive: true });

    // Tab inserts two spaces instead of leaving the field.
    ta.addEventListener("keydown", (e) => {
        if (e.key === "Tab" && !readOnly) {
            e.preventDefault();
            const s = ta.selectionStart, en = ta.selectionEnd;
            ta.value = ta.value.slice(0, s) + "  " + ta.value.slice(en);
            ta.selectionStart = ta.selectionEnd = s + 2;
            ta.dispatchEvent(new Event("input"));
        }
    });

    render();

    return {
        el: root,
        get value() { return ta.value; },
        setValue(v) { ta.value = v; render(); syncScroll(); },
        setFormat(f) { fmt = f; render(); },
        focus() { ta.focus(); },
        textarea: ta,
    };
}
