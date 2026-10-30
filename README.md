# KhojKharid.online

Static product comparison site (Daraz affiliate). No database, no framework.

## Every time you change something
1. Product data: edit `data/products.csv` (export it from your spreadsheet as CSV UTF-8).
2. Product photos: put them in `src/images/products/` (never in `dist/`). The file name must match `image_url` in the CSV exactly, for example `/images/products/p01.jpeg`.
3. Flash Sale / 11.11 link: edit `flash-sale.config.js` (set `active: true` and paste the link).
4. Check and preview:
   ```
   npm run validate
   npm run build
   npm run serve
   ```
   then open http://localhost:3000

`dist/` is generated automatically. Never edit it by hand.

## Put the site online with GitHub Pages
1. Create a GitHub repository and upload everything in this folder (not `dist`, not `node_modules`).
2. Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Each upload to the `main` branch now validates, builds and publishes the site automatically (see the Actions tab).
4. Custom domain: Settings → Pages → Custom domain → `khojkharid.online`, then add the DNS records GitHub shows at your domain provider. Tick "Enforce HTTPS" when it becomes available.
