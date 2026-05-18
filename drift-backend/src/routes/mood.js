const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

// Valid moods for the mood search screen
const VALID_MOODS = [
  'lonely', 'romantic', 'chaotic', 'productive', 'dreamy',
  'rainy-night', 'existential', 'restless', 'in-love', 'numb',
  'nostalgic', 'wandering',
];

// ─── GET /api/mood/:mood ────────────────────────────────────
router.get('/:mood', async (req, res) => {
  try {
    const { mood } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const offset = (page - 1) * limit;

    // Validate mood
    if (!VALID_MOODS.includes(mood)) {
      return res.status(400).json({
        success: false,
        error: `Invalid mood. Valid options: ${VALID_MOODS.join(', ')}`,
      });
    }

    const { data: drops, error, count } = await supabaseAdmin
      .from('drops')
      .select(`*, users:user_id(id, username, avatar_url)`, { count: 'exact' })
      .contains('mood_tags', [mood])
      .order('resonance_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Mood query error:', error);
      return res.status(500).json({ success: false, error: 'Failed to search by mood' });
    }

    return res.json({
      success: true,
      data: {
        mood,
        drops: drops || [],
        page,
        hasMore: offset + limit < (count || 0),
      },
    });
  } catch (err) {
    console.error('Mood search error:', err);
    return res.status(500).json({ success: false, error: 'Failed to search by mood' });
  }
});

// ─── GET /api/mood  (List available moods) ──────────────────
router.get('/', async (_req, res) => {
  return res.json({
    success: true,
    data: { moods: VALID_MOODS },
  });
});

module.exports = router;
