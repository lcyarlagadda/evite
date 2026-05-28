import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  deliverRsvpNotifications,
  hasNotificationConfig,
} from '../lib/rsvp-notify.js';

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

function saveRsvp(data) {
  const entry = { ...data, receivedAt: new Date().toISOString() };
  fs.appendFileSync(rsvpLogPath, `${JSON.stringify(entry)}\n`, 'utf8');
}

app.post('/api/rsvp', async (req, res) => {
  const { name, attendance, prediction, guests } = req.body;

  if (!name || !attendance || !prediction || (attendance !== 'no' && !guests)) {
    return res.status(400).json({ error: 'Please fill in all fields.' });
  }

  if (!hasNotificationConfig()) {
    return res.status(500).json({
      error: 'Notifications are not configured. Set SMTP or NTFY settings on the server.',
    });
  }

  const data = {
    name: String(name).trim(),
    attendance,
    prediction,
    guests: attendance === 'no' ? '0' : String(guests),
  };

  try {
    saveRsvp(data);
    await deliverRsvpNotifications(data);
    res.json({ success: true });
  } catch (err) {
    console.error('RSVP failed:', err.message);
    res.status(500).json({ error: 'Failed to send RSVP. Please try again later.' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    email: Boolean(process.env.RSVP_TO_EMAIL && process.env.SMTP_HOST),
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
