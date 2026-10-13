
const DATA = __DATA__;
const stage = document.querySelector(".brain-stage");
const readout = document.querySelector("[data-readout]");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
const controller = TURN.mount(stage, DATA.turn, {onHold:()=>{tour=false;}});
let angle=0, target=0, last=0, frame=0, visible=true, tour=!reduce.matches;
let drag=null, idle=0;
function display(){
  const value=((Math.round(angle)%360)+360)%360;
  readout.textContent=String(value).padStart(3,"0")+"° / "+DATA.parts+" PARTS";
  stage.setAttribute("aria-valuenow",String(value));
  stage.setAttribute("aria-valuetext","Mechanical brain turned to "+value+" degrees");
}
function draw(){controller.set({brain:angle});display();}
function run(){if(!frame&&visible){last=0;frame=requestAnimationFrame(tick);}}
function tick(now){
  const dt=last?Math.min((now-last)/1000,1/30):1/60;last=now;
  if(reduce.matches)tour=false;
  if(tour)target+=12*dt;
  const before=angle;
  angle=reduce.matches?target:angle+(target-angle)*(1-Math.exp(-dt/0.14));
  if(Math.abs(target-angle)<.002)angle=target;
  if(Math.abs(angle-before)>.001)draw();
  frame=visible&&(tour||Math.abs(angle-target)>.001)?requestAnimationFrame(tick):0;
}
function hold(){
  tour=false;document.getElementById("pause").textContent="恢复自动巡视";
}
stage.addEventListener("pointerdown",e=>{
  if(e.pointerType==="mouse"&&e.button!==0)return;
  hold();drag={id:e.pointerId,x:e.clientX,angle:target,moved:false};
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener("pointermove",e=>{
  if(!drag||drag.id!==e.pointerId)return;
  let dx=e.clientX-drag.x;
  if(Math.abs(dx)>3)drag.moved=true;
  if(!drag.moved)return;
  target=drag.angle+dx*.58;run();
});
const end=e=>{if(!drag||e.pointerId!==drag.id)return;drag=null;try{stage.releasePointerCapture(e.pointerId);}catch{};};
stage.addEventListener("pointerup",end);stage.addEventListener("pointercancel",end);
stage.addEventListener("keydown",e=>{
  let next=null;
  if(e.key==="ArrowLeft")next=target-15;
  if(e.key==="ArrowRight")next=target+15;
  if(e.key==="Home")next=0;
  if(next===null)return;e.preventDefault();hold();target=next;run();
});
document.getElementById("pause").addEventListener("click",e=>{
  if(reduce.matches)return;
  tour=!tour;e.currentTarget.textContent=tour?"暂停自动巡视":"恢复自动巡视";run();
});
document.getElementById("reset").addEventListener("click",()=>{hold();target=0;run();});
document.getElementById("half").addEventListener("click",()=>{hold();target+=180;run();});
reduce.addEventListener("change",()=>{if(reduce.matches)hold();draw();run();});
if("IntersectionObserver" in window) new IntersectionObserver(entries=>{visible=entries.at(-1).isIntersecting;if(visible)run();else if(frame){cancelAnimationFrame(frame);frame=0;}},{rootMargin:"120px 0px"}).observe(stage);
const debugAngle=Number(new URLSearchParams(location.search).get("angle"));
if(new URLSearchParams(location.search).has("angle") && Number.isFinite(debugAngle)) {angle=target=debugAngle;tour=false;}
draw();run();
