// Escape any text before placing it inside HTML. Always use this for CSV values.
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Only allow https links (used later for affiliate and image URLs).
function isSafeHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = { escapeHtml, isSafeHttpsUrl };
