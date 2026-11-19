'use strict';

/* =====================================================================
   PERSONAL CONFIG — edit anything here to customize names, letter,
   blessings, or exam-season passes.
   ===================================================================== */
const CONFIG = {
  nickname: 'Ria',
  fullName: 'Kadondi Maria Priscilla',
  letterTitle: 'Success in Your Exams, Ria! 🎓✨',
  letter: [
    "I refused to just send a boring two-word 'good luck' text, so I built you an entire Golden Exam Vault instead.",
    "You have put in real effort, pushed through tired days, and earned the right to walk into that exam hall with your head high.",
    "May every question look surprisingly familiar, may your memory load in crystal-clear HD, may your pen never stall, and may calm focus follow you from the first line to the final full stop.",
    "Take a deep breath before you turn the first page. You know more than your nerves want to admit — go show those papers who they're dealing with."
  ],
  letterSign: '— Lunatic 😒',
  blessings: [
    ['🧠', 'Instant Recall Blessing: The exact paragraph you skimmed once will appear in 4K memory right when you need it.'],
    ['✍️', 'Smooth Pen Blessing: Your handwriting stays elite and your points flow in clean, mark-magnet structure.'],
    ['🍀', 'Lucky Question Blessing: Your favourite topic shows up in Section A with generous marks attached.'],
    ['🧘🏽‍♀️', 'Zero-Panic Shield: Even if Question 1 looks dramatic, you smile, skip calmly, and cook the rest of the paper.'],
    ['⏱️', 'Time-Mastery Blessing: You finish with enough spare minutes to calmly catch and fix one sneaky mistake.'],
    ['⚡', 'Clear Mind Aura: Zero mental fog, zero second-guessing correct answers, 100% locked-in confidence.'],
    ['🎯', 'Examiner Energy: Whatever you explain lands straight on the marking guide like it was telepathic.'],
    ['☕', 'Main Character Focus: The exam room noises fade out and you enter unstoppable distinction flow state.'],
    ['🌟', 'Plot Twist Victory: The paper you were most worried about turns out to be your smoothest win.'],
    ['🏆', 'Post-Exam Glow: Walking out of the hall knowing you genuinely gave it your best — and nailed it.'],
    ['🛡️', 'Anti-Overthinking Charm: Once you hand in a paper, your brain immediately lets it go and rests easy.'],
    ['👑', 'Distinction Forecast: Verified, stamped, and approved — Ria is officially in her Academic Weapon era.']
  ],
  passes: [
    { icon: '🗣️', title: 'Post-Paper Vent Pass',      text: 'Walk out of any exam and debrief every single question. Lunatic listens with full dramatic reactions.' },
    { icon: '🍟', title: 'Emergency Brain-Fuel Pass', text: 'Redeem the moment you text "my brain is cooked". Comfort snacks or treats are on Lunatic.' },
    { icon: '🎉', title: 'Final-Paper Victory Treat', text: 'Valid the second your last exam ends. Proper celebration hangout, textbooks strictly banned.' },
    { icon: '🛌', title: 'Zero-Guilt Rest Pass',      text: 'No stressing about Question 4(c). Blanket burrito, favourite show, and full peace of mind.' }
  ]
};

/* ---------- DOM & utility helpers ---------- */
const $ = id => document.getElementById(id);
const qsa = (root, sel) => Array.from(root.querySelectorAll(sel));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const shuffle = arr => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const sections = [$('intro'), $('game'), $('vault'), $('finale')];
const stage = $('stage'), verdict = $('verdict'), nextBtn = $('nextBtn');
const trialLabel = $('trialLabel'), luckLabel = $('luckLabel'), stepDots = $('stepDots');
const gradePill = $('gradePill'), auraBtn = $('auraBtn');

const FORECASTS = ['A-', 'A', 'A+', 'DISTINCTION', "DEAN'S LIST", 'HONORS ICON', '👑 LEGENDARY'];

let trialIdx = 0;
let luckPoints = 0;
let trialDone = false;
let cleanups = [];
const battleKit = { fuel: '', sound: '', reward: '' };

function show(section) {
  sections.forEach(s => s.classList.toggle('hidden', s !== section));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function runCleanups() {
  cleanups.forEach(fn => { try { fn(); } catch (e) {} });
  cleanups = [];
}
function setForecast(level) {
  const label = FORECASTS[Math.min(FORECASTS.length - 1, level)];
  gradePill.innerHTML = `FORECAST: <strong>${label}</strong>`;
  gradePill.classList.remove('bump');
  void gradePill.offsetWidth;
  gradePill.classList.add('bump');
}
function addLuck(n = 1) {
  luckPoints += n;
  luckLabel.textContent = `luck points: ${luckPoints} ✦`;
}

/* ---------- Web Audio synthesizer ---------- */
let actx = null, master = null, muted = false;
function audio() {
  try {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
      master = actx.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(actx.destination);
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  } catch (e) { return null; }
}
function tone(freq, dur = 0.12, o = {}) {
  const a = audio(); if (!a) return;
  try {
    const { type = 'sine', vol = 0.08, delay = 0, to = null } = o;
    const t = a.currentTime + delay;
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + dur + 0.03);
  } catch (e) {}
}
const sfx = {
  tap:   () => tone(540, 0.07, { type: 'triangle', vol: 0.07 }),
  good:  () => { tone(660, 0.09, { type: 'triangle' }); tone(880, 0.14, { type: 'triangle', delay: 0.08 }); },
  miss:  () => tone(220, 0.14, { type: 'sawtooth', vol: 0.04, to: 150 }),
  coin:  () => { tone(988, 0.07, { type: 'sine', vol: 0.07 }); tone(1319, 0.14, { type: 'sine', vol: 0.07, delay: 0.06 }); },
  crack: () => { tone(360, 0.18, { type: 'triangle', to: 720 }); [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, { type: 'triangle', delay: 0.08 + i * 0.07 })); },
  win:   () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, { type: 'triangle', delay: i * 0.08 }))
};

