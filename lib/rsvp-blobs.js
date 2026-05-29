import { getStore } from '@netlify/blobs';

const STORE_NAME = 'evite-rsvps';
const LIST_KEY = 'list';

function getRsvpStore() {
  return getStore({ name: STORE_NAME, consistency: 'strong' });
}

export async function appendRsvpNetlify(data) {
  const store = getRsvpStore();
  const entry = { ...data, receivedAt: new Date().toISOString() };
  const guests = (await store.get(LIST_KEY, { type: 'json' })) ?? [];
  guests.push(entry);
  await store.setJSON(LIST_KEY, guests);
  return entry;
}

export async function listRsvpsNetlify() {
  const store = getRsvpStore();
  return (await store.get(LIST_KEY, { type: 'json' })) ?? [];
}

export async function clearRsvpsNetlify() {
  const store = getRsvpStore();
  await store.setJSON(LIST_KEY, []);
}
