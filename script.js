'use strict';

/* =====================================================================
   EDIT ME — everything personal lives here. Change the text, keep the
   quotes and commas, and the game updates itself.
   ===================================================================== */
const CONFIG = {
  nickname: 'Ria',
  fullName: 'Kadondi Maria Priscilla',
  candles: 5,                       // how many candles on the cake
  letterTitle: 'Happy Birthday, Ria! 🎉',
  letter: [
    "I built you a whole chaotic little corner of the internet because a normal card felt far too normal for you.",
    "I hope today is soft where it should be, loud where it should be, and full of cake in every direction.",
    "May this new year bring you good news, better snacks, and fewer reasons to overthink one harmless text.",
    "You're allowed to be a person today, not a productivity app. Eat the cake first."
  ],
  letterSign: '— Lunatic 😒',
  vouchers: [
    { icon: '🗣️', title: 'One free dramatic rant',   text: 'Redeem for a full rant. Lunatic must listen with eye contact and no phone.' },
    { icon: '🍟', title: 'One emergency snack run',  text: 'Valid any time you say the words "I am suffering". Snacks are on Lunatic.' },
    { icon: '🏆', title: 'One "I was right" pass',   text: 'Use it once, anywhere. Nobody is allowed to argue. Not even the frog.' },
    { icon: '😴', title: 'One guilt-free do-nothing day', text: 'No productivity. No explaining. Just vibes, blankets and nonsense.' }
  ],
  links: [
    ['Cat Bounce', 'https://cat-bounce.com/'], ['The Useless Web', 'https://theuselessweb.com/'],
    ['Pointer Pointer', 'https://pointerpointer.com/'], ['Neal.fun', 'https://neal.fun/'],
    ['Zoom Quilt', 'https://zoomquilt.org/'], ['Pug in a Rug', 'https://puginarug.com/']
  ]
};

/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const qsa = (root, sel) => Array.from(root.querySelectorAll(sel));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const intro = $('intro'), game = $('game'), gift = $('gift'), party = $('party');
const sections = [intro, game, gift, party];
const gameContent = $('gameContent'), feedback = $('feedback'), nextBtn = $('nextBtn');
const progressBar = $('progressBar'), roundLabel = $('roundLabel'), scoreLabel = $('scoreLabel');
const chaosBtn = $('chaosBtn'), giftChip = $('giftChip');

let round = 0, chaos = 0, picked = false, cleanups = [];
const answers = {};

function show(section) {
  sections.forEach(s => s.classList.toggle('hidden', s !== section));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function runCleanups() { cleanups.forEach(fn => { try { fn(); } catch (e) {} }); cleanups = []; }
function addChaos(n = 1) { chaos += n; scoreLabel.textContent = `chaos: ${chaos} ✦`; }

/* ---------- sound (all synthesized, no files needed) ---------- */
let actx = null, master = null, muted = false;
function audio() {
  try {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC(); master = actx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(actx.destination);
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  } catch (e) { return null; }
}
function tone(freq, dur = 0.12, o = {}) {
  const a = audio(); if (!a) return;
  try {
    const { type = 'sine', vol = 0.08, delay = 0, to = null } = o;
    const t = a.currentTime + delay, osc = a.createOscillator(), g = a.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, t);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(master); osc.start(t); osc.stop(t + dur + 0.03);
  } catch (e) {}
}
const sfx = {
  tap:    () => tone(520, 0.07, { type: 'triangle' }),
  pop:    () => tone(420, 0.14, { type: 'square', vol: 0.05, to: 90 }),
  flip:   () => tone(700, 0.06, { type: 'triangle', vol: 0.05 }),
  good:   () => { tone(660, 0.1); tone(880, 0.14, { delay: 0.09 }); },
  win:    () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, { type: 'triangle', delay: i * 0.09 })),
  whoosh: () => tone(500, 0.35, { type: 'sawtooth', vol: 0.03, to: 120 })
};
let songBusy = false;
function playBirthday() {
  if (songBusy || !audio()) return;
  const N = { G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784 };
  const song = [['G4',.75],['G4',.25],['A4',1],['G4',1],['C5',1],['B4',2],
                ['G4',.75],['G4',.25],['A4',1],['G4',1],['D5',1],['C5',2],
                ['G4',.75],['G4',.25],['G5',1],['E5',1],['C5',1],['B4',1],['A4',1],
                ['F5',.75],['F5',.25],['E5',1],['C5',1],['D5',1],['C5',2]];
  const beat = 0.46; let t = 0;
  song.forEach(([n, b]) => { tone(N[n], b * beat * 0.95, { type: 'triangle', vol: 0.09, delay: t }); tone(N[n] / 2, b * beat * 0.9, { type: 'sine', vol: 0.04, delay: t }); t += b * beat; });
  songBusy = true; setTimeout(() => { songBusy = false; }, t * 1000 + 300);
}
$('soundBtn').addEventListener('click', e => {
  muted = !muted; audio(); if (master) master.gain.value = muted ? 0 : 1;
  e.currentTarget.textContent = muted ? '🔇' : '🔊'; e.currentTarget.setAttribute('aria-pressed', String(muted));
});

