import * as k from '../../vendor/anatomy/iso-kit.mjs';
import * as G from '../../vendor/anatomy/lathe.mjs';
import * as A from '../../vendor/anatomy/audit.mjs';
import {turning} from '../../vendor/anatomy/turn-build.mjs';
import {TURN} from '../../vendor/anatomy/turn.mjs';

export function heartExhibit(){
  const P={origin:[480,437],scale:2.2,azimuth:42,elevation:35.2644};
  const R=A.recorder(P),T=turning(P,{recorder:R});
  const scene=T.group('exhibit',{turn:{pivot:[0,0]}}),layer=T.layer('exhibit');T.stack(['exhibit']);
  const base={group:scene,layer,tone:'mid'};
  const V=(x,y)=>G.frameOf([x,y,0],[0,0,1],[1,0,0],[0,1,0]);
  const group=(name,config)=>T.group(name,{parent:scene,...config});
  const paper=group('paper',{slide:{direction:[0,1,0],travel:12}});
  const memory=group('memory',{free:{origin:[62,64,40]}});
  const crank=group('crank',{turn:{pivot:[0,-64]}});
  const left=group('leftVentricle',{slide:{direction:[.965926,0,-.258819],travel:1.2}});
  const right=group('rightVentricle',{slide:{direction:[0,-1,0],travel:.7}});
  const key=group('key',{slide:{direction:[0,0,-1],travel:2}});
  const engraver=group('engraver',{slide:{direction:[1,0,0],travel:45}});
  const pens=[group('pen0',{slide:{direction:[0,1,0],travel:9}}),group('pen1',{slide:{direction:[0,-1,0],travel:9}})];
  function box(name,x,y,z,w,d,h,material='brass',g=scene,r=1){return T.prism({...base,group:g,name,plan:{x:x-w/2,y:y-d/2,w,d,r},z,h,bevel:.4,material});}
  function round(name,x,y,z,r,h,material='brass',g=scene,details={}){return T.round({...base,group:g,name,F:V(x,y),s0:z,s1:z+h,r,material,details});}
  function rod(name,a,b,r,material='copper',g=scene){return T.round({...base,group:g,name,F:G.frameAlong(a,b.map((v,i)=>v-a[i])),s0:0,s1:Math.hypot(...b.map((v,i)=>v-a[i])),r,material});}
  function face(part,o,u,v,svg,normal){T.plane({part,o,u,v,svg,normal});}
  function band(name,c,r,width,z,h,material='brass',g=scene){for(let i=0;i<24;i++){const a=i*Math.PI/12,b=(i+1)*Math.PI/12;T.prism({...base,group:g,name:`${name}.${i}`,F:V(...c),polygon:[[r*Math.cos(a),r*Math.sin(a)],[r*Math.cos(b),r*Math.sin(b)],[(r-width)*Math.cos(b),(r-width)*Math.sin(b)],[(r-width)*Math.cos(a),(r-width)*Math.sin(a)]],s0:z,s1:z+h,material});}}
  function gauge(name,x,y,z,r){
    const body=T.round({...base,name,F:G.frameOf([x,y,z],[0,1,0],[1,0,0],[0,0,-1]),s0:0,s1:4,r,material:'brass'});
    let marks='';for(let i=0;i<=18;i++){const a=(135+i*15)*Math.PI/180;marks+=`<path d="M ${Math.cos(a)*r*.7} ${Math.sin(a)*r*.7} L ${Math.cos(a)*r*.83} ${Math.sin(a)*r*.83}"/>`;}
    face(body,[x,y+4,z],[1,0,0],[0,0,-1],`<circle r="${r*.87}" fill="#f2eee4"/><g stroke="#665841" stroke-width=".4" fill="none">${marks}<path id="${name}-needle" d="M 0 0 L ${r*.48} ${-r*.4}"/></g><circle r=".9" fill="#856b49"/><text y="${r*.43}" text-anchor="middle" fill="#79674c" font-size="1.9">PRESSURE</text>`,[0,1,0]);
  }
  for(const x of [-68,68])for(const y of [-68,68]){const foot=round(`foot.${x}.${y}`,x,y,0,7,5,'gunmetal');foot.shapes[0].ground=true;round(`foot-collar.${x}.${y}`,x,y,5,5,4);}
  box('plinth',0,0,9,168,174,12,'gunmetal',scene,8);box('bronze-lip',0,0,21,170,176,2,'copper',scene,8);box('instrument-deck',0,0,23,164,170,5,'steel',scene,7);
  for(const x of [-73,73])for(const y of [-75,75])round(`deck-bolt.${x}.${y}`,x,y,28,1.5,1,'brass');
  const plaque=box('nameplate',0,87.9,12,61,1.8,7);
  face(plaque,[0,88.8,15.5],[1,0,0],[0,0,-1],'<text id="engraved-name" text-anchor="middle" dominant-baseline="middle" font-size="3" fill="#3d3023">THE GIFT OF RESPONSE</text>',[0,1,0]);
  for(const x of [-26,26])box(`engraving-bracket.${x}`,x,89,19,1.4,4,.3,'steel');
  box('engraving-rail',0,91,19.3,52,1.4,1.4,'steel',scene,.15);
  for(const [i,z]of [18.2,20.8].entries())box(`engraver-bearing.${i}`,-23,91,z,1.6,3.6,1,'brass',engraver,.1);
  for(const [i,y]of [89.7,92.3].entries())box(`engraver-bearing.${i+2}`,-23,y,19.2,1.6,1,1.6,'brass',engraver,.1);
  round('engraver-stylus-coupler',-23,91,17.5,.7,.7,'brass',engraver);
  rod('name-stylus',[-23,91,16],[-23,91,17.5],.55,'steel',engraver);
  round('chamber-seat',0,0,28,50,5,'brass',scene,{bolts:[{s:33,r:47,count:24,size:.65}]});round('chamber-floor',0,0,33,47,3,'gunmetal');
  band('lower-clamp',[0,0],49,2.5,36,3);band('upper-clamp',[0,0],49,2.5,143,4);band('crown',[0,0],49,2.5,147,2,'copper');
  const glass=group('glass-shell',{slide:{direction:[0,0,1],travel:0}});
  function clipY(poly,y,above){return poly.flatMap((p,i)=>{const q=poly[(i+1)%poly.length],inside=v=>above?v[1]>=y:v[1]<=y,out=[];if(inside(p))out.push(p);if(inside(p)!==inside(q)){const t=(y-p[1])/(q[1]-p[1]);out.push([p[0]+t*(q[0]-p[0]),y]);}return out;});}
  for(let i=0;i<16;i++){const a=i*Math.PI/8,b=(i+1)*Math.PI/8,polygon=[[49*Math.cos(a),49*Math.sin(a)],[49*Math.cos(b),49*Math.sin(b)],[47*Math.cos(b),47*Math.sin(b)],[47*Math.cos(a),47*Math.sin(a)]],sections=[];
    if(i===9||i===14){sections.push([clipY(polygon,-28,false),39,143],[clipY(polygon,-20,true),39,143]);const middle=clipY(clipY(polygon,-28,true),-20,false);sections.push([middle,39,106.5],[middle,114.5,143]);}else sections.push([polygon,39,143]);
    sections.forEach(([poly,s0,s1],j)=>T.prism({...base,group:glass,name:`glass-wall.${i}${j?'.'+j:''}`,F:V(0,0),polygon:poly,s0,s1,material:'glass'}));
  }
  for(const side of [-1,1])for(let i=0;i<12;i++){const a=i*Math.PI/6,b=(i+1)*Math.PI/6;T.prism({...base,name:`sealed-inlet.${side}.${i}`,F:G.frameOf([side*42,-24,110.5],[1,0,0],[0,1,0],[0,0,1]),polygon:[[4*Math.cos(a),4*Math.sin(a)],[4*Math.cos(b),4*Math.sin(b)],[2.4*Math.cos(b),2.4*Math.sin(b)],[2.4*Math.cos(a),2.4*Math.sin(a)]],s0:-2,s1:2,material:'brass'});}
  for(let i=0;i<4;i++){const a=(45+i*90)*Math.PI/180,x=53*Math.cos(a),y=53*Math.sin(a);round(`pillar-foot.${i}`,x,y,33,3.8,6);round(`pillar.${i}`,x,y,39,1.9,104,'steel');round(`pillar-cap.${i}`,x,y,143,3.8,6);}
  // A dominant tapered ventricular casting forms the asymmetric leftward apex.
  // Curved castings have broad anatomical volumes, not cerebral surface tiles.
  const leftRadius=s=>22*Math.sin(s*Math.PI/100);
  const leftSlope=s=>22*Math.PI/100*Math.cos(s*Math.PI/100);
  const LF=G.frameOf([-29,-10,50.25],[.258819,0,.965926],[.965926,0,-.258819],[0,1,0]);
  T.lathe({...base,group:left,name:'heart-left-ventricle',F:LF,profile:Array.from({length:32},(_,i)=>{const s=66*i/31;return [s,leftRadius(s)];}),slope:leftSlope,radius:leftRadius,material:'steel',details:{seams:[66],bolts:[{s:63,r:leftRadius(63),count:8,size:.55}]}});
  const RF=G.frameOf([19,16,98],[0,1,0],[1,0,0],[0,0,-1]);
  const outline=[[-16,4],[-15,15],[-8,20],[3,20],[13,13],[17,0],[10,-14],[-4,-22],[-12,-17]];
  const contour=outline.flatMap((p,i)=>{const prev=outline[(i+outline.length-1)%outline.length],next=outline[(i+1)%outline.length],a=p.map((v,j)=>v*.7+prev[j]*.3),b=p.map((v,j)=>v*.7+next[j]*.3);return Array.from({length:5},(_,n)=>{const t=n/4;return [0,1].map(j=>((1-t)**2*a[j]+2*t*(1-t)*p[j]+t*t*b[j])*(j===1?-1:1));});});
  T.prism({...base,group:right,name:'heart-right-ventricle',F:RF,polygon:contour,s0:0,s1:12,bevel:1.2,material:'steel'});
  T.round({...base,group:left,name:'apex-bearing',F:LF,s0:-4,s1:0,r:2.5,material:'brass'});T.round({...base,group:left,name:'heart-support',F:LF,s0:-13.7,s1:-4,r:2,material:'steel'});
  for(const y of [-12.6,-7.4])box(`apex-cradle.${y}`,-32,y,36,8,1,7,'gunmetal');
  round('right-support',19,12,36,1.3,58.7,'steel',right);box('right-support-elbow',19,12,94.7,2.6,2.6,2.6,'brass',right);rod('right-support-bearing',[19,13.3,96],[19,16,96],1.3,'steel',right);
  const along=s=>LF.o.map((v,i)=>v+LF.a[i]*s);
  T.ball({...base,name:'left-atrium',c:along(60),r:15,flats:[{n:LF.a.map(n=>-n),d:-6},{n:LF.a,d:12}],material:'copper'});round('right-atrium',16.5,22,118,6.5,7,'steel');
  T.round({...base,name:'aortic-neck',F:LF,s0:72,s1:74,r:3.5,material:'copper'});T.round({...base,name:'aortic-flange',F:LF,s0:74,s1:76,r:5.1,material:'brass'});
  round('pulmonary-neck',16.5,22,125,3.5,7,'copper');round('pulmonary-flange',16.5,22,132,5,2);
  const VF=G.frameOf(along(72).map((v,i)=>v-LF.u[i]*9),LF.a,LF.u,LF.v);
  T.round({...base,name:'venous-neck',F:VF,s0:0,s1:9,r:2.2,material:'steel'});T.round({...base,name:'venous-collar',F:VF,s0:9,s1:11,r:2.8,material:'brass'});
  // Continuous arched great-vessel manifold gives the specimen its cardiac crown.
  const aorticStart=along(76),aorticRoute=Array.from({length:49},(_,i)=>{const a=Math.PI-i*Math.PI/48;return aorticStart.map((v,j)=>v+LF.u[j]*(20+20*Math.cos(a))+LF.a[j]*20*Math.sin(a));});
  const MF=G.frameOf(aorticStart.map((v,i)=>v+LF.u[i]*20),[0,1,0],LF.u,LF.a.map(n=>-n));
  for(let i=0;i<32;i++){const a=Math.PI-i*Math.PI/32,b=Math.PI-(i+1)*Math.PI/32;T.prism({...base,name:`aortic-manifold.${i}`,F:MF,polygon:[[21.8*Math.cos(a),-21.8*Math.sin(a)],[21.8*Math.cos(b),-21.8*Math.sin(b)],[18.2*Math.cos(b),-18.2*Math.sin(b)],[18.2*Math.cos(a),-18.2*Math.sin(a)]],s0:-1.8,s1:1.8,material:'copper'});}
  const outlet=aorticRoute.at(-1),OF=G.frameOf(outlet,LF.a,LF.u,LF.v);
  T.round({...base,name:'aortic-outlet-collar',F:OF,s0:-2,s1:0,r:3.2,material:'brass'});
  T.round({...base,name:'aortic-descending',F:OF,s0:-12,s1:-2,r:1.8,material:'copper'});
  // Central service bridge and restrained violet computation window.
  box('heart-service-frame',19,29,90,14,2,16,'gunmetal',right);
  const core=T.round({...base,group:right,name:'heart-core',F:G.frameOf([19,30,98],[0,1,0],[1,0,0],[0,0,-1]),s0:0,s1:.8,r:2.5,material:'steel'});
  face(core,[19,30.8,98],[1,0,0],[0,0,-1],'<circle id="heart-core-light" r="2.1" fill="#b7a1e2"/>',[0,1,0]);
  for(let i=0;i<3;i++){
    const x=13+i*4,o=[x+1.4,30.55,105];
    const valve=group(`valve${i}`,{parent:right,hinge:{point:o,axis:[1,0,0],range:[0,18]}});
    box(`valve-hinge.${i}`,x+1.4,30.55,104.5,3.2,1.1,1.1,'brass',right);
    box(`heart-valve.${i}`,x+1.4,31.45,96,2.4,.7,8.5,'steel',valve,.35);
  }
  // Rear return and condenser have a purposeful silhouette in the back views.
  round('return-condenser',4,-40,36,5,27,'copper',scene,{seams:[39,43,47,51,55,59]});
  rod('return-riser',[4,-40,63],[4,-40,118],1.8);box('return-elbow',4,-40,118,6,6,5);
  rod('atrial-return',[4,-37,120.5],[4,-22,120.5],1.8);box('atrial-return-port',4,-19,116,6,6,6);
  // The base boiler drives two phased pistons and the eccentric disk.
  for(const x of [-65,65]){round(`pump-foot.${x}`,x,-24,28,7,4);round(`pump-barrel.${x}`,x,-24,32,5.5,28,'copper',scene,{seams:[35,55],ribs:{s0:35,s1:55,count:18,seams:true,tone:'lo'}});round(`pump-cap.${x}`,x,-24,60,7,3);
    const piston=group(x<0?'pistonLeft':'pistonRight',{slide:{direction:[0,0,1],travel:2}});round(`drive-piston.${x}`,x,-24,63,2.2,15,'steel',piston);box(`piston-eye.${x}`,x,-24,78,5,5,3,'brass',piston);
    const label=x<0?'Left':'Right',cam=group(`cam${label}`,{hinge:{point:[x,-30,71],axis:[0,1,0],range:[0,360]}}),link=group(`rod${label}`,{free:{origin:[x,-30,70]}});
    T.round({...base,group:cam,name:`drive-cam.${x}`,F:G.frameOf([x,-32.5,71],[0,1,0],[1,0,0],[0,0,-1]),s0:0,s1:2,r:3,material:'brass'});
    T.round({...base,group:cam,name:`cam-pin.${x}`,F:G.frameOf([x,-30.5,70],[0,1,0]),s0:0,s1:1,r:.75,material:'steel'});
    rod(`connecting-rod.${x}`,[x,-30,70.85],[x,-30,79.15],.45,'steel',link);
    round(`cam-stand.${x}`,x,-35.5,28,1.7,41,'steel');box(`cam-bearing.${x}`,x,-35.5,69,4,4,4,'brass');rod(`cam-axle.${x}`,[x,-33.5,71],[x,-32.5,71],.9,'steel');
    T.round({...base,group:piston,name:`slider-bearing.${x}`,F:G.frameOf([x,-30.5,80],[0,1,0]),s0:0,s1:1,r:.75,material:'brass'});
    rod(`slider-crosshead.${x}`,[x,-29.5,80],[x,-26.5,80],.75,'steel',piston);
    const outside=x+(x<0?-12:12);
    rod(`pump-outlet.${x}`,[x+(x<0?-7:7),-24,61.5],[outside+(x<0?2:-2),-24,61.5],.7);
    box(`pump-outlet-elbow.${x}`,outside,-24,59.5,4,4,4,'copper');
    rod(`feed-line.${x}`,[outside,-24,63.5],[outside,-24,108],1.8);const feed=box(`feed-elbow.${x}`,outside,-24,108,6,6,5);rod(`feed-to-heart.${x}`,[outside-(x<0?-3:3),-24,110.5],[x<0?-35:33,-24,110.5],1.8);
    face(feed,[outside,-21,110.5],[1,0,0],[0,0,-1],`<circle id="pressure-signal-${x<0?'left':'right'}" r="1" fill="#b7a1e2" opacity="0"/>`,[0,1,0]);
  }
  const boiler=T.round({...base,name:'boiler',F:G.frameOf([-31,-62,41],[1,0,0],[0,1,0],[0,0,1]),s0:-18,s1:18,r:9,material:'brass',details:{seams:[-16,16]}});
  for(const x of [-44,-18])box(`boiler-foot.${x}`,x,-62,28,5,14,4,'gunmetal');
  rod('boiler-regulator',[-31,-62,50],[-31,-62,57],2,'steel');round('regulator',-31,-62,57,5,2,'copper');
  round('eccentric-wheel',0,-64,28,8,3,'brass',crank,{bolts:[{s:31,r:6,count:12,size:.5}]});round('crank-pin',4,-64,31,1.3,2,'steel',crank);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;T.prism({...base,group:crank,name:`crank-tooth.${i}`,F:G.frameOf([0,-64,0],[0,0,1],[Math.cos(a),Math.sin(a),0],[-Math.sin(a),Math.cos(a),0]),polygon:[[8,-.8],[10,-.8],[10,.8],[8,.8]],s0:28,s1:31,material:'brass'});}
  gauge('pressure-gauge',62,10,69,9);gauge('boiler-gauge',-55,-59,47,6);
  round('gauge-pedestal',62,12,28,1.8,32,'steel');
  const vents={left:{position:[-84,0,40.5],direction:[-1,0,.25]},right:{position:[84,0,40.5],direction:[1,0,.25]},condenser:{position:[4,-40,63],direction:[0,-.7,.45]}};
  for(const side of [-1,1]){rod(`vent-feed.${side}`,[side*65,0,32],[side*77,0,32],1.5);box(`vent-body.${side}`,side*79,0,28,4,7,7,'copper');rod(`vent-neck.${side}`,[side*79,0,35],[side*79,0,39],1.1,'steel');box(`vent-elbow.${side}`,side*79,0,39,4,4,3,'copper');rod(`vent-nozzle.${side}`,[side*81,0,40.5],[side*84,0,40.5],1.1,'steel');}
  // Five familiar offerings remain physical controls around the instrument deck.
  for(const x of [-63,-43])box(`telegraph-frame.${x}`,x,67,28,3,23,3);
  box('telegraph-plinth',-53,58.25,28,17,5.5,3);box('telegraph-back',-53,76.75,28,17,3.5,3);
  const kb=box('language-key',-53,68,31,17,14,4,'gunmetal',key,3);
  face(kb,[-53,68,35],[1,0,0],[0,1,0],'<text text-anchor="middle" font-size="3" fill="#d9bd83">REPLY</text>',[0,0,1]);
  T.round({...base,group:memory,name:'memory-drum',F:G.frameOf([62,64,40],[1,0,0],[0,1,0],[0,0,1]),s0:-10,s1:10,r:8,material:'copper',details:{ribs:{s0:-10,s1:10,count:18,seams:true,tone:'lo'}}});
  for(const x of [50.5,73.5])box(`drum-pillow.${x}`,x,64,28,3,14,12);
  box('printer',-25,69,28,19,20,9,'gunmetal');const pp=box('language-paper',-25,74,37,15,17,.5,'steel',paper,.1);
  face(pp,[-25,74,37.5],[1,0,0],[0,1,0],'<g id="reply-ink" stroke="#514839" stroke-width=".4"><path d="M -5 -4 H 5 M -5 -1 H 4 M -5 2 H 5 M -5 5 H 1"/></g>',[0,0,1]);
  const drawing=box('drawing-desk',21,70,28,25,22,2);
  face(drawing,[21,70,30],[1,0,0],[0,1,0],'<rect x="-10" y="-9" width="20" height="18" fill="#fbf9f1"/><g id="drawn-flower" opacity="0" stroke="#75604a" fill="none" stroke-width=".65"><path d="M 0 7 V -1 M 0 4 Q -6 0 -5 -1 Q 0 -1 0 4 M 0 2 Q 5 -2 6 0 Q 4 4 0 2"/><g id="flower-petals"><circle cy="-4" r="2.8"/><circle cx="-2.8" cy="-1.3" r="2.8"/><circle cx="2.8" cy="-1.3" r="2.8"/></g></g>',[0,0,1]);
  for(const [i,x] of [7,35].entries()){
    const y=i?75:65,tip=i?26:16,direction=i?-1:1,g=pens[i];
    box(`drafting-foot.${i}`,x,70,28,3,22,1.4,'gunmetal');rod(`drafting-rail.${i}`,[x,59,30],[x,78,30],.6,'steel');box(`pen-carriage.${i}`,x,y,30.6,3,4,2,'brass',g);
    rod(`drafting-post.${i}`,[x,y,32.6],[x,y,34.5],.65,'steel',g);box(`pen-elbow.${i}`,x,y,34.5,2,2,2,'brass',g);
    rod(`drafting-arm.${i}`,[x+direction,y,35.5],[tip-direction,y,35.5],.5,'steel',g);box(`nib-elbow.${i}`,tip,y,34.5,2,2,2,'brass',g);
    rod(`drafting-pen.${i}`,[tip,y,30.05],[tip,y,34.5],.35,'steel',g);
  }
  const sensor=round('affection-sensor',0,31,36,7,1,'copper');face(sensor,[0,31,37],[1,0,0],[0,1,0],'<path d="M 0 3 C -9 -2 -3 -7 0 -3 C 3 -7 9 -2 0 3" fill="none" stroke="#dfc48e" stroke-width=".7"/>',[0,0,1]);
  rod('rose-stem',[0,31,37],[0,31,50],1.3,'steel');round('rose-hub',0,31,50,5,3,'copper');
  for(let i=0;i<6;i++){const a=i*Math.PI/3,o=[5*Math.cos(a),31+5*Math.sin(a),53],petal=group(`petal${i}`,{hinge:{point:o,axis:[-Math.sin(a),Math.cos(a),0],range:[-60,0]}});T.prism({...base,group:petal,name:`rose-petal.${i}`,F:G.frameOf(o,[0,0,1],[Math.cos(a),Math.sin(a),0],[-Math.sin(a),Math.cos(a),0]),polygon:[[0,-1.3],[6,-2.6],[9,0],[6,2.6],[0,1.3]],s0:0,s1:.8,bevel:.25,material:'brass'});}
  const poses=Array.from({length:9},(_,i)=>({exhibit:0,leftVentricle:1.2*i/8,rightVentricle:.7*(8-i)/8,pistonLeft:2*i/8,pistonRight:2*(8-i)/8,key:2*i/8,paper:12*i/8,crank:i*45,engraver:45*i/8,pen0:9*i/8,pen1:9*i/8,...Object.fromEntries(Array.from({length:3},(_,j)=>[`valve${j}`,i*2])),...Object.fromEntries(Array.from({length:6},(_,j)=>[`petal${j}`,-i*7.5]))}));
  for(let phase=0;phase<360;phase+=15){const pose={exhibit:phase,crank:phase,leftVentricle:.6*(1-Math.cos(phase*Math.PI/180)),rightVentricle:.35*(1-Math.cos((phase-14)*Math.PI/180))};for(const [name,angle]of [['Left',phase],['Right',phase-14]]){const a=angle*Math.PI/180,s=Math.sin(a),c=Math.cos(a);pose[`cam${name}`]=-angle;pose[`piston${name}`]=1-c+Math.sqrt(100-s*s)-10;pose[`rod${name}`]={R:TURN.rotation([0,1,0],-Math.asin(s/10)*180/Math.PI),t:[s,0,1-c]};}poses.push(pose);}
  const out=T.build({statics:[],poses,strict:true,verify:true});return {T,R,P,out,poses,vents};
}
