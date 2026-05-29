import { getStore } from '@netlify/blobs';

export const RSVP_STORE = 'evite-rsvps';
export const RSVP_LIST_KEY = 'list';

export async function listRsvpsFromStore() {
  const store = getStore(RSVP_STORE);
  const data = await store.get(RSVP_LIST_KEY, { type: 'json' });
  return Array.isArray(data) ? data : [];
}

export async function appendRsvpToStore(data) {
  const store = getStore(RSVP_STORE);
  const entry = { ...data, receivedAt: new Date().toISOString() };
  const existing = await store.get(RSVP_LIST_KEY, { type: 'json' });
  const guests = Array.isArray(existing) ? existing : [];
  guests.push(entry);
  await store.setJSON(RSVP_LIST_KEY, guests);
  return entry;
}

export async function clearRsvpStore() {
  const store = getStore(RSVP_STORE);
  await store.setJSON(RSVP_LIST_KEY, []);
}
