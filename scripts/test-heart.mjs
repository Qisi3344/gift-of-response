import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {TURN} from '../vendor/anatomy/turn.mjs';
import {heartExhibit} from '../src/artwork/heart.mjs';
const {M,H}=vm.runInNewContext(readFileSync('src/runtime/state-machine.js','utf8')+readFileSync('src/runtime/heart-motion.js','utf8')+';({M,H:HeartMotion})',{TURN});
const motor=H.create(),state=M.initialState({name:'小狼',memories:[{date:'昨日',text:'旧记录'}]});
assert.equal(state.engraved,'小狼');assert.equal(state.memories[0].text,'旧记录');
const {out,poses}=heartExhibit(),scene=TURN.prepare(out.data,{unit:1});
const restCams=TURN.cams(scene,{}),frames=scene.runs.map(run=>{const frame=TURN.frame(run);TURN.emit(run,restCams[run.group],frame);return frame;});
assert(!TURN.disjoint(frames[scene.runs.find(r=>r.name==='nameplate').index],frames[scene.runs.find(r=>r.name==='name-stylus').index],.1),'thin prism bounds retain the face behind the engraving stylus');
for(const pose of poses){const cams=TURN.cams(scene,pose);
  for(const layer of scene.layers)for(let i=0;i<layer.framed.length;i+=6){const data=layer.framed,g=data[i+2],R=g>=0?cams[g].R:cams.world.R,n=[0,1,2].map(j=>R[3*j]*data[i+3]+R[3*j+1]*data[i+4]+R[3*j+2]*data[i+5]);
    const extent=index=>{const run=scene.runs[index],c=run.group>=0?cams[run.group]:cams.world,values=[];for(let p=0;p<run.cloud.length;p+=3){const q=run.cloud.slice(p,p+3);values.push(n.reduce((s,v,j)=>s+v*(c.R[3*j]*q[0]+c.R[3*j+1]*q[1]+c.R[3*j+2]*q[2]+c.t[j]),0));}return [Math.min(...values),Math.max(...values)];};
    assert(extent(data[i+1])[0]-extent(data[i])[1]>=-.08,'stored depth plane encloses the complete inclined casting');
  }
}
for(let a=0;a<=360;a+=3){
  const link=H.linkage(a),r=link.rod.R,t=link.rod.t;
  const end=[t[0]+r[2]*10,t[2]+r[8]*10];
  assert(Math.abs(end[0])<1e-9);assert(Math.abs(end[1]-(10+link.stroke))<1e-9);
  assert(link.stroke>=-1e-9&&link.stroke<=2+1e-9,'connecting rod keeps its length and meets slider');
}
for(const kind of ['name','language','creation','affection']){
  let peaks=0,previous=0,rising=false;
  for(let t=0;t<H.durations[kind];t+=.005){const h=H.at(0,{kind,elapsed:t,base:0});
    assert(h.pressure>=0&&h.pressure<=1);assert(h.valves>=0&&h.valves*18<=18);
    if(h.left>previous+1e-6)rising=true;else if(rising&&h.left<previous-1e-6){peaks++;rising=false;}previous=h.left;
  }
  assert.equal(peaks,H.beats[kind].length,`${kind} has requested complete beats`);
}
assert(H.at(0,{kind:'language',elapsed:3.4,base:0}).paper===0);
assert(H.at(0,{kind:'affection',elapsed:5,base:0}).rose===0);
assert(H.at(0,{kind:'affection',elapsed:6.5,base:0}).rose===1);
assert(H.emissions.affection[0][0]<H.emissions.affection[1][0]);
M.begin(state,'language');motor.values(state,0);motor.advance(2.3,false);M.advance(state,.02);motor.values(state,0);
motor.setPaused(true);const frozen=JSON.stringify(motor.values(state,0));motor.advance(1,false);assert.equal(JSON.stringify(motor.values(state,0)),frozen);
motor.setPaused(false);motor.advance(.1,false);assert.notEqual(JSON.stringify(motor.values(state,0)),frozen);
motor.advance(0,true);const calm=JSON.stringify(motor.values(state,0));motor.advance(1,true);assert.equal(JSON.stringify(motor.values(state,0)),calm);
M.advance(state,0,true);assert.equal(state.progress.language,1);assert.equal(state.engraved,'小狼');
console.log('PASS: beat counts, event order, fixed-length connecting rods, pause/resume, reduced motion, legacy content');
