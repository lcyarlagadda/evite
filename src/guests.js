import { summarizeRsvps } from '../lib/rsvp-summary.js';

const summaryCards = document.getElementById('summary-cards');
const guestTableBody = document.getElementById('guest-table-body');
const guestEmpty = document.getElementById('guest-empty');
const guestTableScroll = document.getElementById('guest-table-scroll');
const loadError = document.getElementById('load-error');
const refreshBtn = document.getElementById('refresh-btn');
const clearBtn = document.getElementById('clear-btn');

const ATTENDANCE_LABELS = {
  yes: 'Yes',
  no: 'No',
  maybe: 'Maybe',
};

const PREDICTION_LABELS = {
  boy: 'Team Boy',
  girl: 'Team Girl',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function badgeClass(prefix, value) {
  return `badge badge--${prefix}${value ? ` badge--${value}` : ''}`;
}

function renderSummary(summary) {
  const stats = summary || summarizeRsvps([]);

  summaryCards.innerHTML = [
    { label: 'Total RSVPs', value: stats.total ?? 0 },
    { label: 'Attending', value: stats.yes ?? 0, className: 'summary-card--yes' },
    { label: 'Maybe', value: stats.maybe ?? 0, className: 'summary-card--maybe' },
    { label: 'Not coming', value: stats.no ?? 0, className: 'summary-card--no' },
    { label: 'Total guests', value: stats.guestCount ?? 0 },
  ]
    .map(
      (card) => `
        <article class="summary-card ${card.className || ''}">
          <div class="summary-card-value">${card.value}</div>
          <div class="summary-card-label">${card.label}</div>
        </article>
      `
    )
    .join('');
}

function renderGuests(guests) {
  const list = Array.isArray(guests) ? guests : [];

  if (!list.length) {
    guestEmpty.classList.remove('hidden');
    guestTableScroll.classList.add('hidden');
    guestTableBody.innerHTML = '';
    return;
  }

  guestEmpty.classList.add('hidden');
  guestTableScroll.classList.remove('hidden');

  const sorted = [...list].sort(
    (a, b) => new Date(b.receivedAt || 0) - new Date(a.receivedAt || 0)
  );

  guestTableBody.innerHTML = sorted
    .map((guest) => {
      const attendance = guest.attendance || '';
      const prediction = guest.prediction || '';
      const guestsLabel = attendance === 'no' ? '—' : (guest.guests ?? '—');

      return `
        <tr>
          <td>${escapeHtml(guest.name || '—')}</td>
          <td><span class="${badgeClass('', attendance)}">${ATTENDANCE_LABELS[attendance] || attendance}</span></td>
          <td><span class="${badgeClass('', prediction)}">${PREDICTION_LABELS[prediction] || prediction}</span></td>
          <td>${escapeHtml(String(guestsLabel))}</td>
          <td>${formatDate(guest.receivedAt)}</td>
        </tr>
      `;
    })
    .join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function fetchGuests() {
  const response = await fetch('/api/guests');
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error(
      'Could not load RSVPs. Run npm run dev and open http://localhost:5173/guests — or use your live site URL after deploying to Fly.'
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || 'Could not load guest list.');
  }

  if (!payload || !Array.isArray(payload.guests)) {
    throw new Error('Guest list API returned an invalid response.');
  }

  return {
    guests: payload.guests,
    summary: payload.summary || summarizeRsvps(payload.guests),
  };
}

async function loadGuestList() {
  loadError.classList.add('hidden');

  try {
    const { guests, summary } = await fetchGuests();
    renderSummary(summary);
    renderGuests(guests);
  } catch (err) {
    loadError.textContent = err.message;
    loadError.classList.remove('hidden');
  }
}

async function clearGuestList() {
  const confirmed = window.confirm(
    'Delete every RSVP and start fresh? This cannot be undone.'
  );
  if (!confirmed) return;

  loadError.classList.add('hidden');

  try {
    const response = await fetch('/api/guests', { method: 'DELETE' });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.error || 'Could not clear guest list.');
    }

    await loadGuestList();
  } catch (err) {
    loadError.textContent = err.message;
    loadError.classList.remove('hidden');
  }
}

refreshBtn.addEventListener('click', loadGuestList);
clearBtn.addEventListener('click', clearGuestList);
loadGuestList();
