import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Zero-dependency deterministic builder. Keep output as a self-contained HTML page.
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const manifest = JSON.parse(readFileSync(resolve(root, 'src/manifest.json'), 'utf8'));
const read = path => readFileSync(resolve(root, path), 'utf8');
const template = read('src/page.template.html');
const groups = {
  '{{STYLES}}': manifest.styles,
  '{{MACHINE}}': manifest.artwork,
  '{{RUNTIME}}': manifest.runtime,
};
let output = template;
for (const [token, paths] of Object.entries(groups)) {
  const count = output.split(token).length - 1;
  if (count !== 1) throw new Error(`Expected exactly one ${token} in template, found ${count}`);
  output = output.replace(token, paths.map(read).join(''));
}
if (output.includes('{{STYLES}}') || output.includes('{{MACHINE}}') || output.includes('{{RUNTIME}}')) {
  throw new Error('Unresolved source placeholder');
}
if (!output.includes('</html>') || !output.includes('id="page-title"')) {
  throw new Error('Built HTML failed integrity markers');
}
const target = resolve(root, 'index.html');
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== output) {
    console.error('Generated index.html differs from sources. Run npm run build.');
    process.exitCode = 1;
  } else console.log('Build is up-to-date');
} else {
  writeFileSync(target, output, 'utf8');
  console.log(`Built index.html (${Buffer.byteLength(output, 'utf8')} bytes)`);
}
