const test = require('node:test');
const assert = require('node:assert');
const seo = require('../scripts/lib/seo');

const product = { id: 'P1', name: 'Test </script> Item', url: '/products/test/', price: 1499, currency: 'NPR', availability: 'in_stock', seller: 'Shop', shortDescription: 'Short', imageUrl: '/images/products/a.jpg', category: 'Cat', brand: 'B', model: 'M' };

test('product JSON-LD has offer with real values', () => {
  const ld = seo.productLd(product);
  assert.strictEqual(ld['@type'], 'Product');
  assert.strictEqual(ld.offers.price, '1499');
  assert.strictEqual(ld.offers.availability, 'https://schema.org/InStock');
  assert.strictEqual(ld.offers.url, 'https://khojkharid.online/products/test/');
  assert.ok(!('aggregateRating' in ld), 'no invented ratings');
});

test('availability is omitted when blank', () => {
  assert.ok(!('availability' in seo.productLd({ ...product, availability: '' }).offers));
});

test('sitemap lists urls and escapes xml', () => {
  const xml = seo.renderSitemap([{ path: '/a&b/', lastmod: '2026-10-27' }]);
  assert.match(xml, /<loc>https:\/\/khojkharid\.online\/a&amp;b\/<\/loc><lastmod>2026-10-27<\/lastmod>/);
});

test('robots.txt points to the sitemap', () => {
  assert.match(seo.renderRobots(), /Sitemap: https:\/\/khojkharid\.online\/sitemap\.xml/);
});

test('breadcrumb positions start at 1', () => {
  const ld = seo.breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'X', path: '/x/' }]);
  assert.strictEqual(ld.itemListElement[1].position, 2);
});
