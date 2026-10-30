// Listing page: search, filters and sorting. It shows, hides and reorders the
// product cards that are already in the HTML, so no product text is ever
// inserted as HTML and the page still works for search engines without JavaScript.
(function () {
  const grid = document.getElementById('product-grid');
  const form = document.getElementById('filters');
  if (!grid || !form) return;

  const cards = Array.from(grid.querySelectorAll('.card'));
  const originalOrder = cards.slice();
  const total = cards.length;
  const field = (name) => form.elements[name];
  const countEl = document.getElementById('result-count');
  const emptyEl = document.getElementById('no-results');
  const pagerEl = document.getElementById('pagination');
  const PAGE_SIZE = 12; // products shown at once
  let page = 1;

  const numberOrNull = (text) => {
    const value = parseFloat(text);
    return Number.isFinite(value) ? value : null;
  };

  function cardMatches(card, filters) {
    const data = card.dataset;
    const price = Number(data.price);
    if (!window.KKSearch.matches(data.search, filters.query)) return false;
    if (filters.category && data.category !== filters.category) return false;
    if (filters.brand && data.brand !== filters.brand) return false;
    // A card with no usable price is excluded by a price filter instead of being treated as 0.
    if (filters.min !== null && !(price >= filters.min)) return false;
    if (filters.max !== null && !(price <= filters.max)) return false;
    return true;
  }

  // Missing prices always sort last, never as zero.
  function comparePrice(a, b, direction) {
    const pa = Number(a.dataset.price);
    const pb = Number(b.dataset.price);
    if (Number.isNaN(pa)) return Number.isNaN(pb) ? 0 : 1;
    if (Number.isNaN(pb)) return -1;
    return direction * (pa - pb);
  }

  const sorters = {
    default: (a, b) => originalOrder.indexOf(a) - originalOrder.indexOf(b),
    'price-asc': (a, b) => comparePrice(a, b, 1),
    'price-desc': (a, b) => comparePrice(a, b, -1),
    name: (a, b) => a.dataset.name.localeCompare(b.dataset.name),
    recent: (a, b) => b.dataset.updated.localeCompare(a.dataset.updated)
  };

  function apply(keepPage) {
    if (!keepPage) page = 1;
    const filters = {
      query: field('q').value,
      category: field('category').value,
      brand: field('brand').value,
      min: numberOrNull(field('min').value),
      max: numberOrNull(field('max').value)
    };
    const visible = [];
    const hidden = [];
    cards.forEach((card) => {
      const show = cardMatches(card, filters);
      card.hidden = !show;
      (show ? visible : hidden).push(card);
    });
    visible.sort(sorters[field('sort').value] || sorters.default);

    // Only one page of the matching products is shown at a time.
    const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
    page = Math.min(Math.max(page, 1), pageCount);
    const first = (page - 1) * PAGE_SIZE;
    visible.forEach((card, i) => { card.hidden = i < first || i >= first + PAGE_SIZE; });
    grid.append(...visible, ...hidden);

    countEl.textContent = visible.length > PAGE_SIZE
      ? `Showing ${first + 1}–${Math.min(first + PAGE_SIZE, visible.length)} of ${visible.length} products`
      : `${visible.length} of ${total} product${total === 1 ? '' : 's'}`;
    emptyEl.hidden = visible.length > 0;
    grid.hidden = visible.length === 0;

    if (pagerEl && window.KKPager) {
      window.KKPager.render(pagerEl, page, pageCount, (next) => {
        page = next;
        apply(true);
        if (countEl.scrollIntoView) countEl.scrollIntoView({ block: 'start' });
      });
    }
    if (window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      if (page > 1) url.searchParams.set('page', String(page)); else url.searchParams.delete('page');
      window.history.replaceState(null, '', url);
    }
  }

  form.addEventListener('input', () => apply(false));
  form.addEventListener('submit', (event) => event.preventDefault());
  document.getElementById('clear-search').addEventListener('click', () => {
    field('q').value = '';
    apply(false);
    field('q').focus();
  });
  document.querySelectorAll('[data-reset-filters]').forEach((button) => {
    button.addEventListener('click', () => { form.reset(); apply(false); });
  });

  // On phones the extra filters are tucked away until the button is pressed.
  const moreToggle = document.getElementById('filters-toggle');
  if (moreToggle) {
    moreToggle.addEventListener('click', () => {
      const open = form.classList.toggle('is-open');
      moreToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Searches from the header or homepage arrive as /products/?q=word
  const startQuery = new URLSearchParams(window.location.search).get('q');
  if (startQuery) field('q').value = startQuery.slice(0, 100);
  const startPage = parseInt(new URLSearchParams(window.location.search).get('page'), 10);
  if (startPage > 1) page = startPage;
  form.hidden = false; // the controls are hidden until this script can make them work
  apply(true);
})();
