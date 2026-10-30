// Templates that show products: cards, listing, categories, product page.
const { escapeHtml } = require('../html-utils');

const AFFILIATE_REL = 'sponsored nofollow noopener noreferrer';
const formatPrice = (p) => `${p.currency} ${p.price.toLocaleString('en-US')}`;
const formatShortDate = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const formatDate = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

// Honest shopping link. It uses the affiliate URL exactly as supplied.
function renderShopLink(product, extraClass = 'btn--primary') {
  return `<a class="btn ${extraClass}" href="${escapeHtml(product.affiliateUrl)}" target="_blank" rel="${AFFILIATE_REL}">View Price on Daraz <span aria-hidden="true">↗</span><span class="visually-hidden"> (opens in a new tab)</span></a>`;
}

// Hidden until the compare script (Phase 4) is loaded, so there is never a dead button.
function renderCompareButton(product) {
  return `<button class="btn btn--ghost btn--small" type="button" data-compare-id="${escapeHtml(product.id)}" data-compare-name="${escapeHtml(product.name)}" aria-pressed="false" hidden>Add to compare</button>`;
}

function renderProductCard(product) {
  const meta = [product.brand, product.model].filter(Boolean).map(escapeHtml).join(' · ');
  const searchText = [product.name, product.brand, product.model, product.category, product.shortDescription].join(' ').toLowerCase().replace(/\s+/g, ' ');
  return `<article class="card" data-id="${escapeHtml(product.id)}" data-name="${escapeHtml(product.name.toLowerCase())}" data-category="${product.categorySlug}" data-brand="${escapeHtml(product.brand)}" data-price="${product.price}" data-updated="${product.lastUpdated}" data-search="${escapeHtml(searchText)}">
  <a class="card__image" href="${product.url}" tabindex="-1" aria-hidden="true"><img src="${escapeHtml(product.imageUrl)}" alt="" width="400" height="400" loading="lazy"></a>
  <div class="card__body">
    <p class="card__category"><a href="/categories/${product.categorySlug}/">${escapeHtml(product.category)}</a></p>
    <h3 class="card__title"><a href="${product.url}">${escapeHtml(product.name)}</a></h3>
    ${meta ? `<p class="card__meta">${meta}</p>` : ''}
    <p class="card__price">${escapeHtml(formatPrice(product))}</p>
    <p class="card__note">Price checked ${formatShortDate(product.lastUpdated)}</p>
    <p class="card__desc">${escapeHtml(product.shortDescription)}</p>
    <div class="card__actions">
      ${renderShopLink(product).replace('class="btn btn--primary"', 'class="btn btn--primary btn--small"')}
      ${renderCompareButton(product)}
    </div>
  </div>
</article>`;
}

const renderGrid = (products, { paginate = 0 } = {}) => `<div class="grid" id="product-grid"${paginate ? ` data-paginate="${paginate}"` : ''}>${products.map(renderProductCard).join('\n')}</div>`;

const emptyState = (text) => `<div class="empty-state"><p><strong>${text}</strong></p><p>Published products will appear here automatically.</p></div>`;