/* ---------- visual effects: confetti + fireworks on a canvas ---------- */
const fx = $('fx'), fctx = fx.getContext ? fx.getContext('2d') : null;
const COLORS = ['#ff5eae', '#8edcff', '#ffd1f0', '#b68cff', '#ffd86b', '#ffffff'];
let particles = [], fxRaf = 0, dpr = 1, showTimer = 0;
function sizeFx() { dpr = Math.min(2, window.devicePixelRatio || 1); fx.width = innerWidth * dpr; fx.height = innerHeight * dpr; }
window.addEventListener('resize', sizeFx); sizeFx();
function kick() { if (!fxRaf && fctx) fxRaf = requestAnimationFrame(step); }
function burst(x, y, n = 50) {
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = rand(2, 7);
    particles.push({ k: 's', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: rand(50, 90), size: rand(2, 4), color: pick(COLORS) }); }
  kick();
}
function confetti(n = 140) {
  for (let i = 0; i < n; i++) particles.push({ k: 'c', x: rand(0, innerWidth), y: rand(-innerHeight * 0.4, -10), vx: rand(-1.5, 1.5), vy: rand(2, 5), w: rand(6, 11), h: rand(4, 8), rot: rand(0, 6.28), vr: rand(-0.2, 0.2), life: 0, max: rand(260, 460), color: pick(COLORS) });
  kick();
}
function step() {
  fctx.setTransform(dpr, 0, 0, dpr, 0, 0); fctx.clearRect(0, 0, innerWidth, innerHeight);
  particles = particles.filter(p => {
    p.life++;
    const alpha = Math.max(0, Math.min(1, (p.max - p.life) / (p.max * 0.35)));
    fctx.globalAlpha = alpha; fctx.fillStyle = p.color;
    if (p.k === 's') { p.vy += 0.08; p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx; p.y += p.vy; fctx.beginPath(); fctx.arc(p.x, p.y, p.size, 0, 6.283); fctx.fill(); }
    else { p.vx += Math.sin(p.life / 15) * 0.03; p.x += p.vx; p.y += p.vy; p.rot += p.vr; fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.rot); fctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); fctx.restore(); }
    return p.life < p.max && p.y < innerHeight + 20;
  });
  fctx.globalAlpha = 1;
  fxRaf = particles.length ? requestAnimationFrame(step) : 0;
}
function fireworks(ms = 9000) {
  clearInterval(showTimer); const end = Date.now() + ms;
  showTimer = setInterval(() => {
    if (Date.now() > end) { clearInterval(showTimer); return; }
    burst(rand(0.12, 0.88) * innerWidth, rand(0.1, 0.5) * innerHeight, 55); tone(rand(300, 600), 0.2, { type: 'square', vol: 0.025, to: 80 });
  }, 450);
}
function sprinkle(amount) {
  const layer = $('floatingLayer'), pieces = ['✦', '✨', '💥', '🪩', '💗', '🐸', '🎈', '🎂', '🎁'];
  for (let i = 0; i < amount; i++) {
    const el = document.createElement('span'); el.className = 'petal'; el.textContent = pick(pieces);
    el.style.left = `${Math.random() * 100}vw`; el.style.animationDuration = `${2.2 + Math.random() * 2.8}s`;
    el.style.animationDelay = `${Math.random() * 0.45}s`; el.style.fontSize = `${12 + Math.random() * 16}px`;
    layer.appendChild(el); el.addEventListener('animationend', () => el.remove());
  }
}
function floatText(host, text) {
  const el = document.createElement('span'); el.className = 'float-text'; el.textContent = text;
  el.style.left = `${rand(20, 80)}%`; el.style.top = `${rand(15, 55)}%`; host.appendChild(el); setTimeout(() => el.remove(), 1000);
}

