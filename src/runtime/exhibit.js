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
      // The chamber wall itself lives inside the turning scene (glass-wall.* parts)
      // so it occludes correctly; these overlays only add reflection cues on top.
      stage.querySelector('.glass-back').innerHTML='';
      // Specular streaks: a tall soft highlight sliding across the front wall as the exhibit turns.
      let streaks='';
      for(const [off,wide,soft] of [[-.62,1.6,6],[-.5,.7,2.6],[.95,.9,3.4]]){
        const a=view+off,facing=Math.max(0,Math.cos(off));if(facing<=0)continue;
        const d=`M ${at([48.4*Math.cos(a),48.4*Math.sin(a),48])} L ${at([48.4*Math.cos(a),48.4*Math.sin(a),136])}`;
        streaks+=`<path d="${d}" stroke="#eef7f0" stroke-opacity="${(.1*facing).toFixed(3)}" stroke-width="${soft}" stroke-linecap="round"/><path d="${d}" stroke="#f6fcf8" stroke-opacity="${(.34*facing).toFixed(3)}" stroke-width="${wide}" stroke-linecap="round"/>`;
      }
      // Ellipsoid silhouette: its normal is perpendicular to the view ray.
      // A centre-plane half-circle covers only half the projected dome.
      // Seat the shallow cap inside the clamp's 46.5-unit inner radius.
      const elevation=P.elevation*Math.PI/180,radius=45,height=6;
      const tangent=Math.hypot(radius*Math.sin(elevation),height*Math.cos(elevation));
      const depth=radius*radius*Math.sin(elevation)/tangent;
      const rise=height*height*Math.cos(elevation)/tangent;
      const domePoint=t=>[
        radius*Math.cos(t)*Math.cos(view+Math.PI/2)-depth*Math.sin(t)*Math.cos(view),
        radius*Math.cos(t)*Math.sin(view+Math.PI/2)-depth*Math.sin(t)*Math.sin(view),
        149+rise*Math.sin(t)
      ];
      const profile=[];
      for(let i=0;i<=80;i++)profile.push(domePoint(Math.PI*i/80));
      const baseArc=[];
      for(let i=0;i<=40;i++){const t=view-Math.PI/2+Math.PI*i/40;baseArc.push([radius*Math.cos(t),radius*Math.sin(t),149]);}
      const glint=[];
      for(let i=6;i<=16;i++)glint.push(domePoint(Math.PI*i/40));
      const lid=`<path id="glass-lid" d="M ${profile.map(at).join(' L ')} L ${baseArc.map(at).join(' L ')} Z" fill="#c1d5ce" fill-opacity=".1" stroke="none"/><path d="M ${profile.map(at).join(' L ')}" fill="none" stroke="#c6d4c8" stroke-opacity=".4" stroke-width=".7"/><path d="M ${glint.map(at).join(' L ')}" fill="none" stroke="#f2faf4" stroke-opacity=".55" stroke-width="1.3" stroke-linecap="round"/>`;
      stage.querySelector('.glass-front').innerHTML=`${streaks}${lid}`;
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