let anthemBusy = false;
function playVictoryAnthem() {
  if (anthemBusy || !audio()) return;
  const N = {
    C4: 261.63, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, C6: 1046.50
  };
  // Bright royal triumph fanfare + uplifting celebratory hook
  const melody = [
    ['C5', .5], ['E5', .5], ['G5', 1.0], ['E5', .5], ['G5', 1.5],
    ['A5', .5], ['G5', .5], ['F5', .5], ['E5', .5], ['D5', 1.0], ['G4', 1.0],
    ['C5', .5], ['D5', .5], ['E5', .5], ['F5', .5], ['G5', 1.0], ['A5', 1.0],
    ['G5', .5], ['E5', .5], ['D5', .5], ['E5', .5], ['C5', 1.2],
    ['E5', .4], ['G5', .4], ['C6', 2.0]
  ];
  const beat = 0.24;
  let t = 0;
  melody.forEach(([n, b]) => {
    tone(N[n], b * beat * 0.94, { type: 'triangle', vol: 0.09, delay: t });
    tone(N[n] / 2, b * beat * 0.88, { type: 'sine', vol: 0.04, delay: t });
    t += b * beat;
  });
  anthemBusy = true;
  setTimeout(() => { anthemBusy = false; }, t * 1000 + 300);
}

$('soundBtn').addEventListener('click', e => {
  muted = !muted;
  audio();
  if (master) master.gain.value = muted ? 0 : 1;
  e.currentTarget.textContent = muted ? '🔇' : '🔊';
  e.currentTarget.setAttribute('aria-pressed', String(muted));
});

/* ---------- Ambient Stardust + Celebration FX Canvas ---------- */
const starsCanvas = $('stars'), sctx = starsCanvas.getContext ? starsCanvas.getContext('2d') : null;
const fxCanvas = $('fx'), fctx = fxCanvas.getContext ? fxCanvas.getContext('2d') : null;
const COLORS = ['#f4c95d', '#ffe699', '#3fe0a8', '#63d2ff', '#ff7b89', '#ffffff'];
let dpr = 1, particles = [], fxRaf = 0, showTimer = 0;
let starfield = [];

function sizeCanvases() {
  dpr = Math.min(2, window.devicePixelRatio || 1);
  [starsCanvas, fxCanvas].forEach(c => {
    c.width = innerWidth * dpr;
    c.height = innerHeight * dpr;
  });
  starfield = Array.from({ length: 46 }, () => ({
    x: rand(0, innerWidth),
    y: rand(0, innerHeight),
    r: rand(0.7, 2.1),
    vy: rand(-0.22, -0.06),
    a: rand(0.2, 0.75),
    c: Math.random() > 0.35 ? '#f4c95d' : '#3fe0a8'
  }));
}
window.addEventListener('resize', sizeCanvases);
sizeCanvases();

if (sctx && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  (function drawStars() {
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.clearRect(0, 0, innerWidth, innerHeight);
    starfield.forEach(s => {
      s.y += s.vy;
      if (s.y < -5) { s.y = innerHeight + 5; s.x = rand(0, innerWidth); }
      sctx.globalAlpha = s.a;
      sctx.fillStyle = s.c;
      sctx.beginPath();
      sctx.arc(s.x, s.y, s.r, 0, 6.283);
      sctx.fill();
    });
    requestAnimationFrame(drawStars);
  })();
}

