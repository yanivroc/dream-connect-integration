# Vercel env vars + email delivery fix (match reference project)

## Environment variables to add on Vercel

Required for the site to load content at all:

- `DREAMOZTECH_API_KEY`
- `DREAMOZTECH_API_SECRET`

Card payments (Square):

- `SQUARE_ENVIRONMENT` (`sandbox` or `production`)
- `SQUARE_APPLICATION_ID`
- `SQUARE_LOCATION_ID`
- `SQUARE_ACCESS_TOKEN`

Order emails (SMTP):

- `MAIL_FROM_NAME`
- `MAIL_FROM_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASSWORD`

Address autocomplete on the checkout page:

- `GoogleMapsKey` — browser key for Google Places; the checkout address field will be upgraded to an autocomplete input (same as the reference project), served through a server function so the key is read from the environment and the address, city, postcode and country fields fill in automatically. Manual typing still works if the key is missing or Places is unavailable.

## Current state (verified)

- Square checkout **is** wired: the checkout page loads the Square Web Payments SDK, tokenizes the card, and a server function re-prices the order from the live API and charges `/v2/payments`. This part matches the reference project.
- Order email is **not** deliverable as built: it opens a raw SMTP socket (`node:net` / `node:tls`) from the server bundle. The deployed runtime cannot open SMTP sockets, so the send silently fails (it is caught and logged) and no email is ever received.
- Only the buyer would have been emailed — no owner copy, no invoice attachment.

## What to change

1. **Add a Node serverless mail relay** at `api/send-mail.ts` (same approach as the reference project): runs on Vercel's Node runtime, uses `nodemailer` with the `SMTP_*` vars, validates the payload, and is protected by an internal token derived from `SMTP_PASSWORD` (HMAC), so it cannot be called by outsiders.
2. **Replace `src/lib/mail.server.ts`** with a relay client that posts to `/api/send-mail` on the same origin (falling back to `VERCEL_URL` when there is no request context), matching the reference `mailer.server.ts`. The hand-rolled SMTP code is deleted.
3. **Add a proper order email module** that, after a successful payment, sends:
   - buyer confirmation with itemised table, shipping, total and Square receipt link;
   - a copy to the store owner (from the web app's email in the API content), with reply-to set to the buyer.
4. **Wire it into checkout** after the payment succeeds, still best-effort so a captured payment is never failed by an email problem, but surfacing a warning toast if the email did not go out.
5. Add `nodemailer` (+ types) as a dependency.

## Technical notes

- The relay is Node-only and lives outside the app bundle; the app itself stays on the edge runtime.
- No new environment variables beyond the list above — the relay reuses the same `SMTP_*` / `MAIL_FROM_*` values.
- After adding or changing any of these variables in Vercel, redeploy for them to take effect.
- Invoice PDF attachment (present in the reference project) is left out unless you want it; say the word and I'll port that too.
