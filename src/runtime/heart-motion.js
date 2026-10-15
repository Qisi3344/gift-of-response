const HeartMotion=(()=>{
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  const windowAt=(t,a,b,edge=.4)=>ease((t-a)/edge)*(1-ease((t-b)/edge));
  const durations={name:3,language:6,creation:5.8,affection:7.2,memory:1.2};
  const beats={name:[[2.1,2.7]],language:[[2.0,2.75],[3.0,3.75]],creation:[[1.1,1.9],[2.6,3.4],[4.8,5.5]],affection:[[1.8,2.7],[3.2,4.25]],memory:[[.15,.95]]};
  const emissions={name:[[2.75,'left']],language:[[1.15,'left']],memory:[[.28,'condenser']],creation:[[2.4,'right']],affection:[[3.8,'left'],[4.6,'right']]};
  function linkage(degrees){const a=degrees*Math.PI/180,s=Math.sin(a),c=Math.cos(a);return {stroke:1-c+Math.sqrt(100-s*s)-10,rod:{R:TURN.rotation([0,1,0],-Math.asin(s/10)*180/Math.PI),t:[s,0,1-c]}};}
  function at(time,event=null,calm=false){
    const t=event?.elapsed||0,kind=event?.kind;
    const crank=calm?0:event?event.base+(beats[kind]||[]).reduce((n,[a,b])=>n+360*ease((t-a)/(b-a)),0):time/3.8*360;
    const a=crank*Math.PI/180,left=(1-Math.cos(a))/2,right=(1-Math.cos(a-.24))/2;
    const force=kind==='affection'?windowAt(t,.9,5.2)*(.7+.3*ease((t-2.8)/.4)):kind==='language'?windowAt(t,1.1,4.2):kind==='name'?.6*windowAt(t,1.9,2.7,.2):kind==='creation'?.25:.1;
    const pressure=.22+.09*left+.4*force;
    const light=.15+.14*left+.48*force;
    const valves=calm?.05:.04+.4*force+.13*left;
    return {crank,left:calm?0:(.2+.48*force)*left,right:calm?0:(.16+.4*force)*right,pressure,light,valves,
      paper:kind==='language'?ease((t-3.6)/1.9):null,
      key:kind==='language'?windowAt(t,0,.22,.12):0,
      engraver:kind==='name'?(t<2.1?clamp(t/2.1):1-ease((t-2.7)/.3)):0,
      pens:kind==='creation'?Math.sin(Math.PI*clamp(t/durations.creation)):0,
      flower:kind==='creation'?ease((t-.6)/4.7):null,
      rose:kind==='affection'?ease((t-5.25)/1.2):null,
      ringdown:kind==='affection'&&t>4.3&&t<4.8?Math.sin((t-4.3)*Math.PI*10)*Math.exp(-(t-4.3)*8)*.3:0};
  }
  function create(){
    Object.assign(M.DURATIONS,durations);
    let time=0,event=null,lastJob=null,lastJobTime=0,lastMemory=0,calm=false,paused=false,reducedMotion=false,stage,controller,steam;
    const emitted=new Set();let frameState=at(0),lastIdleVent=0;
    function detect(state){
      const job=Object.keys(state.jobs)[0];
      if(job&&(job!==lastJob||state.jobs[job]<lastJobTime)){
        event={kind:job,elapsed:state.jobs[job],base:frameState.crank};emitted.clear();
      }
      if(!job&&state.selected==='memory'&&state.targetTurn!==lastMemory){event={kind:'memory',elapsed:0,base:frameState.crank};emitted.clear();}
      lastJob=job||null;lastJobTime=job?state.jobs[job]:0;lastMemory=state.targetTurn;
      if(reducedMotion)event=null;
    }
    return {
      attach(s,c){stage=s;controller=c;steam=Steam.mount(s,c,exhibitProjection,heartPorts);},
      advance(dt,reduced){reducedMotion=reduced;calm=reduced||paused;if(reduced)event=null;if(!calm){time+=dt;if(event)event.elapsed+=dt;}if(event&&event.elapsed>durations[event.kind]+.7){time=event.base/360*3.8+((beats[event.kind]||[]).length)*3.8;event=null;}steam?.advance(calm?0:dt);},
      moving:()=>!calm,
      setPaused(value){paused=value;calm=value||reducedMotion;if(value)steam?.clear();},isPaused:()=>paused,
      values(state,angle){detect(state);if(!paused||reducedMotion)frameState=at(time,event,calm);const h=frameState;
        const rose=event?.kind==='affection'?h.rose:state.progress.affection;
        const l=linkage(h.crank),r=linkage(h.crank-14);
        return {exhibit:angle,leftVentricle:1.2*h.left,rightVentricle:.7*h.right,pistonLeft:l.stroke,pistonRight:r.stroke,crank:h.crank,camLeft:-h.crank,camRight:14-h.crank,rodLeft:l.rod,rodRight:r.rod,
          paper:12*(h.paper??state.progress.language),memory:{R:TURN.rotation([1,0,0],state.turn*60)},key:2*h.key,engraver:45*h.engraver,pen0:9*h.pens,pen1:9*h.pens,
          ...Object.fromEntries(Array.from({length:3},(_,i)=>[`valve${i}`,Math.min(18,(h.valves+h.ringdown)*18*(1-i*.12))])),
          ...Object.fromEntries(Array.from({length:6},(_,i)=>[`petal${i}`,-60*(1-(rose??0))]))};
      },
      paperProgress:state=>frameState.paper??state.progress.language,
      nameText:state=>event?.kind==='name'?Array.from(state.name).slice(0,Math.floor(Array.from(state.name).length*clamp(event.elapsed/2.1))).join(''):state.engraved,
      paint(state){
        const h=frameState;stage.dataset.pressure=h.pressure.toFixed(3);stage.dataset.heartPhase=(h.crank%360).toFixed(2);stage.dataset.valveAngle=(h.valves*18).toFixed(2);stage.dataset.mechanicalEvent=event?.kind||'idle';stage.dataset.eventTime=(event?.elapsed||0).toFixed(2);
        document.getElementById('pressure-gauge-needle')?.setAttribute('transform',`rotate(${-45+h.pressure*115})`);
        document.getElementById('boiler-gauge-needle')?.setAttribute('transform',`rotate(${-40+h.pressure*100})`);
        const core=document.getElementById('heart-core-light');if(core)core.style.opacity=String(calm?.4:h.light);
        for(const [side,delay]of [['left',.35],['right',.85]]){const signal=document.getElementById(`pressure-signal-${side}`);if(signal)signal.setAttribute('opacity',String(!calm&&['language','affection'].includes(event?.kind)?windowAt(event.elapsed,delay,delay+.6,.25)*.7:0));}
        const ink=document.getElementById('reply-ink');if(ink){ink.style.strokeDasharray='60';ink.style.strokeDashoffset=String(60*(1-(h.paper??state.progress.language)));}
        if(h.flower!==null&&event?.kind==='creation'){const flower=document.getElementById('drawn-flower');flower.setAttribute('opacity',String(Math.min(1,h.flower*4)));flower.style.strokeDashoffset=String(100*(1-h.flower));}
        if(!calm&&event)for(const [i,[atTime,port]]of (emissions[event.kind]||[]).entries())if(event.elapsed>=atTime&&!emitted.has(i)){steam.emit(port,event.kind==='memory'?2:4);emitted.add(i);}
        if(!calm&&!event&&time-lastIdleVent>12){steam.emit('right',2);lastIdleVent=time;}
        steam.render();
      },
      snapshot:()=>({time,event: event?{...event}:null,paused,calm,...frameState})
    };
  }
  return {create,at,linkage,durations,beats,emissions};
})();
