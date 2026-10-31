"""Проверить exact runtime/source/legal bindings в source tree или staged site."""

import hashlib
import json
from pathlib import Path, PurePosixPath
import sys

PROFILE = 'provenance/tree-sitter-runtime-sdk.json'
PROFILE_SHA = '6ac8b74be7cf6a36982149380ee6ffe7a11e74f84ade43de35e21f841eb98a85'
RUNTIME_SHA = '082795b88fe15e4b64043f835b4d7160fbf95e801855122acc9509239b5ef916'
BASE = 'vendor/tree-sitter/runtime-sdk/'


def checked_path(root, name):
    if root.is_symlink():
        raise ValueError('symlinked runtime notice root')
    relative = PurePosixPath(name)
    if relative.is_absolute() or '..' in relative.parts or '\\' in name:
        raise ValueError('unsafe runtime notice path')
    path = root
    for part in relative.parts:
        path /= part
        if path.is_symlink():
            raise ValueError('symlinked runtime notice input')
    return path


def read(root, name, limit):
    path = checked_path(root, name)
    if not path.is_file():
        raise ValueError('missing runtime notice input: ' + name)
    with path.open('rb') as source:
        raw = source.read(limit + 1)
    if len(raw) > limit:
        raise ValueError('runtime notice input exceeds bound')
    return raw


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def profile(root):
    raw = read(root, PROFILE, 1024 * 1024)
    if sha(raw) != PROFILE_SHA:
        raise ValueError('unreviewed runtime notice profile')
    return json.loads(raw)


def verify(root):
    data = profile(root)
    runtime = read(root, 'vendor/tree-sitter/web-tree-sitter.wasm', 16 * 1024 * 1024)
    if sha(runtime) != RUNTIME_SHA or data['runtime_sha256'] != RUNTIME_SHA:
        raise ValueError('runtime bytes differ from source/legal bindings')
    lock = json.loads(read(root, 'package-lock.json', 4 * 1024 * 1024))
    identity = lock['packages']['node_modules/web-tree-sitter']
    if identity['version'] != data['runtime_version'] or identity['integrity'] != data['runtime_integrity']:
        raise ValueError('runtime npm identity differs')
    materials = data['materials']
    roles = {item['role'] for item in materials}
    required = {'emscripten-license', 'musl-copyright', 'compiler-rt-license', 'emscripten-authors', 'source:system/lib/dlmalloc.c', 'generated-header:endian.h', 'generated-header:atomic_arch.h'}
    if len(materials) != 71 or len(roles) != 71 or not required <= roles:
        raise ValueError('required runtime legal/source roles differ')
    total = 0
    for item in materials:
        if not item['path'].startswith(BASE):
            raise ValueError('runtime original path escapes material directory')
        raw = read(root, item['path'], 4 * 1024 * 1024)
        blob = hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()
        if len(raw) != item['bytes'] or sha(raw) != item['sha256'] or blob != item['git_blob']:
            raise ValueError('runtime copyright/grant/source bytes differ: ' + item['role'])
        total += len(raw)
        if total > 8 * 1024 * 1024:
            raise ValueError('runtime original inventory exceeds bound')
    notice = read(root, 'THIRD_PARTY_NOTICES.txt', 1024 * 1024).decode('utf-8')
    for name in [PROFILE, BASE + 'emscripten/LICENSE', BASE + 'emscripten/AUTHORS', BASE + 'musl/COPYRIGHT', BASE + 'compiler-rt/LICENSE.TXT', BASE + 'sources/system/lib/dlmalloc.c']:
        if name not in notice:
            raise ValueError('aggregate notice omits a required runtime role')
    return {'runtime_sha256': RUNTIME_SHA, 'profile_sha256': PROFILE_SHA, 'materials': len(materials), 'original_bytes': total, 'scope': data['scope']}


def stage(root, destination):
    verify(root)
    for name in [PROFILE, *(item['path'] for item in profile(root)['materials'])]:
        raw = read(root, name, 4 * 1024 * 1024)
        path = checked_path(destination, name)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(raw)
        if read(destination, name, 4 * 1024 * 1024) != raw:
            raise ValueError('runtime legal bytes changed during staging')
    return verify(destination)


if __name__ == '__main__':
    if len(sys.argv) == 2:
        result = verify(Path(sys.argv[1]))
    elif len(sys.argv) == 3:
        result = stage(Path(sys.argv[1]), Path(sys.argv[2]))
    else:
        raise SystemExit('usage: check-tree-sitter-runtime-notices.py ROOT [STAGE]')
    print(json.dumps(result, sort_keys=True))
