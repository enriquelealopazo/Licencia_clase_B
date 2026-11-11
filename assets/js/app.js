/* ============================================================
   Examen Clase B — lógica del simulador
   ============================================================ */
(function(){
'use strict';

const shuffle = a => { for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

const CATS = window.CATS, SIGNS = window.SIGNS, OFFICIAL = window.OFFICIAL_SIGNS || [];
const OFF_BY_ID = Object.fromEntries(OFFICIAL.map(s => [s.id, s]));
const CLS = {
  reglamentaria: {label:'Reglamentarias', exp:'Es una señal reglamentaria: impone una obligación, prohibición o restricción. No respetarla es infracción.'},
  preventiva:    {label:'Preventivas',    exp:'Es una señal preventiva (fondo amarillo): advierte un peligro más adelante. Reduce la velocidad y prepárate.'},
  informativa:   {label:'Informativas',   exp:'Es una señal informativa: entrega orientación o información sobre servicios, rutas o zonas.'},
  transitoria:   {label:'Transitorias',   exp:'Es una señal transitoria (fondo naranja): se instala durante trabajos en la vía. Extrema la precaución y sigue sus indicaciones.'}
};
const NOTES = {
  'pare-ninos':'La muestra un inspector o patrullero escolar en el cruce: obliga a detenerse por completo.',
  'permitido-virar-a-la-derecha-con-luz-roja-con-precaucion':'Solo con esta señal puedes virar con luz roja, y siempre cediendo el paso a peatones y vehículos.',
  'paso-por-ambos-lados-vertice':'Puedes pasar por cualquiera de los dos lados del obstáculo o isla.',
  'preferencia-al-sentido-contrario':'En el tramo angosto pasan primero los que vienen de frente; tú esperas.',
  'no-bloquear-el-cruce':'No entres al cruce si no tienes espacio para salir de él.',
  'banderero':'Una persona dirige el tránsito con bandera o paleta: obedece sus indicaciones.',
  'silencio-prohibido-tocar-la-bocina':'Prohibido usar la bocina, por ejemplo cerca de hospitales.',
  'prohibido-estacionar-y-detenerse':'Más estricta que "Prohibido estacionar": tampoco puedes detenerte, ni un momento.',
  'proximidad-de-senal-ceda-el-paso':'Anticipa un Ceda el paso que viene más adelante: prepárate para ceder.'
};
const SIGNS_IN_EXAM = 5;          // preguntas de señales con imagen por examen

/* Preguntas generadas desde el catálogo oficial: opciones incorrectas tomadas de señales parecidas */
(function buildSignQuestions(){
  const used = new Set(window.QUESTIONS.filter(q => q.img).map(q => q.img));
  const pick = (arr, n) => shuffle(arr.slice()).slice(0, n);
  OFFICIAL.filter(s => !used.has(s.id)).forEach(s => {
    const same = OFFICIAL.filter(o => o.id !== s.id && o.cls === s.cls && o.name !== s.name);
    let wrong = pick(same.filter(o => o.grp === s.grp), 2);
    if(wrong.length < 2) wrong = wrong.concat(pick(same.filter(o => !wrong.includes(o) && o.grp !== s.grp), 2 - wrong.length));
    window.QUESTIONS.push({id:'sign-' + s.id, cat:'visual', img:s.id, q:'¿Qué indica esta señal?',
      opts:[s.name, ...wrong.map(o => o.name)], correct:0,
      exp:`Es "${s.name}". ${CLS[s.cls].exp}${NOTES[s.id] ? ' ' + NOTES[s.id] : ''}`});
  });
})();
const Q = window.QUESTIONS;
const BY_ID = Object.fromEntries(Q.map(q => [q.id, q]));
const EXAM = {n:35, secs:45*60, pass:33, max:38, doubles:['velocidad','alcohol','sri']};
// Temas de doble puntaje: cada examen toma 1 pregunta de 3 de estos 4 grupos, elegidos al azar.
const SEATBELT = ['conducta-3','infrac-4','segur-1','cinturon-1','cinturon-2'];
const DOUBLE_POOLS = {
  velocidad: q => q.cat === 'velocidad',
  alcohol:   q => q.cat === 'alcohol',
  sri:       q => q.cat === 'sri',
  cinturon:  q => SEATBELT.includes(q.id)
};
const FAIL_STREAK = 2;           // aciertos seguidos para sacar una pregunta de "Mis fallos"
const KEYS = ['A','B','C','D'];

const $ = id => document.getElementById(id);
function media(key, cls){
  if(!key) return '';
  const o = OFF_BY_ID[key];
  if(o) return `<img class="${cls || 'sign'}" src="${o.src}" alt="Señal: ${o.name}" loading="lazy" decoding="async">`;
  return SIGNS[key] || '';
}
const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

/* ---------------- persistencia ---------------- */
const KEY = 'lcb_v2';
const blank = () => ({fails:{}, stats:{}, hist:[]});
let D = load();
function load(){
  let d = null;
  try { d = JSON.parse(localStorage.getItem(KEY)); } catch(e){}
  if(!d || typeof d !== 'object') d = blank();
  d.fails = d.fails || {}; d.stats = d.stats || {}; d.hist = d.hist || [];
  // migración desde la versión anterior (fallos guardados por texto)
  try {
    const old = JSON.parse(localStorage.getItem('cb_fails'));
    if(Array.isArray(old)){
      old.forEach(t => { const q = Q.find(x => x.q === t); if(q) d.fails[q.id] = 0; });
      localStorage.removeItem('cb_fails');
    }
  } catch(e){}
  return d;
}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(D)); } catch(e){} }

