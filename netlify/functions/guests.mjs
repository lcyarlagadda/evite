import {
  clearRsvpStore,
  listRsvpsFromStore,
} from '../../lib/netlify-store.js';
import { summarizeRsvps } from '../../lib/rsvp-summary.js';

const json = (body, status = 200) =>
  Response.json(body, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export default async (request) => {
  if (request.method === 'DELETE') {
    try {
      await clearRsvpStore();
      return json({ success: true });
    } catch (err) {
      console.error('Clear guest list failed:', err.message);
      return json({ error: 'Could not clear guest list.' }, 500);
    }
  }

  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const guests = await listRsvpsFromStore();
    return json({
      guests,
      summary: summarizeRsvps(guests),
    });
  } catch (err) {
    console.error('Guest list failed:', err.message);
    return json({ error: 'Could not load guest list.' }, 500);
  }
};

export const config = {
  path: '/api/guests',
};
