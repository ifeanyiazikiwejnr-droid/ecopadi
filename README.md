# EcoPadi UK — Online Shop

A full-stack ecommerce site for **EcoPadi UK Limited** (Company No. 17215991):
React frontend + Node/Express backend + PostgreSQL, built to be hosted live
on your own domain — the same hosting shape as your Settle-In Buddy project
(Netlify for the frontend, Render for the backend + database).

---

## What's built

- **Product catalog** with categories, variants (size), search, stock levels
- **Guest checkout AND registered accounts with order history** (both, as requested)
- **Free VIP program**: sign-up, free delivery on orders £50+, reward points (1 point per £1 spent)
- **Discount codes** (percent or fixed amount, min spend, expiry, usage limits) — a sample `WELCOME10` (10% off) is seeded
- **Product reviews & star ratings**
- **Payment methods**: Mastercard/Visa + Apple Pay (via Stripe Checkout), PayPal, and Direct Bank Transfer
- **Admin dashboard** (`/admin`) — you manage products, order statuses, and discount codes with a single admin login
- **Delivery info**: UK 2–3 working days, Ireland 3–5 working days, built in
- **FAQ page** with your exact VIP copy
- Currency: GBP throughout, stored as integer pence to avoid rounding errors

### Placeholder content — replace before going live
- **12 sample products** are seeded so the site is fully browsable. Every one has a
  "Sample" badge and `is_placeholder: true` in the database. Replace them via the
  **admin dashboard** once you send over your real product list (names, descriptions,
  images, SKUs, pricing, variants) — or send it to me and I'll write a new seed file.
- **Terms & Conditions, Returns & Refund Policy, and Privacy Policy** pages
  (`/legal/terms`, `/legal/returns`, `/legal/privacy`) are placeholders — these need
  your real documents before launch, both for legal accuracy and because Stripe/PayPal
  require a working Privacy Policy link to approve your account.
- **Logo**: the site currently uses a simple SVG leaf mark matching your brand colours.
  Swap in your real logo file once available.

### A deliberate omission: bank details
Your business account number and sort code are **not** in this codebase. Bank
transfer is offered as a payment method, but the actual account number/sort
code only need to reach the specific customer who chose that option, after
they've placed the order (see `backend/.env.example` — `BANK_TRANSFER_*`
variables, returned only in the authenticated checkout response for
`bank_transfer` orders, never rendered on any public page).

---

## Project structure

```
ecopadi-shop/
  backend/     Express API + PostgreSQL (deploy to Render)
  frontend/    React app (deploy to Netlify)
```

---

## 1. Local setup (test it before deploying)

### Backend
```bash
cd backend
npm install
cp .env.example .env          # fill in DATABASE_URL + JWT_SECRET at minimum
npm run migrate               # creates all tables
npm run seed                  # adds placeholder products + admin login
npm run dev                   # runs on http://localhost:4000
```
For local testing without Render yet, install Postgres locally or use a free
[Neon](https://neon.tech) or [Supabase](https://supabase.com) database — just
paste their connection string into `DATABASE_URL`.

The seed script creates an admin login: **admin@ecopadi.co.uk / ChangeMe123!**
— change this password immediately after first login (there's no "change
password" UI yet, so for now update it directly via the `users` table or ask
me to add that screen).

### Frontend
```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:4000/api
npm run dev                   # runs on http://localhost:5173
```

Open `http://localhost:5173` — you should see the full site with the seeded
products, working cart, checkout, account creation, and (once you log in as
the admin above) the `/admin` dashboard.

---

## 2. Going live on your domain

This mirrors how you deployed Settle-In Buddy: **Render** for the backend +
database, **Netlify** for the frontend, then point your domain at Netlify.

### Step A — Database + backend on Render
1. Create a **Render account** (render.com) if you don't have one for this project.
2. **New → PostgreSQL** — create a database, copy its "External Database URL".
3. **New → Web Service** — connect this backend's GitHub repo (push the
   `backend/` folder as its own repo, same pattern as your other projects).
   - Build command: `npm install`
   - Start command: `npm start`
4. In the Render service's **Environment** tab, add every variable from
   `backend/.env.example`, using the real Postgres URL from step 2.
5. Once deployed, run the migration and seed **once** from your local machine
   pointed at the live database:
   ```bash
   DATABASE_URL="<render external db url>" npm run migrate
   DATABASE_URL="<render external db url>" npm run seed
   ```
6. Note your Render backend URL (e.g. `https://ecopadi-backend.onrender.com`).

### Step B — Frontend on Netlify
1. Push `frontend/` as its own repo.
2. In Netlify: **Add new site → Import from Git**, select the repo.
   - Build command: `npm run build`
   - Publish directory: `dist`
3. In **Site settings → Environment variables**, add:
   `VITE_API_URL = https://ecopadi-backend.onrender.com/api`
4. Deploy. Netlify gives you a `*.netlify.app` URL to test first.

### Step C — Connect your domain
1. In Netlify: **Domain settings → Add a domain**, enter your domain
   (e.g. `ecopadi.co.uk`).
2. Netlify shows you DNS records to add at your domain registrar (usually an
   `A` record or `CNAME`, depending on whether it's the root domain or `www`).
3. Once DNS propagates (can take a few hours), your live site is on your domain.
4. Back in Render, update the backend's `FRONTEND_URL` env var to your real
   domain (for CORS + Stripe/PayPal redirect URLs), and redeploy.

### Step D — Payment gateways (do this before taking real orders)
- **Stripe** (covers card + Apple Pay): create an account at stripe.com,
  grab your **live** secret key from the dashboard, set `STRIPE_SECRET_KEY`
  on Render. Add a webhook endpoint pointing at
  `https://ecopadi-backend.onrender.com/api/payments/stripe/webhook`,
  select the `checkout.session.completed` event, and copy the signing
  secret into `STRIPE_WEBHOOK_SECRET`. Apple Pay activates automatically
  once your domain is verified in Stripe's dashboard (Settings → Payment
  methods → Apple Pay → Add your domain).
- **PayPal**: create a live app at developer.paypal.com, set
  `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET`, and set `PAYPAL_ENV=live`.
- Both require a working Privacy Policy and Terms page on your live domain
  before they'll approve a live (non-sandbox) integration — another reason
  to get your real legal documents into the `/legal/*` pages first.

---

## 3. What I'd still recommend adding
- Real transactional emails (order confirmation, bank transfer instructions) —
  currently the API returns the right data, but nothing sends an email yet.
  A service like Resend or Postmark plugs in cleanly to the checkout route.
- An admin "change password" screen and the ability to invite more admin logins.
- Product images — once you send real photos, `image_url` on each product is
  ready to receive a URL (e.g. hosted on Cloudinary or Netlify's own storage).

Happy to build any of these next — just say the word.
# ecopadi
# ecopadi