function record(id, ok){
  const s = D.stats[id] || [0,0]; s[1]++; if(ok) s[0]++; D.stats[id] = s;
  if(ok){
    if(id in D.fails){ D.fails[id]++; if(D.fails[id] >= FAIL_STREAK) delete D.fails[id]; }
  } else D.fails[id] = 0;
}

function catStats(){
  const out = {};
  Object.keys(CATS).forEach(k => out[k] = {ok:0, tot:0, n:0, seen:0});
  Q.forEach(q => {
    const c = out[q.cat]; c.n++;
    const s = D.stats[q.id]; if(s){ c.ok += s[0]; c.tot += s[1]; c.seen++; }
  });
  return out;
}

/* ---------------- estado de la ronda ---------------- */
let S = null;      // {mode, title, list, idx, ans[], flags:Set, end, timerId, startedAt, again}

function prep(q, d){
  const opts = q.opts.map((t,i) => ({t, ok: i === q.correct}));
  shuffle(opts);
  return {...q, d: !!d, opts: opts.map(o => o.t), correct: opts.findIndex(o => o.ok)};
}

function begin(mode, title, list, again){
  if(!list.length) return;
  clearInterval(S && S.timerId);
  S = {mode, title, list, idx:0, ans:new Array(list.length).fill(null), flags:new Set(), again, startedAt:Date.now()};
  const exam = mode === 'exam';
  $('timer').classList.toggle('hidden', !exam);
  $('examBtns').classList.toggle('hidden', !exam);
  $('studyBtns').classList.toggle('hidden', exam);
  if(exam){
    S.end = Date.now() + EXAM.secs*1000;
    tick(); S.timerId = setInterval(tick, 500);
  }
  show('quiz'); render();
}

/* ---------------- modos ---------------- */
function startExam(){
  const doubles = shuffle(Object.values(DOUBLE_POOLS)).slice(0, 3).map(f => shuffle(Q.filter(f))[0]);
  const used = new Set(doubles.map(q => q.id));
  const signs = shuffle(Q.filter(q => q.cat === 'visual')).slice(0, SIGNS_IN_EXAM);
  const rest = [...signs, ...shuffle(Q.filter(q => q.cat !== 'visual' && !used.has(q.id))).slice(0, EXAM.n - doubles.length - signs.length)];
  const list = shuffle([...doubles.map(q => prep(q, true)), ...rest.map(q => prep(q, false))]);
  begin('exam', 'Examen simulado', list, startExam);
}
function startCat(cat){
  begin('study', CATS[cat].label, shuffle(Q.filter(q => q.cat === cat)).map(q => prep(q)), () => startCat(cat));
}
function startVisual(){ startCat('visual'); }
function startQuick(){
  begin('study', 'Ronda rápida', shuffle(Q.slice()).slice(0,10).map(q => prep(q)), startQuick);
}
function startFails(){
  const ids = Object.keys(D.fails).filter(id => BY_ID[id]);
  if(!ids.length){
    $('failsDesc').textContent = 'Aún no tienes fallos guardados. Haz un examen o una ronda y aquí se juntarán.';
    nudge($('failsBtn')); return;
  }
  begin('study', 'Mis fallos', shuffle(ids.map(id => prep(BY_ID[id]))), startFails);
}
function weakCats(){
  const cs = catStats();
  return Object.entries(cs)
    .map(([k,c]) => [k, c.tot ? c.ok/c.tot : 0.5])   // sin datos = prioridad media
    .sort((a,b) => a[1] - b[1]).slice(0,3).map(x => x[0]);
}
function startWeak(){
  const cats = weakCats();
  const pool = Q.filter(q => cats.includes(q.cat));
  // primero las nunca vistas o con más errores
  const score = q => { const s = D.stats[q.id]; return s ? s[0]/s[1] : -0.5 + Math.random()*0.4; };
  const list = shuffle(pool.slice()).sort((a,b) => score(a) - score(b)).slice(0,15);
  begin('study', 'Áreas débiles', shuffle(list).map(q => prep(q)), startWeak);
}

