import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const DATA_DIR = path.join(process.cwd(), 'data');
const APARTMENTS_FILE = path.join(DATA_DIR, 'apartments.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(APARTMENTS_FILE)) {
  fs.writeFileSync(APARTMENTS_FILE, '[]', 'utf-8');
}

function readApartments(): any[] {
  try {
    if (fs.existsSync(APARTMENTS_FILE)) {
      const data = fs.readFileSync(APARTMENTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading apartments file:', err);
  }
  return [];
}

function writeApartments(apartments: any[]): void {
  try {
    fs.writeFileSync(APARTMENTS_FILE, JSON.stringify(apartments, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing apartments file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 images from uploaded PDFs and ZIPs
  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ extended: true, limit: '60mb' }));

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get all published apartments
  app.get('/api/apartments', (_req, res) => {
    const apts = readApartments();
    res.json(apts);
  });

  // Add or update an apartment
  app.post('/api/apartments', (req, res) => {
    const newApt = req.body;
    if (!newApt || !newApt.id) {
      return res.status(400).json({ error: 'Valid apartment object with id is required' });
    }
    const current = readApartments();
    const updated = [newApt, ...current.filter((a: any) => a.id !== newApt.id)];
    writeApartments(updated);
    res.json({ success: true, count: updated.length, apartment: newApt });
  });

  // Batch sync apartments from client (e.g. from admin browser upload)
  app.post('/api/apartments/sync', (req, res) => {
    const incoming = req.body.apartments;
    if (!Array.isArray(incoming)) {
      return res.status(400).json({ error: 'Expected apartments array' });
    }

    const current = readApartments();
    const map = new Map();
    // Exclude any fake mock IDs if they somehow arrive
    const fakeIds = new Set(['apt-catalog-1', 'apt-catalog-2', 'apt-catalog-3']);
    
    current.forEach((a: any) => {
      if (!fakeIds.has(a.id)) map.set(a.id, a);
    });
    incoming.forEach((a: any) => {
      if (a && a.id && !fakeIds.has(a.id)) {
        map.set(a.id, a);
      }
    });

    const merged = Array.from(map.values());
    writeApartments(merged);
    res.json({ success: true, count: merged.length, apartments: merged });
  });

  // Delete an apartment by ID
  app.delete('/api/apartments/:id', (req, res) => {
    const { id } = req.params;
    const current = readApartments();
    const updated = current.filter((a: any) => a.id !== id);
    writeApartments(updated);
    res.json({ success: true, count: updated.length });
  });

  // Clear all apartments from database
  app.delete('/api/apartments', (_req, res) => {
    writeApartments([]);
    res.json({ success: true, count: 0 });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rentch server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
