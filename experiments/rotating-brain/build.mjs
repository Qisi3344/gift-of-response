import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../.anatomy-upstream/kit/iso-kit.mjs";
import * as G from "../../.anatomy-upstream/kit/lathe.mjs";
import { turning } from "../../.anatomy-upstream/kit/turn-build.mjs";
import { turnScript } from "../../.anatomy-upstream/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 760, HEIGHT = 560;
const AZIMUTH = 45, ELEVATION = 30;
const P = k.fitProjection([
  ...k.boxCorners({ x:-63, y:-60, w:126, d:120, r:5 }, -7, 0),
  [-49,-42,40], [49,42,120], [-52,50,120], [52,-50,38],
], WIDTH, HEIGHT, { pad:52, headroom:8, azimuth:AZIMUTH, elevation:ELEVATION });
const T = turning(P);
const body = T.group("brain", {turn:{pivot:[0,0]}});
const layer = T.layer("brain");
T.stack(["brain"]);
const parts = [];
function addRound(name, center, axis, len, radius, material, ends=["dome","dome"], extras={}) {
  const part = T.round({
    name, group:body, layer, F:G.frameAlong(center, axis),
    s0:0, s1:len, r:radius, ends,
    material, ...extras
  });
  parts.push(name);
  return part;
}
// The hemispheres are two actual 3D metal capsules, not two projected SVG silhouettes.
// A deep narrow longitudinal fissure remains visible through 360 degrees.
for (const side of [-1,1]) {
  const left = side < 0;
  const x = side * 16;
  addRound((left?"left":"right")+".cortex", [x,-12,86], [0,1,0], 23, 15.6,
           left?"steel":"chrome");
  // Front and occipital volume, just below the lateral surface.
  addRound((left?"left":"right")+".temporal", [x+side*1,-12,75], [0,1,0], 18, 9.0, "gunmetal");
  // Organic 3D cortical relief: every gyrus follows the capsule surface in XYZ.
  // Unlike evenly spaced studs, each routed ridge bends across the hemisphere,
  // with tapered front and rear dome contact and real dynamic occlusion.
  const shellRadius=y => {
    const beyond = y < -12 ? -12-y : y > 11 ? y-11 : 0;
    return Math.sqrt(Math.max(1.5, 15.6**2-beyond**2));
  };
  for(let band=0;band<7;band++){
    const theta0=-0.44+band*.416;
    for(let row=0;row<6;row++){
      const y0=-22.5+row*8.2;
      const route=[];
      for(let sample=0;sample<=14;sample++){
        const t=sample/14;
        const y=y0+7.1*t+0.45*Math.sin(t*Math.PI)*Math.sin(row*.9+band);
        const theta=theta0+
          0.11*Math.sin((t*.95+row*.18)*Math.PI) +
          0.055*Math.cos((t*2.1+band*.4)*Math.PI);
        const r=shellRadius(y)+0.12;
        route.push([x+side*r*Math.cos(theta),y,86+r*Math.sin(theta)]);
      }
      const name=(left?"L":"R")+".gyrus."+band+"."+row;
      T.tube({name,group:body,layer,route,r:.85+(row%3)*.12,
        chunk:18,turn:65,spacing:1.2,
        material:(band===3||row===2&&band===5)?"gold":"steel",
        caps:true});
      parts.push(name);
    }
  }
  // Lateral copper stitching is a true 3D ribbed cable (not repeated markers).
  for(let i=0;i<3;i++){
    const route=[];
    for(let q=0;q<=12;q++){
      const y=-18+q*3.0;
      const theta=-.30+i*.46;
      const r=shellRadius(y)+.5;
      route.push([x+side*r*Math.cos(theta),y,86+r*Math.sin(theta)]);
    }
    const name=(left?"L":"R")+".lower-braid."+i;
    T.tube({name,group:body,layer,route,r:.53,chunk:40,turn:65,spacing:1.8,material:"gold"});
    parts.push(name);
  }
}
// Real metal shaft / nexus, mounted inside the two hemispheres.
addRound("cognitive.spindle",[0,0,49],[0,0,1],38,4.1,"gold",["flat","flat"],
  {details:{seams:[50,54,60,70,80]}});