function kickFx() { if (!fxRaf && fctx) fxRaf = requestAnimationFrame(stepFx); }
function burst(x, y, n = 55) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = rand(2, 7.5);
    particles.push({ k: 's', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: rand(48, 88), size: rand(2, 4.2), color: pick(COLORS) });
  }
  kickFx();
}
function confetti(n = 140) {
  for (let i = 0; i < n; i++) {
    particles.push({ k: 'c', x: rand(0, innerWidth), y: rand(-innerHeight * 0.4, -10), vx: rand(-1.4, 1.4), vy: rand(2, 5.2), w: rand(6, 11), h: rand(4, 8), rot: rand(0, 6.28), vr: rand(-0.2, 0.2), life: 0, max: rand(250, 440), color: pick(COLORS) });
  }
  kickFx();
}
function stepFx() {
  fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  fctx.clearRect(0, 0, innerWidth, innerHeight);
  particles = particles.filter(p => {
    p.life++;
    const alpha = Math.max(0, Math.min(1, (p.max - p.life) / (p.max * 0.35)));
    fctx.globalAlpha = alpha;
    fctx.fillStyle = p.color;
    if (p.k === 's') {
      p.vy += 0.08; p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx; p.y += p.vy;
      fctx.beginPath(); fctx.arc(p.x, p.y, p.size, 0, 6.283); fctx.fill();
    } else {
      p.vx += Math.sin(p.life / 15) * 0.03; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.rot); fctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); fctx.restore();
    }
    return p.life < p.max && p.y < innerHeight + 20;
  });
  fctx.globalAlpha = 1;
  fxRaf = particles.length ? requestAnimationFrame(stepFx) : 0;
}
function fireworks(ms = 8500) {
  clearInterval(showTimer);
  const end = Date.now() + ms;
  showTimer = setInterval(() => {
    if (Date.now() > end) { clearInterval(showTimer); return; }
    burst(rand(0.14, 0.86) * innerWidth, rand(0.12, 0.48) * innerHeight, 55);
    tone(rand(320, 620), 0.18, { type: 'triangle', vol: 0.03, to: 110 });
  }, 460);
}
function sprinkle(amount) {
  const layer = $('floatingLayer');
  const pieces = ['✦', '🎓', '🏆', '🍀', '⭐', '💯', '✨'];
  for (let i = 0; i < amount; i++) {
    const el = document.createElement('span');
    el.className = 'petal';
    el.textContent = pick(pieces);
    el.style.left = `${Math.random() * 100}vw`;
    el.style.animationDuration = `${2.2 + Math.random() * 2.6}s`;
    el.style.animationDelay = `${Math.random() * 0.4}s`;
    el.style.fontSize = `${13 + Math.random() * 15}px`;
    layer.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

/* ---------- Luck Aura Toggle ---------- */
let auraTimer = 0;
auraBtn.addEventListener('click', () => {
  const on = document.body.classList.toggle('aura');
  auraBtn.classList.toggle('active', on);
  auraBtn.textContent = `LUCK AURA: ${on ? 'ON' : 'OFF'}`;
  auraBtn.setAttribute('aria-pressed', String(on));
  clearInterval(auraTimer);
  if (on) { sprinkle(12); sfx.win(); auraTimer = setInterval(() => sprinkle(3), 2600); }
});

/* =====================================================================
   THE 6 BRAND-NEW EXAM TRIALS
   ===================================================================== */
const trials = [
  {
    type: 'myth',
    kicker: 'TRIAL 1 · INVIGILATOR VIBE CHECK',
    title: 'Myth Buster: Cap or Facts? 🧢💯',
    hint: 'Five rapid-fire exam-season claims. Call out the myths and lock in the facts.'
  },
  {
    type: 'catcher',
    kicker: 'TRIAL 2 · GRADE MAGNET',
    title: 'Catch 8 Falling A+ Grades 🎓',
    hint: 'Slide your graduation cap left & right to catch A+, 💯, ⭐ & 🍀 — dodge the sneaky distractions!'
  },
  {
    type: 'flowlock',
    kicker: 'TRIAL 3 · FLOW STATE CALIBRATION',
    title: 'Lock In Your Exam Focus 🎯',
    hint: 'Tap LOCK IN (or press Space) when the golden needle hits the emerald Flow Zone — 3 clean locks needed.'
  },
  {
    type: 'scramble',
    kicker: 'TRIAL 4 · SECRET CODE DECODER',
    title: 'Unscramble Your 3 Power Words 🔤',
    hint: 'Tap the golden tiles in order to decode your official exam-day manifestations.'
  },
  {
    type: 'whack',
    kicker: 'TRIAL 5 · DISTRACTION SHIELD',
    title: 'Silence 8 Exam-Week Distractions 🛡️',
    hint: 'Tap distractions as they pop up on your study desk to block them. Bonus 🍀 clovers count double!'
  },
  {
    type: 'battlekit',
    kicker: 'TRIAL 6 · FINAL PREPARATION',
    title: 'Build Your Official Exam Battle Kit 🎒',
    hint: 'Pick one item from each row. Your exact 3-item loadout gets engraved on your Honors Diploma.'
  }
];

function renderStepDots() {
  stepDots.innerHTML = trials.map((_, i) =>
    `<div class="step-dot ${i < trialIdx ? 'done' : i === trialIdx ? 'now' : ''}"></div>`
  ).join('');
}

function renderTrial() {
  runCleanups();
  trialDone = false;
  verdict.classList.add('hidden');
  verdict.innerHTML = '';
  nextBtn.classList.add('hidden');
  const item = trials[trialIdx];
  trialLabel.textContent = `TRIAL ${trialIdx + 1} OF ${trials.length}`;
  luckLabel.textContent = `luck points: ${luckPoints} ✦`;
  renderStepDots();

  const builders = {
    myth: buildMythTrial,
    catcher: buildCatcherTrial,
    flowlock: buildFlowLockTrial,
    scramble: buildScrambleTrial,
    whack: buildWhackTrial,
    battlekit: buildBattleKitTrial
  };
  builders[item.type](item);
}

function trialShell(item, html) {
  stage.innerHTML = `<div class="kicker">${item.kicker}</div><h2>${item.title}</h2><p class="hint">${item.hint}</p>${html}`;
}

function completeTrial(message) {
  if (trialDone) return;
  trialDone = true;
  runCleanups();
  addLuck(15);
  setForecast(trialIdx + 1);
  sfx.win();
  verdict.innerHTML = message;
  verdict.classList.remove('hidden');
  nextBtn.classList.remove('hidden');
  nextBtn.innerHTML = trialIdx === trials.length - 1
    ? 'Unlock the Golden Vault <span>🔓</span>'
    : 'Next Trial <span>→</span>';
  sprinkle(8);
}

/* ---------- TRIAL 1: Myth Buster Deck ---------- */
function buildMythTrial(item) {
  const deck = [
    { q: '“Reading your notes once at 2:17 AM counts as deep mastery.”', fact: false, right: 'Correct — sleep is undefeated and actually saves memory!', wrong: 'Haha nice try — that is 100% CAP. Sleep wins every time.' },
    { q: '“Ria knows way more than her pre-exam nerves are claiming.”', fact: true, right: 'Absolute FACTS. Scientifically verified.', wrong: 'Wait — no! That one is pure FACTS. Trust your brain!' },
    { q: '“If you blank for 3 seconds, the whole exam is ruined.”', fact: false, right: 'Exactly — CAP! One deep breath and the answer reloads.', wrong: 'Major CAP! A quick breath brings your memory right back.' },
    { q: '“Skipping a tough question and coming back later is elite strategy.”', fact: true, right: 'Grandmaster move. Bank the easy marks first, then cook.', wrong: 'Actually FACTS — locking easy marks first is pro exam strategy.' },
    { q: '“Ria is about to walk into that exam hall and slay.”', fact: true, right: 'Legally binding fact. Cannot be appealed.', wrong: 'Objection overruled — that is undeniable FACTS. 🎓' }
  ];
  let idx = 0, correct = 0, busy = false;

  trialShell(item, `
    <div class="myth-wrap">
      <div class="myth-pips" id="mythPips"></div>
      <div class="myth-card" id="mythCard">
        <div class="myth-num" id="mythNum"></div>
        <p class="myth-q" id="mythQ"></p>
        <div class="myth-reply" id="mythReply"></div>
      </div>
      <div class="myth-actions">
        <button class="btn-cap" id="capBtn" type="button">CAP 🧢 (Myth)</button>
        <button class="btn-facts" id="factsBtn" type="button">FACTS 💯 (True)</button>
      </div>
    </div>
  `);

  function drawCard() {
    $('mythPips').innerHTML = deck.map((_, i) => `<span class="myth-pip ${i < idx ? 'done' : i === idx ? 'now' : ''}"></span>`).join('');
    $('mythNum').textContent = `CARD ${idx + 1} OF ${deck.length}`;
    $('mythQ').textContent = deck[idx].q;
    $('mythReply').textContent = '';
    const card = $('mythCard');
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = 'pop .25s ease-out';
  }

  function answer(choice) {
    if (busy || trialDone) return;
    busy = true;
    const card = deck[idx];
    const isRight = choice === card.fact;
    if (isRight) { correct++; addLuck(3); sfx.good(); } else { addLuck(1); sfx.tap(); }
    $('mythReply').textContent = isRight ? `✓ ${card.right}` : `→ ${card.wrong}`;
    $('mythReply').style.color = isRight ? 'var(--emerald)' : 'var(--gold)';

    const timer = setTimeout(() => {
      idx++;
      busy = false;
      if (idx < deck.length) drawCard();
      else {
        $('capBtn').disabled = true;
        $('factsBtn').disabled = true;
        completeTrial(`Vibe Check cleared (${correct}/${deck.length} spot-on)! Mindset officially calibrated for distinctions. ✦`);
      }
    }, 1050);
    cleanups.push(() => clearTimeout(timer));
  }

  $('capBtn').addEventListener('click', () => answer(false));
  $('factsBtn').addEventListener('click', () => answer(true));
  drawCard();
}

/* ---------- TRIAL 2: Falling Grade Catcher ---------- */
function buildCatcherTrial(item) {
  trialShell(item, `
    <div class="catcher-hud">
      <span id="catchScore">CAUGHT: 0 / 8</span>
      <span>SLIDE OR USE ← → KEYS</span>
    </div>
    <div class="catcher-arena" id="catcherArena">
      <div class="catcher-toast" id="catchToast"></div>
      <div class="catcher-player" id="catcherPlayer">🎓</div>
    </div>
    <p class="catcher-tip">Catch <strong>A+</strong>, <strong>💯</strong>, <strong>⭐</strong>, <strong>🍀</strong> · Dodge <strong>📱</strong>, <strong>😴</strong>, <strong>❓</strong></p>
  `);

  const arena = $('catcherArena'), player = $('catcherPlayer'), toast = $('catchToast');
  let px = arena.clientWidth / 2;
  let caught = 0;
  let items = [];
  let keys = { left: false, right: false };
  let toastTimer = 0;
  let rafId = 0;

  function setPlayerX(x) {
    const half = 42;
    px = Math.max(half, Math.min(arena.clientWidth - half, x));
    player.style.left = `${px}px`;
  }
  setPlayerX(px);

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 850);
  }

  function pointerMove(e) {
    const rect = arena.getBoundingClientRect();
    setPlayerX(e.clientX - rect.left);
  }
  arena.addEventListener('pointerdown', pointerMove);
  arena.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch' || e.pointerType === 'mouse') pointerMove(e); });

  const onKeyDown = e => { if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true; if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true; };
  const onKeyUp = e => { if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false; if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false; };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  const goods = [
    { text: 'A+', cls: 'grade', note: 'A+ SECURED! ✦' },
    { text: '💯', cls: '', note: '100% ENERGY!' },
    { text: '⭐', cls: '', note: 'GOLD STAR!' },
    { text: '🍀', cls: '', note: 'LUCKY CHARM!' }
  ];
  const bads = [
    { text: '📱', note: 'Put the phone away! 😂' },
    { text: '😴', note: 'Stay awake, scholar!' },
    { text: '❓', note: 'Plot twist dodged!' }
  ];

  function spawnItem() {
    if (trialDone) return;
    const isGood = Math.random() < 0.72;
    const spec = isGood ? pick(goods) : pick(bads);
    const el = document.createElement('div');
    el.className = `falling-item ${spec.cls || ''}`;
    el.textContent = spec.text;
    const x = rand(34, Math.max(80, arena.clientWidth - 34));
    el.style.left = `${x}px`;
    arena.appendChild(el);
    items.push({ el, x, y: -32, vy: rand(2.2, 3.6), isGood, note: spec.note });
  }

  spawnItem();
  const spawnTimer = setInterval(spawnItem, 640);

  function loop() {
    if (trialDone) return;
    if (keys.left) setPlayerX(px - 7);
    if (keys.right) setPlayerX(px + 7);
    const catchY = arena.clientHeight - 54;

    items = items.filter(it => {
      it.y += it.vy;
      it.el.style.top = `${it.y}px`;
      const hitX = Math.abs(it.x - px) < 46;
      const hitY = it.y >= catchY - 12 && it.y <= catchY + 34;

      if (hitX && hitY) {
        it.el.remove();
        if (it.isGood) {
          caught++;
          addLuck(2);
          sfx.coin();
          showToast(it.note);
          $('catchScore').textContent = `CAUGHT: ${caught} / 8`;
          if (caught >= 8) {
            completeTrial('Eight top grades caught effortlessly! Your graduation cap is officially a distinction magnet. 🎓✨');
          }
        } else {
          sfx.miss();
          showToast(it.note);
        }
        return false;
      }
      if (it.y > arena.clientHeight + 24) {
        it.el.remove();
        return false;
      }
      return true;
    });
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);

  cleanups.push(() => {
    clearInterval(spawnTimer);
    clearTimeout(toastTimer);
    cancelAnimationFrame(rafId);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  });
}

