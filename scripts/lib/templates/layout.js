// Shared page shell: <head>, header, footer. Every generated page uses renderPage().
const config = require('../../../site.config');
const { escapeHtml } = require('../html-utils');

const LOGO_W = 174, LOGO_H = 34; // display size of the logo images (they are 614 x 120)
const LOGO = `<img class="logo__img logo__img--light" src="/images/logo/logo-light.png" width="${LOGO_W}" height="${LOGO_H}" alt="${config.siteName}"><img class="logo__img logo__img--dark" src="/images/logo/logo-dark.png" width="${LOGO_W}" height="${LOGO_H}" alt="" aria-hidden="true">`;
const THEME_ICONS = `<svg class="theme-toggle__moon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M20 14.5A8 8 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg><svg class="theme-toggle__sun" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

const SEARCH_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

// Reusable search form. `idPrefix` keeps ids unique when it appears twice on a page.
function renderSearchForm(idPrefix, extraClass = '') {
  return `<form class="search ${extraClass}" action="/products/" method="get" role="search">
    <label class="visually-hidden" for="${idPrefix}-q">Search products</label>
    <span class="search__icon">${SEARCH_ICON}</span>
    <input id="${idPrefix}-q" class="search__input" type="search" name="q" placeholder="Search products, brands or models" autocomplete="off">
    <button class="btn btn--primary search__button" type="submit">Search</button>
  </form>`;
}

function renderHeader(currentPath) {
  const links = config.nav
    .map((item) => {
      const current = item.href === currentPath ? ' aria-current="page"' : '';
      return `<li><a class="nav__link" href="${item.href}"${current}>${escapeHtml(item.label)}</a></li>`;
    })
    .join('');

  return `<header class="site-header">
  <div class="container site-header__inner">
    <a class="logo" href="/" aria-label="${config.siteName} home">${LOGO}</a>
    ${renderSearchForm('header', 'search--compact')}
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
      <span class="visually-hidden">Menu</span>
      <span class="nav-toggle__bars" aria-hidden="true"></span>
    </button>
    <nav class="nav" id="site-nav" aria-label="Main"><ul class="nav__list">${links}</ul></nav>
    <button class="theme-toggle" type="button" aria-label="Switch to dark mode">${THEME_ICONS}</button>
  </div>
</header>`;
}

const MAIL_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CHAT_ICON = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M12 3a9 9 0 0 0-7.8 13.4L3 21l4.7-1.2A9 9 0 1 0 12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2.2-1-.9.9a4.5 4.5 0 0 1-2.2-2.2l.9-.9-1-2.2z" fill="currentColor"/></svg>`;

function whatsappLink(message = 'Hello KhojKharid') {
  return `https://wa.me/${config.contact.whatsappDigits}?text=${encodeURIComponent(message)}`;
}

function renderFooter() {
  const list = (items) => items.map((item) => `<li><a href="${item.href}">${escapeHtml(item.label)}</a></li>`).join('');
  const info = `${list(config.footerLinks)}<li><a href="/sitemap.xml">Sitemap</a></li>`;
  const { email, whatsappDisplay } = config.contact;

  return `<footer class="site-footer">
  <div class="container site-footer__grid">
    <div class="site-footer__col site-footer__about">
      <p class="site-footer__brand"><img src="/images/logo/logo-dark.png" width="${LOGO_W}" height="${LOGO_H}" alt="${config.siteName}" loading="lazy"></p>
      <p>${escapeHtml(config.tagline)} We help you research and compare products in Nepal. Purchases are made on Daraz, not on this site.</p>
      <p class="site-footer__note">KhojKharid may earn a commission from qualifying purchases made through affiliate links, at no extra cost to you.</p>
    </div>
    <nav class="site-footer__col" aria-label="Explore"><h2 class="site-footer__title">Explore</h2><ul class="site-footer__links">${list(config.footerExplore)}</ul></nav>
    <nav class="site-footer__col" aria-label="Information"><h2 class="site-footer__title">Information</h2><ul class="site-footer__links">${info}</ul></nav>
    <div class="site-footer__col"><h2 class="site-footer__title">Contact us</h2>
      <ul class="site-footer__links site-footer__contact">
        <li><a href="mailto:${email}">${MAIL_ICON}<span>${email}</span></a></li>
        <li><a href="${whatsappLink()}" target="_blank" rel="noopener noreferrer">${CHAT_ICON}<span>WhatsApp ${whatsappDisplay}</span></a></li>
      </ul>
    </div>
  </div>
  <div class="container site-footer__legal">
    <p>© KhojKharid.online. All rights reserved.</p>
    <p>Developed by Asraf Digital.</p>
  </div>
</footer>
<a class="whatsapp-fab" href="${whatsappLink('Hello KhojKharid, I have a question.')}" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">${CHAT_ICON}<span class="whatsapp-fab__label">Chat</span></a>`;
}

// JSON-LD goes inside a script tag, so "<" is escaped and product text can never close the tag.
function renderJsonLd(items) {
  return items.map((item) => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, '\\u003c')}</script>`).join('\n  ');
}

/**
 * Wrap page content in the full HTML document.
 * @param {{title:string, description:string, path:string, body:string, noindex?:boolean, isHome?:boolean, jsonLd?:object[], image?:string, ogType?:string}} page
 */
function renderPage({ title, description, path, body, noindex = false, isHome = false, scripts = [], jsonLd = [], image = '', ogType = 'website' }) {
  image = image || `${config.domain}/images/logo/og-default.png`;
  const scriptTags = ['app.js', 'compare.js', ...scripts].map((file) => `<script src="/js/${file}" defer></script>`).join('\n  ');
  const fullTitle = isHome ? title : `${title} | ${config.siteName}`;
  const canonical = `${config.domain}${path}`;
  const social = noindex ? '' : `
  <meta property="og:site_name" content="${escapeHtml(config.siteName)}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:title" content="${escapeHtml(fullTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ''}
  <meta name="twitter:card" content="summary_large_image">`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}${social}
  <meta name="theme-color" content="#087F8C">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <script>document.documentElement.classList.add('js');try{var t=localStorage.getItem('kk-theme');if(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){t='dark'}if(t){document.documentElement.setAttribute('data-theme',t)}}catch(e){}</script>
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/responsive.css">
  <link rel="stylesheet" href="/css/animations.css">
  ${renderJsonLd(jsonLd)}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  ${renderHeader(path)}
  <main id="main">
${body}
  </main>
  ${renderFooter()}
  ${scriptTags}
</body>
</html>
`;
}

module.exports = { renderPage, renderSearchForm, whatsappLink };
