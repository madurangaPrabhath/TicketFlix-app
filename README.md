# 🎬 TicketFlix App

TicketFlix is a full-stack movie ticket booking platform with a React frontend and an Express + MongoDB backend.
It includes user booking flows, favorites, notifications, Stripe payments, and an admin panel for shows, bookings, and settings.

## 📌 Project Overview

The repository is split into two apps:

- `client`: React + Vite frontend
- `server`: Node.js + Express API with MongoDB

Core capabilities:

- 🎥 Browse now-playing and upcoming movies
- 📅 View movie details, schedules, and seat availability
- 🎟️ Book and manage tickets
- 💳 Pay via Stripe (card/wallet/local bank methods) or bank transfer review flow
- ❤️ Save favorites and sync favorite metadata to user profile
- 🔔 Receive in-app notifications
- 🛠️ Use an admin dashboard for shows, bookings, analytics, and settings

## 🧰 Tech Stack

### Frontend

- React 19
- Vite 7
- React Router
- Clerk (authentication)
- Stripe Elements
- Tailwind CSS 4
- Axios
- react-hot-toast

### Backend

- Node.js + Express 5
- MongoDB + Mongoose
- Clerk middleware and SDK
- Stripe SDK
- Inngest (Clerk user sync handlers)
- Axios (TMDB integration)

## 🗂️ Monorepo Structure

```text
TicketFlix-app/
	client/                  # React app
		src/
			components/          # Reusable UI components
			context/             # Global app state + API access
			pages/               # User and admin route pages
			utils/
		package.json

	server/                  # Express API
		configs/               # DB config
		controllers/           # Route handlers/business logic
		models/                # Mongoose models
		routes/                # API route definitions
		inngest/               # Inngest functions for Clerk sync
		utils/                 # Notification helpers
		package.json
```

## 🏗️ Application Architecture

1. Frontend calls API through `VITE_BASE_URL` (defaults to `http://localhost:3000/api`).
2. Backend exposes REST endpoints under `/api/*`.
3. MongoDB stores users, shows, bookings, favorites, notifications, and admin settings.
4. Movies are fetched from TMDB first, with DB fallback in selected flows.
5. Stripe payment intents are created and confirmed on backend.
6. Inngest functions sync Clerk user events (`created`, `updated`, `deleted`) into MongoDB user records.

## 📸 Screenshots

> Place screenshot files in `docs/screenshots/` using the names below.

| Home | Movies |
|------|--------|
| ![TicketFlix Home](docs/screenshots/home-page.png) | ![TicketFlix Movies](docs/screenshots/movies-page.png) |

| Theaters | My Bookings |
|----------|-------------|
| ![TicketFlix Theaters](docs/screenshots/theaters-page.png) | ![TicketFlix My Bookings](docs/screenshots/my-bookings-page.png) |

| Admin Dashboard |
|-----------------|
| ![TicketFlix Admin Dashboard](docs/screenshots/admin-dashboard.png) |

## 🚀 Getting Started

### 1. ✅ Prerequisites

- Node.js 18+
- npm 9+
- MongoDB running locally or a hosted MongoDB URI
- Clerk app (publishable and secret keys)
- Stripe account (publishable/secret keys and optional webhook secret)
- TMDB API key

### 2. 📦 Install Dependencies

From the repository root:

```bash
cd client && npm install
cd ../server && npm install
```

### 3. 🔐 Environment Variables

Create `client/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_BASE_URL=http://localhost:3000/api
```

Create `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/ticketflix

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

TMDB_API_KEY=your_tmdb_api_key

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_optional

# Optional (if you add Cloudinary-backed media uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. ▶️ Run the Apps

Start backend:

```bash
cd server
npm run server
```

Start frontend in a second terminal:

```bash
cd client
npm run dev
```

Default URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- API base: `http://localhost:3000/api`

## 🧪 Available Scripts

### Client (`client/package.json`)

- `npm run dev`: Start Vite dev server
- `npm run build`: Production build
- `npm run preview`: Preview built app
- `npm run lint`: Run ESLint

### Server (`server/package.json`)

- `npm run server`: Start API with nodemon
- `npm start`: Start API with node

## 🌐 API Overview

Base URL: `/api`

### ❤️ Health

- `GET /` -> Server status

### 🎭 Shows

- `GET /shows/now-playing`
- `GET /shows/upcoming`
- `GET /shows/all`
- `GET /shows/:movieId`
- `GET /shows/movie/:movieId`
- `GET /shows/movie/:movieId/date/:date`
- `GET /shows/details/:showId`
- `GET /shows/seats/:showId`
- `POST /shows/book/:showId`
- `POST /shows/release/:showId`

### 🎞️ Movies

- `GET /movies`
- `GET /movies/search?q=...`
- `GET /movies/genre?genre=...`
- `GET /movies/top-rated`
- `GET /movies/status/:status`
- `GET /movies/:movieId`
- `POST /movies/add`
- `PUT /movies/:movieId`
- `DELETE /movies/:movieId`

### 🎫 Bookings

- `GET /bookings/verify`
- `GET /bookings/summary/:bookingId`
- `GET /bookings/:bookingId`
- `GET /bookings/user/:userId`
- `GET /bookings/user/:userId/active`
- `GET /bookings/user/:userId/past`
- `POST /bookings`
- `PUT /bookings/:bookingId`
- `PUT /bookings/:bookingId/payment`
- `DELETE /bookings/:bookingId`
- `DELETE /bookings/:bookingId/permanent`

### 👤 Users + Admin (under `/users`)

- User profile, preferences, favorites, dashboard, booking history
- Admin endpoints for dashboard, shows, bookings, users, and reports

### ⚙️ Settings + Notifications

- Notification CRUD/read routes
- Public pricing route
- Admin settings sections (theme, dashboard, theater, pricing, notifications, security, reset)

### 💰 Payments

- `POST /payments/create-payment-intent`
- `POST /payments/confirm-payment`
- `POST /payments/bank-transfer/submit`
- `POST /payments/bank-transfer/review/:bookingId`
- `POST /payments/cancel/:bookingId`
- `POST /payments/refund/:bookingId`
- `GET /payments/status/:paymentIntentId`
- `POST /payments/webhook`

## 🙋 User Flows

1. Discover movies and select a show/date.
2. Choose seats from the seat layout.
3. Create booking and proceed to payment.
4. Confirm payment and finalize booking.
5. Access booking history and notifications.

## 🧑‍💼 Admin Flows

1. Open `/admin` routes after sign-in.
2. Manage shows and bookings.
3. Review analytics and system metrics.
4. Configure pricing, theater rules, themes, and notification settings.

## ☁️ Deployment Notes

- `client/vercel.json` rewrites all routes to `/` for SPA routing.
- `server/vercel.json` routes all requests to `server.js`.
- Configure all required environment variables in your hosting provider.

## 🔒 Security and Ops Recommendations

- Keep all secrets in environment variables only.
- Do not commit `.env` files with real keys.
- Add role-based guards to sensitive admin endpoints if not already enforced externally.
- Add request validation and rate-limiting for public-facing endpoints.

## 🔮 Future Improvements

- Add automated tests (unit + integration + API contract)
- Add centralized validation (e.g., Zod/Joi)
- Add logging/monitoring (request tracing + error monitoring)
- Add CI checks for lint/build/test

---

If you use this as a base for production, start by hardening auth/authorization and secrets management before go-live.

## ✍️ Author

- Maduranga Prabhath
