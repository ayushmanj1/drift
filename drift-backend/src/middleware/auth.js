const { supabaseAdmin } = require('../config/supabase');

/**
 * JWT verification middleware.
 * Expects header:  Authorization: Bearer <supabase-access-token>
 *
 * Verifies the token with Supabase Auth, then attaches req.user with
 * the authenticated user's id pulled from our users table.
 */
async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid Authorization header',
      });
    }

    const token = header.split(' ')[1];

    // Verify the token with Supabase Auth
    const { data: { user: authUser }, error: authError } =
      await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Fetch the corresponding row from our users table
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (dbError || !dbUser) {
      // Auth user exists but no row in users table yet — still allow
      // through so the signup/onboarding flow can create the row.
      req.user = {
        id: authUser.id,
        email: authUser.email,
      };
    } else {
      req.user = dbUser;
    }

    req.token = token;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}

module.exports = auth;
