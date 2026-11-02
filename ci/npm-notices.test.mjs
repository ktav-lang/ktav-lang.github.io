import assert from 'node:assert/strict';
import test from 'node:test';
import { noticeNames, usedPackages } from './npm-notices.mjs';

test('maps bundled npm inputs to the deepest lockfile package', () => {
  const packages = { 'node_modules/a': {}, 'node_modules/a/node_modules/b': {} };
  const inputs = { 'node_modules/a/index.js': {}, 'node_modules/a/node_modules/b/index.js': {}, 'assets/app.js': {} };
  assert.deepEqual(usedPackages(inputs, packages), ['node_modules/a', 'node_modules/a/node_modules/b']);
  assert.throws(() => usedPackages({ 'node_modules/unknown/index.js': {} }, packages));
  assert.throws(() => usedPackages({ 'vendor/unreviewed.js': {} }, packages));
});

test('finds license and notice files without accepting unrelated files', () => {
  assert.deepEqual(noticeNames(['README.md', 'LICENSE-MIT', 'NOTICE.txt', 'LICENSE', 'notes.txt']), ['LICENSE', 'LICENSE-MIT', 'NOTICE.txt']);
});
