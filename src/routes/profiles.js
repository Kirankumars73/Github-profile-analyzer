'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/profileController');

const router = Router();

// Analyze (or return cached) a GitHub user profile
// POST /api/analyze/:username
router.post('/analyze/:username', ctrl.analyzeUser);

// List all stored profiles (paginated)
// GET /api/profiles?limit=20&offset=0
router.get('/profiles', ctrl.listProfiles);

// Get one stored profile
// GET /api/profiles/:username
router.get('/profiles/:username', ctrl.getProfile);

// Delete a stored profile
// DELETE /api/profiles/:username
router.delete('/profiles/:username', ctrl.deleteProfile);

// Health check
// GET /api/health
router.get('/health', ctrl.healthCheck);

module.exports = router;
