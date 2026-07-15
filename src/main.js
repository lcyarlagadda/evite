import inviteImg from './assets/invite.png';

const envelopeStage = document.getElementById('envelope-stage');
const envelopeStack = document.getElementById('envelope-stack');
const envelopeWrapper = document.getElementById('envelope-wrapper');
const tapHint = document.getElementById('tap-hint');
const inviteCard = document.getElementById('invite-card');
const envelopePocket = document.querySelector('.envelope-pocket');
const inviteBackdrop = document.getElementById('invite-backdrop');
const inviteActions = document.getElementById('invite-actions');
const openRsvpBtn = document.getElementById('open-rsvp-btn');
const rsvpSheet = document.getElementById('rsvp-sheet');
const backToInviteBtn = document.getElementById('back-to-invite-btn');
const rsvpForm = document.getElementById('rsvp-form');
const formStatus = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');
const inviteScene = document.getElementById('invite-scene');
const successScene = document.getElementById('success-scene');
const successTitle = document.getElementById('success-title');
const successIcon = document.getElementById('success-icon');
const successMessage = document.getElementById('success-message');
const successSub = document.getElementById('success-sub');
const viewInviteBtn = document.getElementById('view-invite-btn');
const guestsGroup = document.getElementById('guests-group');
const headcountInputs = rsvpForm.querySelectorAll('input[name="adults"], input[name="kids"]');
const attendanceInputs = rsvpForm.querySelectorAll('input[name="attendance"]');
const confettiLayer = document.getElementById('confetti-layer');
const pollenField = document.getElementById('pollen-field');
const inviteImgEl = inviteCard?.querySelector('img');

if (inviteImgEl) {
  inviteImgEl.src = inviteImg;
}

const invitePreload = document.createElement('link');
invitePreload.rel = 'preload';
invitePreload.as = 'image';
invitePreload.href = inviteImg;
document.head.appendChild(invitePreload);

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

function getInviteViewportCenterY(cardHeight) {
  const topGap = 16;
  const bottomReserve = 108;
  const available = window.innerHeight - topGap - bottomReserve;
  const height = cardHeight || Math.min(available, Math.min(window.innerHeight * 0.68, 680));

  if (height <= available) {
    return topGap + available / 2;
  }

  return window.innerHeight - bottomReserve - height / 2;
}

function getInviteCardLayout() {
  const img = inviteCard.querySelector('img');
  const topGap = 16;
  const bottomReserve = 108;
  const maxWidth = Math.min(520, window.innerWidth * 0.96);
  const maxHeight = Math.min(window.innerHeight - topGap - bottomReserve, 680);
  const aspect = (img?.naturalHeight || 1100) / (img?.naturalWidth || 800);

  let targetWidth = maxWidth;
  let cardHeight = targetWidth * aspect;
  if (cardHeight > maxHeight) {
    cardHeight = maxHeight;
    targetWidth = maxHeight / aspect;
  }

  return { targetWidth, maxHeight: cardHeight, cardHeight };
}

function freezeEnvelopeStack() {
  const rect = envelopeStack.getBoundingClientRect();
  envelopeStack.style.position = 'fixed';
  envelopeStack.style.top = `${rect.top}px`;
  envelopeStack.style.left = `${rect.left}px`;
  envelopeStack.style.width = `${rect.width}px`;
  envelopeStack.style.zIndex = '40';
}

function restoreInviteCardToEnvelope() {
  if (envelopePocket && inviteCard.parentElement !== envelopePocket) {
    envelopePocket.appendChild(inviteCard);
  }
  inviteCard.style.cssText = '';
  inviteCard.classList.remove('is-maximizing', 'is-maximized', 'is-centered');
  envelopeWrapper.classList.remove('is-opening', 'card-slide', 'envelope-done');
  envelopeStack.classList.remove('card-slide');
  envelopeStack.style.cssText = '';
}

