# Same fluid image layout on product pages

Product detail pages currently fall back to the old stacked layout whenever the page has a carousel (more than one image) or a video, so the picture drops full width below everything. Product pages should use the same magazine-style wrap the info pages got: image floated right, title/price/description/add-to-cart flowing beside it.

## Change

- Extend the floated media layout to product pages, including multi-image ones — the carousel becomes the floated card at roughly half the container width on desktop, with prev/next arrows and the "1 / 3" counter staying inside that card.
- The description text wraps beside the image and continues underneath when it runs longer.
- Price and the Add-to-cart panel sit in the flowing text column beside/below the image, not pushed under it; the panel keeps its current max width so it doesn't stretch oddly.
- Anything after the prose (external link, child card grid) starts below the floated image via a clear.
- Video sections keep the existing full-width block layout (iframes don't scale down well in a narrow float).
- Mobile is unchanged: image stacks full width, no float.

## Technical notes

- `src/routes/page.$slug.tsx`: change `canFloatMedia` to `images.length >= 1 && !videoUrl && !videoEmbed`, and move the price + `AddToCartPanel` inside the floated wrapper (the element that carries `after:clear-both`) so they wrap beside the image; keep the clear before `page.hyperlink` and the Explore grid.
- `src/components/site/PageMedia.tsx`: no structural change needed — arrows are already absolutely positioned inside the card. Only verify arrow hit areas at the narrower floated width and shrink the arrow padding slightly if they crowd the image.
- Presentation only; no cart, pricing, or checkout logic changes.
