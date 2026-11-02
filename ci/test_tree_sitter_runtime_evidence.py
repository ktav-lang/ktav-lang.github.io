"""CI-регрессии bounded reader и exact export transcription."""

import importlib.util
from pathlib import Path
import tempfile
import unittest

SCRIPT = Path(__file__).with_name('tree-sitter-runtime-evidence.py')
SPEC = importlib.util.spec_from_file_location('runtime_evidence', SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class RuntimeEvidenceTests(unittest.TestCase):
    def test_upstream_export_transcription(self):
        self.assertEqual(MODULE.exports('"calloc",\n"free",\n', '"ts_init",\n'), '_calloc,_free,_ts_init')

    def test_unreviewed_export_syntax_is_rejected(self):
        for text in ['', 'function()\n', 'symbol\n', 'symbol,extra,\n', '-flag,\n']:
            with self.subTest(text=text), self.assertRaisesRegex(ValueError, 'requires review'):
                MODULE.exports(text, '')

    def test_reader_preserves_bytes_and_rejects_overflow(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'input'
            path.write_bytes(b'\x00\xffabc')
            self.assertEqual(MODULE.read(path, 5), b'\x00\xffabc')
            with self.assertRaisesRegex(ValueError, 'exceeds bound'):
                MODULE.read(path, 4)

    def test_reader_rejects_missing_files_and_directories(self):
        with tempfile.TemporaryDirectory() as folder:
            for path in [Path(folder), Path(folder) / 'missing']:
                with self.assertRaisesRegex(ValueError, 'missing or symlinked'):
                    MODULE.read(path, 16)


if __name__ == '__main__':
    unittest.main()
