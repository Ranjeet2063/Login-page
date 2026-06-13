# ShopSphere E-Commerce Website

A complete, responsive, production-style e-commerce implementation with:

- Modern UI/UX (home, shop, product details, cart, checkout, auth, dashboard, wishlist, order tracking, contact, about, FAQ)
- Dark mode and professional animations
- Product search, filter, sorting, and pagination
- Cart, coupon, wishlist, and order flow (frontend)
- Secure backend API with JWT auth, bcrypt hashing, CSRF token endpoint, XSS/mongo sanitization, input validation, and rate limiting
- Admin analytics endpoint and management-ready API structures
- Deployment config (Dockerfile + docker-compose)

## Folder Structure

```
.
├── index.html
├── styles.css
├── app.js
├── backend
│   ├── package.json
│   ├── .env.example
│   └── src
│       ├── server.js
│       ├── models/index.js
│       ├── middleware/
│       └── routes/index.js
├── Dockerfile
└── docker-compose.yml
```

## Frontend (Static)

Open `/home/runner/work/Login-page/Login-page/Ranjeet2063/Login-page/index.html` in a browser.

## Backend (Node + Express + MongoDB)

```bash
cd /home/runner/work/Login-page/Login-page/Ranjeet2063/Login-page/backend
npm install
cp .env.example .env
npm run start
```

API base URL: `http://localhost:5000/api`

## Key API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/products`
- `POST /api/orders`
- `GET /api/orders/me`
- `GET /api/orders/:id/tracking`
- `GET /api/admin/analytics` (admin)
- `POST /api/payments/intent`
- `GET /api/csrf-token`

## Security Implemented

- Password hashing with bcrypt
- JWT authentication
- CSRF token endpoint (`csurf`)
- Helmet headers
- XSS sanitization (`xss-clean`)
- NoSQL injection sanitization (`express-mongo-sanitize`)
- HPP protection
- Input validation (`express-validator`)
- Rate limiting (`express-rate-limit`)

## Performance & SEO

- Lazy-loaded product and hero images
- Lightweight static assets for fast load
- Semantic HTML and SEO meta tags
- Responsive breakpoints for mobile/tablet/desktop

## Deployment

```bash
docker compose up --build
```
