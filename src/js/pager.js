// Page-number buttons (Previous 1 2 3 ... Next). Built with DOM methods only, never innerHTML.
(function () {
  // Which page numbers to show: always first, last and the pages around the current one.
  function pageList(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const wanted = new Set([1, total, current - 1, current, current + 1]);
    if (current <= 3) { wanted.add(2); wanted.add(3); wanted.add(4); }
    if (current >= total - 2) { wanted.add(total - 1); wanted.add(total - 2); wanted.add(total - 3); }
    const pages = [...wanted].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
    const out = [];
    pages.forEach((n, i) => {
      if (i > 0 && n - pages[i - 1] > 1) out.push('…');
      out.push(n);
    });
    return out;
  }

  function render(container, current, total, onChange) {
    container.textContent = '';
    if (total <= 1) { container.hidden = true; return; }
    container.hidden = false;
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Pagination');
    const list = document.createElement('ul');
    list.className = 'pager__list';

    const item = (child) => { const li = document.createElement('li'); li.appendChild(child); list.appendChild(li); };
    const button = (label, page, options = {}) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pager__btn' + (options.current ? ' is-current' : '');
      b.textContent = label;
      if (options.aria) b.setAttribute('aria-label', options.aria);
      if (options.current) b.setAttribute('aria-current', 'page');
      if (options.disabled) b.disabled = true;
      else b.addEventListener('click', () => onChange(page));
      return b;
    };

    item(button('‹ Prev', current - 1, { disabled: current <= 1, aria: 'Previous page' }));
    pageList(current, total).forEach((n) => {
      if (n === '…') {
        const gap = document.createElement('span');
        gap.className = 'pager__gap';
        gap.textContent = '…';
        item(gap);
      } else {
        item(button(String(n), n, { current: n === current, aria: `Page ${n}` }));
      }
    });
    item(button('Next ›', current + 1, { disabled: current >= total, aria: 'Next page' }));
    nav.appendChild(list);
    container.appendChild(nav);
  }

  window.KKPager = { pageList, render };
})();
