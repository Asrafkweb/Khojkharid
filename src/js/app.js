// Site-wide behavior: the mobile menu. (Search, filters and compare get their own files in Phase 4.)
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));

  // Escape closes the menu and returns focus to the button.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });

  // Close after choosing a link, and reset when resizing to desktop width.
  nav.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
  window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
})();

// Scroll reveal and header shadow. Both are decoration only: if anything here fails, the page still works.
(function () {
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) return;

  const selectors = ['.card', '.section h2', '.chips li', '.trust', '.empty-state', '.product__details', '.legal > *', '.contact-card', '.site-footer__col'];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll(selectors.join(',')).forEach((item) => {
    // Small stagger for neighbours (cards in a grid), capped so nothing waits long.
    const siblings = item.parentElement ? Array.from(item.parentElement.children) : [];
    const index = Math.min(siblings.indexOf(item), 5);
    item.style.setProperty('--reveal-delay', `${index * 70}ms`);
    item.classList.add('reveal');
    observer.observe(item);
  });
})();

// Light / dark mode button. The choice is remembered on this device only.
(function () {
  const button = document.querySelector('.theme-toggle');
  if (!button) return;
  const root = document.documentElement;
  const isDark = () => root.getAttribute('data-theme') === 'dark';
  const sync = () => {
    button.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark() ? '#0F171A' : '#087F8C');
  };
  sync();
  button.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('kk-theme', next); } catch (e) { /* private mode: the choice just is not remembered */ }
    sync();
  });
})();

// Footer year stays current without editing anything.
document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = String(new Date().getFullYear()); });

// On phones, tuck the header search away when scrolling down and bring it back when scrolling up.
(function () {
  const header = document.querySelector('.site-header');
  const small = window.matchMedia('(max-width: 860px)');
  if (!header) return;
  let lastY = window.scrollY;
  const fab = document.querySelector('.whatsapp-fab');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (!small.matches) { header.classList.remove('is-search-hidden'); if (fab) fab.classList.remove('is-away'); lastY = y; return; }
    if (y > 120 && y > lastY + 4) { header.classList.add('is-search-hidden'); if (fab) fab.classList.add('is-away'); }
    else if (y < lastY - 4 || y <= 120) { header.classList.remove('is-search-hidden'); if (fab) fab.classList.remove('is-away'); }
    lastY = y;
  }, { passive: true });
})();

// Hide the floating WhatsApp button once the footer (which has the same contact links) is on screen.
(function () {
  const fab = document.querySelector('.whatsapp-fab');
  const footer = document.querySelector('.site-footer');
  if (!fab || !footer || !('IntersectionObserver' in window)) return;
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => fab.classList.toggle('is-hidden', entry.isIntersecting));
  }).observe(footer);
})();

// Home category row: show the left/right arrows only when there are more categories to scroll to.
document.querySelectorAll('.cat-scroller').forEach((wrap) => {
  const row = wrap.querySelector('.cat-icons');
  const prev = wrap.querySelector('.cat-scroller__btn--prev');
  const next = wrap.querySelector('.cat-scroller__btn--next');
  if (!row || !prev || !next) return;
  const update = () => {
    const max = row.scrollWidth - row.clientWidth;
    wrap.classList.toggle('has-prev', row.scrollLeft > 4);
    wrap.classList.toggle('has-next', row.scrollLeft < max - 4);
  };
  const step = (dir) => row.scrollBy({ left: dir * Math.max(240, row.clientWidth * 0.8), behavior: 'smooth' });
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  row.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});
