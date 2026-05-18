const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const auth = require('../middleware/auth');
const { refreshMatchesForUser } = require('../utils/tasteMatch');

// ─── GET /api/taste/matches  (Top taste matches) ────────────
router.get('/matches', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch cached matches where this user is user_a or user_b
    const { data: matchesA } = await supabaseAdmin
      .from('taste_matches')
      .select('user_b, match_score, updated_at')
      .eq('user_a', userId)
      .order('match_score', { ascending: false })
      .limit(10);

    const { data: matchesB } = await supabaseAdmin
      .from('taste_matches')
      .select('user_a, match_score, updated_at')
      .eq('user_b', userId)
      .order('match_score', { ascending: false })
      .limit(10);

    // Merge and deduplicate
    const matchMap = new Map();

    (matchesA || []).forEach((m) => {
      matchMap.set(m.user_b, { userId: m.user_b, score: m.match_score, updated_at: m.updated_at });
    });
    (matchesB || []).forEach((m) => {
      const existing = matchMap.get(m.user_a);
      if (!existing || m.match_score > existing.score) {
        matchMap.set(m.user_a, { userId: m.user_a, score: m.match_score, updated_at: m.updated_at });
      }
    });

    // Sort by score descending, take top 10
    let topMatches = [...matchMap.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // If no cached matches, compute fresh ones
    if (topMatches.length === 0) {
      const freshResults = await refreshMatchesForUser(userId);
      topMatches = freshResults
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((r) => ({ userId: r.userId, score: r.score }));
    }

    // Fetch user details for the matched users
    const matchUserIds = topMatches.map((m) => m.userId);

    let users = [];
    if (matchUserIds.length > 0) {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('id, username, avatar_url, taste_identity')
        .in('id', matchUserIds);

      users = userData || [];
    }

    const userMap = new Map(users.map((u) => [u.id, u]));

    const enrichedMatches = topMatches.map((m) => ({
      user: userMap.get(m.userId) || { id: m.userId },
      match_score: m.score,
    }));

    return res.json({
      success: true,
      data: { matches: enrichedMatches },
    });
  } catch (err) {
    console.error('Taste matches error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load taste matches' });
  }
});

module.exports = router;
