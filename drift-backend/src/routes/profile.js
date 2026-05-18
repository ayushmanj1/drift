const express = require('express');
const router = express.Router();
const multer = require('multer');
const { supabaseAdmin } = require('../config/supabase');
const auth = require('../middleware/auth');
const { uploadImage } = require('../utils/upload');
const { getTasteMatch } = require('../utils/tasteMatch');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// ─── GET /api/profile/:username ─────────────────────────────
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const offset = (page - 1) * limit;

    // Fetch user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Fetch their drops (paginated)
    const { data: drops, count: dropCount } = await supabaseAdmin
      .from('drops')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Fetch their public collections
    const { data: collections } = await supabaseAdmin
      .from('collections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Total resonances received across all their drops
    const { data: allDrops } = await supabaseAdmin
      .from('drops')
      .select('resonance_count')
      .eq('user_id', user.id);

    const totalResonances = (allDrops || []).reduce(
      (sum, d) => sum + (d.resonance_count || 0),
      0
    );

    // Taste match with current viewer (if logged in)
    let tasteMatch = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const { data: { user: viewer } } = await supabaseAdmin.auth.getUser(token);
        if (viewer && viewer.id !== user.id) {
          tasteMatch = await getTasteMatch(viewer.id, user.id);
        }
      } catch {
        // Viewer not authenticated — skip taste match
      }
    }

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          taste_identity: user.taste_identity,
          interests: user.interests,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
        },
        drops: drops || [],
        dropsPage: page,
        dropsHasMore: offset + limit < (dropCount || 0),
        collections: collections || [],
        totalResonances,
        tasteMatch,
      },
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load profile' });
  }
});

// ─── PATCH /api/profile  (Update own profile) ───────────────
router.patch('/', auth, upload.single('avatar'), async (req, res) => {
  try {
    const updates = {};

    if (req.body.taste_identity !== undefined) {
      updates.taste_identity = req.body.taste_identity;
    }

    if (req.body.username) {
      // Check uniqueness
      const { data: existing } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', req.body.username)
        .neq('id', req.user.id)
        .single();

      if (existing) {
        return res.status(409).json({ success: false, error: 'Username already taken' });
      }
      updates.username = req.body.username;
    }

    // Avatar upload
    if (req.file) {
      const result = await uploadImage(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname,
        req.user.id
      );
      updates.avatar_url = result.url;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to update profile' });
    }

    return res.json({
      success: true,
      data: { user },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to update profile' });
  }
});

module.exports = router;
