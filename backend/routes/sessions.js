// backend/routes/sessions.js
import express from 'express';
import Session from '../models/Session.js';
import mongoose from 'mongoose';
const router = express.Router();

// POST /api/sessions
// Saves a new session. If overallScore >= 70, appends an aquarium item based on score tier.
router.post('/', async (req, res) => {
  try {
    let sessionData = req.body;
    // Add aquarium item if score >= 70
    if (sessionData.overallScore >= 70) {
      const tier = sessionData.overallScore >= 90 ? 'decor' : sessionData.overallScore >= 80 ? 'coral' : 'fish';
      const items = {
        fish: ['Clownfish', 'Goldfish', 'Blue Tang', 'Angelfish'],
        coral: ['Brain Coral', 'Sea Fan', 'Staghorn Coral'],
        decor: ['Glowing Jellyfish', 'Manta Ray', 'Treasure Chest']
      };
      const pick = arr => arr[Math.floor(Math.random() * arr.length)];
      const newItem = pick(items[tier]);
      if (!sessionData.aquarium) sessionData.aquarium = { fish: [], coral: [], decor: [] };
      sessionData.aquarium[tier].push(newItem);
    }
    const session = await Session.create(sessionData);
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sessions/:userId
// Returns up to 20 most recent sessions for userId
router.get('/:userId', async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sessions/:userId/latest
// Returns the most recent session for userId
router.get('/:userId/latest', async (req, res) => {
  try {
    const session = await Session.findOne({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/aquarium/:userId
// Returns the latest aquarium for userId
router.get('/api/aquarium/:userId', async (req, res) => {
  try {
    const aquarium = await Session.getLatestAquarium(req.params.userId);
    res.json(aquarium);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/baseline/:userId
// Returns the user's personal baseline from last 5 sessions
router.get('/api/baseline/:userId', async (req, res) => {
  try {
    const baseline = await Session.getUserBaseline(req.params.userId);
    res.json(baseline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
