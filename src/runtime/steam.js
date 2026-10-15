const Steam=(()=>{
  function mount(stage,controller,P,ports){
    const NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 960 600');svg.setAttribute('class','steam-layer');svg.setAttribute('aria-hidden','true');svg.style.pointerEvents='none';
    svg.innerHTML='<defs><radialGradient id="steam-fade"><stop stop-color="#fff" stop-opacity=".65"/><stop offset=".55" stop-color="#a5b0b4" stop-opacity=".2"/><stop offset="1" stop-color="#a5b0b4" stop-opacity="0"/></radialGradient></defs>';stage.append(svg);
    const puffs=[];let sequence=0;
    function emit(name,count){
      const port=ports[name],pose=controller.pose('exhibit'),R=pose.R;
      const direction=port.direction,velocity=[0,1,2].map(i=>R[i*3]*direction[0]+R[i*3+1]*direction[1]+R[i*3+2]*direction[2]);
      const start=controller.anchor('exhibit',port.position).world;
      for(let i=0;i<count&&puffs.length<18;i++){
        const el=document.createElementNS(NS,'ellipse'),mask=document.createElementNS(NS,'mask'),id=`steam-mask-${sequence}`;mask.id=id;mask.setAttribute('maskUnits','userSpaceOnUse');mask.setAttribute('x','0');mask.setAttribute('y','0');mask.setAttribute('width','960');mask.setAttribute('height','600');svg.querySelector('defs').append(mask);el.setAttribute('mask',`url(#${id})`);el.setAttribute('fill','url(#steam-fade)');el.dataset.port=name;svg.append(el);
        puffs.push({el,mask,port:name,start:[...start],velocity:velocity.map(v=>v*(10+i*2)),age:-i*.07,lifetime:1.35+(sequence%3)*.07});sequence++;
      }
    }
    function advance(dt){for(let i=puffs.length-1;i>=0;i--){const p=puffs[i];p.age+=dt;if(p.age>p.lifetime){p.el.remove();p.mask.remove();puffs.splice(i,1);}}}
    function render(){for(const p of puffs){const t=Math.max(0,p.age),world=p.start.map((v,i)=>v+p.velocity[i]*t+(i===2?5*t*t:0)),screen=k.iso(world,P),radius=(2.1+t*4)*P.scale;
      p.el.setAttribute('cx',screen[0]);p.el.setAttribute('cy',screen[1]);p.el.setAttribute('rx',radius);p.el.setAttribute('ry',radius*1.4);p.el.setAttribute('opacity',String(p.age<0?0:Math.sin(Math.PI*Math.min(1,t/p.lifetime))*.35));
      p.el.dataset.world=world.map(n=>n.toFixed(2)).join(',');
      const scene=controller.scene(),cams=controller.cams(),frames=controller.frames();let cover='';
      // ponytail: each small puff uses one depth sample; volumetric steam would require a depth texture.
      for(const run of scene.runs){if(run.name.startsWith('glass-'))continue;const f=frames[run.index],b=f.box;
        if(b[0]>screen[0]+radius||b[2]<screen[0]-radius||b[1]>screen[1]+radius*1.4||b[3]<screen[1]-radius*1.4)continue;
        const hit=TURN.gjk(run.cloud,run.group>=0?cams[run.group]:cams.world,world,cams.world,null,12);
        if(hit.n.reduce((sum,n,i)=>sum+n*cams.world.V[i],0)>=0||!f.hullN)continue;
        cover+=`<polygon fill="black" points="${Array.from({length:f.hullN},(_,i)=>`${f.hull[2*i]},${f.hull[2*i+1]}`).join(' ')}"/>`;
      }
      p.mask.innerHTML='<rect width="960" height="600" fill="white"/>'+cover;p.el.dataset.occluders=String((cover.match(/polygon/g)||[]).length);
    }svg.dataset.count=puffs.length;}
    function clear(){for(const p of puffs){p.el.remove();p.mask.remove();}puffs.length=0;render();}
    return {emit,advance,render,clear};
  }
  return {mount};
})();
