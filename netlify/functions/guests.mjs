import { clearRsvpsNetlify, listRsvpsNetlify } from '../../lib/rsvp-blobs.js';
import { summarizeRsvps } from '../../lib/rsvp-summary.js';

export async function handler(event) {
  if (event.httpMethod === 'DELETE') {
    try {
      await clearRsvpsNetlify();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true }),
      };
    } catch (err) {
      console.error('Clear guest list failed:', err.message);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Could not clear guest list.' }),
      };
    }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const guests = await listRsvpsNetlify();
    const summary = summarizeRsvps(guests);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guests, summary }),
    };
  } catch (err) {
    console.error('Guest list failed:', err.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Could not load guest list.' }),
    };
  }
}
