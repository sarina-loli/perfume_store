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

## What changed from the original

- All `.tsx`/`.ts` files converted to `.jsx`/`.js` — same JSX, same CSS, same
  animations, just no type annotations or TypeScript tooling.
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
