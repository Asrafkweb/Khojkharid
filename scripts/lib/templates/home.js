// Homepage body. Sections that depend on product data are added in Phase 3.
const { renderSearchForm } = require('./layout');
const { escapeHtml } = require('../html-utils');
const { renderGrid, renderCategoryLinks, groupByCategory } = require('./catalog');

function flashBanner(flash) {
  if (!flash || !flash.active) return '';
  return `    <section class="flash" aria-labelledby="flash-title">
      <div class="container flash__inner">
        <div><h2 id="flash-title">${escapeHtml(flash.title)}</h2><p>Limited-time offers on Daraz. Check what is on sale today.</p></div>
        <a class="btn btn--primary" href="/flash-sale/">See Flash Sale</a>
      </div>
    </section>
`;
}

function renderHome(products = [], flash = null) {
  const hasProducts = products.length > 0;
  const recent = [...products].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 6);
  const productSections = hasProducts
    ? `    <section class="section" aria-labelledby="cat-title"><div class="container"><h2 id="cat-title">Browse by category</h2>${renderCategoryLinks(groupByCategory(products))}</div></section>
    <section class="section" aria-labelledby="recent-title"><div class="container"><h2 id="recent-title">Recently updated products</h2>${renderGrid(recent).replace(' id="product-grid"', '')}<p><a href="/products/">See all products</a></p></div></section>`
    : `    <section class="section" aria-labelledby="products-title">
      <div class="container">
        <h2 id="products-title">Products</h2>
        <div class="empty-state">
          <p><strong>No products are published yet.</strong></p>
          <p>Products appear here once they are added and verified. Categories and recently updated products will show automatically.</p>
        </div>
      </div>
    </section>`;
  return `    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__copy">
          <h1>Find Better Products. Compare Smarter.</h1>
          <p class="hero__lead">Explore useful products, compare features and prices, and find shopping options that suit your needs.</p>
          ${renderSearchForm('hero', 'search--large')}
          <div class="hero__actions">
            <a class="btn btn--primary" href="/products/">Explore Products</a>
            <a class="btn btn--ghost" href="/compare/">Compare Products</a>
          </div>
        </div>
        <aside class="hero__panel" aria-labelledby="how-title">
          <h2 id="how-title">How KhojKharid works</h2>
          <ol class="steps">
            <li><strong>Search or browse.</strong> Narrow products by category, brand and price.</li>
            <li><strong>Compare up to four.</strong> See features and specifications side by side.</li>
            <li><strong>Check the price on Daraz.</strong> Prices change, so confirm on the seller's page.</li>
          </ol>
        </aside>
      </div>
    </section>

${flashBanner(flash)}${productSections}

    <section class="section section--tint" aria-labelledby="trust-title">
      <div class="container trust">
        <h2 id="trust-title">How we make money</h2>
        <p>KhojKharid helps you research and compare products. Many links on this site are affiliate links to Daraz. If you buy through one, we may earn a commission from qualifying purchases.</p>
        <p>We don't sell or ship products, and prices or availability can change on Daraz at any time. Read the full <a href="/affiliate-disclosure/">affiliate disclosure</a>.</p>
      </div>
    </section>`;
}

module.exports = { renderHome };
