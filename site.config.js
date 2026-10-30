// One place for site-wide settings. Edit here, not inside templates.
module.exports = {
  siteName: 'KhojKharid',
  domain: 'https://khojkharid.online', // no trailing slash
  tagline: 'Find Better Products. Compare Smarter.',
  description:
    'KhojKharid helps shoppers in Nepal research and compare products, then check the current price on Daraz.',
  contact: {
    email: 'info@khojkharid.online',
    whatsappDisplay: '+977 9811016309',
    whatsappDigits: '9779811016309' // digits only, with country code, for the wa.me link
  },
  legalUpdated: '28 October 2026', // change this date whenever you edit the legal pages
  footerExplore: [
    { label: 'Home', href: '/' },
    { label: 'All products', href: '/products/' },
    { label: 'Categories', href: '/categories/' },
    { label: 'Compare products', href: '/compare/' }
  ],
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories/' },
    { label: 'Compare', href: '/compare/' }
    // "Deals" is intentionally absent: there is no genuine deal data yet.
  ],
  footerLinks: [
    { label: 'About KhojKharid', href: '/about/' },
    { label: 'Contact', href: '/contact/' },
    { label: 'Affiliate Disclosure', href: '/affiliate-disclosure/' },
    { label: 'Privacy Policy', href: '/privacy-policy/' },
    { label: 'Terms and Conditions', href: '/terms/' }
  ]
};
