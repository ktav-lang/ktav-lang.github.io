import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function usedPackages(inputs, packages) {
  const keys = Object.keys(packages).filter((path) => path.startsWith('node_modules/'));
  const local = new Set(['assets/app.js', 'assets/converter.js', 'assets/cm-editor.js', 'assets/cm-ktav.js', 'vendor/ktav/ktav.inline.js', 'vendor/js-yaml.mjs', 'vendor/smol-toml.mjs']);
  const used = new Set();
  for (const input of Object.keys(inputs)) {
    if (!input.startsWith('node_modules/')) {
      if (!local.has(input)) throw new Error(`Unreviewed local bundle input: ${input}`);
      continue;
    }
    const matches = keys.filter((path) => input.startsWith(`${path}/`)).sort((a, b) => b.length - a.length);
    if (!matches.length) throw new Error(`Bundle input is not present in lockfile: ${input}`);
    used.add(matches[0]);
  }
  return [...used].sort();
}

export function noticeNames(names) {
  return names.filter((name) => /^(licen[cs]e|copying|notice)(?:[._-][a-z0-9.-]+)?$/i.test(name)).sort();
}

async function main() {
  const meta = JSON.parse(await readFile(process.argv[2], 'utf8'));
  const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
  if (lock.lockfileVersion !== 3 || !lock.packages?.[''] || !meta.inputs || typeof meta.inputs !== 'object') {
    throw new Error('Invalid lockfile or bundle metadata');
  }
  const packages = usedPackages(meta.inputs, lock.packages);
  if (!packages.length) throw new Error('No npm package inputs found in bundle');
  let output = 'Third-party npm licenses for the site JavaScript bundle\n\n';
  for (const path of packages) {
    const locked = lock.packages[path];
    const installed = JSON.parse(await readFile(join(path, 'package.json'), 'utf8'));
    if (installed.version !== locked.version || installed.license !== locked.license) {
      throw new Error(`Installed package differs from lockfile: ${path}`);
    }
    const names = noticeNames(await readdir(path));
    if (!names.some((name) => /^(licen[cs]e|copying)(?:[._-][a-z0-9.-]+)?$/i.test(name))) {
      throw new Error(`Package license file missing: ${path}`);
    }
    output += `============================================================\n${installed.name} ${installed.version} (${installed.license})\n`;
    for (const name of names) {
      const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(await readFile(join(path, name)));
      output += `\n--- ${name} ---\n${text}\n`;
    }
  }
  process.stdout.write(output);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
