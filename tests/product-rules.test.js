const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { loadProducts } = require('../scripts/lib/load-products');
const { validateRecords, slugify } = require('../scripts/lib/product-rules');

const options = { domain: 'https://khojkharid.online', today: '2026-10-26', imageExists: () => true };
const good = {
  rowNumber: 2, id: 'P1', name: 'Test Item', slug: 'test-item', category: 'Office & Study', brand: '', model: '',
  price: '100', currency: 'NPR', seller: '', affiliate_url: 'https://example.com/a', image_url: 'https://example.com/i.jpg',
  short_description: 'Short', full_description: 'Long', features: 'One', specifications: '', seo_title: '',
  meta_description: '', primary_keyword: '', secondary_keywords: '', canonical_url: '', availability: '',
  last_updated: '2026-10-01', status: 'published'
};
const run = (...rows) => validateRecords(rows.map((r, i) => ({ ...r, rowNumber: i + 2 })), options);

test('a valid published row passes and gets generated SEO defaults', () => {
  const { products, errors } = run(good);
  assert.strictEqual(errors.length, 0);
  assert.strictEqual(products[0].url, '/products/test-item/');
  assert.ok(products[0].seoTitle && products[0].metaDescription);
});

test('draft and archived rows are never published, even if incomplete', () => {
  const { products, errors } = run({ ...good, status: 'draft', affiliate_url: '' }, { ...good, id: 'P2', slug: 'b', status: 'archived' });
  assert.strictEqual(products.length, 0);
  assert.strictEqual(errors.length, 0);
});

test('missing affiliate link blocks publishing instead of inventing one', () => {
  const { products, errors } = run({ ...good, affiliate_url: '' });
  assert.strictEqual(products.length, 0);
  assert.match(errors[0], /affiliate_url is required/);
});

test('rejects bad prices, currency, urls, dates, slugs and statuses with row numbers', () => {
  const bad = [
    { ...good, price: '0' }, { ...good, id: 'B', slug: 'b', price: 'Rs 5' }, { ...good, id: 'C', slug: 'c', currency: 'USD' },
    { ...good, id: 'D', slug: 'd', affiliate_url: 'http://x.com' }, { ...good, id: 'E', slug: 'e', image_url: 'javascript:alert(1)' },
    { ...good, id: 'F', slug: 'f', last_updated: '2026-02-31' }, { ...good, id: 'G', slug: 'Bad Slug' }, { ...good, id: 'H', slug: 'h', status: 'live' }
  ];
  const { products, errors } = run(...bad);
  assert.strictEqual(products.length, 0);
  assert.ok(errors.length >= 8);
  assert.ok(errors.every((e) => /^Row \d+/.test(e)));
});

test('duplicate ids and slugs are reported', () => {
  const { errors } = run(good, { ...good });
  assert.ok(errors.some((e) => /duplicate id/.test(e)));
  assert.ok(errors.some((e) => /duplicate slug/.test(e)));
});

test('preview fixture: 2 published, 1 draft, no errors', () => {
  const result = loadProducts(path.join(__dirname, 'fixtures', 'products.preview.csv'));
  assert.deepStrictEqual(result.errors, []);
  assert.strictEqual(result.products.length, 2);
  assert.strictEqual(result.counts.draft, 1);
  assert.strictEqual(result.products[0].paragraphs.length, 2);
});

test('slugify', () => assert.strictEqual(slugify('Home & Kitchen'), 'home-and-kitchen'));
