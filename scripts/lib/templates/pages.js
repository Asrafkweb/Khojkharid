// Static pages: About, Contact, Affiliate Disclosure, Privacy Policy, Terms.
// To change the wording, edit the text below, then run: npm run build
const config = require('../../../site.config');
const { whatsappLink } = require('./layout');

const { email, whatsappDisplay } = config.contact;
const DATE = config.legalUpdated;

function legal(title, intro, inner, { showDate = true } = {}) {
  return `<section class="section"><div class="container legal">
  <nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">${title}</li></ol></nav>
  <h1>${title}</h1>
  ${showDate ? `<p class="legal__date">Last updated: ${DATE}</p>` : ''}
  <p class="legal__intro">${intro}</p>
  ${inner}
</div></section>`;
}

const contactLine = `<p>Questions? Email <a href="mailto:${email}">${email}</a> or message us on <a href="${whatsappLink()}" target="_blank" rel="noopener noreferrer">WhatsApp ${whatsappDisplay}</a>.</p>`;

function renderAbout() {
  return legal('About KhojKharid',
    'KhojKharid is a product discovery and comparison website for shoppers in Nepal.',
    `<h2>What we do</h2>
  <p>We collect product details such as price, features and specifications in one place, so you can compare options side by side before you buy. When you are ready, we link you to the product page on Daraz, where you can check the current price and complete your purchase.</p>
  <h2>What we do not do</h2>
  <ul>
    <li>We do not sell, stock, ship or deliver products.</li>
    <li>We do not take payments or ask for your card details.</li>
    <li>We are not Daraz and are not owned by Daraz. Orders, delivery, returns and warranty are handled by Daraz and the seller.</li>
  </ul>
  <h2>How we earn money</h2>
  <p>Many links on this site are affiliate links. If you buy through one, we may earn a small commission at no extra cost to you. Read the full <a href="/affiliate-disclosure/">affiliate disclosure</a>.</p>
  <h2>Accuracy</h2>
  <p>Every product page shows the date the price was last checked. Prices and availability change often on Daraz, so always confirm on the seller's page before you buy. If you spot a mistake, please tell us.</p>
  ${contactLine}`, { showDate: false });
}

function renderContact() {
  return legal('Contact us',
    'We are happy to hear from you: questions, corrections to a product page, or suggestions.',
    `<div class="contact-cards">
    <a class="contact-card" href="mailto:${email}"><strong>Email</strong><span>${email}</span></a>
    <a class="contact-card" href="${whatsappLink()}" target="_blank" rel="noopener noreferrer"><strong>WhatsApp</strong><span>${whatsappDisplay}</span></a>
  </div>
  <h2>Good reasons to write to us</h2>
  <ul>
    <li>A price, feature or specification on a product page looks wrong.</li>
    <li>A link is broken or a product is no longer available.</li>
    <li>You would like us to add a product or category.</li>
    <li>You have a question about our <a href="/privacy-policy/">privacy policy</a> or <a href="/affiliate-disclosure/">affiliate disclosure</a>.</li>
  </ul>
  <h2>Please note</h2>
  <p>We do not sell products, so we cannot help with orders, delivery, refunds or warranty. For those, contact Daraz or the seller directly. We reply as soon as we can.</p>`, { showDate: false });
}

function renderAffiliateDisclosure() {
  return legal('Affiliate Disclosure',
    'KhojKharid is supported by affiliate commissions. This page explains what that means for you.',
    `<h2>Affiliate links</h2>
  <p>Many of the "View Price on Daraz" links on this site are affiliate links. If you click one and make a qualifying purchase on Daraz, KhojKharid may earn a commission.</p>
  <h2>It costs you nothing extra</h2>
  <p>The price you pay on Daraz is the same whether or not you use our link. The commission is paid by Daraz, not by you.</p>
  <h2>How this affects our content</h2>
  <ul>
    <li>We show product details so you can compare, and we do not hide the fact that we earn from links.</li>
    <li>A commission does not change the information we publish about a product.</li>
    <li>We do not claim to test every product ourselves. Details come from the product listing and the seller.</li>
  </ul>
  <h2>Prices and availability</h2>
  <p>Prices shown on KhojKharid are the prices we saw on the "checked" date shown on each page. Daraz and its sellers can change prices, stock and offers at any time. The price on Daraz when you buy is the one that applies.</p>
  <h2>Who is responsible for your order</h2>
  <p>You buy from Daraz and its sellers, not from KhojKharid. Payment, delivery, returns and warranty are handled by them under their own terms.</p>
  ${contactLine}`);
}

