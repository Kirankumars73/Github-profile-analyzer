'use strict';

const githubService = require('../services/githubService');
const profileModel = require('../models/profileModel');
const pool = require('../config/db');

const ONE_HOUR = 60 * 60 * 1000;

// ─── POST /api/analyze/:username ────────────────────────────────────────────

async function analyzeUser(req, res) {
  const { username } = req.params;

  try {
    // 1. Check cache — if analyzed within last hour, return stored data
    const existing = await profileModel.findByUsername(username);
    if (existing && Date.now() - new Date(existing.analyzed_at) < ONE_HOUR) {
      return res.json(existing);
    }

    // 2. Fetch fresh data from GitHub + compute insights
    const profile = await githubService.analyzeProfile(username);

    // 3. Persist
    await profileModel.upsert(profile);

    // 4. Return the freshly persisted row
    const saved = await profileModel.findByUsername(username);
    return res.json(saved);
  } catch (err) {
    // GitHub 404 → user not found
    if (err.response?.status === 404) {
      return res.status(404).json({ error: `GitHub user '${username}' not found.` });
    }

    // GitHub 429 → rate limited
    if (err.response?.status === 429 || err.response?.status === 403) {
      const retryAfter = err.response.headers['retry-after'] || 60;
      res.set('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'GitHub API rate limit exceeded.',
        retryAfter,
      });
    }

    console.error('[analyzeUser]', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// ─── GET /api/profiles ──────────────────────────────────────────────────────

async function listProfiles(req, res) {
  try {
    let limit = parseInt(req.query.limit) || 20;
    let offset = parseInt(req.query.offset) || 0;

    // Clamp limit to [1, 100]
    limit = Math.min(Math.max(limit, 1), 100);
    offset = Math.max(offset, 0);

    const profiles = await profileModel.listAll(limit, offset);
    return res.json(profiles);
  } catch (err) {
    console.error('[listProfiles]', err.message);
    return res.status(503).json({ error: 'Database unreachable.' });
  }
}

// ─── GET /api/profiles/:username ────────────────────────────────────────────

async function getProfile(req, res) {
  const { username } = req.params;

  try {
    const profile = await profileModel.findByUsername(username);
    if (!profile) {
      return res.status(404).json({
        error: `Profile '${username}' has not been analyzed yet. POST /api/analyze/${username} first.`,
      });
    }
    return res.json(profile);
  } catch (err) {
    console.error('[getProfile]', err.message);
    return res.status(503).json({ error: 'Database unreachable.' });
  }
}

// ─── DELETE /api/profiles/:username ─────────────────────────────────────────

async function deleteProfile(req, res) {
  const { username } = req.params;

  try {
    const deleted = await profileModel.deleteByUsername(username);
    if (!deleted) {
      return res.status(404).json({ error: `Profile '${username}' not found.` });
    }
    return res.json({ message: 'Profile deleted.' });
  } catch (err) {
    console.error('[deleteProfile]', err.message);
    return res.status(503).json({ error: 'Database unreachable.' });
  }
}

// ─── GET /api/health ─────────────────────────────────────────────────────────

async function healthCheck(req, res) {
  let dbStatus = 'disconnected';

  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    dbStatus = 'connected';
  } catch (_) {
    // DB down — still return 200 with status info
  }

  return res.json({
    status: 'ok',
    db: dbStatus,
    uptime: Math.floor(process.uptime()),
  });
}

module.exports = {
  analyzeUser,
  listProfiles,
  getProfile,
  deleteProfile,
  healthCheck,
};
