import { defineConfig } from 'vite';
import { clearRsvps, listRsvps, summarizeRsvps } from './lib/rsvp-store.js';

function guestListDevApi() {
  return {
    name: 'guest-list-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/guests', (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'DELETE') {
          next();
          return;
        }

        try {
          res.setHeader('Content-Type', 'application/json');

          if (req.method === 'DELETE') {
            clearRsvps();
            res.end(JSON.stringify({ success: true }));
            return;
          }

          const guests = listRsvps();
          res.end(
            JSON.stringify({
              guests,
              summary: summarizeRsvps(guests),
            })
          );
        } catch (err) {
          console.error('Guest list dev API:', err.message);
          next();
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [guestListDevApi()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        guests: 'guests.html',
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass(req) {
          if (req.url?.startsWith('/api/guests')) {
            return false;
          }
        },
      },
    },
  },
});
