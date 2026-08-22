# Fluid text-wrap layout for page detail images

On a page detail view (`/page/<slug>`) the image currently sits full width below the whole description, so it renders huge and the text stops dead above it. Instead, the image should sit at the right, sized to a comfortable column, with the body text flowing beside it and continuing underneath once the text runs past the image — the magazine-style wrap in the second reference.

## Change

- On the detail page, a single image (no video, no multi-image gallery) renders as a right-floated card inside the text container: about half the container width on desktop, capped so tall artwork stays readable, with margin on the left/bottom so text doesn't crowd it.
- Body text flows around it; once the copy is longer than the image, it continues full width beneath.
- On mobile the float is dropped — image stacks full width above/below the text as it does today.
- Sections with a video or more than one image keep the existing block layout (carousel needs full width and stable arrows).
- Home page sections are unchanged.

## Technical notes

- `src/components/site/PageMedia.tsx`: add a `float` variant that wraps the single-image card in `float-none w-full md:float-right md:ml-8 md:mb-4 md:w-1/2 lg:w-[46%]` and constrains the image with `w-full h-auto object-contain`. Keep the existing `wide` and default variants intact.
- `src/routes/page.$slug.tsx`: render `<PageMedia float />` before `<RichText />` inside a shared wrapper so the float takes effect, and add `clear-both` after the prose block so the Add-to-cart panel and child card grid start below the image. Fall back to the current stacked order when the page has a video or multiple images.
- Presentation only; no content, cart, or checkout logic changes.
