const express = require('express');
const router = express.Router();
const multer = require('multer');
const { supabaseAdmin } = require('../config/supabase');
const auth = require('../middleware/auth');
const dropRateLimit = require('../middleware/rateLimit');
const { uploadImage } = require('../utils/upload');
const { refreshMatchesForUser } = require('../utils/tasteMatch');

// Multer — store files in memory so we can forward the buffer to Supabase
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// ─── POST /api/drops  (Create a drop — 1/day limit) ────────
router.post('/', auth, dropRateLimit, upload.single('image'), async (req, res) => {
  try {
    const { title, caption, location, latitude, longitude, category, mood_tags } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required',
      });
    }

    // Upload image if provided
    let imageUrl = '';
    if (req.file) {
      const result = await uploadImage(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname,
        req.user.id
      );
      imageUrl = result.url;
    }

    // Parse mood_tags — may arrive as JSON string or array
    let tags = [];
    if (mood_tags) {
      tags = typeof mood_tags === 'string' ? JSON.parse(mood_tags) : mood_tags;
    }

    const { data: drop, error } = await supabaseAdmin
      .from('drops')
      .insert({
        user_id: req.user.id,
        title,
        caption: caption || '',
        image_url: imageUrl,
        location: location || '',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        category: category || 'place',
        mood_tags: tags,
      })
      .select(`*, users:user_id(id, username, avatar_url)`)
      .single();

    if (error) {
      console.error('Create drop error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create drop',
      });
    }

    return res.status(201).json({
      success: true,
      data: { drop },
    });
  } catch (err) {
    console.error('Create drop error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to create drop',
    });
  }
});

// ─── GET /api/drops/:id  (Get single drop) ─────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data: drop, error } = await supabaseAdmin
      .from('drops')
      .select(`*, users:user_id(id, username, avatar_url)`)
      .eq('id', req.params.id)
      .single();

    if (error || !drop) {
      return res.status(404).json({
        success: false,
        error: 'Drop not found',
      });
    }

    return res.json({
      success: true,
      data: { drop },
    });
  } catch (err) {
    console.error('Get drop error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch drop',
    });
  }
});

// ─── DELETE /api/drops/:id ──────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    // Verify ownership
    const { data: drop } = await supabaseAdmin
      .from('drops')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    if (!drop) {
      return res.status(404).json({ success: false, error: 'Drop not found' });
    }

    if (drop.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only delete your own drops' });
    }

    const { error } = await supabaseAdmin
      .from('drops')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to delete drop' });
    }

    return res.json({ success: true, data: { message: 'Drop deleted' } });
  } catch (err) {
    console.error('Delete drop error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete drop' });
  }
});

// ─── POST /api/drops/:id/resonate  (toggle resonance) ──────
router.post('/:id/resonate', auth, async (req, res) => {
  try {
    const dropId = req.params.id;
    const userId = req.user.id;

    // Check if resonance already exists
    const { data: existing } = await supabaseAdmin
      .from('resonances')
      .select('id')
      .eq('user_id', userId)
      .eq('drop_id', dropId)
      .single();

    if (existing) {
      // Remove resonance
      await supabaseAdmin.from('resonances').delete().eq('id', existing.id);

      // Decrement count
      await supabaseAdmin.rpc('', {}).catch(() => {}); // fallback below
      const { data: drop } = await supabaseAdmin
        .from('drops')
        .select('resonance_count')
        .eq('id', dropId)
        .single();

      const newCount = Math.max(0, (drop?.resonance_count || 1) - 1);
      await supabaseAdmin
        .from('drops')
        .update({ resonance_count: newCount })
        .eq('id', dropId);

      return res.json({
        success: true,
        data: { resonated: false, count: newCount },
      });
    } else {
      // Add resonance
      const { error } = await supabaseAdmin
        .from('resonances')
        .insert({ user_id: userId, drop_id: dropId });

      if (error) {
        return res.status(500).json({ success: false, error: 'Failed to resonate' });
      }

      // Increment count
      const { data: drop } = await supabaseAdmin
        .from('drops')
        .select('resonance_count')
        .eq('id', dropId)
        .single();

      const newCount = (drop?.resonance_count || 0) + 1;
      await supabaseAdmin
        .from('drops')
        .update({ resonance_count: newCount })
        .eq('id', dropId);

      return res.json({
        success: true,
        data: { resonated: true, count: newCount },
      });
    }
  } catch (err) {
    console.error('Resonate error:', err);
    return res.status(500).json({ success: false, error: 'Failed to toggle resonance' });
  }
});

// ─── POST /api/drops/:id/save  (toggle save) ───────────────
router.post('/:id/save', auth, async (req, res) => {
  try {
    const dropId = req.params.id;
    const userId = req.user.id;

    const { data: existing } = await supabaseAdmin
      .from('saves')
      .select('id')
      .eq('user_id', userId)
      .eq('drop_id', dropId)
      .single();

    if (existing) {
      await supabaseAdmin.from('saves').delete().eq('id', existing.id);
      return res.json({ success: true, data: { saved: false } });
    } else {
      const { error } = await supabaseAdmin
        .from('saves')
        .insert({ user_id: userId, drop_id: dropId });

      if (error) {
        return res.status(500).json({ success: false, error: 'Failed to save drop' });
      }

      // Refresh taste matches in the background after a save
      refreshMatchesForUser(userId).catch((err) =>
        console.error('Background taste match error:', err)
      );

      return res.json({ success: true, data: { saved: true } });
    }
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).json({ success: false, error: 'Failed to toggle save' });
  }
});

module.exports = router;
