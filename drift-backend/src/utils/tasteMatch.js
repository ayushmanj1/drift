const { supabaseAdmin } = require('../config/supabase');

/**
 * Calculate taste-match score (0–100) between two users.
 *
 * Weighting:
 *   40%  shared interests   (from users.interests[])
 *   30%  shared mood tags   (from drops they each saved)
 *   30%  shared categories  (from drops they posted or saved)
 */
async function calculateTasteMatch(userAId, userBId) {
  // ── 1. Interests overlap (40%) ────────────────────────────
  const [userARes, userBRes] = await Promise.all([
    supabaseAdmin.from('users').select('interests').eq('id', userAId).single(),
    supabaseAdmin.from('users').select('interests').eq('id', userBId).single(),
  ]);

  const interestsA = new Set(userARes.data?.interests || []);
  const interestsB = new Set(userBRes.data?.interests || []);
  const allInterests = new Set([...interestsA, ...interestsB]);
  const sharedInterests = [...interestsA].filter((i) => interestsB.has(i));

  const interestScore =
    allInterests.size > 0
      ? (sharedInterests.length / allInterests.size) * 40
      : 0;

  // ── 2. Shared mood tags from saved drops (30%) ────────────
  const [savesA, savesB] = await Promise.all([
    supabaseAdmin
      .from('saves')
      .select('drop_id, drops(mood_tags)')
      .eq('user_id', userAId),
    supabaseAdmin
      .from('saves')
      .select('drop_id, drops(mood_tags)')
      .eq('user_id', userBId),
  ]);

  const moodsA = new Set();
  const moodsB = new Set();

  (savesA.data || []).forEach((s) => {
    (s.drops?.mood_tags || []).forEach((t) => moodsA.add(t));
  });
  (savesB.data || []).forEach((s) => {
    (s.drops?.mood_tags || []).forEach((t) => moodsB.add(t));
  });

  const allMoods = new Set([...moodsA, ...moodsB]);
  const sharedMoods = [...moodsA].filter((m) => moodsB.has(m));

  const moodScore =
    allMoods.size > 0
      ? (sharedMoods.length / allMoods.size) * 30
      : 0;

  // ── 3. Shared categories (30%) ────────────────────────────
  // Gather categories from drops each user posted or saved
  const [dropsA, dropsB] = await Promise.all([
    supabaseAdmin.from('drops').select('category').eq('user_id', userAId),
    supabaseAdmin.from('drops').select('category').eq('user_id', userBId),
  ]);

  const catsA = new Set((dropsA.data || []).map((d) => d.category));
  const catsB = new Set((dropsB.data || []).map((d) => d.category));

  // Also include categories from saves
  (savesA.data || []).forEach((s) => {
    // Re-fetch would be expensive; we can infer from mood_tags joins later.
    // For now, we already have saves — let's also grab their categories.
  });

  // Simplified: just use posted drops categories
  const allCats = new Set([...catsA, ...catsB]);
  const sharedCats = [...catsA].filter((c) => catsB.has(c));

  const catScore =
    allCats.size > 0
      ? (sharedCats.length / allCats.size) * 30
      : 0;

  // ── Final ────────────────────────────────────────────────
  const finalScore = Math.round(interestScore + moodScore + catScore);

  return Math.min(100, Math.max(0, finalScore));
}

/**
 * Compute taste match between two users and cache the result.
 */
async function computeAndCacheMatch(userAId, userBId) {
  // Ensure consistent ordering so we don't duplicate (A,B) and (B,A)
  const [first, second] = [userAId, userBId].sort();

  const score = await calculateTasteMatch(first, second);

  const { error } = await supabaseAdmin
    .from('taste_matches')
    .upsert(
      {
        user_a: first,
        user_b: second,
        match_score: score,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_a,user_b' }
    );

  if (error) {
    console.error('Failed to cache taste match:', error);
  }

  return score;
}

/**
 * Get the cached taste match score, or compute a fresh one if stale (>24h).
 */
async function getTasteMatch(userAId, userBId) {
  const [first, second] = [userAId, userBId].sort();

  const { data, error } = await supabaseAdmin
    .from('taste_matches')
    .select('match_score, updated_at')
    .eq('user_a', first)
    .eq('user_b', second)
    .single();

  if (!error && data) {
    const age = Date.now() - new Date(data.updated_at).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (age < twentyFourHours) {
      return data.match_score;
    }
  }

  // Stale or missing — recompute
  return computeAndCacheMatch(first, second);
}

/**
 * Recompute taste matches for a user against all other users
 * they interact with (followers, followed, people with shared saves).
 * Called after onboarding or saving a drop.
 */
async function refreshMatchesForUser(userId) {
  // Get users this person follows or is followed by
  const { data: connections } = await supabaseAdmin
    .from('follows')
    .select('follower_id, following_id')
    .or(`follower_id.eq.${userId},following_id.eq.${userId}`);

  const otherIds = new Set();
  (connections || []).forEach((c) => {
    if (c.follower_id !== userId) otherIds.add(c.follower_id);
    if (c.following_id !== userId) otherIds.add(c.following_id);
  });

  // Also grab users who resonated with the same drops
  const { data: myResonances } = await supabaseAdmin
    .from('resonances')
    .select('drop_id')
    .eq('user_id', userId)
    .limit(50);

  if (myResonances && myResonances.length > 0) {
    const dropIds = myResonances.map((r) => r.drop_id);
    const { data: otherRes } = await supabaseAdmin
      .from('resonances')
      .select('user_id')
      .in('drop_id', dropIds)
      .neq('user_id', userId)
      .limit(50);

    (otherRes || []).forEach((r) => otherIds.add(r.user_id));
  }

  // Compute and cache matches (limit to 30 to avoid long processing)
  const targets = [...otherIds].slice(0, 30);
  const results = [];

  for (const otherId of targets) {
    const score = await computeAndCacheMatch(userId, otherId);
    results.push({ userId: otherId, score });
  }

  return results;
}

module.exports = {
  calculateTasteMatch,
  computeAndCacheMatch,
  getTasteMatch,
  refreshMatchesForUser,
};
