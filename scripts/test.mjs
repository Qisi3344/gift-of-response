import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

execFileSync(process.execPath, ['scripts/build.mjs', '--check'], { stdio: 'inherit' });
const html = readFileSync(resolve('index.html'), 'utf8');
const required = ['id="page-title"', 'id="exhibit"', 'id="flower-petals"', 'id="engraved-name"', 'id="drawn-flower"', 'id="letter"', 'id="letter-body"', 'id="memory-text"', 'id="name-form"'];
for (const marker of required) assert(html.includes(marker), `Missing ${marker}`);
for (const action of ['name', 'language', 'memory', 'creation', 'affection']) {
  assert(html.includes(`data-module="${action}"`), `Missing mechanical module ${action}`);
}
console.log('Structural integrity checks passed');
