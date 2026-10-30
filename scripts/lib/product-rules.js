// Validation and normalisation of product rows.
// Only rows with status=published are fully checked and ever become public.
const { isSafeHttpsUrl } = require('./html-utils');

const PRODUCT_HEADERS = [
  'id', 'name', 'slug', 'category', 'brand', 'model', 'price', 'currency', 'seller',
  'affiliate_url', 'image_url', 'short_description', 'full_description', 'features',
  'specifications', 'seo_title', 'meta_description', 'primary_keyword',
  'secondary_keywords', 'canonical_url', 'availability', 'last_updated', 'status'
];
const STATUSES = ['draft', 'published', 'archived'];
const AVAILABILITY = ['in_stock', 'out_of_stock'];

function slugify(text) {
  return text.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function isValidDate(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const date = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text;
}

function truncate(text, max) {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

// Conventions: features separated by "|", specifications as "Label: Value" separated by "|".
function splitList(text) { return text.split('|').map((item) => item.trim()).filter(Boolean); }
function parseSpecs(text) {
  return splitList(text).map((pair) => {
    const colon = pair.indexOf(':');
    return colon === -1
      ? { label: pair, value: '' }
      : { label: pair.slice(0, colon).trim(), value: pair.slice(colon + 1).trim() };
  });
}

// Problems that stop a published row from going live.
function findRowProblems(raw, options) {
  const problems = [];
  const need = (field) => { if (!raw[field]) problems.push(`${field} is required`); };
  ['id', 'name', 'slug', 'category', 'short_description', 'full_description'].forEach(need);

  if (raw.id && !/^[A-Za-z0-9_-]+$/.test(raw.id)) problems.push('id may only use letters, numbers, - and _');
  if (raw.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw.slug)) problems.push('slug must be lowercase letters, numbers and single hyphens');

  if (!/^\d+(\.\d{1,2})?$/.test(raw.price) || Number(raw.price) <= 0) problems.push('price must be a number greater than 0 (no currency symbols or commas)');
  if (raw.currency !== 'NPR') problems.push('currency must be NPR');

  if (!raw.affiliate_url) problems.push('affiliate_url is required (the site never invents affiliate links)');
  else if (!isSafeHttpsUrl(raw.affiliate_url)) problems.push('affiliate_url must be a valid https:// link');

  if (!raw.image_url) problems.push('image_url is required');
  else if (raw.image_url.startsWith('/images/products/')) {
    if (!/^\/images\/products\/[\w./-]+\.(jpe?g|png|webp|svg)$/i.test(raw.image_url)) problems.push('image_url local path must end in .jpg, .png, .webp or .svg');
    else if (!options.imageExists(raw.image_url)) problems.push(`image file not found: src${raw.image_url}`);
  } else if (!isSafeHttpsUrl(raw.image_url)) problems.push('image_url must be https:// or a path starting with /images/products/');

  if (!isValidDate(raw.last_updated)) problems.push('last_updated must be a real date like 2026-10-26');
  else if (raw.last_updated > options.today) problems.push('last_updated is in the future');

  if (raw.availability && !AVAILABILITY.includes(raw.availability)) problems.push(`availability must be blank, ${AVAILABILITY.join(' or ')}`);
  if (raw.features === '' && raw.specifications === '') problems.push('add features or specifications so the page has useful detail');
  return problems;
}

function normalizeProduct(raw, domain) {
  const url = `/products/${raw.slug}/`;
  return {
    id: raw.id, name: raw.name, slug: raw.slug, url, canonicalUrl: `${domain}${url}`,
    category: raw.category, categorySlug: slugify(raw.category),
    brand: raw.brand, model: raw.model, price: Number(raw.price), currency: raw.currency,
    seller: raw.seller, affiliateUrl: raw.affiliate_url, imageUrl: raw.image_url,
    shortDescription: raw.short_description,
    paragraphs: raw.full_description.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    features: splitList(raw.features), specs: parseSpecs(raw.specifications),
    seoTitle: raw.seo_title || `${raw.name} - details and price check`,
    metaDescription: raw.meta_description || truncate(raw.short_description, 155),
    primaryKeyword: raw.primary_keyword, secondaryKeywords: splitList(raw.secondary_keywords.replace(/,/g, '|')),
    availability: raw.availability, lastUpdated: raw.last_updated
  };
}

/**
 * Validate every row. Returns published products plus errors/warnings with row numbers.
 * options: { domain, today: 'YYYY-MM-DD', imageExists(path) => boolean }
 */
function validateRecords(records, options) {
  const errors = [];
  const warnings = [];
  const products = [];
  const counts = { published: 0, draft: 0, archived: 0 };
  const seenIds = new Map();
  const seenSlugs = new Map();
  const seenTitles = new Map();
  const label = (r) => `Row ${r.rowNumber} (${r.slug || r.name || r.id || 'no name'})`;

  for (const raw of records) {
    // Duplicates are checked across ALL rows, so a draft can't collide with a live product later.
    if (raw.id) {
      if (seenIds.has(raw.id)) errors.push(`${label(raw)}: duplicate id "${raw.id}" (also row ${seenIds.get(raw.id)})`);
      else seenIds.set(raw.id, raw.rowNumber);
    }
    if (raw.slug) {
      if (seenSlugs.has(raw.slug)) errors.push(`${label(raw)}: duplicate slug "${raw.slug}" (also row ${seenSlugs.get(raw.slug)})`);
      else seenSlugs.set(raw.slug, raw.rowNumber);
    }

    if (!STATUSES.includes(raw.status)) {
      errors.push(`${label(raw)}: status must be ${STATUSES.join(', ')} (found "${raw.status}")`);
      continue;
    }
    counts[raw.status] += 1;
    if (raw.status !== 'published') continue; // drafts and archived rows never go public

    const problems = findRowProblems(raw, options);
    problems.forEach((problem) => errors.push(`${label(raw)}: ${problem}`));
    if (problems.length > 0) continue;

    if (raw.canonical_url && raw.canonical_url !== `${options.domain}/products/${raw.slug}/`) {
      warnings.push(`${label(raw)}: canonical_url ignored; the build always uses ${options.domain}/products/${raw.slug}/`);
    }
    const product = normalizeProduct(raw, options.domain);
    if (product.seoTitle.length > 60) warnings.push(`${label(raw)}: seo_title is ${product.seoTitle.length} characters (about 60 or fewer displays best)`);
    if (product.metaDescription.length > 160) warnings.push(`${label(raw)}: meta_description is ${product.metaDescription.length} characters (about 160 or fewer displays best)`);
    const titleKey = product.seoTitle.toLowerCase();
    if (seenTitles.has(titleKey)) warnings.push(`${label(raw)}: seo_title duplicates row ${seenTitles.get(titleKey)}`);
    else seenTitles.set(titleKey, raw.rowNumber);
    products.push(product);
  }
  return { products, errors, warnings, counts };
}

module.exports = { PRODUCT_HEADERS, STATUSES, slugify, isValidDate, validateRecords };
