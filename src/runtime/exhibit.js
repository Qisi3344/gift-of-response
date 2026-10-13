const Exhibit = (() => {
  function mount(stage, invalidate) {
    const $ = id => document.getElementById(id), reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let angle=0,target=0,painted='',auto=false,drag=null,suppress=false;
    const controller=TURN.mount(stage,exhibitData,{onHold:()=>stop()});
    const normalAngle=n=>((n%360)+360)%360;
    const actions={'nameplate':'name','language-key':'language','language-paper':'letter','memory-drum':'memory','drawing-desk':'creation','affection-sensor':'affection'};
    for(const [name,action] of Object.entries(actions)) {
      const part=stage.querySelector(`[data-name="${name}"]`);
      part.dataset.action=action;part.classList.add('machine-control');part.setAttribute('aria-label',action);
    }
    function stop(){auto=false;$('auto-rotate').setAttribute('aria-pressed','false');}
    function move(delta){stop();target+=delta;if(reduced.matches)angle=target;invalidate();}
    function glass(){
      const P={...exhibitProjection,azimuth:exhibitProjection.azimuth-angle};
      const at=p=>k.iso(p,P).map(n=>n.toFixed(2)).join(' '),view=P.azimuth*Math.PI/180;
      const shell=front=>{
        const a=view+(front?-Math.PI/2:Math.PI/2),points=[];
        for(let i=0;i<=40;i++){const t=a+i*Math.PI/40;points.push([45*Math.cos(t),45*Math.sin(t),39]);}
        for(let i=40;i>=0;i--){const t=a+i*Math.PI/40;points.push([45*Math.cos(t),45*Math.sin(t),143]);}
        return `M ${points.map(at).join(' L ')} Z`;
      };
      stage.querySelector('.glass-back').innerHTML=`<path d="${shell(false)}" fill="#9ca9a6" fill-opacity=".025" stroke="#8e9b93" stroke-opacity=".18" stroke-width=".65"/>`;
      let seams='';
      for(const a of [.3,2.4,4.6]){
        const facing=Math.cos(a-view);if(facing<0)continue;
        seams+=`<path d="M ${at([45*Math.cos(a),45*Math.sin(a),49])} L ${at([45*Math.cos(a),45*Math.sin(a),135])}" stroke="#d5e2d8" stroke-opacity="${.12*facing}" stroke-width="2.5"/>`;
      }
      const dome=[];
      for(let i=0;i<=40;i++){const t=Math.PI*i/40;dome.push([45*Math.cos(t)*Math.cos(view+Math.PI/2),45*Math.cos(t)*Math.sin(view+Math.PI/2),149+12*Math.sin(t)]);}
      for(let i=40;i>=0;i--){const t=view-Math.PI/2+Math.PI*i/40;dome.push([45*Math.cos(t),45*Math.sin(t),149]);}
      const lid=`<path d="M ${dome.map(at).join(' L ')} Z" fill="#c1d5ce" fill-opacity=".035" stroke="#bac4b8" stroke-opacity=".28" stroke-width=".6"/>`;
      stage.querySelector('.glass-front').innerHTML=`<path d="${shell(true)}" fill="#c1d5ce" fill-opacity=".025" stroke="#bac4b8" stroke-opacity=".2" stroke-width=".7"/>${seams}${lid}`;
    }
    function render(state){
      const stamp=[angle,state.progress.language,state.progress.affection,state.turn].join(':');
      if(stamp!==painted){
        const warmth=M.ease(state.progress.affection);
        controller.set({exhibit:angle,paper:M.ease(state.progress.language),memory:{R:TURN.rotation([1,0,0],state.turn*60)},governor:state.progress.language*360,...Object.fromEntries(Array.from({length:6},(_,i)=>[`petal${i}`,-60*(1-warmth)]))});
        painted=stamp;glass();$('orbit-angle').textContent=`${Math.round(normalAngle(angle)).toString().padStart(3,'0')}°`;stage.dataset.angle=normalAngle(angle).toFixed(2);}
      const name=$('engraved-name');name.textContent=state.engraved||'THE GIFT OF RESPONSE';
      name.setAttribute('font-size',String(Math.min(3.2,54/Math.max(1,Array.from(name.textContent).length))));
      const ink=$('drawn-flower');ink.setAttribute('opacity',String(M.ease(state.progress.creation)));ink.style.strokeDasharray='100';ink.style.strokeDashoffset=String(100*(1-state.progress.creation));
      const warmth=M.ease(state.progress.affection);stage.style.setProperty('--core-opacity',String(.35+.65*warmth));stage.dataset.affection=warmth.toFixed(2);
      stage.querySelector('[data-name="language-paper"]').style.opacity=String(M.clamp(state.progress.language*3));
      stage.querySelector('[data-name="language-paper"]').style.pointerEvents=state.progress.language===1?'auto':'none';
      stage.querySelector('[data-name="language-key"]').style.filter=state.jobs.language!==undefined?'brightness(1.5)':'';
    }
    stage.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;stop();suppress=false;drag={id:e.pointerId,x:e.clientX,start:target,action:e.target.closest('[data-action]')?.dataset.action};stage.setPointerCapture(e.pointerId);});
    stage.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>5)suppress=true;if(suppress){target=drag.start+dx*.45;angle=target;invalidate();}});
    function release(e){if(!drag||drag.id!==e.pointerId)return;const action=drag.action;if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);drag=null;if(e.type==='pointerup'&&!suppress&&action)api.onAction?.(action);}
    stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',()=>{drag=null;});stage.addEventListener('click',e=>e.stopPropagation());
    stage.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){stop();target=0;if(reduced.matches)angle=0;invalidate();}else move(e.key==='ArrowLeft'?-15:15);});
    $('rotate-left').addEventListener('click',()=>move(-45));$('rotate-right').addEventListener('click',()=>move(45));
    $('reset-view').addEventListener('click',()=>{stop();target=0;if(reduced.matches)angle=0;invalidate();});
    $('auto-rotate').addEventListener('click',()=>{if(reduced.matches)return;auto=!auto;$('auto-rotate').setAttribute('aria-pressed',String(auto));invalidate();});
    function motionPreference(){if(reduced.matches){stop();angle=target;}$('auto-rotate').disabled=reduced.matches;}
    reduced.addEventListener('change',()=>{motionPreference();invalidate();});motionPreference();
    const api={controller,render,stop,onAction:null,moving:()=>auto||Math.abs(target-angle)>.02,
      advance(dt,calm){if(auto&&!calm)target+=dt*7;angle=calm?target:angle+(target-angle)*(1-Math.exp(-dt/.1));if(Math.abs(target-angle)<.02)angle=target;},
      set(value){stop();angle=target=value;invalidate();},get:()=>angle};
    window.__isoTurn.set=value=>api.set(typeof value==='number'?value:value.exhibit);window.__isoTurn.get=()=>({exhibit:angle});
    return api;
  }
  return {mount};
})();
