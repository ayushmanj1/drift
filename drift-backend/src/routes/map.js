const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

// ─── GET /api/map/drops  (Location-based discovery) ─────────
router.get('/drops', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 10; // km
    const { category } = req.query;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: 'lat and lng query parameters are required',
      });
    }

    // Fetch all drops with location data
    // We'll filter by approximate bounding box first (for performance),
    // then precise haversine distance in JS.
    //
    // Rough degree offsets for the bounding box:
    //   1 degree latitude  ≈ 111 km
    //   1 degree longitude ≈ 111 km * cos(lat)
    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));

    let query = supabaseAdmin
      .from('drops')
      .select(`*, users:user_id(id, username, avatar_url)`)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .gte('latitude', lat - latDelta)
      .lte('latitude', lat + latDelta)
      .gte('longitude', lng - lngDelta)
      .lte('longitude', lng + lngDelta);

    if (category) {
      query = query.eq('category', category);
    }

    query = query.limit(100);

    const { data: drops, error } = await query;

    if (error) {
      console.error('Map query error:', error);
      return res.status(500).json({ success: false, error: 'Failed to load map drops' });
    }

    // Precise haversine filter
    const filtered = (drops || []).filter((drop) => {
      const dist = haversine(lat, lng, drop.latitude, drop.longitude);
      drop._distance_km = Math.round(dist * 10) / 10;
      return dist <= radius;
    });

    // Sort by distance
    filtered.sort((a, b) => a._distance_km - b._distance_km);

    return res.json({
      success: true,
      data: {
        drops: filtered.map((d) => ({
          id: d.id,
          title: d.title,
          caption: d.caption,
          image_url: d.image_url,
          location: d.location,
          latitude: d.latitude,
          longitude: d.longitude,
          category: d.category,
          mood_tags: d.mood_tags,
          resonance_count: d.resonance_count,
          user: d.users,
          distance_km: d._distance_km,
        })),
        center: { lat, lng },
        radius,
      },
    });
  } catch (err) {
    console.error('Map error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load map data' });
  }
});

/**
 * Haversine formula — distance in km between two lat/lng points.
 */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

module.exports = router;
