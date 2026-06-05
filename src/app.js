'use strict';

const express = require('express');
const profileRoutes = require('./routes/profiles');

const app = express();

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Optional: expose GitHub rate-limit headers to callers
app.use((req, res, next) => {
  res.set('X-Powered-By', 'github-profile-analyzer');
  next();
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', profileRoutes);

// ── 404 fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'Unexpected server error.' });
});

module.exports = app;
