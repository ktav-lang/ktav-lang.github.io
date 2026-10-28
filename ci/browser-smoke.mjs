import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { extname, resolve, sep } from 'node:path';

const require = createRequire(resolve('_sources/ktav-js/package.json'));
const { chromium } = require('playwright');
const root = resolve('.');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.wasm': 'application/wasm', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(`${root}${sep}`)) throw new Error('Invalid path');
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    response.end(content);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle' });
  await page.selectOption('#src-format', 'ktav');
  await page.selectOption('#dst-format', 'json');
  await page.locator('#src-editor .cm-content').fill('service: socks\ncount: 7\n');
  await page.waitForFunction(() => document.querySelector('#dst-editor .cm-content')?.textContent.includes('"count": 7'));
  await page.waitForSelector('#src-editor .tok-key');
  const link = page.locator('#editors a[href*="ktav-0.8.1.vsix"]');
  assert.equal(await link.count(), 1);
  assert.equal(await page.locator('#editors a[href*="ktav-intellij-0.8.1%2B20261026-0756.zip"]').count(), 1);
  for (const lang of ['en', 'ru', 'zh']) {
    await page.locator(`button[data-lang="${lang}"]`).click();
    assert.equal(await page.locator('html').getAttribute('lang'), lang);
  }
  assert.deepEqual(errors, []);
  console.log('Browser conversion, syntax highlighting, languages and plugin links verified');
} finally {
  await browser.close();
  await new Promise((done, reject) => server.close((error) => error ? reject(error) : done()));
}