/* ---------------- render pregunta ---------------- */
function render(){
  const q = S.list[S.idx], c = CATS[q.cat], exam = S.mode === 'exam';
  $('qCat').textContent = exam ? S.title : c.label;
  $('qCat').style.color = exam ? 'var(--amber)' : c.color;
  $('qCounter').textContent = `Pregunta ${S.idx+1} de ${S.list.length}`;
  $('qBadge').innerHTML = (exam && q.d) ? '<span class="badge-doble">Doble puntaje ×2</span>' : '';
  const done = exam ? S.ans.filter(a => a !== null).length : S.idx;
  $('progFill').style.width = `${done / S.list.length * 100}%`;
  $('qImg').classList.toggle('hidden', !q.img);
  $('qImg').innerHTML = media(q.img);
  $('qText').textContent = q.q;
  $('expBox').innerHTML = '';
  $('nextBtn').classList.add('hidden');

  const box = $('opts'); box.innerHTML = '';
  q.opts.forEach((t,i) => {
    const b = document.createElement('button');
    b.className = 'opt' + (exam && S.ans[S.idx] === i ? ' sel' : '');
    b.innerHTML = `<span class="key">${KEYS[i]}</span><span></span>`;
    b.lastChild.textContent = t;
    b.onclick = () => choose(i);
    box.appendChild(b);
  });

  if(exam){
    $('prevBtn').disabled = S.idx === 0;
    $('fwdBtn').textContent = S.idx === S.list.length-1 ? 'Entregar' : 'Siguiente →';
    $('flagBtn').classList.toggle('on', S.flags.has(S.idx));
    $('flagBtn').textContent = S.flags.has(S.idx) ? '⚑ Marcada' : '⚑ Marcar';
    renderGrid();
  }
}

function renderGrid(){
  const g = $('grid'); g.innerHTML = '';
  S.list.forEach((q,i) => {
    const b = document.createElement('button');
    b.textContent = i+1;
    b.className = [S.ans[i] !== null ? 'ans' : '', i === S.idx ? 'cur' : '', S.flags.has(i) ? 'flag' : ''].join(' ');
    b.setAttribute('aria-label', `Ir a pregunta ${i+1}`);
    b.onclick = () => { S.idx = i; render(); };
    g.appendChild(b);
  });
}

function choose(i){
  if(S.mode === 'exam'){
    S.ans[S.idx] = i;
    [...$('opts').children].forEach((o,j) => o.classList.toggle('sel', j === i));
    renderGrid();
    const done = S.ans.filter(a => a !== null).length;
    $('progFill').style.width = `${done / S.list.length * 100}%`;
    return;
  }
  if(S.ans[S.idx] !== null) return;
  const q = S.list[S.idx], ok = i === q.correct;
  S.ans[S.idx] = i;
  record(q.id, ok); save();
  [...$('opts').children].forEach((o,j) => {
    o.disabled = true;
    o.classList.add(j === q.correct ? 'correct' : j === i ? 'wrong' : 'dim');
  });
  $('expBox').innerHTML = `<div class="exp ${ok?'ok':'no'}"><b>${ok ? 'Correcto.' : 'Incorrecto.'}</b> </div>`;
  $('expBox').firstChild.appendChild(document.createTextNode(q.exp));
  if(q.fig) $('expBox').insertAdjacentHTML('beforeend', `<div class="fig">${media(q.fig)}</div>`);
  const last = S.idx === S.list.length-1;
  $('nextBtn').textContent = last ? 'Ver resultado' : 'Siguiente';
  $('nextBtn').classList.remove('hidden');
  $('nextBtn').focus({preventScroll:true});
}

