import {spawnSync} from 'node:child_process';
import {writeFileSync,mkdirSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const profile=process.argv[2]||'desktop',phone=profile==='phone',reduced=profile==='reduced',mode='heart-'+profile;
const chrome=[process.env.CHROME_PATH,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>p&&existsSync(p));
assert(chrome,'Set CHROME_PATH');mkdirSync('shots',{recursive:true});
const check=(js,message)=>['eval',`(()=>{if(!(${js}))throw Error(${JSON.stringify(message)});return ${JSON.stringify('PASS: '+message)}})()`];
const readout=`document.querySelector('[data-readout]').textContent`;
const steps=[
  check('document.querySelectorAll("[data-live] [data-name]").length > 150','real 3D parts mounted'),
  check(`(()=>{
    const matrices=[...document.querySelectorAll('#exhibit > svg')].map(el=>el.getScreenCTM());
    return matrices.every(m=>['a','b','c','d','e','f'].every(key=>Math.abs(m[key]-matrices[0][key])<.01));
  })()`,'glass and solid layers share the same screen projection'),
  ['shot',`shots/${mode}-front.png`,'.page',1],
  check(`(()=>{
    for(const angle of [0,90,180,270]){
      window.__isoTurn.set(angle);
      const lid=document.getElementById('glass-lid');
      const P={...exhibitProjection,azimuth:exhibitProjection.azimuth-angle};
      const points=[[0,0,155],...Array.from({length:16},(_,i)=>{
        const a=i*Math.PI/8;return [31*Math.cos(a),31*Math.sin(a),149+6*Math.sqrt(1-(31/45)**2)];
      })];
      if(!points.every(p=>{const [x,y]=k.iso(p,P);return lid.isPointInFill(new DOMPoint(x,y));}))return false;
      // The glass must never paint over the outer edge of the retaining ring.
      if(!Array.from({length:32},(_,i)=>{
        const a=i*Math.PI/16,[x,y]=k.iso([48.8*Math.cos(a),48.8*Math.sin(a),149],P);
        return !lid.isPointInFill(new DOMPoint(x,y));
      }).every(Boolean))return false;
    }
    window.__isoTurn.set(0);return true;
  })()`,'full glass dome covers both halves at four rotation angles'),
  ['eval',`window.beforeOrbit=Object.fromEntries(['plinth','heart-left-ventricle','pillar.0','pressure-gauge'].map(n=>[n,document.querySelector('[data-name="'+n+'"]').outerHTML]));true;`],
  ['key','ArrowRight','#exhibit'],['until','Number(document.getElementById("exhibit").dataset.angle)>14.9'],
  check(`Object.entries(beforeOrbit).every(([n,v])=>document.querySelector('[data-name="'+n+'"]').outerHTML!==v)`,'keyboard turns specimen, base, chamber structure and gauge together'),
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
{
  if(phone)steps.push(['scroll','#exhibit'],['turn',0],['touchdrag','#exhibit',.3,.5,.7,.5,15],check('Number(document.getElementById("exhibit").dataset.angle)>20','real touch drag rotates without triggering a module'));
  if(reduced)steps.push(['eval','window.frozenPhase=document.getElementById("exhibit").dataset.heartPhase;true'],['wait',400],check('document.getElementById("exhibit").dataset.heartPhase===frozenPhase&&document.querySelector(".steam-layer").dataset.count==="0"','reduced motion stops idle and steam'));
  else steps.push(
    ['click','[data-module="affection"]'],['scroll','#exhibit'],['until','Number(document.getElementById("exhibit").dataset.eventTime)>1.2'],
    ['eval','document.querySelector("[data-trigger=language]").click();true'],check('document.getElementById("exhibit").dataset.mechanicalEvent==="affection"&&document.querySelector("[data-module=language]").disabled','overlapping triggers cannot replace an active response'),
    ['click','#pause-motion'],['eval','window.frozenPhase=document.getElementById("exhibit").dataset.heartPhase;window.frozenEvent=document.getElementById("exhibit").dataset.eventTime;true'],['wait',400],
    check('document.getElementById("exhibit").dataset.heartPhase===frozenPhase&&document.getElementById("exhibit").dataset.eventTime===frozenEvent','pause freezes the active event'),
    ['key','ArrowRight','#exhibit'],['until','Number(document.getElementById("exhibit").dataset.angle)>14.9'],check('document.getElementById("exhibit").dataset.heartPhase===frozenPhase','orbit remains independent of paused mechanics'),
    ['click','#pause-motion'],['until','Number(document.getElementById("exhibit").dataset.eventTime)>4.8'],['slow',0],
    check('document.querySelector(".steam-layer [data-port=left]")&&document.querySelector(".steam-layer [data-port=right]")','affection produces staggered steam at both real ports'),
    ['eval','window.puffBefore=document.querySelector(".steam-layer ellipse").dataset.world;true'],['turn',70],check('document.querySelector(".steam-layer ellipse").dataset.world===puffBefore','emitted steam remains in world space during orbit'),
    ['shot',`shots/${mode}-heart-response.png`,'#exhibit',1],['slow',1],['until',`${readout}.includes('To answer is also')`],
    check('document.getElementById("engraved-name").textContent==="小狼 & 木栖"','another response keeps the engraved name'),
    ['click','#pause-motion'],['orbit',`shots/${mode}-heart-orbit.png`,0,315,45,'#exhibit',1,null,4],['turn',0]
  );
  writeFileSync(`shots/${mode}-actions.json`,JSON.stringify(steps,null,2));
}
const result=spawnSync(process.execPath,['scripts/drive.mjs','index.html','--actions',`shots/${mode}-actions.json`,'--width',phone?'390':'1440','--height',phone?'1100':'1500',...(reduced?['--reduced']:[])],{encoding:'utf8',env:{...process.env,CHROME_PATH:chrome},windowsHide:true});
writeFileSync(`shots/${mode}-checks.log`,result.stdout+result.stderr);console.log(result.stdout);console.error(result.stderr);
assert.equal(result.status,0);assert(result.stdout.includes('console: clean'));