function maximizeCardCentered(animate = false, onDone) {
  const peekRect = animate ? inviteCard.getBoundingClientRect() : null;

  if (animate) freezeEnvelopeStack();

  document.body.appendChild(inviteCard);
  document.body.classList.add('invite-ready');
  inviteBackdrop.classList.remove('hidden');
  inviteActions.classList.remove('hidden');
  envelopeWrapper.classList.add('envelope-done');

  const { targetWidth, cardHeight } = getInviteCardLayout();
  const targetCenterY = getInviteViewportCenterY(cardHeight);
  const popEase = 'cubic-bezier(0.33, 1, 0.38, 1)';

  inviteCard.style.position = 'fixed';
  inviteCard.style.left = '50%';
  inviteCard.style.maxHeight = '';
  inviteCard.style.bottom = 'auto';
  inviteCard.style.margin = '0';
  inviteCard.style.zIndex = '65';
  inviteCard.style.transformOrigin = 'center center';

  if (animate && peekRect.width > 0) {
    inviteCard.classList.add('is-maximizing');
    inviteCard.style.top = `${peekRect.top + peekRect.height / 2}px`;
    inviteCard.style.width = `${peekRect.width}px`;
    inviteCard.style.transform = 'translate(-50%, -50%) scale(1)';
    inviteCard.style.opacity = '1';
    inviteCard.style.transition = 'none';
    inviteCard.style.boxShadow = '0 6px 16px rgba(44, 36, 22, 0.16)';

    inviteCard.offsetHeight;

    inviteCard.style.transition = [
      `top 0.58s ${popEase}`,
      `width 0.58s ${popEase}`,
      `transform 0.58s ${popEase}`,
      'box-shadow 0.58s ease',
    ].join(', ');

    requestAnimationFrame(() => {
      inviteBackdrop.classList.add('is-visible');
      inviteCard.style.top = `${targetCenterY}px`;
      inviteCard.style.width = `${targetWidth}px`;
      inviteCard.style.transform = 'translate(-50%, -50%) scale(1)';
      inviteCard.style.boxShadow = '0 24px 64px rgba(0, 0, 0, 0.35)';
    });

    inviteCard.addEventListener(
      'transitionend',
      (event) => {
        if (event.propertyName !== 'top') return;
        inviteCard.style.transition = '';
        inviteCard.classList.remove('is-maximizing');
        inviteCard.classList.add('is-maximized', 'is-centered');
        onDone?.();
      },
      { once: true }
    );
    return;
  }

  inviteCard.style.top = `${targetCenterY}px`;
  inviteCard.style.width = `${targetWidth}px`;
  inviteCard.classList.add('is-maximized', 'is-centered');
  inviteCard.style.transform = 'translate(-50%, -50%) scale(1)';
  requestAnimationFrame(() => inviteBackdrop.classList.add('is-visible'));
  onDone?.();
}

function hideInviteRevealed() {
  document.body.classList.remove('invite-ready', 'viewing-invite');
  inviteBackdrop.classList.remove('is-visible');
  inviteActions.classList.add('hidden');
  restoreInviteCardToEnvelope();
  setTimeout(() => inviteBackdrop.classList.add('hidden'), 450);
  closeRsvpSheet();
}

function showInviteRevealed(withConfetti = true, animate = true) {
  document.body.classList.add('viewing-invite');

  maximizeCardCentered(animate, () => {
    if (withConfetti) popConfetti();
  });
}

function openRsvpSheet() {
  if (rsvpSheet.classList.contains('is-open')) return;
  openRsvpBtn.classList.add('hidden');
  rsvpSheet.classList.remove('hidden');
  document.body.classList.add('rsvp-sheet-open');
  updateGuestField();
  requestAnimationFrame(() => {
    rsvpSheet.classList.add('is-open');
    rsvpSheet.querySelector('.rsvp-sheet-panel')?.scrollTo(0, 0);
    document.getElementById('name').focus({ preventScroll: true });
  });
}

function closeRsvpSheet() {
  rsvpSheet.classList.remove('is-open');
  document.body.classList.remove('rsvp-sheet-open');
  setTimeout(() => {
    rsvpSheet.classList.add('hidden');
    if (document.body.classList.contains('invite-ready')) {
      openRsvpBtn.classList.remove('hidden');
    }
  }, 450);
}

const FLAP_OPEN_MS = 620;
const PEEK_HOLD_MS = 100;

