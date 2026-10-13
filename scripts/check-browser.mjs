import {spawnSync} from 'node:child_process';
import {writeFileSync,mkdirSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const mode=process.argv[2]||'desktop',phone=mode==='phone',reduced=mode==='reduced';
const chrome=[process.env.CHROME_PATH,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>p&&existsSync(p));
assert(chrome,'Set CHROME_PATH');mkdirSync('shots',{recursive:true});
const check=(js,message)=>['eval',`(()=>{if(!(${js}))throw Error(${JSON.stringify(message)});return ${JSON.stringify('PASS: '+message)}})()`];
const readout=`document.querySelector('[data-readout]').textContent`;
const steps=[
  check('document.querySelectorAll("[data-live] [data-name]").length > 150','real 3D parts mounted'),
  ['shot',`shots/${mode}-front.png`,'.page',1],
  ['eval',`window.beforeOrbit=Object.fromEntries(['plinth','lobe.-1.1.1','pillar.0','pressure-gauge.1'].map(n=>[n,document.querySelector('[data-name="'+n+'"]').outerHTML]));`],
  ['key','ArrowRight','#exhibit'],['until','Number(document.getElementById("exhibit").dataset.angle)>14.9'],
  check(`Object.entries(beforeOrbit).every(([n,v])=>document.querySelector('[data-name="'+n+'"]').outerHTML!==v)`,'keyboard turns brain, base, chamber structure and gauge together'),
  ['drag','#exhibit',.3,.5,.7,.5,15],
  check('Number(document.getElementById("exhibit").dataset.angle)>25','pointer dragging rotates exhibit'),
  ['eval','window.__isoTurn.set(90)'],['shot',`shots/${mode}-side.png`,'#exhibit',1],
  ['eval','window.__isoTurn.set(180)'],['shot',`shots/${mode}-rear.png`,'#exhibit',1],
  ['eval','window.__isoTurn.set(270)'],['shot',`shots/${mode}-opposite.png`,'#exhibit',1],
  ['click','#reset-view'],['until','Number(document.getElementById("exhibit").dataset.angle)<.1'],
  ['eval',`document.getElementById('name-input').value='小狼 & 木栖';`],['key','Enter','#name-input'],['until',`${readout}==='Named: 小狼 & 木栖'`],
  check(`document.getElementById('engraved-name').textContent==='小狼 & 木栖'`,'Unicode name engraved'),
  ['click','[data-module="language"]'],['until',`${readout}.includes('Your first reply is ready')`],['click','#read-letter'],
  check('document.getElementById("letter").open','reply opens'),['shot',`shots/${mode}-letter.png`,'#letter',1],['key','Escape','#letter button'],
  check('!document.getElementById("letter").open','Escape closes reply'),
  ['click','[data-module="memory"]'],['until',`!${readout}.includes('Turning')`],
  ['eval',`window.beforeMemory=document.getElementById('memory-text').textContent`],['click','#next-memory'],['until',`!${readout}.includes('Turning')`],
  check('document.getElementById("memory-text").textContent!==beforeMemory','memory changes'),
  ['click','[data-module="creation"]'],['until',`${readout}.includes('One flower, drawn together')`],
  check('document.getElementById("drawn-flower").getAttribute("opacity")==="1"','flower finishes'),
  ['key',' ','[data-module="affection"]'],['until',`${readout}.includes('To answer is also')`],
  check('document.getElementById("exhibit").dataset.affection==="1.00"','affection opens mechanical rose'),
  ['shot',`shots/${mode}-complete.png`,'.page',1],
  check('document.documentElement.scrollWidth<=innerWidth','no horizontal overflow'),
  check('document.querySelectorAll("[data-module][aria-pressed=true]").length===1','one selected module'),
  ['eval','location.reload()'],['until','document.getElementById("engraved-name")?.textContent==="小狼 & 木栖"'],
  check('JSON.parse(localStorage.getItem("gift-of-response:v1")).memories.some(m=>m.text==="One flower, drawn together.")','name and memories persist')
];
if(reduced)steps.push(check('document.getElementById("auto-rotate").disabled','reduced motion disables automatic rotation'));
else steps.push(['click','#auto-rotate'],['wait',500],check('Number(document.getElementById("exhibit").dataset.angle)>1','automatic rotation advances'),['click','[data-module="name"]'],check('document.getElementById("auto-rotate").getAttribute("aria-pressed")==="false"','interaction stops tour'));
writeFileSync(`shots/${mode}-actions.json`,JSON.stringify(steps,null,2));
const result=spawnSync(process.execPath,['scripts/drive.mjs','index.html','--actions',`shots/${mode}-actions.json`,'--width',phone?'390':'1440','--height',phone?'1100':'1500',...(reduced?['--reduced']:[])],{encoding:'utf8',env:{...process.env,CHROME_PATH:chrome},windowsHide:true});
writeFileSync(`shots/${mode}-checks.log`,result.stdout+result.stderr);console.log(result.stdout);console.error(result.stderr);
assert.equal(result.status,0);assert(result.stdout.includes('console: clean'));
