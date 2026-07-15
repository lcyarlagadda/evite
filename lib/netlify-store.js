import { getStore } from '@netlify/blobs';
import { normalizeRsvpEntry } from './rsvp-entry.js';

export const RSVP_STORE = 'evite-rsvps';
export const RSVP_LIST_KEY = 'list';

export async function listRsvpsFromStore() {
  const store = getStore(RSVP_STORE);
  const data = await store.get(RSVP_LIST_KEY, { type: 'json' });
  return Array.isArray(data) ? data : [];
}

export async function appendRsvpToStore(data) {
  const store = getStore(RSVP_STORE);
  const entry = {
    ...normalizeRsvpEntry(data),
    receivedAt: new Date().toISOString(),
  };
  const existing = await store.get(RSVP_LIST_KEY, { type: 'json' });
  const rsvps = Array.isArray(existing) ? existing : [];
  rsvps.push(entry);
  await store.setJSON(RSVP_LIST_KEY, rsvps);
  return entry;
}

export async function clearRsvpStore() {
  const store = getStore(RSVP_STORE);
  await store.setJSON(RSVP_LIST_KEY, []);
}