/* ---------- TRIAL 3: Precision Focus Lock ---------- */
function buildFlowLockTrial(item) {
  const labels = ['1 · CALM MIND', '2 · LASER FOCUS', '3 · UNSTOPPABLE'];
  let hits = 0;
  let pos = 10, dir = 1, speed = 1.25;
  let zoneStart = 36, zoneWidth = 28;
  let rafId = 0;

  trialShell(item, `
    <div class="lock-box">
      <div class="lock-pips" id="lockPips">
        ${labels.map((l, i) => `<span class="lock-pip" data-pip="${i}">${l}</span>`).join('')}
      </div>
      <div class="lock-track">
        <div class="lock-zone" id="lockZone"></div>
        <div class="lock-needle" id="lockNeedle"></div>
      </div>
      <div class="lock-msg" id="lockMsg">Wait for the golden needle to enter the emerald zone…</div>
      <button class="btn-gold" id="lockBtn" type="button">LOCK IN 🎯</button>
    </div>
  `);

  const zoneEl = $('lockZone'), needleEl = $('lockNeedle'), msgEl = $('lockMsg'), lockBtn = $('lockBtn');

  function placeZone() {
    zoneEl.style.left = `${zoneStart}%`;
    zoneEl.style.width = `${zoneWidth}%`;
  }
  placeZone();

  function tick() {
    if (trialDone) return;
    pos += dir * speed;
    if (pos >= 96) { pos = 96; dir = -1; }
    if (pos <= 4) { pos = 4; dir = 1; }
    needleEl.style.left = `${pos}%`;
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);

  function attemptLock() {
    if (trialDone) return;
    if (pos >= zoneStart - 2 && pos <= zoneStart + zoneWidth + 2) {
      const pip = stage.querySelector(`[data-pip="${hits}"]`);
      if (pip) pip.classList.add('lit');
      hits++;
      addLuck(4);
      sfx.coin();
      if (hits >= 3) {
        lockBtn.disabled = true;
        msgEl.textContent = 'FLOW STATE 100% LOCKED IN! ✨';
        msgEl.style.color = 'var(--emerald)';
        completeTrial('Three clean precision locks! Your exam-room focus is officially razor-sharp. 🎯');
      } else {
        zoneWidth = Math.max(20, zoneWidth - 3);
        zoneStart = Math.round(rand(15, 80 - zoneWidth));
        speed += 0.28;
        placeZone();
        msgEl.textContent = `Locked ${hits}/3! Next zone shifted — stay sharp!`;
        msgEl.style.color = 'var(--emerald)';
      }
    } else {
      sfx.miss();
      msgEl.textContent = 'Close! Aim right for the glowing emerald band.';
      msgEl.style.color = 'var(--coral)';
    }
  }

  lockBtn.addEventListener('click', attemptLock);
  const onKey = e => { if (e.code === 'Space') { e.preventDefault(); attemptLock(); } };
  window.addEventListener('keydown', onKey);
  cleanups.push(() => { cancelAnimationFrame(rafId); window.removeEventListener('keydown', onKey); });
}

