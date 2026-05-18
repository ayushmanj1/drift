const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');
const auth = require('../middleware/auth');
const { refreshMatchesForUser } = require('../utils/tasteMatch');

// ─── POST /api/auth/signup ──────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and username are required',
      });
    }

    // Check if username or email is already taken
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, username, email')
      .or(`username.eq.${username},email.eq.${email}`)
      .limit(1)
      .single();

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ success: false, error: 'Username is already taken' });
      }
      if (existingUser.email === email) {
        return res.status(409).json({ success: false, error: 'Email is already registered. Please sign in instead.' });
      }
    }



    // Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        error: authError.message,
      });
    }

    const authUser = authData.user;

    // Create the user row in our users table
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.id,
        email,
        username,
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB user creation error:', dbError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create user profile',
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        user: dbUser,
        session: authData.session,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({
      success: false,
      error: 'Signup failed',
    });
  }
});

// ─── POST /api/auth/login ───────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: error.message,
      });
    }

    // Fetch user profile from our table
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return res.json({
      success: true,
      data: {
        user: dbUser || data.user,
        session: data.session,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
});

// ─── POST /api/auth/onboarding ──────────────────────────────
router.post('/onboarding', auth, async (req, res) => {
  try {
    const { interests, taste_identity } = req.body;

    if (!interests || !Array.isArray(interests)) {
      return res.status(400).json({
        success: false,
        error: 'interests must be an array',
      });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({
        interests,
        taste_identity: taste_identity || '',
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile',
      });
    }

    // Kick off taste-match computation in background (non-blocking)
    refreshMatchesForUser(req.user.id).catch((err) =>
      console.error('Background taste match error:', err)
    );

    return res.json({
      success: true,
      data: { user },
    });
  } catch (err) {
    console.error('Onboarding error:', err);
    return res.status(500).json({
      success: false,
      error: 'Onboarding failed',
    });
  }
});

// ─── GET /api/auth/me ───────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.json({
      success: true,
      data: { user },
    });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
    });
  }
});

module.exports = router;
