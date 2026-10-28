#!/usr/bin/env bash
set -euo pipefail

root="$GITHUB_WORKSPACE"
js="$root/_sources/ktav-js"
grammar="$root/_sources/tree-sitter-ktav"
export RUSTFLAGS="--remap-path-prefix=$js=/ktav-js --remap-path-prefix=$HOME/.cargo/registry/src=/cargo-registry"
printf '%s  %s\n' 2fd839cf18c47f739ebe5570b10475e2080a435305095c90575bc82a58d3fbe2 "$root/vendor/smol-toml.mjs" | sha256sum --check
printf '%s  %s\n' 11cf9213908fbc28ea7566f682b1b20c097d2a9c642a0ff8f901c78adc1fc395 "$root/assets/tailwind.css" | sha256sum --check
printf '%s  %s\n' 60e0b68c0f35c078eef3a5d29419d0b03ff84ec1df9c3f9d6e39a519a5ae7985 "$root/vendor/tailwindcss.LICENSE" | sha256sum --check
printf '%s  %s\n' 172020dbfd5b53a226dfde77616190a48dcff519b0bc0e6deb91a8450782c4af "$root/vendor/rust-std/COPYRIGHT" | sha256sum --check
printf '%s  %s\n' b71bd43a069ca0641a9ecfe585ca7b3c53b5cc1608f8b68321168698e28b5ea1 "$root/vendor/rust-std/LICENSE-MIT" | sha256sum --check
printf '%s  %s\n' 62c7a1e35f56406896d7aa7ca52d0cc0d272ac022b5d2796e7d6905db8a3636a "$root/vendor/rust-std/LICENSE-APACHE" | sha256sum --check
lock="$root/provenance/ktav-js-0.8.1-Cargo.lock"
test -f "$lock" || { printf '%s\n' 'Pinned Cargo lockfile is missing' >&2; exit 1; }
cp "$lock" "$js/Cargo.lock"

(cd "$js" && cargo fetch --locked)
python3 - "$js/Cargo.lock" <<'PY'
import sys
import tomllib
from pathlib import Path
lock = tomllib.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
core = [package for package in lock['package'] if package['name'] == 'ktav']
assert len(core) == 1, core
assert core[0]['version'] == '0.8.1', core
assert core[0]['source'] == 'registry+https://github.com/rust-lang/crates.io-index', core
assert core[0]['checksum'] == '7140dfe2fa6c320e74768cd6a637828c2d26f81746254f4fcd805f3993bd3fd5', core
wasm = [package for package in lock['package'] if package['name'] == 'ktav-wasm']
assert len(wasm) == 1 and wasm[0]['version'] == '0.8.1', wasm
PY
cp "$js/Cargo.lock" "$RUNNER_TEMP/wasm-lock-before"

