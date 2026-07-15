import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeRsvpEntry } from './rsvp-entry.js';
import { summarizeRsvps } from './rsvp-summary.js';

export { summarizeRsvps };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const defaultDataDir = path.join(__dirname, '..', 'data');
export const defaultRsvpLogPath = path.join(defaultDataDir, 'rsvps.jsonl');

export function ensureDataDir(dataDir = defaultDataDir) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function appendRsvp(data, logPath = defaultRsvpLogPath) {
  ensureDataDir(path.dirname(logPath));
  const entry = {
    ...normalizeRsvpEntry(data),
    receivedAt: new Date().toISOString(),
  };
  fs.appendFileSync(logPath, `${JSON.stringify(entry)}\n`, 'utf8');
  return entry;
}

export function clearRsvps(logPath = defaultRsvpLogPath) {
  ensureDataDir(path.dirname(logPath));
  fs.writeFileSync(logPath, '', 'utf8');
}

export function listRsvps(logPath = defaultRsvpLogPath) {
  if (!fs.existsSync(logPath)) {
    return [];
  }

  return fs
    .readFileSync(logPath, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}
