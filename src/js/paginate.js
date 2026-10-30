// Pages for a plain product grid (used on category pages): shows 12 at a time with page numbers.
// All cards stay in the HTML, so search engines still see every product.
(function () {
  if (!window.KKPager) return;
  document.querySelectorAll('.grid[data-paginate]').forEach((grid) => {
    const size = parseInt(grid.dataset.paginate, 10) || 12;
    const cards = Array.from(grid.children);
    if (cards.length <= size) return;
    const holder = document.createElement('div');
    holder.className = 'pager';
    grid.after(holder);
    const totalPages = Math.ceil(cards.length / size);
    let page = parseInt(new URLSearchParams(window.location.search).get('page'), 10) || 1;
    page = Math.min(Math.max(page, 1), totalPages);

    function show(scroll) {
      cards.forEach((card, i) => { card.hidden = i < (page - 1) * size || i >= page * size; });
      window.KKPager.render(holder, page, totalPages, (next) => { page = next; show(true); });
      if (window.history && window.history.replaceState) {
        const url = new URL(window.location.href);
        if (page > 1) url.searchParams.set('page', String(page)); else url.searchParams.delete('page');
        window.history.replaceState(null, '', url);
      }
      if (scroll && grid.scrollIntoView) grid.scrollIntoView({ block: 'start' });
    }
    show(false);
  });
})();
