; Tree-sitter highlights for Ktav (כְּתָב).
; Capture names follow the standard set documented at
;   https://docs.helix-editor.com/themes.html#scopes
;   https://github.com/nvim-treesitter/nvim-treesitter (highlights.scm)

; ---- Comments ----
(comment) @comment

; ---- Keys ----
(key) @property
(dotted_key) @property
; A quoted key segment (spec 0.7.0 § 5.3.3) — the inner, more specific
; capture distinguishes it from a bare key's plain `@property` text.
(quoted_key_segment) @string.special.key
"." @punctuation.delimiter

; ---- Pair separators ----
(sep_string) @punctuation.delimiter
(sep_raw)    @punctuation.special

; ---- Compound brackets ----
; The structural openers / closers each form their own visible token
; node (the opener swallows trailing horizontal whitespace + newline,
; and the closer is the bracket char(s) followed by `_strict_eol`).
; Capturing them directly leaves the inner content uncoloured so
; nested highlights work correctly in Helix and nvim-treesitter.
(open_brace)    @punctuation.bracket
(close_brace)   @punctuation.bracket
(open_bracket)  @punctuation.bracket
(close_bracket) @punctuation.bracket
(open_paren)    @string
(close_paren)   @string
(open_dparen)   @string
(close_dparen)  @string

; ---- Empty inline forms ----
(empty_object)       @punctuation.bracket
(empty_array)        @punctuation.bracket
(empty_paren)        @string
(empty_double_paren) @string

; ---- Keywords (null / true / false) ----
(kw_null)  @constant.builtin
(kw_true)  @constant.builtin.boolean
(kw_false) @constant.builtin.boolean

; ---- Number literals (block and inline values) ----
(integer) @number
(float)   @number.float

; ---- String values ----
; Plain scalar after `:` — a string, including 0.8 numeric-looking fallbacks.
(object_pair
  separator: (sep_string)
  value: (scalar) @string)

; Raw strings can occur in pairs, compound arrays, and the top-level Array.
(raw_scalar) @string.special

; Inline raw values are distinct from whole-line raw scalars.
(inline_raw_scalar) @string.special

; ---- Array items ----

(array_item
  value: (scalar) @string)

(top_scalar) @string

; ---- Inline compounds (new in spec 0.5.0) ----
"{" @punctuation.bracket
"}" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
(inline_scalar) @string
(escape_sequence) @string.escape

; ---- Multi-line strings ----
(multiline_stripped) @string
(multiline_verbatim) @string
