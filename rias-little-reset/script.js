const intro = document.getElementById('intro');
const game = document.getElementById('game');
const ending = document.getElementById('ending');
const gameContent = document.getElementById('gameContent');
const feedback = document.getElementById('feedback');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const roundLabel = document.getElementById('roundLabel');
const scoreLabel = document.getElementById('scoreLabel');
const chaosBtn = document.getElementById('chaosBtn');
let round = 0;
let chaos = 0;
let picked = false;

const rounds = [
  { type:'choices', kicker:'MISSION 1 · VIBE FORENSICS', title:'Choose your emergency personality 🪩', hint:'There are no wrong answers. There are, however, answers that reveal too much.', choices:[['🧃','A mysterious juice box','Nobody knows what flavour it is. Not even you.'],['🧍🏽‍♀️','Walk into a room and forget why','A timeless classic. Very relatable.'],['🦅','Scream dramatically then continue','Oscar-worthy. The academy is shaking.'],['🛒','Buy one silly little treat','Financially irresponsible? Spiritually correct.']], after:'Personality file updated. The authorities have been notified. ✦' },
  { type:'frog', kicker:'MISSION 2 · FROG EMERGENCY', title:'Feed the dramatic frog 🐸', hint:'The frog has not eaten since Tuesday and is being extremely theatrical. Feed it 8 snacks.', after:'The frog is full, grateful, and still somehow disappointed in you. 🐸' },
  { type:'meter', kicker:'MISSION 3 · UNNECESSARY EFFORT', title:'Charge the silly little button ⚡', hint:'Click until the meter is full. This has no practical purpose. That is the point.', after:'Power levels critical. You have successfully charged absolutely nothing. ⚡' },
  { type:'reaction', kicker:'MISSION 4 · REFLEX TEST', title:'Catch the runaway thought 💨', hint:'Click the emoji 7 times before it escapes. It is very fast for something with no legs.', after:'Thought caught. It says it was just passing through. Rude. 💨' },
  { type:'choices', kicker:'MISSION 5 · FINAL BOSS', title:'Select your legally binding nonsense 🏆', hint:'Pick the option that best represents your current operating system.', choices:[['🧠','Overthink one harmless text','It said “okay” but what did it mean?'],['🍰','Eat dessert before dinner','A bold policy change. Parliament approves.'],['🦆','Become emotionally attached to a duck','Honestly, the duck seems trustworthy.'],['🛌','Cancel plans with the outside world','Your bed has better Wi-Fi anyway.']], after:'Final decision recorded. You are now certified as delightfully unpredictable. 🏆' }
];

document.getElementById('startBtn').addEventListener('click', () => { intro.classList.add('hidden'); game.classList.remove('hidden'); renderRound(); window.scrollTo({top:0,behavior:'smooth'}); });

chaosBtn.addEventListener('click', () => {
  const active = document.body.classList.toggle('chaos');
  chaosBtn.classList.toggle('active', active);
  chaosBtn.textContent = `CHAOS MODE: ${active ? 'ON' : 'OFF'}`;
  chaosBtn.setAttribute('aria-pressed', String(active));
  if (active) sprinkle(12);
});

function renderRound() {
  picked = false;
  feedback.classList.add('hidden'); feedback.innerHTML = ''; nextBtn.classList.add('hidden');
  const item = rounds[round];
  roundLabel.textContent = `MISSION ${round + 1} OF ${rounds.length}`;
  scoreLabel.textContent = `chaos: ${chaos} ✦`;
  progressBar.style.width = `${((round + 1) / rounds.length) * 100}%`;
  if (item.type === 'frog') renderFrog(item);
  else if (item.type === 'meter') renderMeter(item);
  else if (item.type === 'reaction') renderReaction(item);
  else renderChoices(item);
}

function shell(item, content) { gameContent.innerHTML = `<div class="round-kicker">${item.kicker}</div><h2 class="question">${item.title}</h2><p class="hint">${item.hint}</p>${content}`; }

function renderChoices(item) {
  shell(item, `<div class="choices">${item.choices.map((choice,index) => `<button class="choice" data-index="${index}" type="button"><span class="emoji">${choice[0]}</span>${choice[1]}</button>`).join('')}</div>`);
  gameContent.querySelectorAll('.choice').forEach(button => button.addEventListener('click', () => {
    if (picked) return; const choice = item.choices[Number(button.dataset.index)]; button.classList.add('selected');
    gameContent.querySelectorAll('.choice').forEach(other => { other.disabled = true; }); finishRound(`${choice[2]}<br><br>${item.after}`);
  }));
}