/* ---------- TRIAL 4: Word Scramble Decoder ---------- */
function buildScrambleTrial(item) {
  const puzzles = [
    { word: 'ACED',   clue: 'Word 1/3 · What you are about to do to every paper' },
    { word: 'FOCUS',  clue: 'Word 2/3 · Laser-sharp energy in the exam room' },
    { word: 'GENIUS', clue: 'Word 3/3 · Official classification of Ria' }
  ];
  let pIdx = 0;
  let letters = [];
  let chosen = []; // array of tile indices

  trialShell(item, `
    <div class="scramble-box">
      <div class="scramble-clue" id="scClue"></div>
      <div class="word-slots" id="scSlots"></div>
      <div class="letter-bank" id="scBank"></div>
      <div class="scramble-controls">
        <button class="btn-ghost" id="scClear" type="button">Clear ↺</button>
        <button class="btn-ghost" id="scHint" type="button">Hint 💡</button>
      </div>
    </div>
  `);

  function scrambleWord(w) {
    let arr = w.split('');
    for (let tries = 0; tries < 10; tries++) {
      arr = shuffle(arr);
      if (arr.join('') !== w) break;
    }
    return arr;
  }

  function loadPuzzle() {
    const p = puzzles[pIdx];
    letters = scrambleWord(p.word);
    chosen = [];
    $('scClue').textContent = p.clue;
    draw();
  }

  function draw(state = '') {
    const p = puzzles[pIdx];
    $('scSlots').innerHTML = p.word.split('').map((_, i) => {
      const tileIdx = chosen[i];
      const ch = tileIdx !== undefined ? letters[tileIdx] : '';
      return `<button type="button" class="slot ${ch ? 'filled' : ''} ${state}" data-pos="${i}">${ch}</button>`;
    }).join('');
    $('scBank').innerHTML = letters.map((ch, i) =>
      `<button type="button" class="tile" data-tile="${i}" ${chosen.includes(i) ? 'disabled' : ''}>${ch}</button>`
    ).join('');

    qsa($('scSlots'), '.slot').forEach(btn => btn.addEventListener('click', () => {
      const pos = Number(btn.dataset.pos);
      if (chosen[pos] === undefined || trialDone) return;
      chosen.splice(pos, 1);
      sfx.tap();
      draw();
    }));
    qsa($('scBank'), '.tile').forEach(btn => btn.addEventListener('click', () => {
      if (trialDone) return;
      const tIdx = Number(btn.dataset.tile);
      if (chosen.includes(tIdx) || chosen.length >= p.word.length) return;
      chosen.push(tIdx);
      sfx.tap();
      checkProgress();
    }));
  }

  function checkProgress() {
    const p = puzzles[pIdx];
    const guess = chosen.map(i => letters[i]).join('');
    if (guess.length < p.word.length) { draw(); return; }
    if (guess === p.word) {
      addLuck(4);
      sfx.good();
      draw('good');
      const timer = setTimeout(() => {
        pIdx++;
        if (pIdx < puzzles.length) loadPuzzle();
        else completeTrial('All 3 secret exam words decoded: <strong>ACED · FOCUS · GENIUS</strong>. Prophecy locked in! 🔤✨');
      }, 650);
      cleanups.push(() => clearTimeout(timer));
    } else {
      sfx.miss();
      draw('shake');
      const timer = setTimeout(() => { chosen = []; draw(); }, 460);
      cleanups.push(() => clearTimeout(timer));
    }
  }

  $('scClear').addEventListener('click', () => { chosen = []; sfx.tap(); draw(); });
  $('scHint').addEventListener('click', () => {
    if (trialDone) return;
    const p = puzzles[pIdx];
    // Find first mismatched or unfilled slot and fill with correct unused tile
    let prefix = 0;
    while (prefix < chosen.length && letters[chosen[prefix]] === p.word[prefix]) prefix++;
    chosen = chosen.slice(0, prefix);
    if (prefix < p.word.length) {
      const needed = p.word[prefix];
      const tileIdx = letters.findIndex((ch, i) => ch === needed && !chosen.includes(i));
      if (tileIdx !== -1) { chosen.push(tileIdx); sfx.tap(); checkProgress(); }
    }
  });

  loadPuzzle();
}

