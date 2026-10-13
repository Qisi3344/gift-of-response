import * as k from '../../vendor/anatomy/iso-kit.mjs';
import * as G from '../../vendor/anatomy/lathe.mjs';
import * as A from '../../vendor/anatomy/audit.mjs';
import { turning } from '../../vendor/anatomy/turn-build.mjs';

// A single world frame: the specimen, chamber and every instrument turn together.
export function exhibit() {
  const P = { origin: [480, 445], scale: 2.18, azimuth: 45, elevation: 35.2644 };
  const R = A.recorder(P), T = turning(P, { recorder: R });
  const scene = T.group('exhibit', { turn: { pivot: [0, 0] } });
  const paperTravel=T.group('paper',{parent:scene,slide:{direction:[0,1,0],travel:12}});
  const drumTurn=T.group('memory',{parent:scene,free:{origin:[62,64,40]}});
  const gearTurn=T.group('governor',{parent:scene,turn:{pivot:[0,-73]}});
  const layer = T.layer('exhibit'); T.stack(['exhibit']);
  const V = (x, y) => G.frameOf([x,y,0], [0,0,1], [1,0,0], [0,1,0]);
  const base = {group:scene, layer, tone:'mid'};
  function box(name,x,y,z,w,d,h,material='brass',r=1,group=scene) {
    return T.prism({...base,group,name,plan:{x:x-w/2,y:y-d/2,w,d,r},z,h,bevel:.45,material});
  }
  function round(name,x,y,z,r,h,material='brass',details={}) {
    return T.round({...base,name,F:V(x,y),s0:z,s1:z+h,r,material,details});
  }
  function rod(name,a,b,r,material='copper') {
    const n=b.map((v,i)=>v-a[i]), h=Math.hypot(...n);
    return T.round({...base,name,F:G.frameAlong(a,n),s0:0,s1:h,r,material});
  }
  function ring(name,r,width,z,h,material='brass',count=24) {
    const pieces=[];
    for(let i=0;i<count;i++) {
      const a=i*Math.PI*2/count,b=(i+1)*Math.PI*2/count;
      pieces.push(T.prism({...base,name:`${name}.${i}`,F:V(0,0),polygon:[[r*Math.cos(a),r*Math.sin(a)],[r*Math.cos(b),r*Math.sin(b)],[(r-width)*Math.cos(b),(r-width)*Math.sin(b)],[(r-width)*Math.cos(a),(r-width)*Math.sin(a)]],s0:z,s1:z+h,material}));
    }
    return pieces;
  }
  function face(part,o,u,v,svg,normal) { T.plane({part,o,u,v,svg,normal}); }
  function gauge(name,x,y,z,r) {
    const f=G.frameOf([x,y,z],[0,1,0],[1,0,0],[0,0,-1]);
    const body=T.round({...base,name,F:f,s0:0,s1:5,r,material:'brass',details:{seams:[1,4]}});
    let marks='';
    for(let i=0;i<=20;i++){const a=(135+i*13.5)*Math.PI/180;marks+=`<path d="M ${Math.cos(a)*r*.72} ${Math.sin(a)*r*.72} L ${Math.cos(a)*r*(i%5?.83:.89)} ${Math.sin(a)*r*(i%5?.83:.89)}"/>`;}
    face(body,[x,y+5,z],[1,0,0],[0,0,-1],`<circle r="${r*.86}" fill="#dfd1ad"/><g fill="none" stroke="#4c3c28" stroke-width=".45">${marks}<path d="M 0 0 L ${r*.4} ${-r*.49}"/></g><circle r="1.1" fill="#705339"/><text y="${r*.48}" text-anchor="middle" font-size="2.2" fill="#57422d" font-family="serif">PRESSURE</text>`,[0,1,0]);
  }
  // Cast-iron plinth, bronze edges, engraved face and levelling feet.
  for(const x of [-68,68])for(const y of [-68,68]){
    round(`foot.${x}.${y}`,x,y,0,7,5,'gunmetal');round(`foot-cap.${x}.${y}`,x,y,5,5,4);
  }
  box('plinth',0,0,9,168,174,12,'gunmetal',8);
  box('plinth-brass-lip',0,0,21,170,176,2,'brass',8);
  box('instrument-deck',0,0,23,164,170,5,'gunmetal',7);
  const plaque=box('nameplate',0,88.4,12,61,1.8,7,'brass',.6);
  face(plaque,[0,89.3,15.5],[1,0,0],[0,0,-1],'<text id="engraved-name" text-anchor="middle" dominant-baseline="middle" font-size="3.2" fill="#211d17" font-family="Georgia,serif">THE GIFT OF RESPONSE</text>',[0,1,0]);
  for(const x of [-73,73])for(const y of [-75,75])round(`deck-bolt.${x}.${y}`,x,y,28,1.6,1,'steel');
  round('chamber-pedestal',0,0,28,53,5,'brass',{seams:[29,32],bolts:[{s:33,r:49,count:24,size:.8}]});
  round('chamber-floor',0,0,33,47,3,'gunmetal');
  ring('lower-glass-clamp',49,2.5,36,3);
  ring('upper-glass-clamp',49,2.5,143,4);
  ring('crown-edge',49,2.5,147,2,'copper');
  // Glass chamber wall: sixteen real annulus segments in a loose group, so the
  // runtime painter orders them against pillars and brain without audit interlocks.
  const glassShell=T.group('glass-shell',{parent:scene,free:{origin:[0,0,0]}});
  for(let i=0;i<16;i++){
    const a0=i*Math.PI*2/16,a1=(i+1)*Math.PI*2/16;
    T.prism({...base,group:glassShell,name:`glass-wall.${i}`,F:V(0,0),polygon:[[49*Math.cos(a0),49*Math.sin(a0)],[49*Math.cos(a1),49*Math.sin(a1)],[47*Math.cos(a1),47*Math.sin(a1)],[47*Math.cos(a0),47*Math.sin(a0)]],s0:39,s1:143,material:'glass'});
  }
  // Four narrow uprights leave a generous uninterrupted view of the specimen.
  for(let i=0;i<4;i++){
    const a=(45+i*90)*Math.PI/180,x=Math.cos(a)*53,y=Math.sin(a)*53;
    round(`pillar-foot.${i}`,x,y,33,3.8,6);
    round(`pillar.${i}`,x,y,39,1.9,104,'steel');
    round(`pillar-crown.${i}`,x,y,143,3.8,6);
    T.prism({...base,name:`crown-bracket.${i}`,F:G.frameOf([0,0,0],[0,0,1],[Math.cos(a),Math.sin(a),0],[-Math.sin(a),Math.cos(a),0]),polygon:[[46,-2.5],[56,-2.5],[56,2.5],[46,2.5]],s0:149,s1:150.5,material:'brass'});
  }
  // Central spindle and bearing cage hold the two armoured cerebral hemispheres.
  round('spindle-shoe',0,0,36,15,4,'brass',{bolts:[{s:40,r:11,count:8,size:.7}]});
  round('spindle',0,0,40,5,35,'steel',{seams:[45,49,53,57,61]});
  round('brain-cradle',0,0,75,17,4,'gunmetal');
  round('core-housing',0,0,79,3,23,'gunmetal');
  round('brain-lamp',0,0,102,1.8,12,'steel');
  for(const x of [-22,22]){
    box(`cradle-arm.${x}`,x/2,0,79,Math.abs(x)-6,4,3,'steel');
    round(`hemisphere-bearing.${x}`,x,0,82,8,4,'brass',{bolts:[{s:86,r:6,count:8,size:.55}]});
    round(`hemisphere-spine.${x}`,x,0,86,3,3,'steel');
  }
  // Armour tiles follow an ellipsoid with a cerebral cleft, with broad faces
  // and staggered seams rather than repeated tubular surface protrusions.
  const plates=[];
  for(const side of [-1,1]) {
    const cx=side*23.5,cy=0,cz=110,rx=20,ry=31,rz=20;
    const point=(lat,lon)=>[cx+rx*Math.cos(lat)*Math.cos(lon),cy+ry*Math.cos(lat)*Math.sin(lon),cz+rz*Math.sin(lat)];
    for(let row=0;row<4;row++)for(let col=0;col<7;col++){
      if(row<=1&&col===5)continue;
      const lat=-.75+row*.59,lon=Math.PI+(col+(row%2)*.23)*Math.PI*2/7;
      const c=point(lat,lon),n=[(c[0]-cx)/(rx*rx),(c[1]-cy)/(ry*ry),(c[2]-cz)/(rz*rz)],F=G.frameAlong(c,n);
      const polygon=[[-.265,-.40],[-.265,.40],[.265,.40],[.265,-.40]].map(([dl,da])=>{
        const q=point(lat+dl,lon+da).map((v,i)=>v-c[i]);return [q.reduce((v,x,i)=>v+x*F.u[i],0),q.reduce((v,x,i)=>v+x*F.v[i],0)];
      });
      const name=`lobe.${side}.${row}.${col}`;plates.push(name);
      T.prism({...base,name,F,polygon,round:.8,steps:3,s0:-.8,s1:0,bevel:.5,material:row===0&&col%3===0?'copper':'brass',details:{dots:[{at:[0,polygon[0][0]*.65,polygon[0][1]*.65],normal:[1,0,0],size:.45},{at:[0,polygon[2][0]*.65,polygon[2][1]*.65],normal:[1,0,0],size:.45}]}});
    }
    const top=T.ball({...base,name:`crown-lobe.${side}`,c:[cx,0,107],r:22,flats:[{n:[0,0,-1],d:-21}],material:'brass'});
    const rear=T.round({...base,name:`cerebral-bearing.${side}`,F:G.frameOf([cx,0,105],[0,-1,0],[1,0,0],[0,0,-1]),s0:-29,s1:-27,r:7,material:'steel',details:{bolts:[{s:-29,r:5,count:10,size:.6}]}});
    face(rear,[cx,29,105],[1,0,0],[0,0,1],'<circle r="4" fill="#252b29" stroke="#9b8151" stroke-width="1"/><circle r="1.7" fill="#baa7ce"/>',[0,1,0]);
  }
  // Copper pressure circuit: straight pipes meet real elbow blocks and collars.
  for(const side of [-1,1]){
    const x=side*65;
    round(`pump-foot.${side}`,x,-24,28,7,4);
    round(`pump-barrel.${side}`,x,-24,32,5.5,28,'copper',{seams:[35,55],ribs:{s0:35,s1:55,count:18,seams:true,tone:'lo'}});
    round(`pump-cap.${side}`,x,-24,60,7,3);
    round(`piston.${side}`,x,-24,63,2.3,18,'steel');
    box(`elbow-upper.${side}`,x,-24,81,7,7,7,'brass');
    rod(`riser-low.${side}`,[x,-24,88],[x,-24,98],1.8);
    round(`valve-body.${side}`,x,-24,98,4,6,'brass');
    rod(`riser-high.${side}`,[x,-24,104],[x,-24,136],1.8);
    rod(`valve-spindle.${side}`,[x,-20,101],[x,-15,101],1,'steel');
    const valve=T.round({...base,name:`valve-wheel.${side}`,F:G.frameOf([x,-15,101],[0,1,0],[1,0,0],[0,0,-1]),s0:0,s1:1.5,r:6,material:'copper'});
    face(valve,[x,-13.5,101],[1,0,0],[0,0,-1],'<circle r="4.3" fill="none" stroke="#452d22" stroke-width="2"/><path d="M -4 0 H 4 M 0 -4 V 4" stroke="#c69b68" stroke-width="1.2"/>',[0,1,0]);
    box(`elbow-crown.${side}`,x,-24,136,7,7,6);
    rod(`crown-feed.${side}`,[x-side*3.5,-24,139],[side*50.5,-24,139],1.8);
    box(`glass-port.${side}`,side*47.5,-24,136,6,8,7);
    rod(`gauge-feed.${side}`,[x,-20.5,84.5],[x,7,84.5],1.8);
    box(`gauge-elbow.${side}`,x,10.5,81,7,7,7);
    rod(`gauge-stem.${side}`,[x,10.5,81],[x,10.5,78],1.8,'steel');
    gauge(`pressure-gauge.${side}`,x,10.5,69,9);
  }
  // Front instrument keys, memory drum, reply printer and drafting desk.
  box('telegraph-plinth',-53,67,28,23,23,3,'brass');
  const key=box('language-key',-53,68,31,17,14,4,'gunmetal',3);
  face(key,[-53,68,35],[1,0,0],[0,1,0],'<text text-anchor="middle" font-size="3" fill="#d9bd83">REPLY</text>',[0,0,1]);
  const drum=T.round({...base,group:drumTurn,name:'memory-drum',F:G.frameOf([62,64,40],[1,0,0],[0,1,0],[0,0,1]),s0:-10,s1:10,r:8,material:'copper',details:{ribs:{s0:-10,s1:10,count:18,seams:true,tone:'lo'}}});
  for(const x of [50,74])box(`drum-pillow.${x}`,x,64,28,3,14,12,'brass');
  box('printer',-25,69,28,19,20,9,'gunmetal');
  const paper=box('language-paper',-25,74,37,15,17,0.5,'steel',.1,paperTravel);
  face(paper,[-25,74,37.5],[1,0,0],[0,1,0],'<g stroke="#514839" stroke-width=".4"><path d="M -5 -4 H 5 M -5 -1 H 4 M -5 2 H 5 M -5 5 H 1"/></g>',[0,0,1]);
  const drawing=box('drawing-desk',21,70,28,25,22,2,'brass');
  face(drawing,[21,70,30],[1,0,0],[0,1,0],'<rect x="-10" y="-9" width="20" height="18" fill="#d8caad"/><g id="drawn-flower" opacity="0" stroke="#75604a" fill="none" stroke-width=".65"><path d="M 0 7 V -1 M 0 4 Q -6 0 -5 -1 Q 0 -1 0 4 M 0 2 Q 5 -2 6 0 Q 4 4 0 2"/><g id="flower-petals"><circle cy="-4" r="2.8"/><circle cx="-2.8" cy="-1.3" r="2.8"/><circle cx="2.8" cy="-1.3" r="2.8"/></g></g>',[0,0,1]);
  for(const x of [7,35])rod(`drafting-pen.${x}`,[x,68,30],[x,68,43],.8,'steel');
  const sensor=round('affection-sensor',0,31,36,7,1,'copper');
  face(sensor,[0,31,37],[1,0,0],[0,1,0],'<path d="M 0 3 C -9 -2 -3 -7 0 -3 C 3 -7 9 -2 0 3" fill="none" stroke="#dfc48e" stroke-width=".7"/>',[0,0,1]);
  rod('rose-stem',[0,31,37],[0,31,50],1.3,'steel');
  round('rose-hub',0,31,50,5,3,'copper');
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3,o=[5*Math.cos(a),31+5*Math.sin(a),53];
    const group=T.group(`petal${i}`,{parent:scene,hinge:{point:o,axis:[-Math.sin(a),Math.cos(a),0],range:[-60,0]}});
    T.prism({...base,group,name:`rose-petal.${i}`,F:G.frameOf(o,[0,0,1],[Math.cos(a),Math.sin(a),0],[-Math.sin(a),Math.cos(a),0]),polygon:[[0,-1.3],[6,-2.6],[9,0],[6,2.6],[0,1.3]],s0:0,s1:.8,bevel:.25,material:'brass'});
  }
  // Exposed rear governor, flywheel and service valve reward a full orbit.
  box('governor-block',0,-73,28,28,15,9,'gunmetal');
  const wheel=T.round({...base,group:gearTurn,name:'governor-wheel',F:V(0,-73),s0:37,s1:40,r:9,material:'brass',details:{bolts:[{s:40,r:6,count:12,size:.7}]}});
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;T.prism({...base,group:gearTurn,name:`governor-tooth.${i}`,F:G.frameOf([0,-73,0],[0,0,1],[Math.cos(a),Math.sin(a),0],[-Math.sin(a),Math.cos(a),0]),polygon:[[9,-1],[12,-1],[12,1],[9,1]],s0:37,s1:40,material:'brass'});
  }
  round('governor-hub',0,-73,40,2.8,3,'steel');
  const out=T.build({statics:[],poses:Array.from({length:7},(_,i)=>({exhibit:0,paper:i/6,memory:{R:[1,0,0,0,Math.cos(i),-Math.sin(i),0,Math.sin(i),Math.cos(i)]},governor:i*30,...Object.fromEntries(Array.from({length:6},(_,j)=>[`petal${j}`,-i*10]))})),strict:true,verify:true});
  return {T,R,P,out,plates};
}

