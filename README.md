# DreamozTech Connect Integration

A website driven entirely by the live DreamozTech web app API, with a shopping cart and Square card checkout.

## Content source (verified live)

The API works with the supplied key/secret. Today it returns:

- Web app: "DreamozTech" (title, description, email, link), logo/favicon currently null
- Page 1 (orderNo 1) "DreamozTech Digital Innovations" with 3 images (base64 data URLs) and 3 sub-pages
- Page 2 "Professional Digital Services", Page 3 "Scale with Confidence" — no children, no images
- No page currently has `product.enabled: true`, and shipping rates are empty

So the storefront will render zero products until products are enabled in the admin — the code handles both cases.

## Structure rules

- Pages render in `orderNo` order; disabled pages are skipped.
- **Page 1** is the home hero: an auto-playing image slider (its `images`, ordered by `orderNo`, each clickable if `hyperlink` set) with centered title and description over/below it.
- **Remaining top-level pages** render in display order as centered content sections, each also getting its own route.
- **Sub-pages** render as a responsive card grid under their parent, each card linking to its own page.
- **Blog / shop section**: any top-level page whose children include product pages is treated as the blog section. Inside it, children with `product.enabled: false` render as normal article pages, and children with `product.enabled: true` render as product cards with price, quantity selector (respecting `minQty`/`maxQty`) and **Add to cart**.
- Video (`videoUrl` / `videoEmbed`) and `hyperlink` fields are rendered when present.

## Cart and checkout

- Cart lives in the browser (localStorage), with a header cart badge and a slide-over cart.
- Shipping cost from the API's `shippingRates` (`byQuantity` / `byAmount` thresholds) plus per-product `shippingPrice`; totals in the rate currency (AUD).
- Checkout page collects contact + shipping details and renders the **Square Web Payments SDK** card form; the tokenized card is charged by a server endpoint using the Square access token. Order confirmation email is sent via SMTP.
- Orders are not stored in a database (per your choice) — Square holds the record and the confirmation email is the receipt.

## Pages

- `/` — hero slider + all sections in order
- `/page/$slug` — any page (slug from title), with its sub-page cards
- `/cart`, `/checkout`, `/checkout/success`
- Each route sets its own SEO title/description from the page's `seoDescription` and `keywords`.

## Technical notes

- Token + webapp fetch happens in a server function (`API key/secret stored as secrets`, never in the browser), with the bearer token cached in memory until expiry and the content cached briefly to avoid refetching on every request.
- Images arrive as large base64 data URLs; they are passed straight to `<img>` and lazy-loaded below the fold.
- Square: `SQUARE_APPLICATION_ID` and `SQUARE_LOCATION_ID` are exposed to the browser for the card form; `SQUARE_ACCESS_TOKEN` and `SQUARE_ENVIRONMENT` stay server-side.
- Secrets used (added by you later; the app shows a clear message if missing): `DREAMOZTECH_API_KEY`, `DREAMOZTECH_API_SECRET`, `GoogleMapsKey`, `SQUARE_ENVIRONMENT`, `SQUARE_APPLICATION_ID`, `SQUARE_LOCATION_ID`, `SQUARE_ACCESS_TOKEN`, `MAIL_FROM_NAME`, `MAIL_FROM_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`.
- Design: dark, modern tech aesthetic with a semantic token palette; no hardcoded colors.

## Out of scope for this pass

- Admin/editing of content (the DreamozTech admin owns it)
- Google Maps usage — no map data exists in the API yet; the key is reserved for a later contact/location block.