addRound("cognitive.inner-core",[0,0,77],[0,0,1],13,6.2,"chrome",["flat","flat"]);
for (let i=0;i<6;i++) {
  const a=i*Math.PI/3;
  const x=Math.cos(a)*11, y=Math.sin(a)*11;
  addRound("relay.pin."+i,[x,y,57],[0,0,1],6.5,2.0,i%2?"steel":"gold",["flat","flat"]);
}
// Rear lower cerebellum and the small visible transmission stack.
addRound("cerebellum.lower",[0,-19,68],[1,0,0],17,7.0,"steel");
for(let i=0;i<3;i++){
  addRound("bearing.ring."+i,[0,0,55+i*6],[0,0,1],1.1,7.5+i*0.6,
    i===1?"gold":"chrome",["flat","flat"],{details:{ribs:{s0:55+i*6,s1:56+i*6,count:24,tone:"lo"}}});
}
// Sample independent poses to precompute depth relationships in upstream beta.
const poses=Array.from({length:25},(_,i)=>({brain:i*15}));
const out=T.build({poses,statics:[],strict:false});
const base=k.solidSvg(k.slabOf({x:-53,y:-48,w:106,d:96,r:8},-7,11,P,8,1.2),{tone:"mid"})+
  k.solidSvg(k.cylinder(0,0,20,4,7,P,40),{tone:"mid"})+
  k.solidSvg(k.cylinder(0,0,12,11,8,P,40),{tone:"lo"})+
  k.solidSvg(k.cylinder(0,0,7,19,30,P,40),{tone:"mid"});
const under= '<svg viewBox="0 0 '+WIDTH+' '+HEIGHT+'" class="base-svg" aria-hidden="true">'+base+'</svg>';
const css=readFileSync(join(HERE,"style.css"),"utf8");
const script=readFileSync(join(HERE,"live.js"),"utf8")
 .replace("__DATA__",JSON.stringify({turn:out.data,parts:parts.length,projection:P}));
const stage='<div class="brain-stage iso-stage iso-turn" role="slider" tabindex="0" aria-label="Rotate the mechanical brain" aria-valuemin="0" aria-valuemax="360" aria-valuenow="0">'+under+out.layerSvg("brain",{width:WIDTH,height:HEIGHT})+'<div class="core-glow" aria-hidden="true"></div></div>';
const bodyMarkup='<div class="workhead"><span>THE GIFT OF RESPONSE / STUDY 03</span><span>ANATOMY · 3D TURNING BETA</span></div>'+
  '<h1> A mind, made to turn. </h1><p class="subtitle">真正可以转动的机械脑 · 3D Prototype</p>'+
  '<p class="lede">Anatomy 世界坐标零件 · 真实三维遮挡 · 等距投影 · 鼠标或触控拖动旋转</p>'+
  '<section class="figure">'+
    '<div class="frame-top"><span>Fig 03</span><span>ROTATING CORRESPONDENCE CORE</span></div>'+
    stage+
    '<div class="frame-foot"><span>DRAG TO ORBIT · ← → ROTATE · HOME RESET</span><strong data-readout>000° / READY</strong></div>'+
  '</section><div class="controls"><button id="pause" type="button">暂停自动巡视</button><button id="reset" type="button">复位视角</button><button id="half" type="button">查看背面</button></div>'+
  '<p class="disclaimer">独立机械脑实验。正式作品的五个模块与玻璃保护舱保持 V0.2 不变，验收后再整合。<br/>No CSS pseudo-3D; every part is a reprojected Anatomy 3D solid.</p>';
const page=k.pageHtml({title:"Anatomy Rotating Brain · The Gift of Response",theme:"light",width:850,body:'<style>'+out.css+'\n'+css+'</style>'+bodyMarkup,script:turnScript()+'\n'+script});
writeFileSync(join(HERE,"index.html"),page,"utf8");
console.log("Created",join(HERE,"index.html"),"parts",parts.length,"bytes",Buffer.byteLength(page),"depth issues",out.report?.problems?.length ?? "unknown");
