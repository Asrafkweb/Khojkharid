// SEO helpers: structured data (JSON-LD), sitemap.xml and robots.txt.
const config = require('../../site.config');

const abs = (path) => `${config.domain}${path}`;
const AVAILABILITY = { in_stock: 'https://schema.org/InStock', out_of_stock: 'https://schema.org/OutOfStock' };

function organizationLd() {
  return {
    '@context': 'https://schema.org', '@type': 'Organization', name: config.siteName, url: config.domain,
    logo: abs('/images/logo/logo-light.png'),
    email: config.contact.email,
    contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', email: config.contact.email, telephone: `+${config.contact.whatsappDigits}`, areaServed: 'NP' }]
  };
}

function websiteLd() {
  return {
    '@context': 'https://schema.org', '@type': 'WebSite', name: config.siteName, url: config.domain,
    potentialAction: { '@type': 'SearchAction', target: `${config.domain}/products/?q={search_term_string}`, 'query-input': 'required name=search_term_string' }
  };
}

// crumbs: [{ name, path }] in order, last one is the current page
function breadcrumbLd(crumbs) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) }))
  };
}

// Only facts that are really in the CSV are included. No ratings or reviews are invented.
function productLd(p) {
  const offer = { '@type': 'Offer', url: abs(p.url), price: String(p.price), priceCurrency: p.currency };
  if (AVAILABILITY[p.availability]) offer.availability = AVAILABILITY[p.availability];
  if (p.seller) offer.seller = { '@type': 'Organization', name: p.seller };
  const data = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.id,
    description: p.shortDescription, image: abs(p.imageUrl), category: p.category, offers: offer
  };
  if (p.brand) data.brand = { '@type': 'Brand', name: p.brand };
  if (p.model) data.model = p.model;
  return data;
}

function xmlEscape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// entries: [{ path, lastmod? }]
function renderSitemap(entries) {
  const urls = entries.map((e) => `  <url><loc>${xmlEscape(abs(e.path))}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function renderRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${config.domain}/sitemap.xml\n`;
}

module.exports = { organizationLd, websiteLd, breadcrumbLd, productLd, renderSitemap, renderRobots };