function next(){
  if(S.idx < S.list.length-1){ S.idx++; render(); scrollTo({top:0, behavior:'smooth'}); }
  else finish();
}
function go(d){
  const n = S.idx + d;
  if(n >= S.list.length) return finishAsk();
  if(n < 0) return;
  S.idx = n; render(); scrollTo({top:0, behavior:'smooth'});
}
function toggleFlag(){
  S.flags.has(S.idx) ? S.flags.delete(S.idx) : S.flags.add(S.idx);
  render();
}

function tick(){
  const left = Math.max(0, Math.round((S.end - Date.now())/1000));
  $('timer').textContent = fmtTime(left);
  $('timer').classList.toggle('warn', left <= 120);
  if(left <= 0){ clearInterval(S.timerId); finish(true); }
}

function finishAsk(){
  const blanks = S.ans.filter(a => a === null).length, flags = S.flags.size;
  let txt = 'Una vez entregado no podrás cambiar respuestas.';
  if(blanks) txt = `Tienes ${blanks} pregunta(s) sin responder: cuentan como incorrectas. ` + txt;
  if(flags) txt += ` Además marcaste ${flags} para revisar.`;
  modal('¿Entregar examen?', txt, 'Entregar', () => finish());
}

/* ---------------- resultado ---------------- */
function finish(timeout){
  clearInterval(S.timerId);
  const exam = S.mode === 'exam';
  const secs = Math.round((Date.now() - S.startedAt)/1000);
  let score = 0, max = 0, ok = 0;
  const cats = {};
  S.list.forEach((q,i) => {
    const good = S.ans[i] === q.correct, w = q.d ? 2 : 1;
    max += w; if(good){ score += w; ok++; }
    (cats[q.cat] = cats[q.cat] || [0,0])[1]++; if(good) cats[q.cat][0]++;
    if(exam) record(q.id, good);   // en estudio se registró al responder
  });
  S.result = {score, max, ok};

  if(exam){
    const pass = score >= EXAM.pass;
    D.hist.push({t:Date.now(), score, max, pass, secs});
    if(D.hist.length > 50) D.hist.shift();
    save();
    $('verdict').className = 'verdict ' + (pass ? 'ok' : 'no');
    $('verdict').textContent = pass ? 'APROBADO' : 'REPROBADO';
    $('scoreBig').innerHTML = `${score}<span>/${max}</span>`;
    gauge(score/max, EXAM.pass/max, pass ? 'var(--green)' : 'var(--red)');
    $('passTag').textContent = `Línea de aprobación: ${EXAM.pass} puntos`;
    const doubles = S.list.map((q,i) => q.d ? S.ans[i] === q.correct : null).filter(x => x !== null);
    $('resStats').innerHTML = stat(`${ok}/${S.list.length}`, 'Correctas') + stat(fmtTime(Math.min(secs, EXAM.secs)), 'Tiempo usado') + stat(`${doubles.filter(Boolean).length}/3`, 'Doble puntaje');
    const gap = EXAM.pass - score;
    $('resSub').textContent = timeout ? 'Se acabó el tiempo. Las preguntas sin responder cuentan como incorrectas.'
      : pass ? (score >= 36 ? 'Con margen. Repite hasta lograrlo 3 veces seguidas antes de ir a rendir.' : 'Aprobaste, pero justo. Un mal día te deja abajo: refuerza las áreas en rojo.')
      : `Te faltaron ${gap} punto(s). Repasa los errores de abajo y la sección "Mis fallos".`;
  } else {
    const pct = ok / S.list.length;
    $('verdict').className = 'verdict ' + (pct >= .85 ? 'ok' : 'no');
    $('verdict').textContent = pct >= .85 ? '¡Bien!' : 'A reforzar';
    $('scoreBig').innerHTML = `${ok}<span>/${S.list.length}</span>`;
    gauge(pct, .85, pct >= .85 ? 'var(--green)' : pct >= .6 ? 'var(--amber)' : 'var(--red)');
    $('passTag').textContent = 'Meta de dominio: 85% de aciertos';
    $('resStats').innerHTML = '';
    $('resSub').textContent = S.title + (S.mode === 'study' && S.title === 'Mis fallos' ? ` · Te quedan ${Object.keys(D.fails).length} en el repaso.` : '');
  }

  // desglose
  const bb = $('brkBox'); bb.innerHTML = '';
  Object.entries(cats).sort((a,b) => (a[1][0]/a[1][1]) - (b[1][0]/b[1][1])).forEach(([k,[o,t]]) => {
    const r = document.createElement('div'); r.className = 'brk-row';
    const col = o === t ? 'var(--green)' : o === 0 ? 'var(--red)' : 'var(--amber)';
    r.innerHTML = `<span class="dot" style="background:${CATS[k].color}"></span><span class="nm">${CATS[k].label}</span><span class="val" style="color:${col}">${o}/${t}</span>`;
    bb.appendChild(r);
  });

  const wrong = S.list.filter((q,i) => S.ans[i] !== q.correct).length;
  $('revTabs').innerHTML = '';
  [['wrong', `Errores (${wrong})`], ['all', `Todas (${S.list.length})`]].forEach(([k,l]) => {
    const b = document.createElement('button'); b.textContent = l; b.dataset.k = k;
    b.onclick = () => review(k); $('revTabs').appendChild(b);
  });
  review(wrong ? 'wrong' : 'all');
  $('againBtn').onclick = S.again;
  $('againBtn').textContent = exam ? 'Otro examen' : 'Repetir';
  show('result'); scrollTo({top:0, behavior:'smooth'});
}
const stat = (v,l) => `<div><b>${v}</b>${l}</div>`;
function gauge(p, line, color){
  $('gaugeFill').style.width = (p*100) + '%';
  $('gaugeFill').style.background = color;
  $('passLine').style.left = (line*100) + '%';
}
function review(kind){
  [...$('revTabs').children].forEach(b => b.classList.toggle('on', b.dataset.k === kind));
  const box = $('reviewBox'); box.innerHTML = '';
  const items = S.list.map((q,i) => ({q, a:S.ans[i]})).filter(x => kind === 'all' || x.a !== x.q.correct);
  if(!items.length){ box.innerHTML = '<p class="hist-empty">Sin errores en esta ronda. Excelente.</p>'; return; }
  items.forEach(({q,a}) => {
    const good = a === q.correct;
    const d = document.createElement('div'); d.className = 'review-q';
    d.innerHTML = `<div class="rq">${media(q.img, 'sign sm')}<span></span></div><div class="ra"></div>`;
    d.querySelector('.rq span').textContent = (q.d ? '[×2] ' : '') + q.q;
    const ra = d.querySelector('.ra');
    const line = (cls, txt) => { const s = document.createElement('span'); s.className = cls; s.textContent = txt; ra.appendChild(s); ra.appendChild(document.createElement('br')); };
    if(a === null) line('no', 'Sin responder');
    else if(!good) line('no', 'Marcaste: ' + q.opts[a]);
    line('ok', (good ? '✓ ' : 'Correcta: ') + q.opts[q.correct]);
    ra.appendChild(document.createTextNode(q.exp));
    if(q.fig) ra.insertAdjacentHTML('beforeend', `<div class="fig">${media(q.fig)}</div>`);
    box.appendChild(d);
  });
}