/* ---------- chaos mode ---------- */
let chaosTimer = 0;
chaosBtn.addEventListener('click', () => {
  const active = document.body.classList.toggle('chaos');
  chaosBtn.classList.toggle('active', active); chaosBtn.textContent = `CHAOS MODE: ${active ? 'ON' : 'OFF'}`; chaosBtn.setAttribute('aria-pressed', String(active));
  clearInterval(chaosTimer);
  if (active) { sprinkle(14); sfx.win(); chaosTimer = setInterval(() => sprinkle(4), 2500); }
});

/* ---------- missions ---------- */
const rounds = [
  { type: 'choices', key: 'persona', kicker: 'MISSION 1 · VIBE FORENSICS', title: 'Choose your emergency personality 🪩', hint: 'There are no wrong answers. There are, however, answers that reveal too much.',
    choices: [['🧃', 'A mysterious juice box', 'Nobody knows what flavour it is. Not even you.'], ['🧍🏽‍♀️', 'Walk into a room and forget why', 'A timeless classic. Very relatable.'], ['🦅', 'Scream dramatically then continue', 'Oscar-worthy. The academy is shaking.'], ['🛒', 'Buy one silly little treat', 'Financially irresponsible? Spiritually correct.']],
    after: 'Personality file updated. The authorities have been notified. ✦' },
  { type: 'frog', kicker: 'MISSION 2 · FROG EMERGENCY', title: 'Feed the dramatic frog 🐸', hint: 'The frog has not eaten since Tuesday and is being extremely theatrical. Feed it 8 snacks.',
    after: 'The frog is full, grateful, and still somehow disappointed in you. 🐸' },
  { type: 'balloons', kicker: 'MISSION 3 · BALLOON INCIDENT', title: 'Pop 10 escaped balloons 🎈', hint: 'They are floating away with your good mood. Tap them before they leave the building.',
    after: 'Ten balloons popped. Several were innocent. We will not be discussing it. 🎈' },
  { type: 'meter', kicker: 'MISSION 4 · UNNECESSARY EFFORT', title: 'Charge the silly little button ⚡', hint: 'Click until the meter is full. This has no practical purpose. That is the point.',
    after: 'Power levels critical. You have successfully charged absolutely nothing. ⚡' },
  { type: 'reaction', kicker: 'MISSION 5 · REFLEX TEST', title: 'Catch the runaway thought 💨', hint: 'Click the emoji 7 times before it escapes. It is very fast for something with no legs.',
    after: 'Thought caught. It says it was just passing through. Rude. 💨' },
  { type: 'memory', kicker: 'MISSION 6 · MEMORY MATCH', title: 'Find the matching pairs 🧠', hint: 'Six pairs. Flip two cards at a time. Try to remember where things are, which is more than you do with your keys.',
    after: 'Memory confirmed. Surprisingly intact. Medical science is baffled. 🧠' },
  { type: 'choices', key: 'os', kicker: 'MISSION 7 · FINAL BOSS', title: 'Select your legally binding nonsense 🏆', hint: 'Pick the option that best represents your current operating system.',
    choices: [['🧠', 'Overthink one harmless text', 'It said “okay” but what did it mean?'], ['🍰', 'Eat dessert before dinner', 'A bold policy change. Parliament approves.'], ['🦆', 'Become emotionally attached to a duck', 'Honestly, the duck seems trustworthy.'], ['🛌', 'Cancel plans with the outside world', 'Your bed has better Wi-Fi anyway.']],
    after: 'Final decision recorded. Something is now unlocking. Do not touch anything. 🔓' }
];

