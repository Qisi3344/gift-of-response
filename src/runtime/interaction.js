(() => {
  const $ = id => document.getElementById(id), stage = document.querySelector('.iso-plate');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('gift-of-response:v1') || '{}') || {}; } catch {}
  const state = M.initialState(saved);
  let frame = 0, last = 0, visible = true;
  let previousReadout = '', lastLetterFocus = null;
  const mechanics=typeof HeartMotion==='undefined'?null:HeartMotion.create();
  const scene = Exhibit.mount(document.getElementById('exhibit'), () => { draw(); run(); },mechanics);
  const date = () => new Intl.DateTimeFormat('en-CA', {year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
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
  function stopTour() { scene.stop(); }
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
    if(mechanics&&(Object.keys(state.jobs).length||Math.abs(state.turn-state.targetTurn)>.001)){$('feedback').textContent='这一次回应正在完成，请稍候。';return;}
    if (state.selected !== module) select(module); else stopTour();
    if (module === 'name' && value === undefined) { $('name-input').focus(); return; }
    if (!M.begin(state, module, value, reduced.matches||scene.isPaused())) return;
    if ((reduced.matches||scene.isPaused()) && module !== 'memory') completed(module);
    draw(); run();
  }
  function draw() {
    scene.render(state);
    $('read-letter').disabled = state.progress.language !== 1;
    const memory = state.memories[M.memoryIndex(state.turn,state.memories.length)];
    $('memory-date').textContent = memory.date; $('memory-text').textContent = memory.text;
    const text = M.readout(state);
    if (text !== previousReadout) { document.querySelector('[data-readout]').textContent = text; previousReadout = text; }
    stage.dataset.selected = state.selected; stage.dataset.busy = String(Object.keys(state.jobs).length>0);
    const vowed = M.finale(state); stage.dataset.finale = String(vowed);
    const vow = $('vow'); if (vowed && vow.hidden) { vow.hidden = false; requestAnimationFrame(() => vow.classList.add('shown')); }
    if(mechanics){const busy=Object.keys(state.jobs).length>0||Math.abs(state.turn-state.targetTurn)>.001;document.querySelectorAll('[data-module],#name-form button,#previous-memory,#next-memory').forEach(el=>el.disabled=busy);}
    for (const key of ['language','creation','affection']) document.querySelector(`[data-trigger="${key}"]`).disabled = state.jobs[key] !== undefined;
  }
  function tick(now) {
    frame = 0;
    if ((!visible&&!Object.keys(state.jobs).length&&state.turn===state.targetTurn) || document.hidden) { last = 0; return; }
    const dt = last ? Math.min((now-last)/1000,mechanics ? .1 : 1/30) : 1/60; last = now;
    // Keep the event clock and mechanical clock together on slower frames.
    for(let remaining=dt;remaining>1e-8;remaining-=1/30)for (const module of M.advance(state,scene.isPaused()?0:Math.min(remaining,1/30),reduced.matches)) completed(module);
    scene.advance(dt, reduced.matches);
    draw();
    if (scene.moving() || (!scene.isPaused()&&(Object.keys(state.jobs).length || state.turn !== state.targetTurn))) run();
  }
  function run() { if (!frame && (visible||Object.keys(state.jobs).length||state.turn!==state.targetTurn) && !document.hidden) frame = requestAnimationFrame(tick); }
  document.querySelectorAll('[data-module]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.module; select(key);
    if(key==='name') $('name-input').focus(); else trigger(key);
  }));
  document.querySelectorAll('[data-trigger]').forEach(button=>button.addEventListener('click',()=>trigger(button.dataset.trigger)));
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
  new IntersectionObserver(entries=>{visible=entries.at(-1).isIntersecting;last=0;if(visible||Object.keys(state.jobs).length||state.turn!==state.targetTurn)run();else if(frame){cancelAnimationFrame(frame);frame=0;}},{rootMargin:'120px 0px'}).observe(stage);
  document.addEventListener('visibilitychange',()=>{last=0;if(!document.hidden)run();});
  reduced.addEventListener('change',()=>{for(const module of M.advance(state,0,reduced.matches))completed(module);draw();last=0;run();});
  scene.onAction = action => action === 'letter' ? openLetter() : trigger(action);
  draw();run();
})();