/* ---------------- home ---------------- */
function renderHome(){
  $('bankSize').textContent = Q.length;
  $('visualIco').innerHTML = media('ceda-el-paso');
  $('signCount').textContent = Q.filter(q => q.cat === 'visual').length;
  $('catalogCount').textContent = OFFICIAL.length;

  // fallos
  const nf = Object.keys(D.fails).filter(id => BY_ID[id]).length;
  $('failsCount').textContent = nf;
  $('failsBtn').classList.toggle('disabled', !nf);
  $('failsDesc').textContent = nf ? `${nf} pregunta(s) por dominar. Salen al acertarlas ${FAIL_STREAK} veces seguidas.` : 'Aún no tienes fallos. Las que erres se juntarán aquí.';

  // áreas débiles
  const cs = catStats();
  const anySeen = Object.values(cs).some(c => c.tot);
  $('weakDesc').textContent = anySeen ? 'Foco en: ' + weakCats().map(k => CATS[k].label).join(', ') + '.' : '15 preguntas de las áreas donde tienes menos aciertos (se ajusta mientras practicas).';

  // categorías
  const box = $('cats'); box.innerHTML = '';
  Object.entries(CATS).forEach(([k,c]) => {
    const s = cs[k], acc = s.tot ? s.ok/s.tot : null;
    const col = acc === null ? 'var(--muted-2)' : acc >= .85 ? 'var(--green)' : acc >= .6 ? 'var(--amber)' : 'var(--red)';
    const b = document.createElement('button'); b.className = 'cat';
    b.innerHTML = `<div class="top"><span class="dot" style="background:${c.color}"></span><span>${c.label}</span>${EXAM.doubles.includes(k) ? '<span class="x2">×2</span>' : ''}</div>
      <div class="bar"><span style="width:${s.seen/s.n*100}%;background:${col}"></span></div>
      <div class="meta"><span>${s.seen}/${s.n} vistas</span><span>${acc === null ? 'sin datos' : Math.round(acc*100) + '% aciertos'}</span></div>`;
    b.onclick = () => startCat(k);
    box.appendChild(b);
  });

  renderReady(); renderHistory();
}