function renderRound() {
  runCleanups(); picked = false;
  feedback.classList.add('hidden'); feedback.innerHTML = ''; nextBtn.classList.add('hidden');
  const item = rounds[round];
  roundLabel.textContent = `MISSION ${round + 1} OF ${rounds.length}`; scoreLabel.textContent = `chaos: ${chaos} ✦`;
  progressBar.style.width = `${((round + 1) / rounds.length) * 100}%`;
  ({ frog: renderFrog, meter: renderMeter, reaction: renderReaction, balloons: renderBalloons, memory: renderMemory }[item.type] || renderChoices)(item);
}
function shell(item, content) { gameContent.innerHTML = `<div class="round-kicker">${item.kicker}</div><h2 class="question">${item.title}</h2><p class="hint">${item.hint}</p>${content}`; }

function renderChoices(item) {
  shell(item, `<div class="choices">${item.choices.map((c, i) => `<button class="choice" data-index="${i}" type="button"><span class="emoji">${c[0]}</span>${c[1]}</button>`).join('')}</div>`);
  qsa(gameContent, '.choice').forEach(btn => btn.addEventListener('click', () => {
    if (picked) return; const c = item.choices[Number(btn.dataset.index)];
    btn.classList.add('selected'); qsa(gameContent, '.choice').forEach(o => { o.disabled = true; });
    if (item.key) answers[item.key] = c[1]; sfx.tap(); finishRound(`${c[2]}<br><br>${item.after}`);
  }));
}
function renderFrog(item) {
  shell(item, '<div class="mini-game"><button class="tap-target" id="frog" type="button" aria-label="Feed the frog">🐸</button><div class="tap-count" id="frogCount">0 / 8 snacks delivered</div></div>');
  let snacks = 0; const host = gameContent.querySelector('.mini-game');
  $('frog').addEventListener('click', e => {
    if (picked) return; snacks++; addChaos(); sfx.tap(); floatText(host, pick(['🍔', '🍟', '🍕', '🍪', '🍩', '🧁']));
    e.currentTarget.textContent = ['🐸', '😮', '😋', '🤤', '🥳'][Math.min(4, Math.floor(snacks / 2))];
    $('frogCount').textContent = `${snacks} / 8 snacks delivered`; if (snacks >= 8) finishRound(item.after);
  });
}
function renderBalloons(item) {
  shell(item, '<div class="balloon-zone" id="bz"></div><div class="tap-count" id="balCount">0 / 10 balloons popped</div>');
  const zone = $('bz'); let popped = 0;
  const pop = b => {
    if (b.dataset.done || picked) return; b.dataset.done = '1';
    const tr = getComputedStyle(b).transform; b.style.animation = 'none'; if (tr && tr !== 'none') b.style.transform = tr;
    b.textContent = '💥'; b.style.animation = 'popfade .35s ease-out forwards'; setTimeout(() => b.remove(), 360);
    popped++; addChaos(2); sfx.pop(); floatText(zone, pick(['+1 ✦', 'pop!', '💗', 'yikes']));
    $('balCount').textContent = `${popped} / 10 balloons popped`; if (popped >= 10) finishRound(item.after);
  };
  const spawn = () => {
    if (picked || popped >= 10) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'balloon'; b.textContent = '🎈'; b.setAttribute('aria-label', 'Pop balloon');
    b.style.left = `${rand(3, 84)}%`; b.style.setProperty('--dur', `${rand(3.4, 5.6)}s`); b.style.setProperty('--hue', `${Math.floor(rand(0, 360))}deg`);
    b.style.setProperty('--rise', `${zone.clientHeight + 140}px`); b.style.setProperty('--sway', `${rand(-40, 40)}px`);
    b.addEventListener('animationend', () => { if (!b.dataset.done) b.remove(); });
    b.addEventListener('pointerdown', e => { e.preventDefault(); pop(b); });
    b.addEventListener('click', () => pop(b));
    zone.appendChild(b);
  };
  spawn(); spawn(); const t = setInterval(spawn, 520); cleanups.push(() => clearInterval(t));
}
function renderMeter(item) {
  shell(item, '<div class="mini-game"><button class="tap-target" id="chargeBtn" type="button" aria-label="Charge the button">⚡</button><div class="meter"><div id="meterFill"></div></div><div class="meter-label" id="meterLabel">0% powered by nonsense</div></div>');
  let charge = 0; const notes = { 30: 'warming up…', 60: 'something is humming', 90: 'the lights are flickering' };
  $('chargeBtn').addEventListener('click', () => {
    if (picked) return; charge += 10; addChaos(); tone(300 + charge * 6, 0.08, { type: 'triangle' });
    $('meterFill').style.width = `${charge}%`; $('meterLabel').textContent = `${charge}% powered by nonsense${notes[charge] ? ' — ' + notes[charge] : ''}`;
    if (charge >= 100) finishRound(item.after);
  });
}
function renderReaction(item) {
  shell(item, '<div class="reaction-zone" id="reactionZone"><button class="reaction-btn" id="reactionBtn" type="button" aria-label="Catch the thought">💨</button></div><div class="tap-count" id="reactionCount">0 / 7 thoughts caught</div>');
  let catches = 0; const btn = $('reactionBtn');
  const move = () => { btn.style.left = `${8 + Math.random() * 76}%`; btn.style.top = `${8 + Math.random() * 62}%`; };
  move(); const t = setInterval(() => { if (!picked) move(); }, 1300); cleanups.push(() => clearInterval(t));
  btn.addEventListener('click', () => {
    if (picked) return; catches++; addChaos(2); sfx.good(); $('reactionCount').textContent = `${catches} / 7 thoughts caught`;
    btn.textContent = catches % 2 ? '💭' : '💨'; move(); if (catches >= 7) finishRound(item.after);
  });
}
function renderMemory(item) {
  const faces = ['🎂', '🎁', '🎈', '🪩', '🐸', '🍰'], deck = shuffle(faces.concat(faces));
  shell(item, `<div class="memory">${deck.map(f => `<button class="mcard" type="button" data-face="${f}" aria-label="Hidden card"><span class="mback">✦</span><span class="mfront">${f}</span></button>`).join('')}</div><div class="tap-count" id="memCount">0 moves · 0 / 6 pairs</div>`);
  let first = null, lock = false, moves = 0, pairs = 0;
  qsa(gameContent, '.mcard').forEach(card => card.addEventListener('click', () => {
    if (lock || picked || card === first || card.classList.contains('open')) return;
    card.classList.add('open'); sfx.flip(); addChaos();
    if (!first) { first = card; return; }
    moves++; const a = first, b = card;
    if (a.dataset.face === b.dataset.face) { a.classList.add('matched'); b.classList.add('matched'); pairs++; first = null; sfx.good(); }
    else { lock = true; setTimeout(() => { a.classList.remove('open'); b.classList.remove('open'); first = null; lock = false; }, 750); }
    $('memCount').textContent = `${moves} moves · ${pairs} / 6 pairs`;
    if (pairs === 6) finishRound(`${item.after}<br><br>Solved in ${moves} moves.`);
  }));
}

