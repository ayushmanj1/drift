require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── CORS ───────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      // Add your production frontend URL here:
      // 'https://drift-app.vercel.app',
    ],
    credentials: true,
  })
);

// ─── Body parsers ───────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request logging (development) ──────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()}  ${req.method} ${req.path}`);
    next();
  });
}

// ─── Health check ───────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Drift API',
      version: '1.0.0',
      status: 'running',
      message: 'Discover through people, not algorithms.',
    },
  });
});

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'healthy' } });
});

// ─── Routes ─────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/drops', require('./routes/drops'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/taste', require('./routes/taste'));
app.use('/api/mood', require('./routes/mood'));
app.use('/api/map', require('./routes/map'));

// ─── 404 handler ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// ─── Global error handler ───────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Internal server error',
  });
});

// ─── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ✦ Drift API running on http://localhost:${PORT}`);
  console.log(`  ✦ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  ✦ Discover through people, not algorithms.\n`);
});

module.exports = app;