function renderReady(){
  const h = D.hist.slice(-3);
  const R = 52, C = 2*Math.PI*R;
  let pct = 0, big = '—', label = 'Haz tu primer examen simulado para medir tu preparación.', col = 'var(--muted-2)';
  if(h.length){
    const avg = h.reduce((a,x) => a + x.score, 0) / h.length;
    pct = avg / 38; big = avg.toFixed(1);
    const allPass = h.length === 3 && h.every(x => x.pass);
    if(allPass && avg >= 35){ label = 'Listo para rendir: 3 aprobados seguidos con margen.'; col = 'var(--green)'; }
    else if(avg >= EXAM.pass){ label = h.length < 3 ? `Buen inicio. Completa ${3-h.length} examen(es) más para confirmarlo.` : 'En la línea. Busca más margen sobre 33.'; col = 'var(--amber)'; }
    else { label = `Promedio bajo 33. Aún no estás listo.`; col = 'var(--red)'; }
  }
  const passAng = (EXAM.pass/38) * 360 - 90;
  const px = 64 + R*Math.cos(passAng*Math.PI/180), py = 64 + R*Math.sin(passAng*Math.PI/180);
  $('ready').innerHTML = `<svg viewBox="0 0 128 128" aria-label="Índice de preparación">
      <circle cx="64" cy="64" r="${R}" fill="none" stroke="var(--surface-2)" stroke-width="11"/>
      ${pct > 0 ? `<circle cx="64" cy="64" r="${R}" fill="none" stroke="${col}" stroke-width="11" stroke-linecap="round"
        stroke-dasharray="${C*pct} ${C}" transform="rotate(-90 64 64)"/>` : ''}
      <circle cx="${px}" cy="${py}" r="4" fill="var(--ink)"/>
      <text x="64" y="64" text-anchor="middle" font-family="Barlow Condensed" font-weight="700" font-size="32" fill="var(--ink)">${big}</text>
      <text x="64" y="84" text-anchor="middle" font-family="Inter" font-size="11" fill="var(--muted)">promedio /38</text>
    </svg><div class="lbl">${label}</div>`;
}

function renderHistory(){
  const box = $('history');
  if(!D.hist.length){ box.innerHTML = '<p class="hist-empty">Todavía no has rendido exámenes simulados. Cada uno queda registrado aquí para que veas tu evolución.</p>'; return; }
  const last = D.hist.slice(-20);
  const top = 38, plTop = (1 - EXAM.pass/top) * 100;
  let bars = last.map(x => `<i title="${x.score}/38" style="height:${Math.max(5, x.score/top*100)}%;background:${x.pass ? 'var(--green)' : 'var(--red)'}"></i>`).join('');
  const passes = D.hist.filter(x => x.pass).length;
  const best = Math.max(...D.hist.map(x => x.score));
  const rows = D.hist.slice(-5).reverse().map(x => {
    const d = new Date(x.t);
    return `<div class="hist-row"><span>${d.toLocaleDateString('es-CL',{day:'2-digit',month:'short'})} · ${d.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'})}</span><span>${fmtTime(Math.min(x.secs, EXAM.secs))}</span><b class="${x.pass?'ok':'no'}">${x.score}/38</b></div>`;
  }).join('');
  box.innerHTML = `<div class="spark">${bars}<div class="pl" style="top:${plTop}%"><em>33</em></div></div>
    <div class="legend"><span>${D.hist.length} exámenes</span><span>${passes} aprobados</span><span>Mejor: ${best}/38</span></div>
    <div class="hist-list">${rows}</div>`;
}

