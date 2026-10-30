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
