#!/usr/bin/env node
/**
 * Bumps welmi-killer-data/altstore/apps.json with a new version entry
 * and pushes it back via the GitHub API.
 *
 * Env:
 *   GH_TOKEN      — GitHub PAT with `repo` scope on welmi-killer-data
 *   VERSION       — semver tag like "v0.1.1" (without leading 'v' is OK too)
 */
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const OWNER = 'theriderymarketing';
const DATA_REPO = 'welmi-killer-data';
const APP_REPO = 'welmi-killer';
const MANIFEST_PATH = 'altstore/apps.json';

const versionArg = process.argv[2] ?? process.env.VERSION;
if (!versionArg) {
  console.error('Usage: update-manifest.mjs <version>');
  process.exit(1);
}
const version = versionArg.replace(/^v/, '');
const tag = `v${version}`;
const token = process.env.GH_TOKEN;
if (!token) {
  console.error('GH_TOKEN missing');
  process.exit(1);
}

const ipaUrl = `https://github.com/${OWNER}/${APP_REPO}/releases/download/${tag}/WelmiKiller.ipa`;
const ipaSize = (() => {
  try {
    return fs.statSync('WelmiKiller.ipa').size;
  } catch {
    return 0;
  }
})();

const api = (path, init = {}) =>
  fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {})
    }
  });

const r = await api(`/repos/${OWNER}/${DATA_REPO}/contents/${MANIFEST_PATH}`);
if (!r.ok) {
  console.error(`Fetch manifest failed: ${r.status}`);
  process.exit(1);
}
const file = await r.json();
const manifest = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));

const newVersion = {
  version,
  date: new Date().toISOString(),
  localizedDescription: `Release ${tag}.`,
  downloadURL: ipaUrl,
  size: ipaSize || 18000000,
  minOSVersion: '17.0'
};

manifest.apps[0].versions = [newVersion, ...(manifest.apps[0].versions ?? [])];

const updated = JSON.stringify(manifest, null, 2);
const put = await api(`/repos/${OWNER}/${DATA_REPO}/contents/${MANIFEST_PATH}`, {
  method: 'PUT',
  body: JSON.stringify({
    message: `chore(altstore): publish ${tag}`,
    content: Buffer.from(updated).toString('base64'),
    sha: file.sha
  })
});

if (!put.ok) {
  console.error(`PUT manifest failed: ${put.status}`, await put.text());
  process.exit(1);
}
console.log(`✓ Manifest updated for ${tag} (${ipaSize} bytes)`);