function renderFrog(item) {
  shell(item, '<div class="mini-game"><button class="tap-target" id="frog" type="button" aria-label="Feed the frog">🐸</button><div class="tap-count" id="frogCount">0 / 8 snacks delivered</div></div>');
  let snacks = 0;
  document.getElementById('frog').addEventListener('click', event => { if (picked) return; snacks++; event.currentTarget.textContent = ['🐸','😮','😋','🤤','🥳'][Math.min(4,Math.floor(snacks / 2))]; document.getElementById('frogCount').textContent = `${snacks} / 8 snacks delivered`; if (snacks >= 8) finishRound(item.after); });
}

function renderMeter(item) {
  shell(item, '<div class="mini-game"><button class="tap-target" id="chargeBtn" type="button" aria-label="Charge the button">⚡</button><div class="meter"><div id="meterFill"></div></div><div class="meter-label" id="meterLabel">0% powered by nonsense</div></div>');
  let charge = 0;
  document.getElementById('chargeBtn').addEventListener('click', () => { if (picked) return; charge += 10; document.getElementById('meterFill').style.width = `${charge}%`; document.getElementById('meterLabel').textContent = `${charge}% powered by nonsense`; if (charge >= 100) finishRound(item.after); });
}

function renderReaction(item) {
  shell(item, '<div class="reaction-zone" id="reactionZone"><button class="reaction-btn" id="reactionBtn" type="button" aria-label="Catch the thought">💨</button></div><div class="tap-count" id="reactionCount">0 / 7 thoughts caught</div>');
  let catches = 0;
  const button = document.getElementById('reactionBtn');
  button.addEventListener('click', () => { if (picked) return; catches++; document.getElementById('reactionCount').textContent = `${catches} / 7 thoughts caught`; button.textContent = catches % 2 ? '💭' : '💨'; button.style.left = `${8 + Math.random() * 76}%`; button.style.top = `${8 + Math.random() * 65}%`; if (catches >= 7) finishRound(item.after); });
}

function finishRound(message) { if (picked) return; picked = true; chaos++; scoreLabel.textContent = `chaos: ${chaos} ✦`; feedback.innerHTML = message; feedback.classList.remove('hidden'); nextBtn.classList.remove('hidden'); nextBtn.innerHTML = round === rounds.length - 1 ? 'Issue certificate <span>🏆</span>' : 'Next questionable mission <span>→</span>'; sprinkle(7); }

nextBtn.addEventListener('click', () => { if (round < rounds.length - 1) { round++; renderRound(); } else { game.classList.add('hidden'); ending.classList.remove('hidden'); sprinkle(24); window.scrollTo({top:0,behavior:'smooth'}); } });

const randomLinks = [
  ['Cat Bounce','https://cat-bounce.com/'], ['The Useless Web','https://theuselessweb.com/'], ['Pointer Pointer','https://pointerpointer.com/'], ['Neal.fun','https://neal.fun/'], ['Staggering Beauty','http://www.staggeringbeauty.com/'], ['Zoom Quilt','https://zoomquilt.org/']
];
document.getElementById('randomLinkBtn').addEventListener('click', () => { const link = randomLinks[Math.floor(Math.random() * randomLinks.length)]; document.getElementById('linkStatus').textContent = `Deploying: ${link[0]} ↗`; window.open(link[1], '_blank', 'noopener,noreferrer'); sprinkle(10); });
document.getElementById('replayBtn').addEventListener('click', () => { round=0; chaos=0; picked=false; ending.classList.add('hidden'); game.classList.remove('hidden'); renderRound(); window.scrollTo({top:0,behavior:'smooth'}); });
document.getElementById('confettiBtn').addEventListener('click', () => sprinkle(35));

function sprinkle(amount) { const layer = document.getElementById('floatingLayer'); const pieces = ['✦','✨','💥','🪩','💗','🐸']; for (let i=0;i<amount;i++) { const piece=document.createElement('span'); piece.className='petal'; piece.textContent=pieces[Math.floor(Math.random()*pieces.length)]; piece.style.left=`${Math.random()*100}vw`; piece.style.animationDuration=`${2.2+Math.random()*2.8}s`; piece.style.animationDelay=`${Math.random()*.45}s`; piece.style.fontSize=`${12+Math.random()*16}px`; layer.appendChild(piece); piece.addEventListener('animationend',()=>piece.remove()); } }
