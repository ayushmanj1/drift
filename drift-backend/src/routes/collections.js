const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const auth = require('../middleware/auth');

// ─── GET /api/collections  (All collections for current user) ─
router.get('/', auth, async (req, res) => {
  try {
    const { data: collections, error } = await supabaseAdmin
      .from('collections')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to fetch collections' });
    }

    return res.json({
      success: true,
      data: { collections: collections || [] },
    });
  } catch (err) {
    console.error('Get collections error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch collections' });
  }
});

// ─── POST /api/collections  (Create collection) ────────────
router.post('/', auth, async (req, res) => {
  try {
    const { name, cover_image_url } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Collection name is required' });
    }

    const { data: collection, error } = await supabaseAdmin
      .from('collections')
      .insert({
        user_id: req.user.id,
        name,
        cover_image_url: cover_image_url || '',
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to create collection' });
    }

    return res.status(201).json({
      success: true,
      data: { collection },
    });
  } catch (err) {
    console.error('Create collection error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create collection' });
  }
});

// ─── GET /api/collections/:id  (Collection with drops) ─────
router.get('/:id', async (req, res) => {
  try {
    // Fetch the collection
    const { data: collection, error: colError } = await supabaseAdmin
      .from('collections')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (colError || !collection) {
      return res.status(404).json({ success: false, error: 'Collection not found' });
    }

    // Fetch drops in this collection
    const { data: dropJoins, error: dropsError } = await supabaseAdmin
      .from('collection_drops')
      .select(`
        added_at,
        drops:drop_id(*, users:user_id(id, username, avatar_url))
      `)
      .eq('collection_id', req.params.id)
      .order('added_at', { ascending: false });

    if (dropsError) {
      console.error('Collection drops error:', dropsError);
    }

    const drops = (dropJoins || []).map((j) => ({
      ...j.drops,
      added_at: j.added_at,
    }));

    return res.json({
      success: true,
      data: { collection, drops },
    });
  } catch (err) {
    console.error('Get collection error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch collection' });
  }
});

// ─── POST /api/collections/:id/drops  (Add drop to collection) ─
router.post('/:id/drops', auth, async (req, res) => {
  try {
    const { drop_id } = req.body;

    if (!drop_id) {
      return res.status(400).json({ success: false, error: 'drop_id is required' });
    }

    // Verify the collection belongs to the user
    const { data: collection } = await supabaseAdmin
      .from('collections')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    if (!collection || collection.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not your collection' });
    }

    const { error } = await supabaseAdmin
      .from('collection_drops')
      .insert({
        collection_id: req.params.id,
        drop_id,
      });

    if (error) {
      // Might be a duplicate
      if (error.code === '23505') {
        return res.status(409).json({ success: false, error: 'Drop already in this collection' });
      }
      return res.status(500).json({ success: false, error: 'Failed to add drop' });
    }

    return res.json({
      success: true,
      data: { message: 'Drop added to collection' },
    });
  } catch (err) {
    console.error('Add to collection error:', err);
    return res.status(500).json({ success: false, error: 'Failed to add drop to collection' });
  }
});

// ─── DELETE /api/collections/:id/drops/:dropId ──────────────
router.delete('/:id/drops/:dropId', auth, async (req, res) => {
  try {
    // Verify ownership
    const { data: collection } = await supabaseAdmin
      .from('collections')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    if (!collection || collection.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not your collection' });
    }

    const { error } = await supabaseAdmin
      .from('collection_drops')
      .delete()
      .eq('collection_id', req.params.id)
      .eq('drop_id', req.params.dropId);

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to remove drop' });
    }

    return res.json({
      success: true,
      data: { message: 'Drop removed from collection' },
    });
  } catch (err) {
    console.error('Remove from collection error:', err);
    return res.status(500).json({ success: false, error: 'Failed to remove drop' });
  }
});

// ─── DELETE /api/collections/:id  (Delete entire collection) ─
router.delete('/:id', auth, async (req, res) => {
  try {
    const { data: collection } = await supabaseAdmin
      .from('collections')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    if (!collection || collection.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not your collection' });
    }

    const { error } = await supabaseAdmin
      .from('collections')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to delete collection' });
    }

    return res.json({
      success: true,
      data: { message: 'Collection deleted' },
    });
  } catch (err) {
    console.error('Delete collection error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete collection' });
  }
});

module.exports = router;