function groupByCategory(products) {
  const map = new Map();
  for (const p of products) {
    if (!map.has(p.categorySlug)) map.set(p.categorySlug, { name: p.category, slug: p.categorySlug, products: [] });
    map.get(p.categorySlug).products.push(p);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function renderCategoryLinks(categories) {
  return `<ul class="chips">${categories.map((c) => `<li><a class="chip" href="/categories/${c.slug}/">${escapeHtml(c.name)} <span>${c.products.length}</span></a></li>`).join('')}</ul>`;
}

function renderFilters(products) {
  const categories = groupByCategory(products);
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort((x, y) => x.localeCompare(y));
  const options = (items) => items.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join('');
  return `<form class="filters" id="filters" aria-label="Search and filter products" hidden>
    <div class="field field--wide"><label for="f-q">Search</label>
      <div class="field__row"><input id="f-q" type="search" name="q" autocomplete="off" placeholder="Search products"><button class="btn btn--ghost btn--small" type="button" id="clear-search" aria-label="Clear search">Clear</button></div></div>
    <button class="btn btn--ghost btn--small filters__toggle" type="button" id="filters-toggle" aria-expanded="false" aria-controls="filters-more">Category, price and sort</button>
    <div class="filters__more" id="filters-more">
    <div class="field"><label for="f-category">Category</label><select id="f-category" name="category"><option value="">All categories</option>${options(categories.map((c) => [c.slug, c.name]))}</select></div>
    <div class="field"><label for="f-brand">Brand</label><select id="f-brand" name="brand"><option value="">All brands</option>${options(brands.map((b) => [b, b]))}</select></div>
    <div class="field"><label for="f-min">Min price (NPR)</label><input id="f-min" type="number" name="min" min="0" step="any" inputmode="decimal"></div>
    <div class="field"><label for="f-max">Max price (NPR)</label><input id="f-max" type="number" name="max" min="0" step="any" inputmode="decimal"></div>
    <div class="field"><label for="f-sort">Sort by</label><select id="f-sort" name="sort"><option value="default">Default</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name">Name: A to Z</option><option value="recent">Recently updated</option></select></div>
    <div class="field field--action"><button class="btn btn--ghost btn--small" type="button" data-reset-filters>Reset all</button></div>
    </div>
  </form>`;
}

function renderListingPage(products) {
  if (products.length === 0) return `<section class="section"><div class="container"><h1>All products</h1>${emptyState('No products are published yet.')}</div></section>`;
  return `<section class="section"><div class="container">
  <h1>All products</h1>
  ${renderFilters(products)}
  <p class="result-count" id="result-count" aria-live="polite">${products.length} product${products.length === 1 ? '' : 's'}</p>
  <div class="empty-state" id="no-results" hidden><p><strong>No products match your search.</strong></p><p>Try fewer words or a wider price range. <button class="btn btn--ghost btn--small" type="button" data-reset-filters>Reset all filters</button></p></div>
  ${renderGrid(products)}
  <div class="pager" id="pagination" hidden></div>
</div></section>`;
}

function renderComparePage(products) {
  // JSON in a script tag: "<" is escaped so product text can never close the tag.
  const data = JSON.stringify(products.map((p) => ({ id: p.id, name: p.name, url: p.url, category: p.category, brand: p.brand, model: p.model, price: p.price, currency: p.currency, seller: p.seller, affiliateUrl: p.affiliateUrl, features: p.features, specs: p.specs, availability: p.availability, lastUpdated: p.lastUpdated }))).replace(/</g, '\\u003c');
  return `<section class="section"><div class="container">
  <h1>Compare products</h1>
  <p>Compare up to four products side by side. Your selection is saved in this browser only.</p>
  <noscript><p class="disclosure">Comparison needs JavaScript. Please enable it to use this page.</p></noscript>
  <div id="compare-root"></div>
  <script type="application/json" id="products-data">${data}</script>
</div></section>`;
}

function renderCategoriesIndex(products) {
  const categories = groupByCategory(products);
  if (categories.length === 0) return `<section class="section"><div class="container"><h1>Categories</h1>${emptyState('No categories yet.')}</div></section>`;
  return `<section class="section"><div class="container"><h1>Categories</h1><p>Browse products by category. Only categories with published products are listed.</p>${renderCategoryLinks(categories)}</div></section>`;
}

function renderCategoryPage(category) {
  return `<section class="section"><div class="container">
  <nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/categories/">Categories</a></li><li aria-current="page">${escapeHtml(category.name)}</li></ol></nav>
  <h1>${escapeHtml(category.name)}</h1>
  <p class="result-count">${category.products.length} product${category.products.length === 1 ? '' : 's'}</p>
  ${renderGrid(category.products, { paginate: 12 })}
</div></section>`;
}

function renderProductPage(product, allProducts) {
  const related = allProducts.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 3);
  const specs = product.specs.length
    ? `<h2>Specifications</h2><table class="spec-table"><tbody>${product.specs.map((s) => `<tr><th scope="row">${escapeHtml(s.label)}</th><td>${s.value ? escapeHtml(s.value) : 'Not provided'}</td></tr>`).join('')}</tbody></table>` : '';
  const features = product.features.length
    ? `<h2>Features</h2><ul class="feature-list">${product.features.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>` : '';
  const facts = [['Brand', product.brand], ['Model', product.model], ['Seller', product.seller]]
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v ? escapeHtml(v) : 'Not provided'}</dd></div>`).join('');

  return `<article class="section"><div class="container">
  <nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/categories/">Categories</a></li><li><a href="/categories/${product.categorySlug}/">${escapeHtml(product.category)}</a></li><li aria-current="page">${escapeHtml(product.name)}</li></ol></nav>
  <div class="product">
    <img class="product__image" src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}" width="800" height="800">
    <div class="product__summary">
      <h1>${escapeHtml(product.name)}</h1>
      <p class="product__price">${escapeHtml(formatPrice(product))}</p>
      <p class="card__note">Price checked on ${formatDate(product.lastUpdated)}. Prices and availability can change on Daraz.</p>
      <p>${escapeHtml(product.shortDescription)}</p>
      <div class="product__actions">${renderShopLink(product)}${renderCompareButton(product)}</div>
      <p class="disclosure">Affiliate link: KhojKharid may earn a commission from qualifying purchases. We don't sell or ship this product. <a href="/affiliate-disclosure/">Learn more</a></p>
      <dl class="facts">${facts}</dl>
    </div>
  </div>
  <div class="product__details">
    <h2>About this product</h2>
    ${product.paragraphs.map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('\n')}
    ${features}
    ${specs}
    <p class="card__note">Last updated ${formatDate(product.lastUpdated)}. More in <a href="/categories/${product.categorySlug}/">${escapeHtml(product.category)}</a> or <a href="/products/">all products</a>.</p>
  </div>
  ${related.length ? `<h2>Related products</h2>${renderGrid(related).replace(' id="product-grid"', '')}` : ''}
</div></article>`;
}

module.exports = { renderComparePage, renderListingPage, renderCategoriesIndex, renderCategoryPage, renderProductPage, renderGrid, renderCategoryLinks, groupByCategory, emptyState };
