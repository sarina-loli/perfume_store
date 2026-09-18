# Victoria Perfume Store — Frontend

A React + Vite storefront. This is the original design/animations/layout,
converted from TypeScript to plain JavaScript and connected to the Django
backend in `../backend`.

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # only needed if your backend isn't at localhost:8000
npm run dev
```

The site runs at `http://localhost:5173`. Make sure the backend (see
`../backend/README.md`) is running first, or the product list and login will
show a "couldn't reach the store server" message.

## Routing

The app uses [React Router](https://reactrouter.com/) (`react-router-dom`),
with every page on its own URL:

| URL                | Page            |
|---------------------|-----------------|
| `/`                  | Home            |
| `/products`          | Products        |
| `/products/:id`      | Product Details |
| `/cart`              | Cart            |
| `/checkout`          | Checkout        |
| `/orders`            | Orders          |
| `/login`             | Login           |
| `/register`          | Register        |
| `/profile`           | Profile         |
| `/about`             | About           |
| `/contact`           | Contact         |
| `/payment/success`   | Stripe return — payment succeeded |
| `/payment/cancel`    | Stripe return — payment cancelled |

`/orders`, `/checkout`, and `/profile` require a logged-in user — visiting
them while logged out redirects to `/login`. All other routes are public.
Any unmatched URL redirects to `/`.

### Deploying to Render (or any static host) — SPA fallback

Because this is a client-side-routed single-page app, the **web server**
needs to serve `index.html` for every route, not just `/`, or a refresh (or
a shared link) on something like `/products/3` will 404 — the server has no
file at that path; only React Router, running in the browser, knows what to
do with it.

- **Render**: a `render.yaml` at the repo root already configures this as a
  Static Site with a rewrite rule (`/*` → `/index.html`). Deploy it as a
  Blueprint and Render picks it up automatically. Deploying the static site
  by hand instead? Add the same rewrite under that site's **Settings →
  Redirects/Rewrites**.
- **Netlify**: add a `public/_redirects` file containing `/*  /index.html  200`.
- **Vercel**: add a `vercel.json` with a catch-all rewrite to `/index.html`.

## What changed from the original

- All `.tsx`/`.ts` files converted to `.jsx`/`.js` — same JSX, same CSS, same
  animations, just no type annotations or TypeScript tooling.
- Client-side routing was rewritten to use React Router (`react-router-dom`)
  instead of an in-memory `page` state variable — see "Routing" above.
- `src/api.js` — a small `fetch` wrapper for talking to the backend.
- Products are now loaded from `GET /api/products/` instead of a hardcoded
  array.
- The cart is now stored on the backend per logged-in user instead of only
  in memory.
- Added simple Login/Register, Account, and Orders pages/components, built
  from the exact same CSS classes as the existing Contact and Cart pages so
  they match the site's look.
- "Pay with PayPal" now calls `POST /api/orders/`, which turns the current
  cart into a real order and clears the cart — no real payment processing is
  wired up (there wasn't any in the original either).

Everything else — the hero animation, the SVG bottle, the product cards, the
About/Contact pages — is untouched.