/* ---------- TRIAL 5: Whack-a-Distraction 3x3 Desk Grid ---------- */
function buildWhackTrial(item) {
  trialShell(item, `
    <div class="desk-hud">
      <span id="whackCount">BLOCKED: 0 / 8</span>
      <span>TAP TO BANISH!</span>
    </div>
    <div class="desk-grid" id="deskGrid">
      ${Array.from({ length: 9 }, (_, i) => `<button type="button" class="desk-cell" data-cell="${i}"><span class="d-emoji">·</span><span class="d-label">quiet</span></button>`).join('')}
    </div>
  `);

  const cells = qsa($('deskGrid'), '.desk-cell');
  const distractions = [
    ['📱', 'scroll'], ['💤', '2pm nap'], ['🌀', 'overthink'],
    ['📺', '1 episode'], ['😰', 'panic'], ['🍪', 'snack run']
  ];
  let blocked = 0;
  const activeTimers = new Map();

  function clearCell(cell) {
    if (activeTimers.has(cell)) { clearTimeout(activeTimers.get(cell)); activeTimers.delete(cell); }
    cell.className = 'desk-cell';
    delete cell.dataset.kind;
    cell.innerHTML = '<span class="d-emoji">·</span><span class="d-label">quiet</span>';
  }

  function popRandom() {
    if (trialDone) return;
    const idle = cells.filter(c => !c.dataset.kind);
    if (!idle.length) return;
    const cell = pick(idle);
    const isBonus = Math.random() < 0.2;
    if (isBonus) {
      cell.dataset.kind = 'bonus';
      cell.classList.add('bonus');
      cell.innerHTML = '<span class="d-emoji">🍀</span><span class="d-label">lucky +2</span>';
    } else {
      const [em, lbl] = pick(distractions);
      cell.dataset.kind = 'bad';
      cell.classList.add('active');
      cell.innerHTML = `<span class="d-emoji">${em}</span><span class="d-label">${lbl}</span>`;
    }
    const hideTimer = setTimeout(() => { if (!trialDone && cell.dataset.kind) clearCell(cell); }, isBonus ? 1650 : 1450);
    activeTimers.set(cell, hideTimer);
  }

  cells.forEach(cell => cell.addEventListener('click', () => {
    if (trialDone || !cell.dataset.kind) return;
    const isBonus = cell.dataset.kind === 'bonus';
    if (activeTimers.has(cell)) { clearTimeout(activeTimers.get(cell)); activeTimers.delete(cell); }
    delete cell.dataset.kind;
    cell.className = 'desk-cell hit';
    cell.innerHTML = isBonus
      ? '<span class="d-emoji">✨</span><span class="d-label">+2 LUCK!</span>'
      : '<span class="d-emoji">🛡️</span><span class="d-label">blocked</span>';
    blocked += isBonus ? 2 : 1;
    addLuck(isBonus ? 4 : 2);
    sfx.coin();
    $('whackCount').textContent = `BLOCKED: ${Math.min(8, blocked)} / 8`;
    const resetT = setTimeout(() => { if (!trialDone) clearCell(cell); }, 380);
    activeTimers.set(cell, resetT);
    if (blocked >= 8) {
      completeTrial('Distraction shield online! Phone notifications, 2 PM naps, and overthinking are officially banned from your exam week. 🛡️✨');
    }
  }));

  popRandom();
  const loopTimer = setInterval(popRandom, 650);
  cleanups.push(() => {
    clearInterval(loopTimer);
    activeTimers.forEach(t => clearTimeout(t));
    activeTimers.clear();
  });
}

/* ---------- TRIAL 6: 3-Slot Exam Battle Kit Builder ---------- */
function buildBattleKitTrial(item) {
  const categories = [
    { key: 'fuel',   label: '1 · POWER FUEL',      opts: ['☕ Iced Coffee & Audacity', '💧 Hydrated & Moisturized', '🍫 Emergency Chocolate', '😴 Full 8 Hours (Rare)'] },
    { key: 'sound',  label: '2 · MENTAL SOUNDTRACK', opts: ['🎧 Main Character Energy', '🔇 Pure Zen Silence', '🥁 Dramatic Boss Music', '🎵 One Random Lyric on Loop'] },
    { key: 'reward', label: '3 · POST-EXAM REWARD',  opts: ['🍟 Legendary Comfort Feast', '🛌 14-Hour Hibernation', '💃🏽 Victory Celebration', '📵 Airplane Mode Forever'] }
  ];

  trialShell(item, `
    <div class="kit-bar">
      <div class="kit-slot" id="slot-fuel"><strong>FUEL</strong><span>Choose below</span></div>
      <div class="kit-slot" id="slot-sound"><strong>SOUNDTRACK</strong><span>Choose below</span></div>
      <div class="kit-slot" id="slot-reward"><strong>REWARD</strong><span>Choose below</span></div>
    </div>
    ${categories.map(cat => `
      <div class="kit-group">
        <div class="kit-title">${cat.label}</div>
        <div class="kit-grid">
          ${cat.opts.map(opt => `<button type="button" class="kit-item" data-cat="${cat.key}" data-val="${opt}">${opt}</button>`).join('')}
        </div>
      </div>
    `).join('')}
  `);

  qsa(stage, '.kit-item').forEach(btn => btn.addEventListener('click', () => {
    if (trialDone) return;
    const { cat, val } = btn.dataset;
    battleKit[cat] = val;
    qsa(stage, `.kit-item[data-cat="${cat}"]`).forEach(o => o.classList.toggle('picked', o === btn));
    const slot = $(`slot-${cat}`);
    slot.classList.add('filled');
    slot.querySelector('span').textContent = val;
    addLuck(2);
    sfx.tap();

    if (battleKit.fuel && battleKit.sound && battleKit.reward) {
      completeTrial('Official Exam Battle Kit locked & engraved! All 6 trials complete — your Golden Exam Vault is ready to open. 🔓🎓');
    }
  }));
}