function finishRound(message) {
  if (picked) return; picked = true; runCleanups(); addChaos(10); sfx.win();
  feedback.innerHTML = message; feedback.classList.remove('hidden'); nextBtn.classList.remove('hidden');
  nextBtn.innerHTML = round === rounds.length - 1 ? 'Open the secret file <span>🎁</span>' : 'Next questionable mission <span>→</span>';
  sprinkle(7);
}
nextBtn.addEventListener('click', () => {
  if (round < rounds.length - 1) { round++; renderRound(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  else goGift();
});
$('startBtn').addEventListener('click', () => { audio(); sfx.good(); show(game); renderRound(); });

/* ---------- the surprise: gift -> cake -> party ---------- */
function unlockChip() { giftChip.textContent = '🎁 SURPRISE: UNLOCKED'; giftChip.classList.add('open'); }
function goGift() {
  runCleanups(); unlockChip(); show(gift);
  $('giftStage').classList.remove('hidden'); $('cakeStage').classList.add('hidden');
  const box = $('giftBox'); box.textContent = '🎁'; box.dataset.level = '0'; box.disabled = false; taps = 0; $('giftCount').textContent = 'tap to open · 0 / 3';
  sprinkle(20); confetti(60);
}
let taps = 0;
$('giftBox').addEventListener('click', e => {
  const box = e.currentTarget; taps++; sfx.tap(); sprinkle(5);
  box.dataset.level = String(Math.min(2, taps)); $('giftCount').textContent = `tap to open · ${Math.min(taps, 3)} / 3`;
  if (taps >= 3) { box.disabled = true; box.textContent = '💥'; sfx.win(); burst(innerWidth / 2, innerHeight / 3, 90); confetti(80); setTimeout(showCake, 900); }
});
function showCake() {
  $('giftStage').classList.add('hidden'); $('cakeStage').classList.remove('hidden');
  $('cakeTitle').textContent = `Make a wish, ${CONFIG.nickname}. 🕯️`;
  $('cakeHint').textContent = 'Tap each candle to blow it out. Or press the mic button and blow for real.';
  const box = $('candles'); box.innerHTML = ''; lit = CONFIG.candles;
  for (let i = 0; i < CONFIG.candles; i++) {
    const c = document.createElement('button'); c.type = 'button'; c.className = 'candle'; c.setAttribute('aria-label', `Blow out candle ${i + 1}`);
    c.style.setProperty('--c', COLORS[i % 5]); c.innerHTML = '<span class="flame"></span><span class="wick"></span><span class="stick"></span>';
    c.addEventListener('click', () => blowOut(c)); box.appendChild(c);
  }
  $('micBtn').classList.remove('hidden'); $('micBtn').textContent = 'Blow for real 🎤';
}
let lit = 0;
function blowOut(c) {
  if (c.classList.contains('out')) return; c.classList.add('out'); lit--; sfx.whoosh();
  if (lit > 0) $('cakeHint').textContent = `${lit} still burning. Commit.`; else wishDone();
}
function wishDone() {
  stopMic(); $('micBtn').classList.add('hidden');
  $('cakeTitle').textContent = 'Wish locked in. 🤫'; $('cakeHint').textContent = "Don't tell anyone. Especially not Lunatic.";
  setTimeout(startParty, 1900);
}
/* optional: really blow into the microphone */
let micStream = null, micOn = false;
function stopMic() { micOn = false; if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; } }
$('micBtn').addEventListener('click', async () => {
  if (micOn) { stopMic(); $('micBtn').textContent = 'Blow for real 🎤'; return; }
  try {
    const a = audio(); if (!a || !navigator.mediaDevices) throw new Error('no mic');
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true }); micOn = true;
    $('micBtn').textContent = 'Listening… blow! (tap to stop)'; $('cakeHint').textContent = 'Take a breath and blow into your mic. 💨';
    const an = a.createAnalyser(); an.fftSize = 512; a.createMediaStreamSource(micStream).connect(an);
    const buf = new Uint8Array(an.fftSize); let hits = 0, cool = 0;
    const tick = () => {
      if (!micOn) return; an.getByteTimeDomainData(buf);
      let sum = 0; for (let i = 0; i < buf.length; i++) { const d = (buf[i] - 128) / 128; sum += d * d; }
      hits = Math.sqrt(sum / buf.length) > 0.12 ? hits + 1 : Math.max(0, hits - 1);
      if (cool > 0) cool--;
      if (hits > 5 && cool === 0) { const next = qsa($('candles'), '.candle:not(.out)')[0]; if (next) blowOut(next); cool = 12; }
      requestAnimationFrame(tick);
    };
    tick();
  } catch (err) { stopMic(); $('cakeHint').textContent = "Mic not available here — no stress, just tap the candles. 🕯️"; $('micBtn').classList.add('hidden'); }
});

