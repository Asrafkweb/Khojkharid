const { renderSearchForm } = require('./layout');

function renderNotFound() {
  return `    <section class="section">
      <div class="container not-found">
        <h1>Page not found</h1>
        <p>The page you opened doesn't exist or has moved. Search for a product or go back to the homepage.</p>
        ${renderSearchForm('notfound', 'search--large')}
        <p><a class="btn btn--primary" href="/">Go to homepage</a></p>
      </div>
    </section>`;
}

module.exports = { renderNotFound };
