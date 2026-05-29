import { deliverRsvpNotifications, hasNotificationConfig } from '../../lib/rsvp-notify.js';
import { appendRsvpNetlify } from '../../lib/rsvp-blobs.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (!hasNotificationConfig()) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Notifications are not configured. Add email settings in Netlify.',
      }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid request.' }),
    };
  }

  const { name, attendance, prediction, guests } = body;

  if (!name || !attendance || !prediction || (attendance !== 'no' && !guests)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Please fill in all fields.' }),
    };
  }

  const data = {
    name: String(name).trim(),
    attendance,
    prediction,
    guests: attendance === 'no' ? '0' : String(guests),
  };

  try {
    await appendRsvpNetlify(data);
    await deliverRsvpNotifications(data);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('RSVP failed:', err.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to send RSVP. Please try again later.' }),
    };
  }
}
