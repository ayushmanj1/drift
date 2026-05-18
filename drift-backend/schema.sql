-- ============================================================
-- DRIFT — Supabase Database Schema
-- Run this in the Supabase SQL Editor to create all tables
-- ============================================================

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  taste_identity TEXT DEFAULT '',
  interests     TEXT[] DEFAULT '{}',
  avatar_url    TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DROPS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drops (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  caption         TEXT DEFAULT '',
  image_url       TEXT DEFAULT '',
  location        TEXT DEFAULT '',
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  category        TEXT DEFAULT 'place'
                  CHECK (category IN ('café','music','film','book','place','internet')),
  mood_tags       TEXT[] DEFAULT '{}',
  resonance_count INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drops_user      ON drops(user_id);
CREATE INDEX IF NOT EXISTS idx_drops_category   ON drops(category);
CREATE INDEX IF NOT EXISTS idx_drops_created    ON drops(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drops_location   ON drops(latitude, longitude);

-- ─── RESONANCES (replaces "likes") ──────────────────────────
CREATE TABLE IF NOT EXISTS resonances (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  drop_id   UUID NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, drop_id)
);

-- ─── SAVES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saves (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  drop_id   UUID NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, drop_id)
);

-- ─── COLLECTIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collections (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  cover_image_url TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── COLLECTION ↔ DROP  junction ─────────────────────────────
CREATE TABLE IF NOT EXISTS collection_drops (
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  drop_id       UUID NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  added_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, drop_id)
);

-- ─── FOLLOWS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  follower_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

-- ─── TASTE MATCHES (cached scores) ──────────────────────────
CREATE TABLE IF NOT EXISTS taste_matches (
  user_a      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_a, user_b)
);

-- ─── HELPER: get distance in km between two lat/lng points ──
CREATE OR REPLACE FUNCTION haversine_km(
  lat1 DOUBLE PRECISION, lng1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION, lng2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
  SELECT 6371 * ACOS(
    LEAST(1.0,
      COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
      COS(RADIANS(lng2) - RADIANS(lng1)) +
      SIN(RADIANS(lat1)) * SIN(RADIANS(lat2))
    )
  );
$$ LANGUAGE SQL IMMUTABLE;