function openEnvelope() {
  if (isOpen) return;
  isOpen = true;

  tapHint.classList.add('fade-out');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showInviteRevealed(true, false);
    return;
  }

  const flap = envelopeWrapper.querySelector('.envelope-flap');
  let popScheduled = false;

  const schedulePop = () => {
    if (popScheduled) return;
    popScheduled = true;
    setTimeout(() => showInviteRevealed(true, true), PEEK_HOLD_MS);
  };

  const onFlapEnd = (event) => {
    if (event.target !== flap || event.propertyName !== 'transform') return;
    flap.removeEventListener('transitionend', onFlapEnd);
    schedulePop();
  };

  envelopeWrapper.classList.add('is-opening', 'card-slide');
  envelopeStack.classList.add('card-slide');

  if (window.matchMedia('(max-width: 480px)').matches) {
    inviteCard.getBoundingClientRect();
  }

  flap.addEventListener('transitionend', onFlapEnd);

  // Fallback if transform transition does not run (some mobile WebViews)
  setTimeout(() => {
    flap.removeEventListener('transitionend', onFlapEnd);
    schedulePop();
  }, FLAP_OPEN_MS + 80);
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
  closeRsvpSheet();
  showInviteRevealed(false, false);
}

openRsvpBtn.addEventListener('click', openRsvpSheet);
backToInviteBtn.addEventListener('click', closeRsvpSheet);

function updateGuestField() {
  const attendance = rsvpForm.querySelector('input[name="attendance"]:checked')?.value;
  const declining = attendance === 'no';

  guestsGroup.classList.toggle('hidden', declining);
  headcountInputs.forEach((input) => {
    if (declining) input.checked = false;
  });
}

function validateRsvpForm() {
  const formData = new FormData(rsvpForm);
  const name = String(formData.get('name') || '').trim();
  const attendance = formData.get('attendance');
  const prediction = formData.get('prediction');
  const adults = formData.get('adults');
  const kids = formData.get('kids');

  if (!name) {
    return 'Please enter your name.';
  }
  if (!attendance) {
    return 'Please choose whether you can attend.';
  }
  if (!prediction) {
    return 'Please pick Team Boy or Team Girl.';
  }
  if (attendance !== 'no' && !adults) {
    return 'Please select how many adults are coming.';
  }
  if (attendance !== 'no' && kids === null) {
    return 'Please select how many kids are coming (choose 0 if none).';
  }

  return null;
}

function showSuccessScreen(payload) {
  if (payload.attendance === 'no') {
    successIcon.textContent = '🍯';
    successTitle.textContent = `We'll miss you, ${payload.name}!`;
    successMessage.textContent = 'Wish you could be there!';
    successSub.textContent = 'Hope to meet you soon.';
  } else if (payload.attendance === 'maybe') {
    successIcon.textContent = '🐝';
    successTitle.textContent = `Thanks, ${payload.name}!`;
    successMessage.textContent = 'Hope you can make it!';
    successSub.textContent = "We'll keep a spot buzzing for you — let us know when you decide.";
  } else {
    successIcon.textContent = '🎉';
    successTitle.textContent = `Thanks, ${payload.name}!`;
    successMessage.textContent = 'Your RSVP fluttered straight to Himani & Praneeth.';
    successSub.textContent = "We can't wait to celebrate with you!";
  }
}

attendanceInputs.forEach((input) => {
  input.addEventListener('change', updateGuestField);
});

rsvpForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const validationError = validateRsvpForm();
  if (validationError) {
    formStatus.textContent = validationError;
    formStatus.classList.remove('hidden', 'success');
    formStatus.classList.add('error');
    return;
  }

  const formData = new FormData(rsvpForm);
  const attendance = formData.get('attendance');
  const payload = {
    name: String(formData.get('name')).trim(),
    attendance,
    prediction: formData.get('prediction'),
    adults: attendance === 'no' ? '0' : formData.get('adults'),
    kids: attendance === 'no' ? '0' : formData.get('kids'),
  };

  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Sending…';
  formStatus.classList.add('hidden');
  formStatus.classList.remove('success', 'error');

  try {
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Failed to send RSVP. Please try again.');
    }

    closeRsvpSheet();
    hideInviteRevealed();
    popConfetti(payload.attendance === 'no' ? 30 : 55);
    showSuccessScreen(payload);
    showScene(successScene);
  } catch (err) {
    formStatus.textContent = err.message;
    formStatus.classList.remove('hidden');
    formStatus.classList.add('error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Send RSVP';
  }
});

viewInviteBtn.addEventListener('click', () => {
  showScene(inviteScene);
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
