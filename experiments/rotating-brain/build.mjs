import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../.anatomy-upstream/kit/iso-kit.mjs";
import * as G from "../../.anatomy-upstream/kit/lathe.mjs";
import { turning } from "../../.anatomy-upstream/kit/turn-build.mjs";
import { turnScript } from "../../.anatomy-upstream/scripts/inline-kit.mjs";
import { assembleBrain } from "./brain-geometry.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 760, HEIGHT = 560;
const AZIMUTH = 45, ELEVATION = 30;
const P = k.fitProjection([
  ...k.boxCorners({ x:-49, y:-45, w:98, d:90, r:5 }, -7, 0),
  [-42,-42,36], [42,42,112], [-45,45,112], [45,-45,36],
], WIDTH, HEIGHT, { pad:45, headroom:8, azimuth:AZIMUTH, elevation:ELEVATION });
const T = turning(P);
const body = T.group("brain", {turn:{pivot:[0,0]}});
const layer = T.layer("brain");
T.stack(["brain"]);
const parts=assembleBrain(T,G,body,layer);
// Sample independent poses to precompute depth relationships in upstream beta.
const poses=Array.from({length:25},(_,i)=>({brain:i*15}));
const out=T.build({poses,statics:[],strict:false});
const base=k.solidSvg(k.slabOf({x:-44,y:-40,w:88,d:80,r:8},-7,11,P,8,1.2),{tone:"mid"})+
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
