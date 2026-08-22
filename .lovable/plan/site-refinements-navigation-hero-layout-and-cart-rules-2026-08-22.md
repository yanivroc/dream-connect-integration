# Site refinements: navigation, hero, layout and cart rules

## 1. Blog/section items open their own page
Every card under a section (including Published Blog Posts) becomes fully clickable to its own detail page — title and image both link through, for info pages and products alike. On product cards the quantity + Add to cart controls stay usable without triggering navigation. The product detail page keeps its own Add to cart panel, so a product opened from a blog list can be purchased there.

## 2. Cart icon only when the cart has items
The header cart button renders only when the item count is greater than zero (hidden at zero), so an empty cart shows no icon.

## 3. Collapsed navbar at all widths
The header always uses the compact menu: logo on the left, menu button on the right, and the page links appear in a slide-down/overlay panel — no inline horizontal link row on desktop. This avoids the long page titles crowding the bar. The panel list is scrollable for long menus.

## 4. Hero slider images visible
Reduce the heavy overlay: single soft gradient scrim tuned for text contrast instead of the current double overlay, so the slide images read clearly behind the copy. Add prev/next controls alongside the dots.

## 5. Typography and alignment
One font family and consistent heading/body scale across hero, sections, cards and detail pages. Section content is left-aligned instead of centered, laid out as a two-column band on desktop: text left, images right (stacked on mobile, text first). Hero content also left-aligned within the container.

## 6. Quantity limits from product data
Quantity inputs (card, detail panel and cart drawer/page) clamp to the product's `minQty`/`maxQty` from the CMS. Increasing past max is blocked with a short toast ("Only N available"), and adding an item already in the cart tops out at max rather than exceeding it.

## 7. Remove cart link from footer
Drop the "Cart" link from the footer contact column.

## 8. Success Stories Testimonials: one image at a time
Image galleries render as a single-image carousel with back/next arrows and a counter, instead of a grid. Applies to any page whose media is a set of images (Testimonials included).

## Technical notes
- Files touched: `SiteHeader.tsx` (always-collapsed nav, conditional cart icon), `HeroSlider.tsx` (overlay, arrows, left alignment), `PageMedia.tsx` (single-image carousel), `PageCardGrid.tsx` / `ProductCard.tsx` (card-wide links, stop-propagation on controls), `AddToCartPanel.tsx` and `cart.tsx` (min/max clamping, max-aware `add`), `CartSheet.tsx` / `cart.tsx` route (qty clamping), `SiteFooter.tsx` (remove cart link), `index.tsx` and `page.$slug.tsx` (left-aligned text/image-right layout), `styles.css` (font + type scale tokens).
- No backend, API or checkout logic changes; presentation plus cart quantity clamping only.