/* ---------- party: letter, vouchers, certificate ---------- */
let typeToken = 0, skipTyping = false;
function buildVouchers() {
  const box = $('vouchers'); box.innerHTML = '';
  CONFIG.vouchers.forEach(v => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'voucher';
    b.innerHTML = `<span class="vicon">${v.icon}</span><span class="vtitle">${v.title}</span><span class="vhint">TAP TO REDEEM</span><span class="vtext">${v.text}</span><span class="vstamp">REDEEMED</span>`;
    b.addEventListener('click', () => { if (b.classList.contains('redeemed')) return; b.classList.add('redeemed'); sfx.good(); burst(b.getBoundingClientRect().left + 60, b.getBoundingClientRect().top + 40, 30); });
    box.appendChild(b);
  });
}
function buildCertificate() {
  $('certText').innerHTML = `This certifies that <strong>${CONFIG.fullName}</strong> survived ${rounds.length} missions, fed a dramatic frog, popped innocent balloons, and blew out birthday candles with admirable commitment. ` +
    (answers.persona ? `Emergency personality: <strong>${answers.persona}</strong>. ` : '') + (answers.os ? `Current operating system: <strong>${answers.os}</strong>. ` : '') +
    `Final chaos score: <strong>${chaos} ✦</strong>. Happy birthday, legend.`;
}
function celebrate() { confetti(180); fireworks(); playBirthday(); sfx.win(); }
function startParty() {
  show(party); $('partyTitle').textContent = `Happy Birthday, ${CONFIG.nickname}!`; $('partyRest').classList.add('hidden');
  buildVouchers(); buildCertificate(); celebrate(); typeLetter();
}
async function typeLetter() {
  const token = ++typeToken, box = $('letter'); skipTyping = false; box.innerHTML = '';
  const h = document.createElement('h3'); h.textContent = CONFIG.letterTitle; box.appendChild(h);
  const alive = () => token === typeToken;
  for (const text of CONFIG.letter) {
    const p = document.createElement('p'); p.className = 'typing'; box.appendChild(p);
    for (let i = 1; i <= text.length; i++) { if (!alive()) return; p.textContent = text.slice(0, i); if (!skipTyping) await sleep(18); }
    p.classList.remove('typing'); if (!skipTyping) await sleep(280);
  }
  if (!alive()) return;
  const s = document.createElement('p'); s.className = 'sign'; s.textContent = CONFIG.letterSign; box.appendChild(s);
  const rest = $('partyRest'); rest.classList.remove('hidden'); rest.style.animation = 'pop .5s ease-out';
}
$('letter').addEventListener('click', () => { skipTyping = true; });

