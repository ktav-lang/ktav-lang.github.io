"""CI-регрессии exact compiler argument boundary и bounded input reader."""

import importlib.util
from pathlib import Path
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location('grammar_evidence', Path(__file__).with_name('grammar-compiler-evidence.py'))
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def arguments(output):
    return ['--target=wasm32-unknown-wasi', '-o', str(output), '-fPIC', '-shared', '-Os', '-Wl,--export=tree_sitter_ktav', '-Wl,--allow-undefined', '-Wl,--no-entry', '-nostdlib', '-fno-exceptions', '-fvisibility=hidden', '-I', '.', 'parser.c']


class GrammarEvidenceTests(unittest.TestCase):
    def test_exact_source_command_and_optional_scanner_are_accepted(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            command = arguments(root / 'output.wasm')
            MODULE.validate_arguments(command, root, root)
            MODULE.validate_arguments([*command, 'scanner.c'], root, root)

    def test_library_target_and_flag_changes_are_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            command = arguments(root / 'output.wasm')
            for changed in [[*command, '-lc'], ['--target=wasm32-unknown-unknown', *command[1:]], [value for value in command if value != '-nostdlib'], [*command, 'other.c']]:
                with self.subTest(command=changed), self.assertRaisesRegex(ValueError, 'unreviewed grammar'):
                    MODULE.validate_arguments(changed, root, root)

    def test_output_escape_is_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            with self.assertRaisesRegex(ValueError, 'output escapes'):
                MODULE.validate_arguments(arguments(root.parent / 'outside.wasm'), root, root)

    def test_original_byte_reader_is_bounded(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / 'input'
            path.write_bytes(b'\x00\xffdata')
            self.assertEqual(MODULE.read(path, 6), b'\x00\xffdata')
            with self.assertRaisesRegex(ValueError, 'exceeds bound'):
                MODULE.read(path, 5)


if __name__ == '__main__':
    unittest.main()
