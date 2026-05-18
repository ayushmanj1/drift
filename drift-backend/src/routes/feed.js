const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const auth = require('../middleware/auth');

// ─── GET /api/feed  (Personalised home feed) ────────────────
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const offset = (page - 1) * limit;
    const { category, mood } = req.query;

    // Get list of users this person follows
    const { data: followRows } = await supabaseAdmin
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    const followingIds = (followRows || []).map((f) => f.following_id);
    const hasFollowing = followingIds.length > 0;

    // Build query
    let query = supabaseAdmin
      .from('drops')
      .select(`*, users:user_id(id, username, avatar_url)`, { count: 'exact' });

    // If user follows people, show their drops; otherwise show popular globally
    if (hasFollowing) {
      query = query.in('user_id', followingIds);
    }

    // Optional filters
    if (category) {
      query = query.eq('category', category);
    }
    if (mood) {
      query = query.contains('mood_tags', [mood]);
    }

    // Sort: followed users → chronological; global → by resonance then date
    if (hasFollowing) {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query
        .order('resonance_count', { ascending: false })
        .order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data: drops, error, count } = await query;

    if (error) {
      console.error('Feed query error:', error);
      return res.status(500).json({ success: false, error: 'Failed to load feed' });
    }

    return res.json({
      success: true,
      data: {
        drops: drops || [],
        page,
        hasMore: offset + limit < (count || 0),
      },
    });
  } catch (err) {
    console.error('Feed error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load feed' });
  }
});

// ─── GET /api/feed/explore  (Global explore feed) ───────────
router.get('/explore', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const offset = (page - 1) * limit;
    const { category, mood } = req.query;

    let query = supabaseAdmin
      .from('drops')
      .select(`*, users:user_id(id, username, avatar_url)`, { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }
    if (mood) {
      query = query.contains('mood_tags', [mood]);
    }

    query = query
      .order('resonance_count', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: drops, error, count } = await query;

    if (error) {
      console.error('Explore query error:', error);
      return res.status(500).json({ success: false, error: 'Failed to load explore feed' });
    }

    return res.json({
      success: true,
      data: {
        drops: drops || [],
        page,
        hasMore: offset + limit < (count || 0),
      },
    });
  } catch (err) {
    console.error('Explore error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load explore feed' });
  }
});

module.exports = router;
