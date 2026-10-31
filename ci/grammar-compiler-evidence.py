"""Собрать actual grammar compiler/linker evidence только в GitHub CI."""

import hashlib
import json
import os
from pathlib import Path
import re
import shlex
import subprocess
import sys

SOURCE = 'ca25876463583d54caf51d54bdd7bae27e599c5f'
BINARY = 'f7ba7e8aedd163a35ab1cfee681734ac1ce268dc65460640c75fd09113213b99'


def read(path, limit):
    if path.is_symlink() or not path.is_file():
        raise ValueError('missing or symlinked grammar evidence input')
    with path.open('rb') as source:
        raw = source.read(limit + 1)
    if len(raw) > limit:
        raise ValueError('grammar evidence input exceeds bound')
    return raw


def fingerprint(path):
    raw = read(path, 128 * 1024 * 1024)
    return {'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()}


def validate_arguments(args, cwd, evidence):
    if len(args) < 3:
        raise ValueError('unreviewed grammar compiler arguments')
    expected = ['--target=wasm32-unknown-wasi', '-o', args[2], '-fPIC', '-shared', '-Os', '-Wl,--export=tree_sitter_ktav', '-Wl,--allow-undefined', '-Wl,--no-entry', '-nostdlib', '-fno-exceptions', '-fvisibility=hidden', '-I', '.', 'parser.c']
    if args[:len(expected)] != expected or len(args) not in {len(expected), len(expected) + 1}:
        raise ValueError('unreviewed grammar compiler arguments')
    output = (cwd / args[2]).resolve()
    if not output.is_relative_to(evidence.resolve()):
        raise ValueError('grammar compiler output escapes evidence')
    if len(args) > len(expected) and (cwd / args[-1]).resolve() != (cwd / 'scanner.c').resolve():
        raise ValueError('unreviewed grammar scanner source')


def compiler(evidence, actual, args):
    cwd = Path.cwd()
    validate_arguments(args, cwd, evidence)
    record = evidence / 'actual-compiler-command.json'
    if record.exists():
        raise ValueError('unexpected additional grammar compiler invocation')
    command = [str(actual), *args, '-Wl,-Map=' + str(evidence / 'native-link.map'), '-Wl,--trace', '-H', '-v']
    record.write_text(json.dumps({'cwd': str(cwd), 'original_arguments': args, 'diagnostic_command': command}, indent=2) + '\n', encoding='utf-8')
    with (evidence / 'compiler-stdout.txt').open('wb') as out, (evidence / 'compiler-stderr.txt').open('wb') as err:
        result = subprocess.run(command, stdout=out, stderr=err)
    return result.returncode


def main(grammar, nominal_path, sdk, evidence):
    if subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=grammar, text=True).strip() != SOURCE:
        raise ValueError('grammar source revision differs')
    nominal = read(nominal_path, 16 * 1024 * 1024)
    if hashlib.sha256(nominal).hexdigest() != BINARY:
        raise ValueError('nominal grammar differs from actual served bytes')
    evidence.mkdir()
    actual = (sdk / 'bin/clang').resolve()
    if not actual.is_relative_to(sdk.resolve()):
        raise ValueError('compiler escapes selected SDK')
    version = subprocess.check_output([str(actual), '--version'], text=True)
    if '21.1.4' not in version or '222fc11f2b8f25f6a0f4976272ef1bb7bf49521d' not in version:
        raise ValueError('actual grammar compiler identity requires review')
    (evidence / 'compiler-version.txt').write_text(version, encoding='utf-8')
    wrapper = evidence / 'sdk-wrapper/bin/clang'
    wrapper.parent.mkdir(parents=True)
    prefix = shlex.join([sys.executable, '-I', str(Path(__file__).resolve()), '--compiler', str(evidence.resolve()), str(actual)])
    wrapper.write_text('#!/bin/sh\nexec ' + prefix + ' "$@"\n', encoding='utf-8')
    wrapper.chmod(0o755)
    diagnostic_path = evidence / 'diagnostic.wasm'
    environment = {**os.environ, 'TREE_SITTER_WASI_SDK_PATH': str(wrapper.parent.parent.resolve())}
    result = subprocess.run(['tree-sitter', 'build', '--wasm', '-o', str(diagnostic_path.resolve())], cwd=grammar, env=environment, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    (evidence / 'tree-sitter-stdout.txt').write_bytes(result.stdout)
    (evidence / 'tree-sitter-stderr.txt').write_bytes(result.stderr)
    if result.returncode:
        raise ValueError('actual diagnostic grammar build failed; see preserved compiler logs')
    diagnostic = read(diagnostic_path, 16 * 1024 * 1024)
    if diagnostic != nominal:
        raise ValueError('diagnostic grammar bytes differ from actual served grammar')
    trace = read(evidence / 'compiler-stderr.txt', 16 * 1024 * 1024).decode('utf-8')
    mapping = read(evidence / 'native-link.map', 16 * 1024 * 1024).decode('utf-8')
    sources = []
    src = grammar / 'src'
    selected = {src / 'parser.c'}
    if (src / 'scanner.c').is_file():
        selected.add(src / 'scanner.c')
    for name in re.findall(r'^\.+ (.+)$', trace, re.M):
        selected.add((src / name).resolve())
    total = 0
    for path in sorted(selected):
        path = path.resolve()
        if path.is_relative_to(grammar.resolve()):
            role, relative = 'grammar-source', path.relative_to(grammar.resolve()).as_posix()
        elif path.is_relative_to(sdk.resolve()):
            role, relative = 'sdk-header', path.relative_to(sdk.resolve()).as_posix()
        else:
            raise ValueError('compiler header input escapes selected source/SDK')
        raw = read(path, 4 * 1024 * 1024)
        total += len(raw)
        if total > 32 * 1024 * 1024 or len(sources) >= 1024:
            raise ValueError('grammar source inventory exceeds bound')
        dest = evidence / 'source-originals' / role / relative
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(raw)
        sources.append({'role': role, 'path': relative, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()})
    archives = sorted(set(re.findall(r'[^\s()]+[.]a(?:\([^)]*\))?', mapping)))
    legal = []
    legal_total = 0
    for index, path in enumerate(sdk.rglob('*')):
        if index >= 65536:
            raise ValueError('SDK legal enumeration exceeds bound')
        if not path.is_file() or not re.fullmatch(r'(?:LICENSE|LICENCE|COPYING|COPYRIGHT|NOTICE)(?:[._-].*)?', path.name, re.I):
            continue
        if not path.resolve().is_relative_to(sdk.resolve()):
            raise ValueError('SDK legal original escapes selected SDK')
        raw = read(path, 4 * 1024 * 1024)
        legal_total += len(raw)
        if legal_total > 32 * 1024 * 1024 or len(legal) >= 1024:
            raise ValueError('grammar SDK legal inventory exceeds bound')
        relative = path.relative_to(sdk).as_posix()
        dest = evidence / 'sdk-legal' / relative
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(raw)
        legal.append({'path': relative, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()})
    record = {'source_ref': SOURCE, 'binary_sha256': BINARY, 'diagnostic_matches_nominal': True, 'compiler': fingerprint(actual), 'map_sha256': hashlib.sha256(mapping.encode('utf-8')).hexdigest(), 'map_archive_members': archives, 'source_inputs': sources, 'sdk_legal': legal, 'scope': 'Actual matching grammar build with logged compiler arguments, full selected source/header originals and diagnostic link map. SDK inventory is not proof of included code; no redistribution-rights approval or served asset change.'}
    (evidence / 'verification.json').write_text(json.dumps(record, sort_keys=True, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(record, sort_keys=True))


if __name__ == '__main__':
    if sys.argv[1:2] == ['--compiler']:
        raise SystemExit(compiler(Path(sys.argv[2]), Path(sys.argv[3]), sys.argv[4:]))
    if len(sys.argv) != 5:
        raise SystemExit('usage: grammar-compiler-evidence.py GRAMMAR NOMINAL SDK EVIDENCE')
    main(*map(Path, sys.argv[1:]))
