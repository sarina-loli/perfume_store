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
| GET    | `/api/products/`             |  | List all products |
| GET    | `/api/products/<id>/`        |  | Product detail |
| POST   | `/api/auth/register/`        |  | `{username, email, password}` → `{token, user}` |
| POST   | `/api/auth/login/`           |  | `{username, password}` → `{token, user}` |
| POST   | `/api/auth/logout/`          | ✅ | Invalidates the current token |
| GET    | `/api/auth/user/`            | ✅ | Current logged-in user |
| GET    | `/api/cart/`                 | ✅ | Current user's cart |
| POST   | `/api/cart/items/`           | ✅ | `{product_id, quantity}` — add or increment |
| PATCH  | `/api/cart/items/<product_id>/` | ✅ | `{quantity}` — set an exact quantity (0 removes it) |
| DELETE | `/api/cart/items/<product_id>/` | ✅ | Remove an item from the cart |
| POST   | `/api/orders/`                | ✅ | Checks out the current cart into a new order |
| GET    | `/api/orders/`                | ✅ | List the current user's past orders |
| GET    | `/api/orders/<id>/`           | ✅ | A single order's detail |

For authenticated requests, send the header:

```
Authorization: Token <token from login/register>
```

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
