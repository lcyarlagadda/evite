import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;
const isDev = process.env.NODE_ENV !== 'production';
const dataDir = path.join(__dirname, '..', 'data');
const rsvpLogPath = path.join(dataDir, 'rsvps.jsonl');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (isDev) {
  app.use(cors());
}

app.use(express.json());

const ATTENDANCE_LABELS = {
  yes: 'Joyfully Accepts',
  no: 'Bummer, no',
  maybe: 'Still deciding',
};

const PREDICTION_LABELS = {
  boy: 'Team Boy 💙 (Wear Blue)',
  girl: 'Team Girl 💗 (Wear Pink)',
};

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatRsvpText(data) {
  return [
    'New RSVP — Gender Reveal',
    '',
    `Name: ${data.name}`,
    `Attendance: ${ATTENDANCE_LABELS[data.attendance] || data.attendance}`,
    `Prediction: ${PREDICTION_LABELS[data.prediction] || data.prediction}`,
    `Guests: ${data.guests}`,
    '',
    'June 19 · 6:30 PM · 231 Club house Drive, Delaware, OH 43015',
  ].join('\n');
}

function buildEmailHtml(data) {
  return `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #2c2416;">
      <div style="background: linear-gradient(135deg, #f4b942, #d99a1a); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="margin: 0; color: #2c2416; font-size: 24px;">🐝 New RSVP Received</h1>
        <p style="margin: 8px 0 0; color: #2c2416; opacity: 0.85;">Gender Reveal — Himani & Praneeth</p>
      </div>
      <div style="background: #fdf8ee; padding: 28px; border-radius: 0 0 12px 12px; border: 1px solid #e8dfd0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px 0; font-weight: bold; width: 140px;">Name</td><td style="padding: 10px 0;">${escapeHtml(data.name)}</td></tr>
          <tr><td style="padding: 10px 0; font-weight: bold;">Attendance</td><td style="padding: 10px 0;">${ATTENDANCE_LABELS[data.attendance] || data.attendance}</td></tr>
          <tr><td style="padding: 10px 0; font-weight: bold;">Prediction</td><td style="padding: 10px 0;">${PREDICTION_LABELS[data.prediction] || data.prediction}</td></tr>
          <tr><td style="padding: 10px 0; font-weight: bold;">Guests</td><td style="padding: 10px 0;">${escapeHtml(data.guests)}</td></tr>
        </table>
        <p style="margin-top: 24px; font-size: 13px; color: #6b5d4a; text-align: center;">
          June 19 · 6:30 PM · 231 Club house Drive, Delaware, OH 43015
        </p>
      </div>
    </div>
  `;
}

function saveRsvp(data) {
  const entry = { ...data, receivedAt: new Date().toISOString() };
  fs.appendFileSync(rsvpLogPath, `${JSON.stringify(entry)}\n`, 'utf8');
}

async function sendEmail(data) {
  const toEmail = process.env.RSVP_TO_EMAIL;
  const transporter = createTransporter();

  if (!toEmail || !transporter) {
    return { ok: false, skipped: true };
  }

  await transporter.sendMail({
    from: `"Gender Reveal RSVP" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `RSVP: ${data.name} — ${PREDICTION_LABELS[data.prediction] || data.prediction}`,
    html: buildEmailHtml(data),
    text: formatRsvpText(data),
  });

  return { ok: true };
}

async function sendNtfy(data) {
  const topic = process.env.NTFY_TOPIC;
  const server = (process.env.NTFY_SERVER || 'https://ntfy.sh').replace(/\/$/, '');

  if (!topic) {
    return { ok: false, skipped: true };
  }

  const response = await fetch(`${server}/${encodeURIComponent(topic)}`, {
    method: 'POST',
    headers: {
      Title: `🐝 RSVP: ${data.name}`,
      Tags: 'bee,honeybee',
      Priority: '4',
    },
    body: formatRsvpText(data),
  });

  if (!response.ok) {
    throw new Error(`ntfy notification failed (${response.status})`);
  }

  return { ok: true };
}

function hasNotificationConfig() {
  const hasEmail = process.env.RSVP_TO_EMAIL && createTransporter();
  const hasNtfy = Boolean(process.env.NTFY_TOPIC);
  return hasEmail || hasNtfy;
}

app.post('/api/rsvp', async (req, res) => {
  const { name, attendance, prediction, guests } = req.body;

  if (!name || !attendance || !prediction || !guests) {
    return res.status(400).json({ error: 'Please fill in all fields.' });
  }

  if (!hasNotificationConfig()) {
    return res.status(500).json({
      error: 'Notifications are not configured. Set SMTP or NTFY settings on the server.',
    });
  }

  const data = { name, attendance, prediction, guests };

  try {
    saveRsvp(data);

    const results = await Promise.allSettled([sendEmail(data), sendNtfy(data)]);
    const delivered = results.some(
      (result) => result.status === 'fulfilled' && result.value.ok
    );

    if (!delivered) {
      const errors = results
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason?.message || 'Unknown error');

      console.error('Notification delivery failed:', errors);
      return res.status(500).json({ error: 'Failed to deliver RSVP. Please try again later.' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('RSVP failed:', err.message);
    res.status(500).json({ error: 'Failed to send RSVP. Please try again later.' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    email: Boolean(process.env.RSVP_TO_EMAIL && createTransporter()),
    ntfy: Boolean(process.env.NTFY_TOPIC),
  });
});

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Invite app running on port ${PORT}`);
});
