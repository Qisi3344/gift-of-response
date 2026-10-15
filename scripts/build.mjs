import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exhibit } from '../src/artwork/exhibit.mjs';
import {heartExhibit} from '../src/artwork/heart.mjs';

// Zero-dependency deterministic builder. Keep output as a self-contained HTML page.
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const manifest = JSON.parse(readFileSync(resolve(root, 'src/manifest.json'), 'utf8'));
const read = path => readFileSync(resolve(root, path), 'utf8');
const template = read('src/page.template.html');
const heart=process.argv.includes('--heart');
const scene = heart?heartExhibit():exhibit();
const groups = {
  '{{STYLES}}': heart?[...manifest.styles,'src/styles/heart.css']:manifest.styles,
  '{{RUNTIME}}': heart?manifest.runtime.flatMap(p=>p.endsWith('/interaction.js')?['src/runtime/steam.js','src/runtime/heart-motion.js',p]:[p]):manifest.runtime,
};
let output = template;
if(heart)output=output.replace('data-theme="dark"','data-theme="light"').replace('THE CEREBRAL ENGINE · 脑叶机械标本','THE RECIPROCAL HEART · 蒸汽心脏标本').replace('A mind of brass. A chamber of glass. A place for your words.','A heart of clockwork. A pulse for every offering.').replace('黄铜铸成思绪，玻璃珍藏回响。','蒸汽推动心搏，玻璃珍藏回响。').replace('THE MECHANICAL MIND · 机械心智馆藏','THE RECIPROCAL HEART · 机械心脏馆藏').replace('BRASS &amp; BRONZE','SILVER &amp; BRASS').replace('</div><div class="plate-foot">','<button type="button" id="pause-motion" aria-pressed="false">暂停动态</button></div><div class="plate-foot">');
output = output.replace('{{MACHINE}}', `<svg class="glass-layer glass-back" viewBox="0 0 960 600" aria-hidden="true"></svg>${scene.out.layerSvg('exhibit',{width:960,height:600})}<svg class="glass-layer glass-front" viewBox="0 0 960 600" aria-hidden="true"></svg>`);
for (const [token, paths] of Object.entries(groups)) {
  const count = output.split(token).length - 1;
  if (count !== 1) throw new Error(`Expected exactly one ${token} in template, found ${count}`);
  output = output.replace(token, paths.map(read).join(''));
}
output = output.replace('</style>', `${scene.out.css}</style>`);
output = output.replace('<script>', `<script>${read('vendor/anatomy/turn.mjs').replace(/^export /gm,'')}\nconst exhibitData=${JSON.stringify(scene.out.data)};\nconst exhibitProjection=${JSON.stringify(scene.P)};\n${heart?`const heartPorts=${JSON.stringify(scene.vents)};`:""}\n`);
if (output.includes('{{STYLES}}') || output.includes('{{MACHINE}}') || output.includes('{{RUNTIME}}')) {
  throw new Error('Unresolved source placeholder');
}
if (!output.includes('</html>') || !output.includes('id="page-title"')) {
  throw new Error('Built HTML failed integrity markers');
}
const target = resolve(root,heart?'experiments/heart-v03/index.html':'index.html');
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== output) {
    console.error('Generated index.html differs from sources. Run npm run build.');
    process.exitCode = 1;
  } else console.log('Build is up-to-date');
} else {
  writeFileSync(target, output, 'utf8');
  console.log(`Built ${heart?'experiments/heart-v03/index.html':'index.html'} (${Buffer.byteLength(output, 'utf8')} bytes)`);
}
