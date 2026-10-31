import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { validateProfile, verifyIcu } from './check-tree-sitter-icu.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const PROFILE_PATH = 'provenance/tree-sitter-icu.json';
const PROFILE = JSON.parse(readFileSync(resolve(ROOT, PROFILE_PATH), 'utf8'));
validateProfile(PROFILE);

function fixture(t) {
  const root = mkdtempSync(resolve(tmpdir(), 'icu-notice-'));
  t.after(() => rmSync(root, { recursive: true }));
  for (const name of [PROFILE_PATH, 'package-lock.json', 'vendor/tree-sitter/web-tree-sitter.wasm', ...PROFILE.materials.map((entry) => entry.path)]) {
    const path = resolve(root, name);
    mkdirSync(dirname(path), { recursive: true });
    copyFileSync(resolve(ROOT, name), path);
  }
  return root;
}

test('exact reviewed runtime, lock and all original materials pass', (t) => {
  assert.deepEqual(verifyIcu(fixture(t)).material_roles, ['license', 'utf8', 'utf16', 'umachine']);
});

test('missing license is rejected', (t) => {
  const root = fixture(t);
  unlinkSync(resolve(root, 'vendor/tree-sitter/icu/LICENSE'));
  assert.throws(() => verifyIcu(root), { code: 'ENOENT' });
});

test('changed original copyright bytes are rejected', (t) => {
  const root = fixture(t);
  writeFileSync(resolve(root, 'vendor/tree-sitter/icu/utf8.h'), 'changed');
  assert.throws(() => verifyIcu(root), /Original ICU material bytes differ/);
});

test('a profile cannot omit its mandatory license role', () => {
  const profile = structuredClone(PROFILE);
  profile.materials = profile.materials.filter((entry) => entry.role !== 'license');
  assert.throws(() => validateProfile(profile), /mandatory ICU legal\/source roles/);
});

test('prototype names cannot replace a legal role', () => {
  const profile = structuredClone(PROFILE);
  const entry = profile.materials.find((item) => item.role === 'license');
  entry.role = '__proto__';
  entry.path = 'vendor/tree-sitter/icu/[object Object]';
  entry.source_path = 'lib/src/unicode/[object Object]';
  assert.throws(() => validateProfile(profile), /Invalid or duplicate ICU material role/);
});

test('changed runtime bytes are rejected', (t) => {
  const root = fixture(t);
  writeFileSync(resolve(root, 'vendor/tree-sitter/web-tree-sitter.wasm'), 'not the reviewed runtime');
  assert.throws(() => verifyIcu(root), /different runtime binary/);
});

test('unreviewed npm runtime version is rejected', (t) => {
  const root = fixture(t);
  const lock = JSON.parse(readFileSync(resolve(root, 'package-lock.json'), 'utf8'));
  lock.packages['node_modules/web-tree-sitter'].version = '0.26.9';
  writeFileSync(resolve(root, 'package-lock.json'), JSON.stringify(lock));
  assert.throws(() => verifyIcu(root), /locked npm runtime/);
});

test('symlinked legal material is rejected', (t) => {
  const root = fixture(t);
  const path = resolve(root, 'vendor/tree-sitter/icu/LICENSE');
  unlinkSync(path);
  symlinkSync(resolve(ROOT, 'vendor/tree-sitter/icu/LICENSE'), path);
  assert.throws(() => verifyIcu(root), /symlinked/);
});
