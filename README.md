# Victoria Perfume Store

A luxury perfume storefront: a React (JavaScript) frontend and a Django
REST Framework + PostgreSQL backend, wired together with clean REST APIs.

```
victoria-perfume-store/
├── backend/     Django REST API (products, users, cart, orders) — PostgreSQL
└── frontend/    React + Vite storefront (converted from TypeScript to JS)
```

The frontend's design, layout, colors, images, and animations are exactly as
they were originally — only the data (products, cart, orders, users) now
comes from a real backend instead of being hardcoded/in-memory.

## Quick start

You'll run two things side by side: the Django API and the Vite dev server.

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env                # then edit .env with your Postgres credentials

# make sure the database in .env exists first, e.g.:
# psql -U postgres -c "CREATE DATABASE victoria_perfume;"

python manage.py migrate
python manage.py seed_products      # loads the 4 Victoria fragrances
python manage.py createsuperuser    # optional, for /admin/
python manage.py runserver
```

Backend now running at **http://localhost:8000**.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env                # defaults already point at localhost:8000
npm run dev
```

Frontend now running at **http://localhost:5173**.

Open that URL — the product grid should load from the backend automatically.

## How it fits together

- Browsing products, viewing details, and reading About/Contact needs no
  login — those come from the public `/api/products/` endpoints.
- Adding to cart, viewing the cart, and checking out require an account.
  Clicking "Add to Cart" while logged out sends you to the Login/Register
  page.
- Checkout ("Pay with PayPal") converts the current cart into an order via
  the backend, clears the cart, and shows the order on the new Orders page.
- Full API reference and design notes: see `backend/README.md`.
- Details of what changed in the frontend code: see `frontend/README.md`.

## Tech stack

- **Frontend**: React 19, Vite, Tailwind (only for the base CSS import that
  was already in the project), plain `fetch` for API calls — no extra
  libraries added.
- **Backend**: Django 5, Django REST Framework, PostgreSQL, DRF Token
  Authentication, `django-cors-headers`.

## Troubleshooting

- **"Couldn't reach the store server" on the homepage** — the backend isn't
  running, or `VITE_API_URL` in `frontend/.env` doesn't match where it's
  running.
- **CORS errors in the browser console** — make sure `CORS_ALLOWED_ORIGINS`
  in `backend/.env` includes `http://localhost:5173`.
- **`django.db.utils.OperationalError` on migrate** — PostgreSQL isn't
  running, or the database named in `backend/.env` doesn't exist yet (create
  it with `createdb` or `psql`).
