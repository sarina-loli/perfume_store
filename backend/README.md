# Victoria Perfume Store — Backend

A simple Django REST Framework API that powers the Victoria Perfume Store frontend.

## What's inside

| App        | Responsible for |
|------------|-----------------|
| `products` | The perfume catalog (list + detail) |
| `accounts` | Register / login / logout / current user (token auth) |
| `cart`     | Each logged-in user's shopping cart |
| `orders`   | Checking out a cart into an order, and order history |

Auth uses Django REST Framework's built-in **Token Authentication** — simple,
well-documented, and enough for a store like this. The frontend sends
`Authorization: Token <token>` on requests that need a logged-in user.

## 1. Prerequisites

- Python 3.10+
- PostgreSQL running locally (or accessible somewhere)

## 2. Create a database

Using the `psql` shell (adjust the name/user to match your `.env`):

```bash
psql -U postgres -c "CREATE DATABASE victoria_perfume;"
```

## 3. Set up the Python environment

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 4. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your real PostgreSQL credentials and a random
`SECRET_KEY`. The defaults work fine for local development if your Postgres
user/password are both `postgres`.

## 5. Run migrations and load the starter products

```bash
python manage.py migrate
python manage.py seed_products
```

`seed_products` inserts the four Victoria fragrances shown on the frontend
(Bloom, Noir, Royale, Mist) so the site has real data to display immediately.

## 6. (Optional) Create an admin user

```bash
python manage.py createsuperuser
```

This lets you view/edit products, users, carts and orders at `/admin/`.

## 7. Start the server

```bash
python manage.py runserver
```

The API is now available at `http://localhost:8000/api/`.

## API reference

| Method | Endpoint                    | Auth required | Description |
|--------|------------------------------|:---:|--------------|
| GET    | `/api/products/`             |  | List all products (now includes `category`, `stock`, `in_stock`) |
| GET    | `/api/products/<id>/`        |  | Product detail |
| POST   | `/api/auth/register/`        |  | `{username, email, password}` → `{token, user}` |
| POST   | `/api/auth/login/`           |  | `{username, password}` → `{token, user}` |
| POST   | `/api/auth/logout/`          | ✅ | Invalidates the current token |
| GET    | `/api/auth/user/`            | ✅ | Current logged-in user |
| GET    | `/api/cart/`                 | ✅ | Current user's cart |
| POST   | `/api/cart/items/`           | ✅ | `{product_id, quantity}` — add or increment |
| PATCH  | `/api/cart/items/<product_id>/` | ✅ | `{quantity}` — set an exact quantity (0 removes it) |
| DELETE | `/api/cart/items/<product_id>/` | ✅ | Remove an item from the cart |
| POST   | `/api/orders/`                | ✅ | Disabled — returns 400. Use `/api/payments/checkout/` |
| GET    | `/api/orders/`                | ✅ | List the current user's past orders (pending/paid/failed/cancelled) |
| GET    | `/api/orders/<id>/`           | ✅ | A single order's detail |
| POST   | `/api/payments/checkout/`     | ✅ | Snapshots the cart into a pending order, returns `{checkout_url, order_id}` — redirect the browser to `checkout_url` |
| GET    | `/api/payments/verify/?session_id=` | ✅ | Called by the success page; re-checks the session with Stripe and finalizes the order |
| POST   | `/api/payments/cancel/`       | ✅ | `{order_id}` — marks a still-pending order as cancelled |
| POST   | `/api/payments/webhook/`      |  | Stripe-only. Verified via the `Stripe-Signature` header, not a user token |

For authenticated requests, send the header:

```
Authorization: Token <token from login/register>
```

## Payments (Stripe)

Checkout uses **Stripe Checkout** (Stripe's own hosted payment page), so
card data never touches this app and the frontend never needs any Stripe
key — it just redirects to the URL `/api/payments/checkout/` returns.

1. Create a free account at https://dashboard.stripe.com and grab your
   **test mode** secret key from https://dashboard.stripe.com/test/apikeys.
2. In `backend/.env`, set:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   FRONTEND_URL=http://localhost:5173
   ```
3. For webhooks in local dev, install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
   and run:
   ```bash
   stripe listen --forward-to localhost:8000/api/payments/webhook/
   ```
   It prints a `whsec_...` value — put that in `STRIPE_WEBHOOK_SECRET`.
   (Webhooks aren't strictly required to test the flow locally — the
   success page also calls `/api/payments/verify/`, which checks the
   payment status with Stripe directly. The webhook is what makes it
   reliable in production, where the customer's browser might not survive
   long enough to hit the verify endpoint.)
4. Test with [Stripe's test cards](https://stripe.com/docs/testing), e.g.
   `4242 4242 4242 4242`, any future expiry, any CVC.

What happens on a purchase:
- `POST /api/payments/checkout/` snapshots the cart into a **pending**
  `Order`, validates stock, and opens a Stripe Checkout session for the
  total (subtotal + 8% tax).
- The browser is redirected to Stripe's hosted page. Nothing in this app
  ever sees card details.
- On success, Stripe redirects to `/payment/success?session_id=...`. That
  page calls `/api/payments/verify/`, which re-checks the session with
  Stripe, and only then: decrements stock, marks the order `paid`, and
  clears the cart. This is idempotent — calling it twice, or racing with
  the webhook, never double-processes.
- On cancel, Stripe redirects to `/payment/cancel?order_id=...`; the order
  is marked `cancelled` and the cart is left untouched so the customer can
  just try again.
- A `Payment` row is kept per checkout attempt (`backend/payments/models.py`)
  for audit/debugging — visible in `/admin/`.

## Notes on the design choices

- **Token auth over JWT**: fewer moving parts, no expiry/refresh logic to
  build for a learning project, and it's built into DRF.
- **One cart per user**: kept simple on purpose — carts require login, so
  there's no anonymous/session cart merging logic to worry about.
- **Orders snapshot product name & price**: so an order still displays
  correctly even if a product's price changes later.
- **Decimals as numbers**: `COERCE_DECIMAL_TO_STRING = False` in settings so
  the frontend receives `185.0` instead of `"185.00"` and can do math on it
  directly.
