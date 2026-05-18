const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');

const BUCKET = 'drift-media';
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Upload an image buffer to Supabase Storage.
 *
 * @param {Buffer}  fileBuffer   The raw file bytes (from multer)
 * @param {string}  mimetype     e.g. "image/jpeg"
 * @param {string}  originalName Original filename
 * @param {string}  userId       Owner's user id (used in the path)
 * @returns {{ url: string }}    Public URL of the uploaded file
 */
async function uploadImage(fileBuffer, mimetype, originalName, userId) {
  // Validate type
  if (!ALLOWED_TYPES.includes(mimetype)) {
    throw new Error(`Unsupported file type: ${mimetype}. Allowed: jpg, png, webp`);
  }

  // Validate size
  if (fileBuffer.length > MAX_SIZE) {
    throw new Error(`File too large. Maximum size is 5 MB`);
  }

  // Build a unique storage path
  const ext = path.extname(originalName) || '.jpg';
  const filename = `${userId}_${Date.now()}_${uuidv4().slice(0, 8)}${ext}`;
  const storagePath = `drops/${filename}`;

  // Upload to Supabase Storage
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return { url: urlData.publicUrl };
}

module.exports = { uploadImage, ALLOWED_TYPES, MAX_SIZE };
