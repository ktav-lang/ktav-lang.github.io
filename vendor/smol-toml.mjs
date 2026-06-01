/**
 * Bundled by jsDelivr using Rollup v2.79.2 and Terser v5.39.0.
 * Original file: /npm/smol-toml@1.3.1/dist/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
class e extends Error{line;column;codeblock;constructor(e,t){const[n,r]=function(e,t){let n=e.slice(0,t).split(/\r\n|\n|\r/g);return[n.length,n.pop().length+1]}(t.toml,t.ptr),i=function(e,t,n){let r=e.split(/\r\n|\n|\r/g),i="",l=1+(0|Math.log10(t+1));for(let e=t-1;e<=t+1;e++){let o=r[e-1];o&&(i+=e.toString().padEnd(l," "),i+=":  ",i+=o,i+="\n",e===t&&(i+=" ".repeat(l+n+2),i+="^\n"))}return i}(t.toml,n,r);super(`Invalid TOML document: ${e}\n\n${i}`,t),this.line=n,this.column=r,this.codeblock=i}}
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */function t(e,t=0,n=e.length){let r=e.indexOf("\n",t);return"\r"===e[r-1]&&r--,r<=n?r:-1}function n(t,n){for(let r=n;r<t.length;r++){let i=t[r];if("\n"===i)return r;if("\r"===i&&"\n"===t[r+1])return r+1;if(i<" "&&"\t"!==i||""===i)throw new e("control characters are not allowed in comments",{toml:t,ptr:n})}return t.length}function r(e,t,i,l){let o;for(;" "===(o=e[t])||"\t"===o||!i&&("\n"===o||"\r"===o&&"\n"===e[t+1]);)t++;return l||"#"!==o?t:r(e,n(e,t),i)}function i(n,r,i,l,o=!1){if(!l)return(r=t(n,r))<0?n.length:r;for(let e=r;e<n.length;e++){let r=n[e];if("#"===r)e=t(n,e);else{if(r===i)return e+1;if(r===l)return e;if(o&&("\n"===r||"\r"===r&&"\n"===n[e+1]))return e}}throw new e("cannot find end of structure",{toml:n,ptr:r})}function l(e,t){let n=e[t],r=n===e[t+1]&&e[t+1]===e[t+2]?e.slice(t,t+3):n;t+=r.length-1;do{t=e.indexOf(r,++t)}while(t>-1&&"'"!==n&&"\\"===e[t-1]&&"\\"!==e[t-2]);return t>-1&&(t+=r.length,r.length>1&&(e[t]===n&&t++,e[t]===n&&t++)),t}
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */let o=/^(\d{4}-\d{2}-\d{2})?[T ]?(?:(\d{2}):\d{2}:\d{2}(?:\.\d+)?)?(Z|[-+]\d{2}:\d{2})?$/i;class f extends Date{#e=!1;#t=!1;#n=null;constructor(e){let t=!0,n=!0,r="Z";if("string"==typeof e){let i=e.match(o);i?(i[1]||(t=!1,e=`0000-01-01T${e}`),n=!!i[2],i[2]&&+i[2]>23?e="":(r=i[3]||null,e=e.toUpperCase(),!r&&n&&(e+="Z"))):e=""}super(e),isNaN(this.getTime())||(this.#e=t,this.#t=n,this.#n=r)}isDateTime(){return this.#e&&this.#t}isLocal(){return!this.#e||!this.#t||!this.#n}isDate(){return this.#e&&!this.#t}isTime(){return this.#t&&!this.#e}isValid(){return this.#e||this.#t}toISOString(){let e=super.toISOString();if(this.isDate())return e.slice(0,10);if(this.isTime())return e.slice(11,23);if(null===this.#n)return e.slice(0,-1);if("Z"===this.#n)return e;let t=60*+this.#n.slice(1,3)+ +this.#n.slice(4,6);return t="-"===this.#n[0]?t:-t,new Date(this.getTime()-6e4*t).toISOString().slice(0,-1)+this.#n}static wrapAsOffsetDateTime(e,t="Z"){let n=new f(e);return n.#n=t,n}static wrapAsLocalDateTime(e){let t=new f(e);return t.#n=null,t}static wrapAsLocalDate(e){let t=new f(e);return t.#t=!1,t.#n=null,t}static wrapAsLocalTime(e){let t=new f(e);return t.#e=!1,t.#n=null,t}}
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */let a=/^((0x[0-9a-fA-F](_?[0-9a-fA-F])*)|(([+-]|0[ob])?\d(_?\d)*))$/,s=/^[+-]?\d(_?\d)*(\.\d(_?\d)*)?([eE][+-]?\d(_?\d)*)?$/,u=/^[+-]?0[0-9_]/,c=/^[0-9a-f]{4,8}$/i,d={b:"\b",t:"\t",n:"\n",f:"\f",r:"\r",'"':'"',"\\":"\\"};function h(t,n=0,i=t.length){let l="'"===t[n],o=t[n++]===t[n]&&t[n]===t[n+1];o&&(i-=2,"\r"===t[n+=2]&&n++,"\n"===t[n]&&n++);let f,a=0,s="",u=n;for(;n<i-1;){let i=t[n++];if("\n"===i||"\r"===i&&"\n"===t[n]){if(!o)throw new e("newlines are not allowed in strings",{toml:t,ptr:n-1})}else if(i<" "&&"\t"!==i||""===i)throw new e("control characters are not allowed in strings",{toml:t,ptr:n-1});if(f){if(f=!1,"u"===i||"U"===i){let r=t.slice(n,n+="u"===i?4:8);if(!c.test(r))throw new e("invalid unicode escape",{toml:t,ptr:a});try{s+=String.fromCodePoint(parseInt(r,16))}catch{throw new e("invalid unicode escape",{toml:t,ptr:a})}}else if(!o||"\n"!==i&&" "!==i&&"\t"!==i&&"\r"!==i){if(!(i in d))throw new e("unrecognized escape sequence",{toml:t,ptr:a});s+=d[i]}else{if("\n"!==t[n=r(t,n-1,!0)]&&"\r"!==t[n])throw new e("invalid escape: only line-ending whitespace may be escaped",{toml:t,ptr:a});n=r(t,n)}u=n}else l||"\\"!==i||(a=n-1,f=!0,s+=t.slice(u,a))}return s+t.slice(u,i-1)}function w(t,n,r){if("true"===t)return!0;if("false"===t)return!1;if("-inf"===t)return-1/0;if("inf"===t||"+inf"===t)return 1/0;if("nan"===t||"+nan"===t||"-nan"===t)return NaN;if("-0"===t)return 0;let i;if((i=a.test(t))||s.test(t)){if(u.test(t))throw new e("leading zeroes are not allowed",{toml:n,ptr:r});let l=+t.replace(/_/g,"");if(isNaN(l))throw new e("invalid number",{toml:n,ptr:r});if(i&&!Number.isSafeInteger(l))throw new e("integer value cannot be represented losslessly",{toml:n,ptr:r});return l}let l=new f(t);if(!l.isValid())throw new e("invalid value",{toml:n,ptr:r});return l}
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */function m(o,f,a,s){if(0===s)throw new e("document contains excessively nested structures. aborting.",{toml:o,ptr:f});let u,c=o[f];if("["===c||"{"===c){let[r,l]="["===c?function(t,r,i){let l,o=[];r++;for(;"]"!==(l=t[r++])&&l;){if(","===l)throw new e("expected value, found comma",{toml:t,ptr:r-1});if("#"===l)r=n(t,r);else if(" "!==l&&"\t"!==l&&"\n"!==l&&"\r"!==l){let e=m(t,r-1,"]",i-1);o.push(e[0]),r=e[1]}}if(!l)throw new e("unfinished array encountered",{toml:t,ptr:r});return[o,r]}
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */(o,f,s):function(t,n,r){let i,l={},o=new Set,f=0;n++;for(;"}"!==(i=t[n++])&&i;){if("\n"===i)throw new e("newlines are not allowed in inline tables",{toml:t,ptr:n-1});if("#"===i)throw new e("inline tables cannot contain comments",{toml:t,ptr:n-1});if(","===i)throw new e("expected key-value, found comma",{toml:t,ptr:n-1});if(" "!==i&&"\t"!==i){let i,a=l,s=!1,[u,c]=g(t,n-1);for(let r=0;r<u.length;r++){if(r&&(a=s?a[i]:a[i]={}),i=u[r],(s=Object.hasOwn(a,i))&&("object"!=typeof a[i]||o.has(a[i])))throw new e("trying to redefine an already defined value",{toml:t,ptr:n});s||"__proto__"!==i||Object.defineProperty(a,i,{enumerable:!0,configurable:!0,writable:!0})}if(s)throw new e("trying to redefine an already defined value",{toml:t,ptr:n});let[d,h]=m(t,c,"}",r-1);o.add(d),a[i]=d,f=","===t[(n=h)-1]?n-1:0}}if(f)throw new e("trailing commas are not allowed in inline tables",{toml:t,ptr:f});if(!i)throw new e("unfinished table encountered",{toml:t,ptr:n});return[l,n]}(o,f,s),u=i(o,l,",",a);if("}"===a){let n=t(o,l,u);if(n>-1)throw new e("newlines are not allowed in inline tables",{toml:o,ptr:n})}return[r,u]}if('"'===c||"'"===c){u=l(o,f);let t=h(o,f,u);if(a){if(u=r(o,u,"]"!==a),o[u]&&","!==o[u]&&o[u]!==a&&"\n"!==o[u]&&"\r"!==o[u])throw new e("unexpected character encountered",{toml:o,ptr:u});u+=+(","===o[u])}return[t,u]}u=i(o,f,",",a);let d=function(t,r,i,l){let o=t.slice(r,i),f=o.indexOf("#");f>-1&&(n(t,f),o=o.slice(0,f));let a=o.trimEnd();if(!l){let n=o.indexOf("\n",a.length);if(n>-1)throw new e("newlines are not allowed in inline tables",{toml:t,ptr:r+n})}return[a,f]}(o,f,u-+(","===o[u-1]),"]"===a);if(!d[0])throw new e("incomplete key-value declaration: no value specified",{toml:o,ptr:f});return a&&d[1]>-1&&(u=r(o,f+d[1]),u+=+(","===o[u])),[w(d[0],o,f),u]}
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */let p=/^[a-zA-Z0-9-_]+[ \t]*$/;function g(n,i,o="="){let f=i-1,a=[],s=n.indexOf(o,i);if(s<0)throw new e("incomplete key-value: cannot find end of key",{toml:n,ptr:i});do{let r=n[i=++f];if(" "!==r&&"\t"!==r)if('"'===r||"'"===r){if(r===n[i+1]&&r===n[i+2])throw new e("multiline strings are not allowed in keys",{toml:n,ptr:i});let u=l(n,i);if(u<0)throw new e("unfinished string encountered",{toml:n,ptr:i});f=n.indexOf(".",u);let c=n.slice(u,f<0||f>s?s:f),d=t(c);if(d>-1)throw new e("newlines are not allowed in keys",{toml:n,ptr:i+f+d});if(c.trimStart())throw new e("found extra tokens after the string part",{toml:n,ptr:u});if(s<u&&(s=n.indexOf(o,u),s<0))throw new e("incomplete key-value: cannot find end of key",{toml:n,ptr:i});a.push(h(n,i,u))}else{f=n.indexOf(".",i);let t=n.slice(i,f<0||f>s?s:f);if(!p.test(t))throw new e("only letter, numbers, dashes and underscores are allowed in keys",{toml:n,ptr:i});a.push(t.trimEnd())}}while(f+1&&f<s);return[a,r(n,s+1,!0,!0)]}function b(e,t,n,r){let i,l,o=t,f=n,a=!1;for(let t=0;t<e.length;t++){if(t){if(o=a?o[i]:o[i]={},f=(l=f[i]).c,0===r&&(1===l.t||2===l.t))return null;if(2===l.t){let e=o.length-1;o=o[e],f=f[e].c}}if(i=e[t],(a=Object.hasOwn(o,i))&&0===f[i]?.t&&f[i]?.d)return null;a||("__proto__"===i&&(Object.defineProperty(o,i,{enumerable:!0,configurable:!0,writable:!0}),Object.defineProperty(f,i,{enumerable:!0,configurable:!0,writable:!0})),f[i]={t:t<e.length-1&&2===r?3:r,d:!1,i:0,c:{}})}if(l=f[i],l.t!==r&&(1!==r||3!==l.t))return null;if(2===r&&(l.d||(l.d=!0,o[i]=[]),o[i].push(o={}),l.c[l.i++]=l={t:1,d:!1,i:0,c:{}}),l.d)return null;if(l.d=!0,1===r)o=a?o[i]:o[i]={};else if(0===r&&a)return null;return[i,o,l.c]}function y(t,n){let i=n?.maxDepth??1e3,l={},o={},f=l,a=o;for(let n=r(t,0);n<t.length;){if("["===t[n]){let r="["===t[++n],i=g(t,n+=+r,"]");if(r){if("]"!==t[i[1]-1])throw new e("expected end of table declaration",{toml:t,ptr:i[1]-1});i[1]++}let s=b(i[0],l,o,r?2:1);if(!s)throw new e("trying to redefine an already defined table or value",{toml:t,ptr:n});a=s[2],f=s[1],n=i[1]}else{let r=g(t,n),l=b(r[0],f,a,0);if(!l)throw new e("trying to redefine an already defined table or value",{toml:t,ptr:n});let o=m(t,r[1],void 0,i);l[1][l[0]]=o[0],n=o[1]}if(n=r(t,n,!0),t[n]&&"\n"!==t[n]&&"\r"!==t[n])throw new e("each key-value declaration must be followed by an end-of-line",{toml:t,ptr:n});n=r(t,n)}return l}
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */let v=/^[a-z0-9-_]+$/i;function x(e){let t=typeof e;if("object"===t){if(Array.isArray(e))return"array";if(e instanceof Date)return"date"}return t}function T(e){for(let t=0;t<e.length;t++)if("object"!==x(e[t]))return!1;return 0!=e.length}function O(e){return JSON.stringify(e).replace(/\x7f/g,"\\u007f")}function j(e,t,n){if(0===n)throw new Error("Could not stringify the object: maximum object depth exceeded");if("number"===t)return isNaN(e)?"nan":e===1/0?"inf":e===-1/0?"-inf":e.toString();if("bigint"===t||"boolean"===t)return e.toString();if("string"===t)return O(e);if("date"===t){if(isNaN(e.getTime()))throw new TypeError("cannot serialize invalid date");return e.toISOString()}return"object"===t?function(e,t){let n=Object.keys(e);if(0===n.length)return"{}";let r="{ ";for(let i=0;i<n.length;i++){let l=n[i];i&&(r+=", "),r+=v.test(l)?l:O(l),r+=" = ",r+=j(e[l],x(e[l]),t-1)}return r+" }"}(e,n):"array"===t?function(e,t){if(0===e.length)return"[]";let n="[ ";for(let r=0;r<e.length;r++){if(r&&(n+=", "),null===e[r]||void 0===e[r])throw new TypeError("arrays cannot contain null or undefined values");n+=j(e[r],x(e[r]),t-1)}return n+" ]"}(e,n):void 0}function D(e,t,n){if(0===n)throw new Error("Could not stringify the object: maximum object depth exceeded");let r="";for(let i=0;i<e.length;i++)r+=`[[${t}]]\n`,r+=$(e[i],t,n),r+="\n\n";return r}function $(e,t,n){if(0===n)throw new Error("Could not stringify the object: maximum object depth exceeded");let r="",i="",l=Object.keys(e);for(let o=0;o<l.length;o++){let f=l[o];if(null!==e[f]&&void 0!==e[f]){let l=x(e[f]);if("symbol"===l||"function"===l)throw new TypeError(`cannot serialize values of type '${l}'`);let o=v.test(f)?f:O(f);if("array"===l&&T(e[f]))i+=D(e[f],t?`${t}.${o}`:o,n-1);else if("object"===l){let r=t?`${t}.${o}`:o;i+=`[${r}]\n`,i+=$(e[f],r,n-1),i+="\n\n"}else r+=o,r+=" = ",r+=j(e[f],l,n),r+="\n"}}return`${r}\n${i}`.trim()}function _(e,t){if("object"!==x(e))throw new TypeError("stringify can only be called with an object");return $(e,"",t?.maxDepth??1e3)}
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */var S={parse:y,stringify:_,TomlDate:f,TomlError:e};export{f as TomlDate,e as TomlError,S as default,y as parse,_ as stringify};
//# sourceMappingURL=/sm/8758b55d7335a7643d5dbbd6640e3622abe1e797493e4f175dcd47cf97f8ed00.map