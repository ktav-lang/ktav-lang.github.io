"""Собрать CI-only runtime rebuild evidence без изменения vendored assets."""

import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys

SOURCE = 'cd5b087cd9f45ca6d93ab1954f6b7c8534f324d2'
RECIPE = 'cbf6408c63ee60a25906b9b3b3231dd49182e0bf6d4f462dcf9ff807f1e683ee'
ORIGINAL = '082795b88fe15e4b64043f835b4d7160fbf95e801855122acc9509239b5ef916'
IMAGE = 'emscripten/emsdk@sha256:27bc6267cb285223b8aebb7627bfebae7cb3ad2aaa0d5923b8aa5321793033e8'
METHODS = ['AsciiToString', 'stringToUTF8', 'UTF8ToString', 'lengthBytesUTF8', 'stringToUTF16', 'loadWebAssemblyModule', 'getValue', 'setValue', 'HEAPF32', 'HEAPF64', 'HEAP_DATA_VIEW', 'HEAP8', 'HEAPU8', 'HEAP16', 'HEAPU16', 'HEAP32', 'HEAPU32', 'HEAP64', 'HEAPU64', 'LE_HEAP_STORE_I64']


def read(path, limit):
    if path.is_symlink() or not path.is_file():
        raise ValueError('missing or symlinked runtime evidence input')
    with path.open('rb') as source:
        raw = source.read(limit + 1)
    if len(raw) > limit:
        raise ValueError('runtime evidence input exceeds bound')
    return raw


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def exports(first, second):
    lines = (first + second).replace('"', '').splitlines()
    if not lines or any(not re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*,', line) for line in lines):
        raise ValueError('upstream export syntax requires review')
    return ''.join('_' + line for line in lines).rstrip(',')


def run(command, root, evidence, name):
    with (evidence / (name + '.stdout.txt')).open('wb') as out, (evidence / (name + '.stderr.txt')).open('wb') as err:
        result = subprocess.run(command, cwd=root, stdout=out, stderr=err)
    if result.returncode:
        raise ValueError(f'{name} failed with exit code {result.returncode}; see preserved logs')


def main(root, evidence, original):
    evidence.mkdir(exist_ok=True)
    revision = subprocess.check_output(['git', '-c', 'safe.directory=' + str(root), 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
    if revision != SOURCE or sha(read(root / 'crates/xtask/src/build_wasm.rs', 1024 * 1024)) != RECIPE:
        raise ValueError('upstream source/recipe differs')
    if read(root / 'crates/loader/emscripten-version', 64).strip() != b'4.0.15':
        raise ValueError('upstream SDK version differs')
    original_raw = read(original, 16 * 1024 * 1024)
    if sha(original_raw) != ORIGINAL or original_raw[:8] != b'\0asm\x01\0\0\0':
        raise ValueError('original runtime identity differs')
    version = subprocess.check_output(['emcc', '--version'], text=True)
    if '4.0.15' not in version.splitlines()[0]:
        raise ValueError('actual emcc version differs')
    (evidence / 'emcc-version.txt').write_text(version, encoding='utf-8')
    export = exports(read(root / 'lib/src/wasm/stdlib-symbols.txt', 65536).decode(), read(root / 'lib/binding_web/lib/exports.txt', 65536).decode())
    flags = ['-O3', '--minify', '0', '-s', 'EXPORT_ES6=1', '-gsource-map=inline', '-fno-exceptions', '-std=c11']
    for value in ['WASM=1', 'MODULARIZE=1', 'INITIAL_MEMORY=33554432', 'ALLOW_MEMORY_GROWTH=1', 'SUPPORT_BIG_ENDIAN=1', 'WASM_BIGINT=1', 'MAIN_MODULE=2', 'FILESYSTEM=0', 'NODEJS_CATCH_EXIT=0', 'NODEJS_CATCH_REJECTION=0', 'EXPORTED_FUNCTIONS=' + export, 'EXPORTED_RUNTIME_METHODS=' + ','.join(METHODS)]:
        flags += ['-s', value]
    for value in ['fprintf(...)=', 'printf(...)=', 'NDEBUG=', '_POSIX_C_SOURCE=200112L', '_DEFAULT_SOURCE=', '_BSD_SOURCE=', '_DARWIN_C_SOURCE=']:
        flags += ['-D', value]
    flags += ['-I', 'lib/src', '-I', 'lib/include', '--js-library', 'lib/binding_web/lib/imports.js', '--pre-js', 'lib/binding_web/lib/prefix.js', '-o', 'lib/binding_web/lib/web-tree-sitter.mjs', 'lib/src/lib.c', 'lib/binding_web/lib/tree-sitter.c']
    (root / 'target/scratch').mkdir(parents=True, exist_ok=True)
    command = ['emcc', *flags]
    (evidence / 'commands.json').write_text(json.dumps({'nominal': command, 'diagnostic_extra': ['-Wl,-Map=/evidence/native-link.map', '-Wl,--trace', '-v'], 'recipe_sha256': RECIPE, 'scope': 'Transcription of pinned upstream release emcc arguments; no upstream source-map filtering.'}, indent=2) + '\n', encoding='utf-8')
    run(command, root, evidence, 'nominal')
    output = root / 'lib/binding_web/lib'
    nominal = read(output / 'web-tree-sitter.wasm', 16 * 1024 * 1024)
    shutil.copyfile(output / 'web-tree-sitter.wasm', evidence / 'nominal.wasm')
    shutil.copyfile(output / 'web-tree-sitter.wasm.map', evidence / 'nominal.unfiltered.wasm.map')
    run([*command, '-Wl,-Map=/evidence/native-link.map', '-Wl,--trace', '-v'], root, evidence, 'diagnostic')
    diagnostic = read(output / 'web-tree-sitter.wasm', 16 * 1024 * 1024)
    shutil.copyfile(output / 'web-tree-sitter.wasm', evidence / 'diagnostic.wasm')
    shutil.copyfile(output / 'web-tree-sitter.wasm.map', evidence / 'diagnostic.unfiltered.wasm.map')
    source_map = json.loads(read(evidence / 'diagnostic.unfiltered.wasm.map', 32 * 1024 * 1024))
    sdk_files = []
    seen = set()
    for name in source_map.get('sources', []):
        path = Path(name)
        candidates = [path] if path.is_absolute() else [output / path, root / path]
        found = next((p.resolve() for p in candidates if p.is_file() and p.resolve().is_relative_to(Path('/emsdk'))), None)
        if found is not None and str(found) not in seen:
            seen.add(str(found))
            raw = read(found, 4 * 1024 * 1024)
            sdk_files.append({'path': str(found), 'bytes': len(raw), 'sha256': sha(raw)})
    read(evidence / 'native-link.map', 32 * 1024 * 1024)
    trace = read(evidence / 'diagnostic.stdout.txt', 32 * 1024 * 1024).decode('utf-8') + read(evidence / 'diagnostic.stderr.txt', 32 * 1024 * 1024).decode('utf-8')
    link_inputs = []
    for name in sorted(set(re.findall(r'(/[^\s()\"\x27]+[.](?:a|o|bc))', trace))):
        path = Path(name)
        if not path.is_file():
            link_inputs.append({'path': name, 'available_after_link': False})
            continue
        if not path.resolve().is_relative_to(Path('/emsdk')):
            continue
        raw = read(path, 128 * 1024 * 1024)
        link_inputs.append({'path': name, 'available_after_link': True, 'bytes': len(raw), 'sha256': sha(raw)})
    if not any(item['available_after_link'] for item in link_inputs):
        raise ValueError('actual SDK linker input fingerprints missing')
    legal = []
    total = 0
    sdk = Path('/emsdk/upstream/emscripten')
    for parent in [sdk, sdk / 'system/lib']:
        paths = parent.iterdir() if parent == sdk else parent.rglob('*')
        for index, path in enumerate(paths):
            if index >= 65536:
                raise ValueError('SDK legal enumeration exceeds bound')
            if not path.is_file() or not re.fullmatch(r'(?:LICENSE|LICENCE|COPYING|COPYRIGHT|NOTICE)(?:[._-].*)?', path.name, re.I):
                continue
            if not path.resolve().is_relative_to(sdk.resolve()):
                raise ValueError('SDK legal original escapes SDK')
            raw = read(path, 4 * 1024 * 1024)
            total += len(raw)
            if total > 32 * 1024 * 1024 or len(legal) >= 1024:
                raise ValueError('SDK legal inventory exceeds bound')
            key = path.relative_to(sdk).as_posix()
            dest = evidence / 'sdk-legal' / key
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(raw)
            legal.append({'path': key, 'bytes': len(raw), 'sha256': sha(raw)})
    if not legal:
        raise ValueError('SDK original legal documents missing')
    report = {'source_ref': SOURCE, 'recipe_sha256': RECIPE, 'image': IMAGE, 'original_sha256': ORIGINAL, 'nominal_sha256': sha(nominal), 'diagnostic_sha256': sha(diagnostic), 'matches_original': nominal == original_raw, 'diagnostic_matches_nominal': diagnostic == nominal, 'sdk_source_map_files': sdk_files, 'link_input_fingerprints': link_inputs, 'sdk_legal': legal, 'scope': 'CI rebuild/input evidence only. A mismatch is a new candidate, not historical npm provenance. A source map is not a complete retained-code inventory; no legal approval or site asset replacement.'}
    (evidence / 'verification.json').write_text(json.dumps(report, sort_keys=True, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, sort_keys=True))


if __name__ == '__main__':
    main(*map(Path, sys.argv[1:4]))
