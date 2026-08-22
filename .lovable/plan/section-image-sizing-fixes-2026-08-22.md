# Section image sizing fixes

## 1. Images render in full, never cropped
Section images currently sit in a fixed 320px-tall box with `object-cover`, which cuts off tall artwork (the "Grow Your Business" graphic loses its heading and chart top). Change the media frame to preserve the image's own proportions: no fixed height, `object-contain` with a max height cap (about 70vh) so a tall portrait image shows end to end and a wide image stays wide. The card border/rounding stays.

## 2. Wider gallery for image-heavy sections (Testimonials)
When a section has more than one image, the media block moves out of the narrow right-hand column and renders as a full-width row directly under that section's text. The carousel then uses the full container width, so each image scales nicely inside a consistent frame with the arrows and the "1 / 2" counter.

Sections with a single image (or a video) keep the current two-column layout: text left, image right.

## Technical notes
- `src/components/site/PageMedia.tsx`: drop `h-80 object-cover`; use `w-full max-h-[70vh] object-contain` on a neutral padded frame; keep arrows/counter; accept an optional `wide` prop for the full-width variant.
- `src/routes/index.tsx` and `src/routes/page.$slug.tsx`: choose layout per section — multi-image sections render text full width with `<PageMedia wide />` in a row below; others keep the `lg:grid-cols-2` text/image split.
- Presentation only; no content, cart or checkout logic changes.