nextBtn.addEventListener('click', () => {
  if (trialIdx < trials.length - 1) {
    trialIdx++;
    renderTrial();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    openVault();
  }
});

$('startBtn').addEventListener('click', () => {
  audio();
  sfx.good();
  show($('game'));
  renderTrial();
});

/* =====================================================================
   VAULT UNLOCK: STAGE A (ROYAL WAX SEAL) -> STAGE B (GOLDEN SCRATCH CARD)
   ===================================================================== */
let sealPct = 0, sealTaps = 0, sealBroken = false, holdRaf = 0, holding = false;
const RING_CIRC = 326.7;

function updateSealRing(pct) {
  $('sealProgress').style.strokeDashoffset = String(RING_CIRC * (1 - pct / 100));
}

function openVault() {
  runCleanups();
  setForecast(6);
  show($('vault'));
  $('sealStage').classList.remove('hidden');
  $('scratchStage').classList.add('hidden');
  sealPct = 0; sealTaps = 0; sealBroken = false; holding = false;
  updateSealRing(0);
  const seal = $('waxSeal');
  seal.classList.remove('cracked', 'holding');
  seal.disabled = false;
  $('sealHint').textContent = 'hold to melt seal · or tap 0 / 3';
  sprinkle(16);
  confetti(60);
}

function crackSeal() {
  if (sealBroken) return;
  sealBroken = true;
  holding = false;
  cancelAnimationFrame(holdRaf);
  updateSealRing(100);
  const seal = $('waxSeal');
  seal.classList.add('cracked');
  seal.disabled = true;
  $('sealHint').textContent = 'SEAL BROKEN · OPENING GOLDEN TICKET… ✨';
  sfx.crack();
  burst(innerWidth / 2, innerHeight / 2.4, 95);
  confetti(80);
  setTimeout(initScratchCard, 900);
}

const waxSeal = $('waxSeal');
let pressStart = 0;

function startHold(e) {
  if (sealBroken) return;
  e.preventDefault();
  audio();
  holding = true;
  pressStart = performance.now();
  waxSeal.classList.add('holding');
  const step = () => {
    if (!holding || sealBroken) return;
    sealPct = Math.min(100, sealPct + 1.9);
    updateSealRing(sealPct);
    if (Math.random() < 0.2) tone(380 + sealPct * 4, 0.05, { type: 'sine', vol: 0.03 });
    if (sealPct >= 100) { crackSeal(); return; }
    holdRaf = requestAnimationFrame(step);
  };
  holdRaf = requestAnimationFrame(step);
}

function endHold() {
  if (!holding || sealBroken) return;
  holding = false;
  waxSeal.classList.remove('holding');
  cancelAnimationFrame(holdRaf);
  // If user tapped quickly (< 260ms), count it as a tap step (3 taps breaks seal)
  if (performance.now() - pressStart < 260) {
    sealTaps++;
    sfx.tap();
    sprinkle(5);
    sealPct = Math.min(100, Math.max(sealPct, Math.round((sealTaps / 3) * 100)));
    updateSealRing(sealPct);
    $('sealHint').textContent = `hold to melt seal · or tap ${Math.min(sealTaps, 3)} / 3`;
    if (sealTaps >= 3) crackSeal();
  }
}

waxSeal.addEventListener('pointerdown', startHold);
window.addEventListener('pointerup', endHold);
window.addEventListener('pointercancel', endHold);
waxSeal.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    sealTaps++;
    sealPct = Math.min(100, Math.round((sealTaps / 3) * 100));
    updateSealRing(sealPct);
    sfx.tap();
    if (sealTaps >= 3) crackSeal();
  }
});

/* ---------- Stage B: Canvas Metallic Gold Scratch-Off Ticket ---------- */
let scratchDone = false;

function initScratchCard() {
  $('sealStage').classList.add('hidden');
  $('scratchStage').classList.remove('hidden');
  scratchDone = false;

  const canvas = $('scratchCanvas');
  canvas.classList.remove('cleared');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Paint metallic gold foil surface
  ctx.globalCompositeOperation = 'source-over';
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#c89b32');
  grad.addColorStop(0.28, '#ffe79a');
  grad.addColorStop(0.55, '#d8a638');
  grad.addColorStop(0.82, '#fff0b8');
  grad.addColorStop(1, '#b68522');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Diagonal shimmer stripes
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 14;
  for (let i = -H; i < W + H; i += 44) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke();
  }
  // Decorative border & prompt text
  ctx.strokeStyle = 'rgba(84, 54, 10, 0.45)';
  ctx.lineWidth = 3;
  ctx.strokeRect(12, 12, W - 24, H - 24);
  ctx.fillStyle = '#3d2806';
  ctx.font = '700 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('✦ SCRATCH OFF THE GOLD FOIL ✦', W / 2, H / 2 - 4);
  ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Rub with finger or mouse to reveal your exam prophecy', W / 2, H / 2 + 24);

  $('scratchPct').textContent = '0% scratched';

  let drawing = false, moves = 0;

  function scratchAt(clientX, clientY) {
    if (scratchDone) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * W;
    const y = ((clientY - rect.top) / rect.height) * H;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();
    moves++;
    if (moves % 6 === 0) {
      tone(rand(450, 720), 0.03, { type: 'sine', vol: 0.025 });
      checkScratchPct();
    }
  }

  function checkScratchPct() {
    if (scratchDone) return;
    const data = ctx.getImageData(0, 0, W, H).data;
    let cleared = 0, total = 0;
    // Sample every 16th pixel for fast, smooth checking
    for (let i = 3; i < data.length; i += 64) {
      total++;
      if (data[i] < 128) cleared++;
    }
    const pct = Math.min(100, Math.round((cleared / total) * 100));
    $('scratchPct').textContent = `${pct}% scratched`;
    if (pct >= 42) finishScratch();
  }

  function finishScratch() {
    if (scratchDone) return;
    scratchDone = true;
    $('scratchPct').textContent = '100% REVEALED ✨';
    canvas.classList.add('cleared');
    sfx.win();
    burst(innerWidth / 2, innerHeight / 2.2, 100);
    confetti(120);
    setTimeout(startFinale, 1450);
  }

  const onDown = e => { e.preventDefault(); drawing = true; scratchAt(e.clientX, e.clientY); };
  const onMove = e => { if (drawing) { e.preventDefault(); scratchAt(e.clientX, e.clientY); } };
  const onUp = () => { if (drawing) { drawing = false; checkScratchPct(); } };

  canvas.onpointerdown = onDown;
  canvas.onpointermove = onMove;
  window.addEventListener('pointerup', onUp);
  $('quickRevealBtn').onclick = finishScratch;
  cleanups.push(() => window.removeEventListener('pointerup', onUp));
}

