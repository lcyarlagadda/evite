const envelopeStage = document.getElementById('envelope-stage');
const envelopeWrapper = document.getElementById('envelope-wrapper');
const tapHint = document.getElementById('tap-hint');
const invitePopup = document.getElementById('invite-popup');
const openRsvpBtn = document.getElementById('open-rsvp-btn');
const rsvpSheet = document.getElementById('rsvp-sheet');
const backToInviteBtn = document.getElementById('back-to-invite-btn');
const rsvpForm = document.getElementById('rsvp-form');
const formStatus = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');
const inviteScene = document.getElementById('invite-scene');
const successScene = document.getElementById('success-scene');
const successTitle = document.getElementById('success-title');
const viewInviteBtn = document.getElementById('view-invite-btn');
const confettiLayer = document.getElementById('confetti-layer');
const pollenField = document.getElementById('pollen-field');

let isOpen = false;

const CONFETTI_COLORS = ['#f4b942', '#d99a1a', '#e879a9', '#4a90d9', '#fff3d4', '#ffe9a8'];

function spawnPollen(count = 24) {
  pollenField.innerHTML = '';
  for (let i = 0; i < count; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'pollen';
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.animationDelay = `${Math.random() * 8}s`;
    dot.style.animationDuration = `${6 + Math.random() * 8}s`;
    dot.style.opacity = `${0.2 + Math.random() * 0.5}`;
    dot.style.width = dot.style.height = `${3 + Math.random() * 5}px`;
    pollenField.appendChild(dot);
  }
}

function popConfetti(count = 55, duration = 2000) {
  confettiLayer.innerHTML = '';

  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti';

    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty('--drift', `${-40 + Math.random() * 80}px`);
    piece.style.setProperty('--spin', `${Math.random() * 720}deg`);
    piece.style.animationDelay = `${Math.random() * 0.35}s`;
    piece.style.animationDuration = `${0.9 + Math.random() * 0.7}s`;
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];

    const w = 6 + Math.random() * 6;
    const h = 4 + Math.random() * 4;
    piece.style.width = `${w}px`;
    piece.style.height = `${h}px`;

    confettiLayer.appendChild(piece);
  }

  setTimeout(() => {
    confettiLayer.innerHTML = '';
  }, duration);
}

function showScene(scene) {
  [inviteScene, successScene].forEach((el) => {
    el.classList.add('hidden');
    el.classList.remove('scene-active');
  });
  scene.classList.remove('hidden');
  scene.classList.add('scene-active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideInvitePopup() {
  invitePopup.classList.remove('is-visible');
  setTimeout(() => invitePopup.classList.add('hidden'), 400);
  document.body.classList.remove('viewing-invite');
  closeRsvpSheet();
}

function showInvitePopup() {
  invitePopup.classList.remove('hidden');
  document.body.classList.add('viewing-invite');
  openRsvpBtn.classList.remove('hidden');
  requestAnimationFrame(() => {
    invitePopup.classList.add('is-visible');
    popConfetti();
  });
}

function openRsvpSheet() {
  if (rsvpSheet.classList.contains('is-open')) return;
  openRsvpBtn.classList.add('hidden');
  rsvpSheet.classList.remove('hidden');
  document.body.classList.add('rsvp-sheet-open');
  requestAnimationFrame(() => rsvpSheet.classList.add('is-open'));
  document.getElementById('name').focus();
}

function closeRsvpSheet() {
  rsvpSheet.classList.remove('is-open');
  document.body.classList.remove('rsvp-sheet-open');
  setTimeout(() => {
    rsvpSheet.classList.add('hidden');
    if (invitePopup.classList.contains('is-visible')) {
      openRsvpBtn.classList.remove('hidden');
    }
  }, 450);
}

function openEnvelope() {
  if (isOpen) return;
  isOpen = true;

  tapHint.classList.add('fade-out');
  envelopeWrapper.classList.add('envelope-tapped');
  showInvitePopup();
}

envelopeWrapper.addEventListener('click', openEnvelope);
envelopeWrapper.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openEnvelope();
  }
});
envelopeWrapper.setAttribute('tabindex', '0');
envelopeWrapper.setAttribute('role', 'button');
envelopeWrapper.setAttribute('aria-label', 'Open invitation envelope');

function showInviteReady() {
  isOpen = true;
  envelopeStage.classList.add('hidden');
  closeRsvpSheet();
  showInvitePopup();
}

openRsvpBtn.addEventListener('click', openRsvpSheet);
backToInviteBtn.addEventListener('click', closeRsvpSheet);

rsvpForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = new FormData(rsvpForm).get('name').trim();

  closeRsvpSheet();
  hideInvitePopup();
  popConfetti(55);
  successTitle.textContent = `Thanks, ${name}!`;
  showScene(successScene);
});

viewInviteBtn.addEventListener('click', () => {
  showScene(inviteScene);
  envelopeStage.classList.add('hidden');
  showInviteReady();
});

spawnPollen();
initBees();

function initBees() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const starts = [
    { x: 10, y: 14 },
    { x: 78, y: 42 },
    { x: 18, y: 72 },
    { x: 62, y: 22 },
    { x: 45, y: 58 },
  ];

  const bees = Array.from(document.querySelectorAll('.bee')).map((el, i) => ({
    el,
    x: starts[i].x,
    y: starts[i].y,
    tx: starts[i].x,
    ty: starts[i].y,
    speed: 0.055 + i * 0.008,
    facing: 1,
    pauseUntil: 0,
  }));

  function pickTarget(bee) {
    bee.tx = 6 + Math.random() * 86;
    bee.ty = 8 + Math.random() * 78;
  }

  function updateFacing(bee, dx, dy) {
    if (Math.abs(dx) > 0.05) {
      // Bee emoji faces left by default — flip when flying right
      bee.facing = dx > 0 ? -1 : 1;
    }

    bee.el.style.transform = `translate(${bee.x}vw, ${bee.y}vh) scaleX(${bee.facing})`;
  }

  bees.forEach((bee) => pickTarget(bee));

  let lastTime = performance.now();

  function tick(now) {
    const dt = Math.min((now - lastTime) / 16.67, 2.5);
    lastTime = now;

    bees.forEach((bee) => {
      if (now < bee.pauseUntil) {
        const dx = bee.tx - bee.x;
        const dy = bee.ty - bee.y;
        updateFacing(bee, dx, dy);
        return;
      }

      const dx = bee.tx - bee.x;
      const dy = bee.ty - bee.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 2) {
        bee.pauseUntil = now + 400;
        pickTarget(bee);
        updateFacing(bee, bee.tx - bee.x, bee.ty - bee.y);
        return;
      }

      bee.x += (dx / dist) * bee.speed * dt;
      bee.y += (dy / dist) * bee.speed * dt;
      updateFacing(bee, dx, dy);
    });

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

document.querySelectorAll('.team-option input').forEach((input) => {
  input.addEventListener('change', () => {
    input.closest('.team-card')?.classList.add('team-pop');
    setTimeout(() => input.closest('.team-card')?.classList.remove('team-pop'), 400);
  });
});
