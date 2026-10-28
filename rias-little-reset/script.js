const intro = document.getElementById('intro');
const game = document.getElementById('game');
const ending = document.getElementById('ending');
const gameContent = document.getElementById('gameContent');
const feedback = document.getElementById('feedback');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const roundLabel = document.getElementById('roundLabel');
const scoreLabel = document.getElementById('scoreLabel');
const garden = document.getElementById('garden');

let round = 0;
let petals = 0;
let picked = false;
let flowerTaps = 0;

const rounds = [
  {
    type: 'choices', kicker: 'ROUND 1 · QUICK VIBE CHECK', title: 'Pick your tiny escape 🌤️',
    hint: 'No wrong answers. Choose the one that sounds nicest right now.',
    choices: [
      ['🌊','Beach with zero responsibilities','A whole day of peace? Elite choice.'],
      ['🛌','Sleep like a retired cat','Honestly, 10/10 life plan.'],
      ['🎧','Headphones + favourite songs','Main character soundtrack activated.'],
      ['🍟','Snacks and unserious gossip','The healing power of snacks is underrated.']
    ],
    after: 'First petal unlocked! 🌸 See? You are already growing a tiny garden.'
  },
  {
    type: 'choices', kicker: 'ROUND 2 · VERY IMPORTANT RESEARCH', title: 'Choose your superpower 🦸🏽‍♀️',
    hint: 'This is definitely a serious scientific assessment. Definitely.',
    choices: [
      ['🫥','Disappear from awkward moments','Imagine leaving every embarrassing memory on read.'],
      ['💸','Money appears when needed','Peace, stability, and snacks. A powerful combo.'],
      ['⏰','Pause time for naps','The world can wait. Nap first.'],
      ['🧠','Know when someone is lying','No more “I can explain” speeches. 😭']
    ],
    after: 'Petal number two! Your imaginary superpower certificate is in the mail. 😂'
  },
  {
    type: 'tap', kicker: 'ROUND 3 · A TINY MISSION', title: 'Water the little flower 🌷',
    hint: 'Tap the flower 5 times. That is the whole mission. You got this.',
    after: 'Look at you completing missions! 🌷 Tiny wins still count.'
  },
  {
    type: 'choices', kicker: 'ROUND 4 · PICK YOUR ENERGY', title: 'What are we claiming? ✨',
    hint: 'Choose a vibe. No pressure to feel it every single day.',
    choices: [
      ['🌱','A fresh start','Small steps still move you forward.'],
      ['🧘🏽‍♀️','Peace and quiet','Protecting your peace is a valid plan.'],
      ['🤣','Laugh until my stomach hurts','Please, this is the most important one.'],
      ['🧁','Soft life and sweet treats','As you should. Respectfully.']
    ],
    after: 'Another petal for the garden. 🌼 Your vibe, your pace.'
  },
  {
    type: 'choices', kicker: 'ROUND 5 · FINAL BOSS', title: 'Pick one kind thing for yourself 💗',
    hint: 'Nothing dramatic. Just one little thing you deserve.',
    choices: [
      ['🫶🏽','Talk to myself more kindly','You deserve the same kindness you give others.'],
      ['🎶','Make a comfort playlist','Soundtrack for the next chapter.'],
      ['🌳','Get some fresh air','A little outside time can feel good.'],
      ['🍰','Treat myself to something nice','Tiny joy is still joy.']
    ],
    after: 'Final petal unlocked! The garden appreciates your excellent decisions. 🌸'
  }
];

document.getElementById('startBtn').addEventListener('click', () => {
  intro.classList.add('hidden');
  game.classList.remove('hidden');
  renderRound();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function renderRound() {
  picked = false;
  feedback.classList.add('hidden');
  feedback.innerHTML = '';
  nextBtn.classList.add('hidden');
  const item = rounds[round];
  roundLabel.textContent = `ROUND ${round + 1} OF ${rounds.length}`;
  scoreLabel.textContent = `petals: ${petals} 🌸`;
  progressBar.style.width = `${((round + 1) / rounds.length) * 100}%`;

  if (item.type === 'tap') {
    flowerTaps = 0;
    gameContent.innerHTML = `
      <div class="round-kicker">${item.kicker}</div>
      <h2 class="question">${item.title}</h2>
      <p class="hint">${item.hint}</p>
      <div class="mini-game">
        <button class="tap-flower" id="tapFlower" aria-label="Tap the flower">🌷</button>
        <div class="tap-count" id="tapCount">0 / 5 taps</div>
      </div>`;
    document.getElementById('tapFlower').addEventListener('click', (event) => {
      if (picked) return;
      flowerTaps++;
      event.currentTarget.textContent = ['🌷','🌸','🌼','🌺','💐'][Math.min(flowerTaps, 4)];
      document.getElementById('tapCount').textContent = `${Math.min(flowerTaps,5)} / 5 taps`;
      if (flowerTaps >= 5) finishRound(item.after);
    });
    return;
  }

  gameContent.innerHTML = `
    <div class="round-kicker">${item.kicker}</div>
    <h2 class="question">${item.title}</h2>
    <p class="hint">${item.hint}</p>
    <div class="choices">${item.choices.map((choice, index) => `
      <button class="choice" data-index="${index}">
        <span class="emoji">${choice[0]}</span>${choice[1]}
      </button>`).join('')}</div>`;
  gameContent.querySelectorAll('.choice').forEach((button) => {
    button.addEventListener('click', () => {
      if (picked) return;
      picked = true;
      const choice = item.choices[Number(button.dataset.index)];
      button.classList.add('selected');
      gameContent.querySelectorAll('.choice').forEach((other) => other.disabled = true);
      finishRound(`${choice[2]}<br><br>${item.after}`);
    });
  });
}

function finishRound(message) {
  if (rounds[round].type === 'tap' && picked) return;
  picked = true;
  petals++;
  scoreLabel.textContent = `petals: ${petals} 🌸`;
  feedback.innerHTML = message;
  feedback.classList.remove('hidden');
  nextBtn.classList.remove('hidden');
  nextBtn.innerHTML = round === rounds.length - 1 ? 'See your garden <span>♡</span>' : 'Next little thing <span>→</span>';
  sprinkle(8);
}

nextBtn.addEventListener('click', () => {
  if (round < rounds.length - 1) {
    round++;
    renderRound();
  } else {
    game.classList.add('hidden');
    ending.classList.remove('hidden');
    renderGarden();
    sprinkle(24);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

function renderGarden() {
  const blooms = ['🌷','🌼','🌸','🌻','🌺','🌹','🪻'];
  garden.innerHTML = '';
  for (let i = 0; i < petals + 2; i++) {
    const flower = document.createElement('span');
    flower.textContent = blooms[i % blooms.length];
    flower.style.animationDelay = `${i * 0.07}s`;
    garden.appendChild(flower);
  }
}

document.getElementById('replayBtn').addEventListener('click', () => {
  round = 0; petals = 0; flowerTaps = 0; picked = false;
  ending.classList.add('hidden');
  game.classList.remove('hidden');
  renderRound();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('confettiBtn').addEventListener('click', () => sprinkle(35));

function sprinkle(amount) {
  const layer = document.getElementById('floatingLayer');
  const pieces = ['🌸','✨','💗','🌷','✿'];
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement('span');
    piece.className = 'petal';
    piece.textContent = pieces[Math.floor(Math.random() * pieces.length)];
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.animationDuration = `${2.4 + Math.random() * 2.8}s`;
    piece.style.animationDelay = `${Math.random() * .45}s`;
    piece.style.fontSize = `${12 + Math.random() * 16}px`;
    layer.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}