/* ---------- ending buttons ---------- */
$('randomLinkBtn').addEventListener('click', () => {
  const l = pick(CONFIG.links); $('linkStatus').textContent = `Deploying: ${l[0]} ↗`; window.open(l[1], '_blank', 'noopener,noreferrer'); sprinkle(10);
});
$('songBtn').addEventListener('click', () => { playBirthday(); confetti(60); });
$('fireworksBtn').addEventListener('click', () => { fireworks(7000); sfx.win(); });
$('confettiBtn').addEventListener('click', () => { sprinkle(35); confetti(80); });
$('replayBtn').addEventListener('click', () => {
  typeToken++; stopMic(); clearInterval(showTimer); round = 0; chaos = 0; picked = false;
  Object.keys(answers).forEach(k => delete answers[k]);
  giftChip.textContent = '🎁 SURPRISE: LOCKED'; giftChip.classList.remove('open');
  show(game); renderRound();
});

/* ---------- secret shortcuts ---------- */
// tap the RIA.EXE logo 5 times (or open index.html?surprise) to jump straight to the gift
let logoTaps = 0, logoTimer = 0;
$('brandBtn').addEventListener('click', () => {
  logoTaps++; clearTimeout(logoTimer); logoTimer = setTimeout(() => { logoTaps = 0; }, 1500); sfx.tap();
  if (logoTaps >= 5) { logoTaps = 0; goGift(); }
});
const params = new URLSearchParams(location.search);
if (params.has('surprise')) goGift();
