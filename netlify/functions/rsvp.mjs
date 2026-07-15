import { appendRsvpToStore } from '../../lib/netlify-store.js';
import { normalizeRsvpEntry } from '../../lib/rsvp-entry.js';
import { hasEmailConfig, sendEmail, sendNtfy } from '../../lib/rsvp-notify.js';

const json = (body, status = 200) =>
  Response.json(body, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export default async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  if (!hasEmailConfig()) {
    return json(
      {
        error:
          'Email is not set up on Netlify. Add RSVP_TO_EMAIL, SMTP_HOST, SMTP_USER, and SMTP_PASS in Site settings → Environment variables.',
      },
      500
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const { name, attendance, prediction, adults, kids } = body;

  if (
    !name ||
    !attendance ||
    !prediction ||
    (attendance !== 'no' && (adults == null || kids == null))
  ) {
    return json({ error: 'Please fill in all fields.' }, 400);
  }

  const data = normalizeRsvpEntry({ name, attendance, prediction, adults, kids });

  try {
    await appendRsvpToStore(data);

    const emailResult = await sendEmail(data);
    if (!emailResult.ok) {
      throw new Error('Could not send RSVP email. Check SMTP settings in Netlify.');
    }

    try {
      await sendNtfy(data);
    } catch (ntfyErr) {
      console.error('ntfy skipped:', ntfyErr.message);
    }

    return json({ success: true });
  } catch (err) {
    console.error('RSVP failed:', err.message);
    return json(
      { error: err.message || 'Failed to send RSVP. Please try again later.' },
      500
    );
  }
};

export const config = {
  path: '/api/rsvp',
};
