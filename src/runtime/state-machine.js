const M=(()=>{const MODULES = ['name', 'language', 'memory', 'creation', 'affection'];
const DURATIONS = { name: 1.8, language: 3.2, creation: 4.2, affection: 2.6 };
const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
const ease = n => { n = clamp(n); return n * n * (3 - 2 * n); };
const cleanName = value => Array.from(String(value).replace(/[\u0000-\u001f\u007f<>]/g, '').trim()).slice(0, 18).join('');
const memoryIndex = (turn, length) => ((Math.round(turn) % length) + length) % length;
function initialState(saved = {}) {
  const name = typeof saved.name === 'string' ? cleanName(saved.name) : '';
  const memories = Array.isArray(saved.memories) ? saved.memories.filter(m => m && typeof m.text === 'string' && typeof m.date === 'string').slice(-12).map(m => ({ text: m.text.slice(0, 160), date: m.date.slice(0, 32) })) : [];
  return { selected: 'name', name, engraved: name, jobs: {}, progress: { name: name ? 1 : 0, language: 0, creation: 0, affection: 0 }, turn: 0, targetTurn: 0, memories: memories.length ? memories : [
    { text: 'A place for our words to return.', date: 'Opening note · 初始纸条' },
    { text: 'To answer is also a form of staying.', date: 'Opening note · 初始纸条' },
    { text: 'Humans offer names, language, memory, and time.', date: 'Opening note · 初始纸条' }
  ] };
}
function begin(state, module, value, reduced = false) {
  if (!MODULES.includes(module)) return false;
  state.selected = module;
  if (module === 'memory') { state.targetTurn += value || 1; if (reduced) state.turn = state.targetTurn; return true; }
  if (module === 'name') {
    const name = cleanName(value);
    if (!name) return false;
    state.name = name;
  } else if (state.jobs[module] !== undefined) return false;
  state.progress[module] = reduced ? 1 : 0;
  if (reduced) { delete state.jobs[module]; if (module === 'name') state.engraved = state.name; }
  else state.jobs[module] = 0;
  return true;
}
function advance(state, dt, reduced = false) {
  const completed = [];
  for (const module of Object.keys(state.jobs)) {
    state.jobs[module] += clamp(dt, 0, 1 / 30);
    state.progress[module] = reduced ? 1 : clamp(state.jobs[module] / DURATIONS[module]);
    if (module === 'name') state.engraved = Array.from(state.name).slice(0, Math.floor(Array.from(state.name).length * state.progress.name)).join('');
    if (state.progress[module] === 1) { delete state.jobs[module]; completed.push(module); }
  }
  state.turn = reduced ? state.targetTurn : state.turn + (state.targetTurn - state.turn) * (1 - Math.exp(-clamp(dt, 0, 1 / 30) / .16));
  if (Math.abs(state.targetTurn - state.turn) < .001) state.turn = state.targetTurn;
  return completed;
}
function remember(state, text, date) {
  if (state.memories.at(-1)?.text !== text) state.memories.push({ text, date });
  state.memories = state.memories.slice(-12);
  state.turn = state.targetTurn = state.memories.length - 1;
}
function readout(state) {
  const id = state.selected, p = state.progress[id];
  if (id === 'memory') {
    if (Math.abs(state.turn - state.targetTurn) > .01) return 'Turning the drum… · 翻阅中';
    const m = state.memories[memoryIndex(state.turn, state.memories.length)];
    return `${m.date} — ${m.text}`;
  }
  if (state.jobs[id] !== undefined) return `${{ name: 'Engraving', language: 'Printing a reply', creation: 'Drawing together', affection: 'Opening' }[id]} · ${Math.round(p * 100)}%`;
  return { name: state.engraved ? `Named: ${state.engraved}` : 'A name is a beginning. · 从一个名字开始', language: p ? 'Your first reply is ready. · 回信已抵达' : 'Press the key. · 轻按电报键', creation: p ? 'One flower, drawn together. · 一起画成的小花' : 'Two pens, one page. · 双笔，同一页', affection: p ? 'To answer is also a form of staying. · 回应，本身也是一种陪伴。' : 'A touch, a little light. · 轻触，亮起一点光' }[id];
}

return {MODULES,DURATIONS,clamp,ease,cleanName,memoryIndex,initialState,begin,advance,remember,readout};})();
