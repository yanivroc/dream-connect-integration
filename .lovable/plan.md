# Let tall section images render at full height

On the home page, section images (Services & Expert Partnership, Scale with Confidence, and the other single-image sections) are tall portrait artwork (764x1400) but the media frame caps them at 60% of the viewport height, so they look squeezed relative to the text column.

## Change

Remove the height cap on single-image section media so the image renders at its natural proportions, filling the width of its column and running as long as it needs. Multi-image wide galleries (Testimonials) keep their current cap so the carousel stays usable.

## Technical notes

- `src/components/site/PageMedia.tsx`: for the non-`wide` variant, drop `max-h-[60vh]` and use `w-full h-auto object-contain`; keep `max-h-[70vh]` for the `wide` gallery variant.
- Presentation only; no content, cart, or checkout changes.
