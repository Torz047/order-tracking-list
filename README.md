# Alliance Order Tracker

A production-ready React + Vite order tracking app with Supabase backend, deployable to Vercel.

---

## Stack

- **React 18** + Vite
- **Supabase** — Postgres database (with localStorage fallback when env vars are missing)
- **Vercel** — deployment
- **CSS Modules** — scoped styles, no extra dependencies

---

## 1 — Local Setup

```bash
# Clone your repo
git clone https://github.com/YOUR_USERNAME/alliance-tracker.git
cd alliance-tracker

# Install dependencies
npm install

# Copy env template
cp .env.example .env
```

Fill in `.env` with your Supabase keys (see step 2).

```bash
npm run dev   # → http://localhost:5173
```

> **No Supabase yet?** It still works — data is stored in localStorage automatically.

---

## 2 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Once created, go to **SQL Editor** and paste the contents of `supabase-schema.sql` → **Run**
3. Go to **Settings → API** and copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
4. Paste both into your `.env` file:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3 — GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit — Alliance Order Tracker"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/alliance-tracker.git
git branch -M main
git push -u origin main
```

---

## 4 — Vercel Deployment

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Framework preset: **Vite** (auto-detected)
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy** ✓

Every `git push` to `main` will auto-deploy.

---

## Project Structure

```
alliance-tracker/
├── index.html
├── vite.config.js
├── supabase-schema.sql     ← run this in Supabase SQL editor
├── .env.example            ← copy to .env and fill in keys
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles/
    │   └── global.css
    ├── lib/
    │   ├── supabase.js     ← Supabase client
    │   └── constants.js    ← field maps, roles, helpers
    ├── hooks/
    │   ├── useOrders.js    ← orders CRUD (Supabase + localStorage fallback)
    │   └── useAccounts.js  ← accounts CRUD
    └── components/
        ├── LoginScreen.jsx / .module.css
        ├── AppShell.jsx    / .module.css
        ├── OrderModal.jsx
        ├── AccountsModal.jsx
        ├── Modal.module.css
        └── Toast.jsx       / .module.css
```

---

## Demo Accounts

| Role      | Username    | Password   |
|-----------|-------------|------------|
| Admin     | admin       | admin123   |
| Planner   | planner1    | plan123    |
| Logistics | logistics1  | logi123    |
| Inventory | inventory1  | inv123     |

---

## Role Permissions

| Action              | Admin | Planner | Logistics | Inventory |
|---------------------|-------|---------|-----------|-----------|
| Add / Delete orders | ✅    | ✅      | ❌        | ❌        |
| Edit all fields     | ✅    | ✅      | ❌        | ❌        |
| Edit AWB / Invoice  | ✅    | ✅      | ✅        | ❌        |
| Edit Parts Issuance | ✅    | ✅      | ❌        | ✅        |
| Manage accounts     | ✅    | ❌      | ❌        | ❌        |