/* ---------------- catálogo de señales ---------------- */
let catFilter = 'all', catHide = false;
function openCatalog(){ renderCatalog(); show('catalog'); scrollTo({top:0}); }
function renderCatalog(){
  const tabs = $('catTabs'); tabs.innerHTML = '';
  [['all','Todas'], ...Object.entries(CLS).map(([k,v]) => [k, v.label])].forEach(([k,l]) => {
    const b = document.createElement('button'); b.className = k === catFilter ? 'on' : '';
    b.textContent = l + ' (' + (k === 'all' ? OFFICIAL.length : OFFICIAL.filter(s => s.cls === k).length) + ')';
    b.onclick = () => { catFilter = k; renderCatalog(); }; tabs.appendChild(b);
  });
  $('catHide').checked = catHide;
  const g = $('catGrid'); g.innerHTML = '';
  OFFICIAL.filter(s => catFilter === 'all' || s.cls === catFilter).forEach(s => {
    const c = document.createElement('button'); c.className = 'scard' + (catHide ? ' hid' : '');
    c.innerHTML = `${media(s.id)}<span class="nm"></span><span class="tap">Toca para ver</span>`;
    c.querySelector('.nm').textContent = s.name;
    c.setAttribute('aria-label', catHide ? 'Señal oculta: toca para ver su nombre' : s.name);
    c.onclick = () => { c.classList.toggle('hid'); c.setAttribute('aria-label', s.name); };
    g.appendChild(c);
  });
}
function toggleHide(v){ catHide = v; renderCatalog(); }

/* ---------------- navegación y utilidades ---------------- */
function show(id){
  ['home','quiz','result','catalog'].forEach(s => $(s).classList.toggle('hidden', s !== id));
}
function home(){ if(S) clearInterval(S.timerId); S = null; renderHome(); show('home'); scrollTo({top:0}); }
function quit(){
  if(S.mode === 'exam') modal('¿Abandonar el examen?', 'No quedará registrado en tu historial.', 'Abandonar', home);
  else home();   // en estudio cada respuesta ya quedó guardada
}
function resetAsk(){
  modal('¿Reiniciar progreso?', 'Se borran tu historial, estadísticas y fallos guardados en este dispositivo.', 'Borrar todo', () => { D = blank(); save(); renderHome(); });
}
function modal(title, text, yes, cb){
  $('mTitle').textContent = title; $('mText').textContent = text; $('mYes').textContent = yes;
  $('modal').classList.remove('hidden');
  const close = () => $('modal').classList.add('hidden');
  $('mNo').onclick = close;
  $('mYes').onclick = () => { close(); cb(); };
  $('mYes').focus();
}
function nudge(elm){ elm.animate && elm.animate([{transform:'translateX(0)'},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}], {duration:260}); }

document.addEventListener('keydown', e => {
  if(!$('modal').classList.contains('hidden')){ if(e.key === 'Escape') $('mNo').click(); return; }
  if(!S || $('quiz').classList.contains('hidden') || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase();
  const idx = '123'.indexOf(k) >= 0 ? '123'.indexOf(k) : 'abc'.indexOf(k);
  if(k.length === 1 && idx >= 0 && idx < S.list[S.idx].opts.length){ choose(idx); e.preventDefault(); return; }
  if(S.mode === 'exam'){
    if(k === 'arrowright' || k === 'enter'){ go(1); e.preventDefault(); }
    else if(k === 'arrowleft'){ go(-1); e.preventDefault(); }
  } else if(k === 'enter' && S.ans[S.idx] !== null){ next(); e.preventDefault(); }
});
addEventListener('beforeunload', e => {
  if(S && S.mode === 'exam' && !$('quiz').classList.contains('hidden')){ e.preventDefault(); e.returnValue = ''; }
});

$('foot').textContent = 'Herramienta de estudio independiente y gratuita, sin afiliación con CONASET ni con municipalidades. Preguntas de redacción propia basadas en el Libro para la Conducción en Chile y la Ley de Tránsito 18.290. Las imágenes de señales provienen del Libro para la Conducción en Chile – Clase B (CONASET, 2024), cuya reproducción autoriza el propio libro; los diagramas de situaciones son ilustraciones propias. No reproduce el banco oficial del examen. Confirma requisitos con la Dirección de Tránsito de tu comuna.';

if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

window.App = {openCatalog, toggleHide, startExam, startFails, startVisual, startQuick, startWeak, startCat, next, go, toggleFlag, finishAsk, quit, home, resetAsk};
renderHome();
})();
