const { supabaseAdmin } = require('../config/supabase');

/**
 * Rate-limit middleware for the "one drop per day" rule.
 * Checks whether the authenticated user has already posted a drop
 * within the last 24 hours.
 */
async function dropRateLimit(req, res, next) {
  try {
    const userId = req.user.id;

    // Look for any drop from this user in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: recentDrops, error } = await supabaseAdmin
      .from('drops')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', twentyFourHoursAgo)
      .limit(1);

    if (error) {
      console.error('Rate limit check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Could not verify drop limit',
      });
    }

    if (recentDrops && recentDrops.length > 0) {
      const lastDrop = new Date(recentDrops[0].created_at);
      const nextAllowed = new Date(lastDrop.getTime() + 24 * 60 * 60 * 1000);
      const hoursLeft = Math.ceil((nextAllowed - Date.now()) / (1000 * 60 * 60));

      return res.status(429).json({
        success: false,
        error: "You've used your drop for today. Come back tomorrow.",
        nextDropAvailable: nextAllowed.toISOString(),
        hoursRemaining: hoursLeft,
      });
    }

    next();
  } catch (err) {
    console.error('Rate limit error:', err);
    return res.status(500).json({
      success: false,
      error: 'Rate limit check failed',
    });
  }
}

module.exports = dropRateLimit;