bindgen_version="$(python3 - "$js/Cargo.lock" <<'PY'
import sys
import tomllib
from pathlib import Path
packages = tomllib.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))['package']
versions = {package['version'] for package in packages if package['name'] == 'wasm-bindgen'}
assert len(versions) == 1, versions
print(versions.pop())
PY
)"
[[ "$bindgen_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
bindgen_asset="wasm-bindgen-${bindgen_version}-x86_64-unknown-linux-musl.tar.gz"
bindgen_digest="$(gh api "repos/wasm-bindgen/wasm-bindgen/releases/tags/$bindgen_version" --jq ".assets[] | select(.name == \"$bindgen_asset\") | .digest")"
[[ "$bindgen_digest" =~ ^sha256:[0-9a-f]{64}$ ]]
printf 'bindgen_version=%s\nbindgen_digest=%s\n' "$bindgen_version" "$bindgen_digest" > "$RUNNER_TEMP/wasm-bindgen.txt"
cmp "$root/provenance/wasm-bindgen.txt" "$RUNNER_TEMP/wasm-bindgen.txt"
bindgen_download="$(mktemp -d "$RUNNER_TEMP/bindgen-download.XXXXXX")"
bindgen_tools="$(mktemp -d "$RUNNER_TEMP/bindgen-tools.XXXXXX")"
curl -fsSL "https://github.com/wasm-bindgen/wasm-bindgen/releases/download/$bindgen_version/$bindgen_asset" -o "$bindgen_download/archive.tar.gz"
printf '%s  %s\n' "${bindgen_digest#sha256:}" "$bindgen_download/archive.tar.gz" | sha256sum --check
tar -xzf "$bindgen_download/archive.tar.gz" --strip-components=1 -C "$bindgen_tools"
export PATH="$bindgen_tools:$PATH"

(cd "$js" && npm install --ignore-scripts)
(cd "$root" && node --test ci/check-js-tool-licenses.test.mjs)
(cd "$root" && node ci/check-js-tool-licenses.mjs "$js")
(cd "$js" && npm run build:ts)
(cd "$js" && node scripts/build-wasm.mjs)
cmp "$RUNNER_TEMP/wasm-lock-before" "$js/Cargo.lock"
cp "$js/dist/wasm/web/ktav.inline.js" "$RUNNER_TEMP/wasm-first.js"
(cd "$js" && node scripts/build-wasm.mjs)
cmp "$RUNNER_TEMP/wasm-lock-before" "$js/Cargo.lock"
cmp "$RUNNER_TEMP/wasm-first.js" "$js/dist/wasm/web/ktav.inline.js"
(cd "$js" && node tests/node/run-node-wasm.mjs)

(cd "$js" && cargo about generate --config "$root/provenance/about.toml" --manifest-path crates/wasm/Cargo.toml --locked --target wasm32-unknown-unknown "$root/provenance/notices.hbs") > "$RUNNER_TEMP/ktav-notices.txt"
test -s "$RUNNER_TEMP/ktav-notices.txt"
if grep -Fq '<year> <copyright holders>' "$RUNNER_TEMP/ktav-notices.txt"; then
  printf '%s\n' 'Generated notice contains an unresolved copyright placeholder' >&2
  exit 1
fi

(cd "$grammar" && tree-sitter build --wasm -o "$RUNNER_TEMP/tree-sitter-ktav-first.wasm")
(cd "$grammar" && tree-sitter build --wasm -o "$RUNNER_TEMP/tree-sitter-ktav.wasm")
cmp "$RUNNER_TEMP/tree-sitter-ktav-first.wasm" "$RUNNER_TEMP/tree-sitter-ktav.wasm"

cmp "$root/vendor/ktav/ktav.inline.js" "$js/dist/wasm/web/ktav.inline.js"
cmp "$root/vendor/ktav/THIRD_PARTY_NOTICES.txt" "$RUNNER_TEMP/ktav-notices.txt"
cmp "$root/vendor/tree-sitter/tree-sitter-ktav.wasm" "$RUNNER_TEMP/tree-sitter-ktav.wasm"
cmp "$root/vendor/tree-sitter/highlights.scm" "$grammar/queries/highlights.scm"
cmp "$root/vendor/ktav/LICENSE-MIT" "$js/LICENSE-MIT"
cmp "$root/vendor/ktav/LICENSE-APACHE" "$js/LICENSE-APACHE"
cmp "$root/vendor/tree-sitter/ktav-LICENSE-MIT" "$grammar/LICENSE-MIT"
cmp "$root/vendor/tree-sitter/ktav-LICENSE-APACHE" "$grammar/LICENSE-APACHE"
cp "$js/LICENSE-MIT" "$js/LICENSE-APACHE" "$root/vendor/ktav/"
cp "$grammar/LICENSE-MIT" "$root/vendor/tree-sitter/ktav-LICENSE-MIT"
cp "$grammar/LICENSE-APACHE" "$root/vendor/tree-sitter/ktav-LICENSE-APACHE"
cp "$js/dist/wasm/web/ktav.inline.js" "$root/vendor/ktav/ktav.inline.js"
cp "$RUNNER_TEMP/ktav-notices.txt" "$root/vendor/ktav/THIRD_PARTY_NOTICES.txt"
cp "$RUNNER_TEMP/tree-sitter-ktav.wasm" "$root/vendor/tree-sitter/tree-sitter-ktav.wasm"
cp "$grammar/queries/highlights.scm" "$root/vendor/tree-sitter/highlights.scm"

(cd "$root" && npm ci && php build/build.php)
(cd "$root" && npx --no-install esbuild assets/app.js --bundle --format=iife --target=es2020 --external:module --external:fs --external:fs/promises --external:path --external:url --external:crypto --external:worker_threads --external:os --external:util --external:child_process --external:perf_hooks --metafile="$RUNNER_TEMP/site-esbuild-meta.json" --outfile=assets/bundle.js)
(cd "$root" && node --test ci/npm-notices.test.mjs)
(cd "$root" && node ci/npm-notices.mjs "$RUNNER_TEMP/site-esbuild-meta.json") > "$RUNNER_TEMP/npm-notices.txt"
test -s "$RUNNER_TEMP/npm-notices.txt"
cmp "$root/vendor/npm/THIRD_PARTY_NOTICES.txt" "$RUNNER_TEMP/npm-notices.txt"
mkdir -p "$root/vendor/npm"
cp "$RUNNER_TEMP/npm-notices.txt" "$root/vendor/npm/THIRD_PARTY_NOTICES.txt"
(cd "$root" && node ci/site-smoke.mjs)
(cd "$js" && npx --no-install playwright install --with-deps chromium)
(cd "$root" && node ci/browser-smoke.mjs)
(cd "$root" && git diff --exit-code -- index.html assets/styles.css assets/bundle.js vendor/ktav/ktav.inline.js vendor/ktav/THIRD_PARTY_NOTICES.txt vendor/tree-sitter/tree-sitter-ktav.wasm vendor/tree-sitter/highlights.scm)

stage="$(mktemp -d "$RUNNER_TEMP/site-0.8.1.XXXXXX")"
mkdir -p "$stage/assets" "$stage/vendor/ktav" "$stage/vendor/npm" "$stage/vendor/tree-sitter" "$stage/provenance"
cp "$root/index.html" "$stage/index.html"
cp "$root/assets/styles.css" "$root/assets/bundle.js" "$stage/assets/"
cp "$root/vendor/ktav/ktav.inline.js" "$root/vendor/ktav/THIRD_PARTY_NOTICES.txt" "$root/vendor/ktav/LICENSE-MIT" "$root/vendor/ktav/LICENSE-APACHE" "$stage/vendor/ktav/"
cp "$root/vendor/npm/THIRD_PARTY_NOTICES.txt" "$stage/vendor/npm/"
cp "$root/vendor/tree-sitter/tree-sitter-ktav.wasm" "$root/vendor/tree-sitter/highlights.scm" "$root/vendor/tree-sitter/ktav-LICENSE-MIT" "$root/vendor/tree-sitter/ktav-LICENSE-APACHE" "$stage/vendor/tree-sitter/"
cp "$js/Cargo.lock" "$stage/provenance/ktav-js-0.8.1-Cargo.lock"
cp "$RUNNER_TEMP/wasm-bindgen.txt" "$stage/provenance/wasm-bindgen.txt"
printf 'stage=%s\n' "$stage" >> "$GITHUB_OUTPUT"
