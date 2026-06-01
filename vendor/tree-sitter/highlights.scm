; Tree-sitter highlights for Ktav (כְּתָב).
; Capture names follow the standard set documented at
;   https://docs.helix-editor.com/themes.html#scopes
;   https://github.com/nvim-treesitter/nvim-treesitter (highlights.scm)

; ---- Comments ----
(comment) @comment

; ---- Keys ----
(key) @property
(dotted_key) @property
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

; ---- Number literals (new in spec 0.5.0) ----
(integer) @number
(float)   @number.float

; ---- String values ----
; Plain scalar after `:` — a string.
(object_pair
  separator: (sep_string)
  value: (scalar) @string)

; Raw string after `::`
(object_pair
  separator: (sep_raw)
  value: (raw_scalar) @string.special)

; ---- Array items ----
(array_item
  marker: (sep_raw)
  value: (raw_scalar) @string.special)

(array_item
  value: (scalar) @string)

; ---- Inline compounds (new in spec 0.5.0) ----
(inline_object) @punctuation.bracket
(inline_array)  @punctuation.bracket
(inline_scalar) @string
(escape_sequence) @string.escape

; ---- Multi-line strings ----
(multiline_stripped) @string
(multiline_verbatim) @string
