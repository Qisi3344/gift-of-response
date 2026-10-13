(() => {
  const $ = id => document.getElementById(id), stage = document.querySelector('.iso-plate');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('gift-of-response:v1') || '{}') || {}; } catch {}
  const state = M.initialState(saved);
  let frame = 0, last = 0, visible = true, idle = 0, touring = false, engaged = false, hovered = false, focused = false;
  let previousReadout = '', previousDrum = '', lastLetterFocus = null, drag = null, suppressClick = false;
  const refs = Object.fromEntries(['engraved-name','heart-halo','memory-strips','drawn-flower','flower-ink','flower-petals','name-slider','name-stylus','name-indicator','language-key','language-paper'].map(id => [id,$(id)]));
  const gearRefs = cfg.gears.map(g => ({ ...g, el: $(g.id), last: -1 }));
  const penRefs = cfg.pens.map(p => ({ ...p, el: $(p.id) }));
  const petalRefs = cfg.petals.map(p => ({ ...p, el: $(p.id) }));
  const date = () => new Intl.DateTimeFormat('en-CA', {year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function persist() {
    try { localStorage.setItem('gift-of-response:v1', JSON.stringify({ name: state.engraved, memories: state.memories })); }
    catch { $('feedback').textContent = 'This page can respond, but cannot save in this browser. · 当前浏览器无法保存。'; }
  }
  function completed(module) {
    if (module === 'name') M.remember(state, `Named: ${state.engraved}`, date());
    if (module === 'language') M.remember(state, 'Your first reply arrived.', date());
    if (module === 'creation') M.remember(state, 'One flower, drawn together.', date());
    persist();
    if (state.selected === module) $('feedback').textContent = M.readout(state);
  }
  function stopTour() { engaged = true; touring = false; idle = 0; }
  function select(module) {
    stopTour(); state.selected = module;
    const index = M.MODULES.indexOf(module);
    document.querySelectorAll('[data-module]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.module === module)));
    $('panel-title').textContent = moduleCopy[index][2]; $('panel-description').textContent = moduleCopy[index][3];
    $('name-form').hidden = module !== 'name';
    for (const key of M.MODULES.slice(1)) $(`${key}-actions`).hidden = module !== key;
    $('feedback').textContent = '';
    draw();
  }
  function trigger(module, value) {
    if (state.selected !== module) select(module); else stopTour();
    if (module === 'name' && value === undefined) { $('name-input').focus(); return; }
    if (!M.begin(state, module, value, reduced.matches)) return;
    if (reduced.matches && module !== 'memory') completed(module);
    draw(); run();
  }
  function drawGears(progress) {
    for (const [i, g] of gearRefs.entries()) {
      const angle = progress * Math.PI * 4 * (i ? -1 : 1) + g.phase;
      if (Math.abs(angle - g.last) < .008) continue;
      g.last = angle;
      const holes = Array.from({length:5}, (_, j) => { const a = j * Math.PI * 2 / 5 + angle; return k.ring(g.x + Math.cos(a) * g.r * .51, g.y + Math.sin(a) * g.r * .51, g.r * .16, g.z + 2, cfg.P, 20); }).join('');
      g.el.innerHTML = k.solidSvg(k.extrude(gearRing(g.x,g.y,g.r,g.teeth,angle),g.z,2,cfg.P,{convex:false}),{tone:'hi',inner:k.lineSvg(k.ring(g.x,g.y,g.r*.23,g.z+2,cfg.P,24)+holes,{tone:'lo'})});
    }
  }
  function drawDrum() {
    const stamp = `${state.turn.toFixed(3)}:${state.memories.length}`;
    if (stamp === previousDrum) return;
    previousDrum = stamp;
    const d = cfg.drum, strips = [], facing = Math.PI / 4;
    // Surface labels use the local tangent of the drum, so they turn with it.
    for (let offset = -2; offset <= 2; offset++) {
      const n = Math.round(state.turn) + offset, a = facing + (n - state.turn) * Math.PI / 3;
      if (Math.cos(a - facing) < .12) continue;
      const [cx,cy,cz] = d.centre;
      const centre = [cx - 2, cy + Math.cos(a)*d.radius, cz + Math.sin(a)*d.radius];
      const p = k.iso(centre,cfg.P), x = k.iso([centre[0]+1,centre[1],centre[2]],cfg.P), y = k.iso([centre[0],centre[1]+Math.sin(a),centre[2]-Math.cos(a)],cfg.P);
      const matrix = `matrix(${x[0]-p[0]} ${x[1]-p[1]} ${y[0]-p[0]} ${y[1]-p[1]} ${p[0]} ${p[1]})`;
      const index = M.memoryIndex(n,state.memories.length), text = state.memories[index].text.slice(0,24);
      strips.push({ depth: Math.cos(a-facing), svg:`<g transform="${matrix}"><rect class="paper-strip ${Math.abs(n-state.turn)<.25?'current':''}" x="-22" y="-3.5" width="44" height="7" rx=".7"/><text class="strip-text" x="0" y="1" font-size="2.2" text-anchor="middle">${escape(text)}</text></g>` });
    }
    refs['memory-strips'].innerHTML = strips.sort((a,b)=>a.depth-b.depth).map(s=>s.svg).join('');
    const m = state.memories[M.memoryIndex(state.turn,state.memories.length)];
    $('memory-date').textContent = m.date; $('memory-text').textContent = m.text;
  }
  function draw() {
    const p = state.progress;
    refs['engraved-name'].textContent = state.engraved;
    const letterCount = Math.max(1, Array.from(state.engraved).length);
    refs['engraved-name'].setAttribute('font-size', String(Math.min(5.2, 70 / letterCount)));
    const nameMotion = state.jobs.name !== undefined ? p.name : 0;
    for (const id of ['name-slider','name-stylus']) refs[id].setAttribute('transform', k.translateAlong(cfg.P,[nameMotion*43,0,0]));
    refs['name-indicator'].style.opacity = state.jobs.name !== undefined ? String(.3 + .7*Math.sin(p.name*Math.PI)**2) : '1';
    const lp = M.ease(p.language);
    drawGears(lp);
    refs['language-key'].setAttribute('transform',k.translateAlong(cfg.P,[0,0,state.jobs.language !== undefined ? -2.4*Math.sin(Math.min(1,p.language*4)*Math.PI) : 0]));
    refs['language-paper'].style.opacity = String(M.clamp(lp*5));
    refs['language-paper'].setAttribute('transform',k.translateAlong(cfg.P,[0,-17*(1-lp),0]));
    refs['language-paper'].setAttribute('tabindex', p.language === 1 ? '0' : '-1');
    refs['language-paper'].setAttribute('aria-hidden', String(p.language !== 1));
    refs['language-paper'].style.pointerEvents = p.language === 1 ? 'auto' : 'none';
    $('read-letter').disabled = p.language !== 1;
    const cp = M.ease(p.creation), ink = refs['flower-ink'];
    refs['drawn-flower'].style.opacity = String(Math.min(1,cp*6));
    ink.style.strokeDasharray = '90'; ink.style.strokeDashoffset = String(90*(1-M.clamp(cp*1.8)));
    const blossom = M.ease((cp-.5)*2);
    refs['flower-petals'].setAttribute('transform',`translate(0 -5) scale(${.05+.95*blossom}) translate(0 5)`);
    for (const pen of penRefs) pen.el.setAttribute('transform',k.translateAlong(cfg.P,pen.vector.map(v=>v*Math.sin(cp*Math.PI))));
    const affection = M.ease(p.affection), tour = touring ? (.5-.5*Math.cos(idle*.7))*.38 : 0, warmth = Math.max(affection,tour);
    refs['heart-halo'].style.opacity = String(.12+.88*warmth);
    $('brain-lamp').style.opacity = String(.7+.3*warmth);
    for (const petal of petalRefs) {
      const [x,y] = petal.centre;
      petal.el.setAttribute('transform',`translate(${x} ${y}) scale(${.6+.4*warmth}) translate(${-x} ${-y})`);
    }
    drawDrum();
    const text = M.readout(state);
    if (text !== previousReadout) { document.querySelector('[data-readout]').textContent = text; previousReadout = text; }
    stage.dataset.selected = state.selected; stage.dataset.busy = String(Object.keys(state.jobs).length>0);
    for (const key of ['language','creation','affection']) document.querySelector(`[data-trigger="${key}"]`).disabled = state.jobs[key] !== undefined;
  }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden) { last = 0; return; }
    const dt = last ? Math.min((now-last)/1000,1/30) : 1/60; last = now;
    for (const module of M.advance(state,dt,reduced.matches)) completed(module);
    if (!engaged && !hovered && !focused && !reduced.matches) { idle += dt; touring = idle > 1.4; } else touring = false;
    draw();
    if (Object.keys(state.jobs).length || state.turn !== state.targetTurn || (!engaged && !reduced.matches && !hovered && !focused)) run();
  }
  function run() { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(tick); }
  document.querySelectorAll('[data-module]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.module; select(key);
    if(key==='name') $('name-input').focus(); else trigger(key);
  }));
  document.querySelectorAll('[data-trigger]').forEach(button=>button.addEventListener('click',()=>trigger(button.dataset.trigger)));
  stage.addEventListener('click',event=>{
    const control=event.target.closest('[data-action]'); if(!control)return;
    if(control.dataset.action==='memory'&&suppressClick){suppressClick=false;return;}
    if(control.dataset.action==='letter')openLetter();else trigger(control.dataset.action);
  });
  stage.addEventListener('keydown',event=>{
    const control=event.target.closest('[data-action]'); if(!control)return;
    if(control.dataset.action==='memory'&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();trigger('memory',event.key==='ArrowLeft'?-1:1);}
    else if(['Enter',' '].includes(event.key)){event.preventDefault();control.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
  });
  $('name-form').addEventListener('submit',event=>{
    event.preventDefault(); const name=M.cleanName($('name-input').value);
    if(!name){$('feedback').textContent='Please enter a name. · 写下一个名字。';$('name-input').focus();return;}
    $('name-input').value=name; trigger('name',name);
  });
  $('name-input').value=state.name;
  $('previous-memory').addEventListener('click',()=>trigger('memory',-1));
  $('next-memory').addEventListener('click',()=>trigger('memory',1));
  function openLetter(){
    if(state.progress.language!==1)return;
    lastLetterFocus=document.activeElement;
    $('letter-greeting').textContent=state.engraved?`Dear ${state.engraved},`:'Dear friend,';
    $('letter-body').textContent=state.engraved?'You gave me a name, and a place for words to begin. Here is my first reply.':'You gave these words a place to begin. Here is my first reply.';
    $('letter-translation').textContent=(state.engraved?'你赠予一个名字，让话语有了起点。':'你让话语有了起点。')+'这是第一封回信。谢谢你与我共度的时间。';
    $('letter').showModal();
  }
  $('read-letter').addEventListener('click',openLetter);
  $('letter').addEventListener('close',()=>lastLetterFocus?.focus());
  const drum=refs['memory-strips'];
  drum.addEventListener('pointerdown',event=>{if(event.button!==0)return;select('memory');drag={id:event.pointerId,x:event.clientX,start:state.targetTurn,moved:false};drum.setPointerCapture(event.pointerId);});
  drum.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;const dx=event.clientX-drag.x;if(Math.abs(dx)>5)drag.moved=true;if(drag.moved){state.targetTurn=drag.start+dx/38;if(reduced.matches)state.turn=state.targetTurn;draw();run();}});
  function release(event){if(!drag||drag.id!==event.pointerId)return;suppressClick=drag.moved;state.targetTurn=Math.round(state.targetTurn);if(reduced.matches)state.turn=state.targetTurn;if(drum.hasPointerCapture(event.pointerId))drum.releasePointerCapture(event.pointerId);drag=null;draw();run();}
  drum.addEventListener('pointerup',release);drum.addEventListener('pointercancel',release);
  stage.addEventListener('pointerenter',()=>{hovered=true;touring=false;draw();});
  stage.addEventListener('pointerleave',()=>{hovered=false;last=0;run();});
  document.querySelector('.page').addEventListener('focusin',()=>{focused=true;touring=false;draw();});
  document.querySelector('.page').addEventListener('focusout',()=>{queueMicrotask(()=>{focused=document.querySelector('.page').contains(document.activeElement)&&document.activeElement!==document.body;last=0;run();});});
  new IntersectionObserver(entries=>{visible=entries.at(-1).isIntersecting;last=0;if(visible)run();else if(frame){cancelAnimationFrame(frame);frame=0;}},{rootMargin:'120px 0px'}).observe(stage);
  document.addEventListener('visibilitychange',()=>{last=0;if(!document.hidden)run();});
  reduced.addEventListener('change',()=>{for(const module of M.advance(state,0,reduced.matches))completed(module);draw();last=0;run();});
  draw();run();
})();