function renderPrivacy() {
  return legal('Privacy Policy',
    'This policy explains what information KhojKharid (khojkharid.online) collects, how it is used, and the choices you have. We keep data collection to a minimum.',
    `<h2>1. Who we are</h2>
  <p>KhojKharid is a product discovery and comparison website for shoppers in Nepal. You can contact us at <a href="mailto:${email}">${email}</a>.</p>

  <h2>2. What we do not collect</h2>
  <ul>
    <li>You do not need an account to use this site, and we do not ask you to register.</li>
    <li>We do not take payments and do not collect card or banking details.</li>
    <li>We do not sell your personal information.</li>
  </ul>

  <h2>3. Information stored on your device</h2>
  <p>Our product comparison tool saves the products you choose to compare in your browser's local storage, so your selection stays when you move between pages. This stays on your device. It is not sent to us. You can remove it at any time by using "Clear all" on the compare tray or by clearing your browser's site data.</p>
  <p>The site also remembers whether you chose light or dark mode. This small setting is stored in the same way, on your device only.</p>
  <p>Product search and filters run in your browser. We do not receive or keep what you type.</p>

  <h2>4. If you contact us</h2>
  <p>If you email us or message us on WhatsApp, we receive the details you send, such as your name, email address or phone number, and your message. We use them only to reply to you and to improve our product information. We do not add you to a mailing list unless you ask us to. Messages on WhatsApp are also subject to WhatsApp's own privacy policy.</p>

  <h2>5. Hosting and technical data</h2>
  <p>This website is a static site served by a third-party hosting provider. Like most web hosts, the provider may automatically log technical information when you visit, such as your IP address, browser type, device type and the pages requested, for security and to run the service. We do not control those logs. Please see your host's privacy policy for details.</p>

  <h2>6. Cookies, analytics and advertising</h2>
  <p>KhojKharid does not set its own cookies and does not currently use analytics or advertising trackers. If we add analytics in the future, we will update this page before doing so and explain what is collected.</p>

  <h2>7. Links to Daraz and affiliate tracking</h2>
  <p>Our product pages link to Daraz. Many of these are affiliate links. When you click one, Daraz and its affiliate partners may use cookies or similar technology to recognise that you came from KhojKharid so a commission can be credited. This happens on their sites under their own privacy policies, and we do not see what you view, buy or enter there. We encourage you to read Daraz's privacy policy. See also our <a href="/affiliate-disclosure/">affiliate disclosure</a>.</p>

  <h2>8. Children</h2>
  <p>KhojKharid is intended for a general audience and is not directed at children. We do not knowingly collect personal information from children. If you believe a child has sent us personal information, contact us and we will delete it.</p>

  <h2>9. Your choices</h2>
  <ul>
    <li>Clear your browser's site data to remove the comparison list.</li>
    <li>Ask us to delete any messages you sent us by emailing <a href="mailto:${email}">${email}</a>.</li>
    <li>Use your browser's settings to block or limit cookies on other sites, including Daraz.</li>
  </ul>

  <h2>10. Data security</h2>
  <p>The site is served over HTTPS. We keep the information we hold, such as messages sent to us, to the minimum needed and do not share it except where the law requires.</p>

  <h2>11. Changes to this policy</h2>
  <p>We may update this policy from time to time. The "Last updated" date at the top shows when it last changed.</p>

  <h2>12. Contact</h2>
  <p>For any privacy question, email <a href="mailto:${email}">${email}</a> or message us on <a href="${whatsappLink()}" target="_blank" rel="noopener noreferrer">WhatsApp ${whatsappDisplay}</a>.</p>`);
}

function renderTerms() {
  return legal('Terms and Conditions',
    'By using KhojKharid you agree to these terms. If you do not agree, please do not use the site.',
    `<h2>1. What this site is</h2>
  <p>KhojKharid is an information and comparison website. We do not sell, ship or deliver products, and we are not a party to any purchase you make.</p>

  <h2>2. Information may change</h2>
  <p>We try to keep product details, prices and availability accurate, but we cannot guarantee that they are complete, current or error free. Prices and stock can change on Daraz at any time. Always confirm the price and details on the seller's page before you buy.</p>

  <h2>3. Third-party sites</h2>
  <p>Links on this site lead to Daraz and may lead to other third-party sites. We do not control those sites and are not responsible for their content, products, prices, policies or service. Purchases, payments, delivery, returns and warranty are between you and Daraz or the seller.</p>

  <h2>4. Affiliate links</h2>
  <p>Some links are affiliate links, and we may earn a commission from qualifying purchases at no extra cost to you. See our <a href="/affiliate-disclosure/">affiliate disclosure</a>.</p>

  <h2>5. Intellectual property</h2>
  <p>The KhojKharid name, logo, design and original text belong to KhojKharid. Product names, brands and images belong to their respective owners and are shown to help you identify products. You may not copy or republish our original content at scale without permission.</p>

  <h2>6. Acceptable use</h2>
  <p>Please do not misuse the site, for example by attempting to disrupt it, scrape it in a way that harms its performance, or use it for anything unlawful.</p>

  <h2>7. No warranty and limit of liability</h2>
  <p>The site and its content are provided "as is" and "as available". To the extent permitted by law, KhojKharid is not liable for any loss or damage arising from your use of the site or from decisions you make based on its content, including purchases made on other sites.</p>

  <h2>8. Changes</h2>
  <p>We may change these terms or the site at any time. The "Last updated" date shows the latest version. Continuing to use the site means you accept the updated terms.</p>

  <h2>9. Governing law</h2>
  <p>These terms are governed by the laws of Nepal.</p>

  <h2>10. Contact</h2>
  ${contactLine}`);
}

function renderFlashSale(flash) {
  const { escapeHtml } = require('../html-utils');
  return legal(escapeHtml(flash.title),
    escapeHtml(flash.text),
    `<p><a class="btn btn--primary" href="${escapeHtml(flash.affiliateUrl)}" target="_blank" rel="sponsored nofollow noopener noreferrer">View Flash Sale on Daraz</a></p>
  <p class="disclosure">Affiliate link: KhojKharid may earn a commission from qualifying purchases. We don't sell or ship products. <a href="/affiliate-disclosure/">Learn more</a></p>
  <h2>Good to know</h2>
  <ul>
    <li>Flash sale products, prices and times are set by Daraz and change often.</li>
    <li>Offers can end or sell out quickly. Confirm the price on Daraz before you buy.</li>
    <li>You can also <a href="/products/">browse our products</a> and compare them before you decide.</li>
  </ul>`, { showDate: false });
}

module.exports = { renderFlashSale, renderAbout, renderContact, renderAffiliateDisclosure, renderPrivacy, renderTerms };
