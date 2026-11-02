import { createHash } from 'node:crypto';
import { lstatSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const PROFILE_SHA256 = '58bf0737f215b4579cb1a6419b49c7e8137755fc25fce9e9866ff43ec8e681eb';
const SOURCE_REVISION = 'cd5b087cd9f45ca6d93ab1954f6b7c8534f324d2';
const RUNTIME_SHA256 = '082795b88fe15e4b64043f835b4d7160fbf95e801855122acc9509239b5ef916';
const ROLES = { license: 'LICENSE', utf8: 'utf8.h', utf16: 'utf16.h', umachine: 'umachine.h' };

function digest(data) {
  return createHash('sha256').update(data).digest('hex');
}

function bounded(path, limit) {
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > limit) throw new Error('Missing, symlinked or oversized ICU notice input');
  const data = readFileSync(path);
  if (data.length > limit) throw new Error('ICU notice input exceeds bound');
  return data;
}

export function validateProfile(profile) {
  if (profile.schema_version !== 1 || profile.runtime_package !== 'web-tree-sitter' || profile.runtime_version !== '0.26.8' || profile.runtime_sha256 !== RUNTIME_SHA256 || profile.source_repository !== 'https://github.com/tree-sitter/tree-sitter' || profile.source_revision !== SOURCE_REVISION) {
    throw new Error('Unreviewed ICU runtime/source identity');
  }
  if (!Array.isArray(profile.materials) || profile.materials.length !== Object.keys(ROLES).length) throw new Error('Missing mandatory ICU legal/source roles');
  const seen = new Set();
  for (const entry of profile.materials) {
    const filename = Object.hasOwn(ROLES, entry.role) ? ROLES[entry.role] : null;
    if (!filename || seen.has(entry.role) || entry.path !== `vendor/tree-sitter/icu/${filename}` || entry.source_path !== `lib/src/unicode/${filename}` || !/^[0-9a-f]{64}$/.test(entry.sha256) || !/^[0-9a-f]{40}$/.test(entry.git_blob) || !Number.isSafeInteger(entry.bytes) || entry.bytes <= 0 || entry.bytes > 4 * 1024 * 1024) {
      throw new Error('Invalid or duplicate ICU material role');
    }
    seen.add(entry.role);
  }
  return profile;
}

export function verifyIcu(root) {
  const raw = bounded(resolve(root, 'provenance/tree-sitter-icu.json'), 1024 * 1024);
  if (digest(raw) !== PROFILE_SHA256) throw new Error('ICU source profile differs from reviewed bytes');
  const profile = validateProfile(JSON.parse(raw));
  const lock = JSON.parse(bounded(resolve(root, 'package-lock.json'), 4 * 1024 * 1024));
  const runtime = lock.packages?.['node_modules/web-tree-sitter'];
  if (!runtime || runtime.version !== profile.runtime_version || runtime.integrity !== profile.runtime_integrity) throw new Error('ICU source profile differs from locked npm runtime');
  if (digest(bounded(resolve(root, 'vendor/tree-sitter/web-tree-sitter.wasm'), 16 * 1024 * 1024)) !== RUNTIME_SHA256) throw new Error('ICU notices are bound to a different runtime binary');
  for (const entry of profile.materials) {
    const data = bounded(resolve(root, entry.path), 4 * 1024 * 1024);
    const blob = createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
    if (data.length !== entry.bytes || digest(data) !== entry.sha256 || blob !== entry.git_blob) throw new Error(`Original ICU material bytes differ: ${entry.role}`);
  }
  return { runtime_sha256: RUNTIME_SHA256, source_revision: SOURCE_REVISION, material_roles: Object.keys(ROLES), scope: profile.scope };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(verifyIcu(resolve(process.argv[2] || '.')), null, 2));
}
