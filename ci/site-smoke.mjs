import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Language, Parser, Query } from 'web-tree-sitter';
import init, { dumps, loads, loadsBytes } from '../vendor/ktav/ktav.inline.js';

await init();
const document = loads('service: socks\ncount: 7\n');
assert.equal(document.service, 'socks');
assert.equal(document.count, 7);
assert.equal(loads(dumps(document)).service, 'socks');
assert.equal(loads('big: 9007199254740993\n').big, 9007199254740993n);
assert.throws(() => loadsBytes(new Uint8Array([0xff])), /InvalidUtf8/);

await Parser.init({ locateFile: () => resolve('vendor/tree-sitter/web-tree-sitter.wasm') });
const language = await Language.load(resolve('vendor/tree-sitter/tree-sitter-ktav.wasm'));
const parser = new Parser();
parser.setLanguage(language);
const tree = parser.parse('service: socks\ncount: 7\n');
assert.ok(tree);
assert.equal(tree.rootNode.hasError, false);
const query = new Query(language, await readFile('vendor/tree-sitter/highlights.scm', 'utf8'));
assert.ok(query.captures(tree.rootNode).some((capture) => capture.name === 'property'));
query.delete();
tree.delete();
parser.delete();

const html = await readFile('index.html', 'utf8');
assert.ok(html.includes('https://github.com/ktav-lang/editor/releases/download/v0.8.1/ktav-0.8.1.vsix'));
assert.ok(html.includes('ktav-intellij-0.8.1%2B20261026-0756.zip'));
assert.ok(html.includes('io.github.ktav-lang:ktav:0.8.1'));
console.log('WASM conversion, grammar highlighting and 0.8.1 links verified');
