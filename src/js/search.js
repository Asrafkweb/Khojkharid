// Search helper shared by the products page. Plain text matching, no libraries.
(function () {
  // Lowercase, collapse repeated spaces, trim the ends.
  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  // Every word typed must appear somewhere in the product's searchable text.
  function matches(haystack, query) {
    const words = normalize(query).split(' ').filter(Boolean);
    return words.every((word) => haystack.includes(word));
  }

  window.KKSearch = { normalize, matches };
})();
