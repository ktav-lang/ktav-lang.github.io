"""CI-регрессии обязательных runtime/source/legal roles и staged delivery."""

import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('runtime_notices', Path(__file__).with_name('check-tree-sitter-runtime-notices.py'))
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)
CORE = ['provenance/tree-sitter-runtime-sdk.json', 'package-lock.json', 'THIRD_PARTY_NOTICES.txt', 'vendor/tree-sitter/web-tree-sitter.wasm']


class RuntimeNoticeTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name) / 'source'
        self.copy_core(self.root)
        shutil.copytree(ROOT / MODULE.BASE, self.root / MODULE.BASE)

    def copy_core(self, root):
        for name in CORE:
            destination = root / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / name, destination)

    def test_exact_originals_and_stage_are_verified(self):
        self.assertEqual(MODULE.verify(self.root)['materials'], 71)
        destination = Path(self.temporary.name) / 'stage'
        self.copy_core(destination)
        self.assertEqual(MODULE.stage(self.root, destination)['original_bytes'], 403184)
        self.assertEqual(MODULE.verify(destination), MODULE.verify(self.root))

    def test_missing_original_is_rejected(self):
        (self.root / MODULE.BASE / 'compiler-rt/LICENSE.TXT').unlink()
        with self.assertRaisesRegex(ValueError, 'missing runtime notice'):
            MODULE.verify(self.root)

    def test_changed_source_copyright_bytes_are_rejected(self):
        path = self.root / MODULE.BASE / 'sources/system/lib/dlmalloc.c'
        path.write_bytes(path.read_bytes() + b'\n')
        with self.assertRaisesRegex(ValueError, 'copyright/grant/source bytes differ'):
            MODULE.verify(self.root)

    def test_profile_cannot_remove_a_required_role(self):
        path = self.root / MODULE.PROFILE
        document = json.loads(path.read_bytes())
        document['materials'] = document['materials'][1:]
        path.write_text(json.dumps(document), encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'unreviewed runtime notice profile'):
            MODULE.verify(self.root)

    def test_changed_runtime_is_rejected(self):
        (self.root / 'vendor/tree-sitter/web-tree-sitter.wasm').write_bytes(b'other wasm')
        with self.assertRaisesRegex(ValueError, 'runtime bytes differ'):
            MODULE.verify(self.root)

    def test_changed_npm_version_or_integrity_is_rejected(self):
        path = self.root / 'package-lock.json'
        original = json.loads(path.read_bytes())
        for field in ['version', 'integrity']:
            document = json.loads(json.dumps(original))
            document['packages']['node_modules/web-tree-sitter'][field] = 'unreviewed'
            path.write_text(json.dumps(document), encoding='utf-8')
            with self.subTest(field=field), self.assertRaisesRegex(ValueError, 'npm identity differs'):
                MODULE.verify(self.root)

    def test_aggregate_notice_must_retain_runtime_roles(self):
        (self.root / 'THIRD_PARTY_NOTICES.txt').write_text('notices omitted', encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'aggregate notice omits'):
            MODULE.verify(self.root)

    def test_symlinked_material_directory_is_rejected(self):
        path = self.root / MODULE.BASE / 'emscripten'
        moved = Path(self.temporary.name) / 'outside'
        path.rename(moved)
        path.symlink_to(moved, target_is_directory=True)
        with self.assertRaisesRegex(ValueError, 'symlinked runtime notice'):
            MODULE.verify(self.root)

    def test_reader_bounds_and_parent_escape_are_rejected(self):
        with self.assertRaisesRegex(ValueError, 'exceeds bound'):
            MODULE.read(self.root, MODULE.PROFILE, 1)
        for path in ['../outside', '/outside', 'vendor\\outside']:
            with self.subTest(path=path), self.assertRaisesRegex(ValueError, 'unsafe runtime notice path'):
                MODULE.read(self.root, path, 16)


if __name__ == '__main__':
    unittest.main()