/* =====================================================================
   FINALE: LETTER, BLESSING GENERATOR, PASSES & ENGRAVED DIPLOMA
   ===================================================================== */
let typeToken = 0, skipTyping = false, lastBlessing = -1;

function drawBlessing() {
  let idx = Math.floor(Math.random() * CONFIG.blessings.length);
  if (idx === lastBlessing) idx = (idx + 1) % CONFIG.blessings.length;
  lastBlessing = idx;
  const [icon, text] = CONFIG.blessings[idx];
  const card = $('blessingCard');
  $('blessingIcon').textContent = icon;
  $('blessingText').textContent = text;
  card.classList.remove('flip-in');
  void card.offsetWidth;
  card.classList.add('flip-in');
  sfx.coin();
  sprinkle(6);
}
$('drawBlessingBtn').addEventListener('click', drawBlessing);

function buildPasses() {
  const box = $('passes');
  box.innerHTML = '';
  CONFIG.passes.forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pass';
    btn.innerHTML = `<span class="p-icon">${p.icon}</span><span class="p-title">${p.title}</span><span class="p-hint">TAP TO CLAIM</span><span class="p-text">${p.text}</span><span class="p-stamp">CLAIMED</span>`;
    btn.addEventListener('click', () => {
      if (btn.classList.contains('claimed')) return;
      btn.classList.add('claimed');
      sfx.good();
      const r = btn.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 32);
    });
    box.appendChild(btn);
  });
}

function buildDiploma() {
  $('diplomaText').innerHTML =
    `This certifies that <strong>${CONFIG.fullName}</strong> conquered all 6 pre-exam trials, cracked the Golden Wax Seal, revealed her Distinction Prophecy, and enters exam season with <strong>${luckPoints} ✦ Luck Points</strong> and a verified <strong>👑 LEGENDARY</strong> forecast.`;

  const chips = [
    battleKit.fuel ? `FUEL: ${battleKit.fuel}` : 'FUEL: ☕ Pure Determination',
    battleKit.sound ? `VIBE: ${battleKit.sound}` : 'VIBE: 🎧 Main Character Energy',
    battleKit.reward ? `AFTER: ${battleKit.reward}` : 'AFTER: 🏆 Victory Celebration'
  ];
  $('loadoutSummary').innerHTML = chips.map(c => `<span class="loadout-chip">${c}</span>`).join('');
}

async function typeLetter() {
  const token = ++typeToken;
  const box = $('letter');
  skipTyping = false;
  box.innerHTML = '';
  const h = document.createElement('h3');
  h.textContent = CONFIG.letterTitle;
  box.appendChild(h);

  const alive = () => token === typeToken;
  for (const para of CONFIG.letter) {
    const p = document.createElement('p');
    p.className = 'typing';
    box.appendChild(p);
    for (let i = 1; i <= para.length; i++) {
      if (!alive()) return;
      p.textContent = para.slice(0, i);
      if (!skipTyping) await sleep(16);
    }
    p.classList.remove('typing');
    if (!skipTyping) await sleep(240);
  }
  if (!alive()) return;
  const sign = document.createElement('p');
  sign.className = 'sign';
  sign.textContent = CONFIG.letterSign;
  box.appendChild(sign);

  const rest = $('finaleRest');
  rest.classList.remove('hidden');
  rest.style.animation = 'pop .5s ease-out';
}
$('letter').addEventListener('click', () => { skipTyping = true; });

function startFinale() {
  runCleanups();
  show($('finale'));
  $('finaleTitle').textContent = `Success in Your Exams, ${CONFIG.nickname}!`;
  $('finaleRest').classList.add('hidden');
  buildPasses();
  buildDiploma();
  confetti(170);
  fireworks();
  playVictoryAnthem();
  sfx.win();
  typeLetter();
}

/* ---------- Finale Controls ---------- */
$('anthemBtn').addEventListener('click', () => { playVictoryAnthem(); confetti(70); });
$('fireworksBtn').addEventListener('click', () => { fireworks(7500); sfx.win(); });
$('sparkleBtn').addEventListener('click', () => { sprinkle(32); confetti(80); sfx.coin(); });
$('replayBtn').addEventListener('click', () => {
  typeToken++;
  clearInterval(showTimer);
  trialIdx = 0;
  luckPoints = 0;
  trialDone = false;
  battleKit.fuel = ''; battleKit.sound = ''; battleKit.reward = '';
  setForecast(0);
  show($('game'));
  renderTrial();
});

/* ---------- Secret Shortcut (tap brand 5x or ?success / ?unlock) ---------- */
let brandTaps = 0, brandTimer = 0;
$('brandBtn').addEventListener('click', () => {
  brandTaps++;
  clearTimeout(brandTimer);
  brandTimer = setTimeout(() => { brandTaps = 0; }, 1500);
  sfx.tap();
  if (brandTaps >= 5) { brandTaps = 0; openVault(); }
});
const params = new URLSearchParams(location.search);
if (params.has('success') || params.has('unlock') || params.has('surprise')) openVault();
