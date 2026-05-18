const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Validate config
if (!SUPABASE_URL || !SUPABASE_URL.startsWith('http')) {
  console.error(
    '\n  ✖  Missing or invalid SUPABASE_URL in .env\n' +
    '     Go to your Supabase project → Settings → API → Project URL\n' +
    '     and paste it into drift-backend/.env\n'
  );
  process.exit(1);
}
if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'your_supabase_anon_key') {
  console.error(
    '\n  ✖  Missing SUPABASE_ANON_KEY in .env\n' +
    '     Go to your Supabase project → Settings → API → anon public key\n'
  );
  process.exit(1);
}
if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY === 'your_supabase_service_role_key') {
  console.error(
    '\n  ✖  Missing SUPABASE_SERVICE_KEY in .env\n' +
    '     Go to your Supabase project → Settings → API → service_role secret key\n'
  );
  process.exit(1);
}

// Public client — respects RLS, used for auth operations
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Service-role client — bypasses RLS, used for admin/server operations
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

module.exports = { supabase, supabaseAdmin };
