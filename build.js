// KhojKharid build script.
// Reads hand-written files from src/ and writes a complete website into dist/.
// It never writes inside src/, so your source files are safe.
const fs = require('node:fs');
const path = require('node:path');
const config = require('./site.config');
const { renderPage } = require('./scripts/lib/templates/layout');
const { renderHome } = require('./scripts/lib/templates/home');
const { renderNotFound } = require('./scripts/lib/templates/not-found');
const catalog = require('./scripts/lib/templates/catalog');
const pages = require('./scripts/lib/templates/pages');
const seo = require('./scripts/lib/seo');
const flash = require('./flash-sale.config');
const { isSafeHttpsUrl } = require('./scripts/lib/html-utils');
const { loadProducts, csvPathFromArgs, printReport } = require('./scripts/lib/load-products');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

// '/about/' -> dist/about/index.html (clean URLs on GitHub Pages)
function writePage(urlPath, html) {
  const file = urlPath.endsWith('/')
    ? path.join(DIST, urlPath, 'index.html')
    : path.join(DIST, urlPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log('  wrote', path.relative(ROOT, file));
}

function copyStatic() {
  for (const folder of ['css', 'js', 'images']) {
    fs.cpSync(path.join(SRC, folder), path.join(DIST, folder), { recursive: true });
  }
  // Files placed in src/static (CNAME, favicon...) go to the root of dist/.
  fs.cpSync(path.join(SRC, 'static'), DIST, { recursive: true });
}

// Only published, validated products are written. Nothing else ever reaches dist/.
function writePublicData(products) {
  const publicProducts = products.map((p) => ({
    id: p.id, name: p.name, slug: p.slug, url: p.url, category: p.category, categorySlug: p.categorySlug,
    brand: p.brand, model: p.model, price: p.price, currency: p.currency, seller: p.seller,
    affiliateUrl: p.affiliateUrl, imageUrl: p.imageUrl, shortDescription: p.shortDescription,
    features: p.features, specs: p.specs, availability: p.availability, lastUpdated: p.lastUpdated
  }));
  const file = path.join(DIST, 'data', 'products.json');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(publicProducts, null, 2));
  console.log('  wrote', path.relative(ROOT, file));
}

function build() {
  const result = loadProducts(csvPathFromArgs(process.argv.slice(2)));
  printReport(result);
  if (result.errors.length > 0) throw new Error(`${result.errors.length} data error(s). Nothing was built. Fix the CSV and try again.`);
  const products = result.products;

  if (flash.active && !isSafeHttpsUrl(flash.affiliateUrl)) {
    throw new Error('flash-sale.config.js: active is true, but affiliateUrl is empty or does not start with https://. Paste your Flash Sale link, or set active to false.');
  }
  if (flash.active) {
    config.nav.push({ label: 'Flash Sale', href: '/flash-sale/' });
    config.footerExplore.push({ label: 'Flash Sale', href: '/flash-sale/' });
  }

  console.log('Building', config.siteName);
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  copyStatic();

  writePage('/', renderPage({
    title: `${config.siteName}: ${config.tagline}`,
    description: config.description,
    path: '/',
    isHome: true,
    jsonLd: [seo.organizationLd(), seo.websiteLd()],
    body: renderHome(products, flash)
  }));

  writePage('/products/', renderPage({
    title: 'All products',
    description: 'Browse all products on KhojKharid and compare features before checking the price on Daraz.',
    path: '/products/',
    scripts: ['search.js', 'pager.js', 'products.js'],
    body: catalog.renderListingPage(products)
  }));

  // Utility page with no static content, so it is kept out of search results.
  writePage('/compare/', renderPage({
    title: 'Compare products',
    description: 'Compare products side by side on KhojKharid.',
    path: '/compare/',
    noindex: true,
    body: catalog.renderComparePage(products)
  }));

  writePage('/categories/', renderPage({
    title: 'Product categories',
    description: 'Browse KhojKharid products by category.',
    path: '/categories/',
    body: catalog.renderCategoriesIndex(products)
  }));

  for (const category of catalog.groupByCategory(products)) {
    writePage(`/categories/${category.slug}/`, renderPage({
      title: `${category.name} products`,
      description: `Browse ${category.products.length} ${category.name} product${category.products.length === 1 ? '' : 's'} on KhojKharid and compare them before checking prices on Daraz.`,
      path: `/categories/${category.slug}/`,
      scripts: ['pager.js', 'paginate.js'],
      jsonLd: [seo.breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Categories', path: '/categories/' }, { name: category.name, path: `/categories/${category.slug}/` }])],
      body: catalog.renderCategoryPage(category)
    }));
  }

  for (const product of products) {
    writePage(product.url, renderPage({
      title: product.seoTitle,
      description: product.metaDescription,
      path: product.url,
      ogType: 'product',
      image: `${config.domain}${product.imageUrl}`,
      jsonLd: [
        seo.productLd(product),
        seo.breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Categories', path: '/categories/' }, { name: product.category, path: `/categories/${product.categorySlug}/` }, { name: product.name, path: product.url }])
      ],
      body: catalog.renderProductPage(product, products)
    }));
  }
  writePublicData(products);

  const staticPages = [
    { path: '/about/', title: 'About KhojKharid', description: 'KhojKharid helps shoppers in Nepal research and compare products before checking the price on Daraz.', body: pages.renderAbout() },
    { path: '/contact/', title: 'Contact us', description: 'Contact KhojKharid by email or WhatsApp for questions, corrections or suggestions.', body: pages.renderContact() },
    { path: '/affiliate-disclosure/', title: 'Affiliate Disclosure', description: 'How KhojKharid earns commissions from affiliate links to Daraz, and what that means for you.', body: pages.renderAffiliateDisclosure() },
    { path: '/privacy-policy/', title: 'Privacy Policy', description: 'What information KhojKharid collects, how it is used, and your choices.', body: pages.renderPrivacy() },
    { path: '/terms/', title: 'Terms and Conditions', description: 'The terms for using the KhojKharid website.', body: pages.renderTerms() }
  ];
  if (flash.active) {
    staticPages.push({ path: '/flash-sale/', title: flash.title, description: 'Open the current Daraz Flash Sale from KhojKharid and see limited-time offers.', body: pages.renderFlashSale(flash) });
  }
  for (const page of staticPages) writePage(page.path, renderPage(page));

  // sitemap.xml and robots.txt (the compare page and 404 are left out on purpose)
  const sitemapEntries = [
    { path: '/' }, { path: '/products/' }, { path: '/categories/' },
    ...catalog.groupByCategory(products).map((c) => ({ path: `/categories/${c.slug}/` })),
    ...products.map((p) => ({ path: p.url, lastmod: p.lastUpdated })),
    ...staticPages.map((p) => ({ path: p.path }))
  ];
  writePage('/sitemap.xml', seo.renderSitemap(sitemapEntries));
  writePage('/robots.txt', seo.renderRobots());

  writePage('/404.html', renderPage({
    title: 'Page not found',
    description: 'The page you were looking for could not be found.',
    path: '/404.html',
    noindex: true,
    body: renderNotFound()
  }));

  console.log('Done. Output is in dist/');
}

try {
  build();
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
