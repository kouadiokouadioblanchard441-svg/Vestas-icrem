# PowerAdd / SolEaPay

## Overview
Full-stack fintech/payment platform built with React (Vite) + Express + Drizzle ORM + PostgreSQL (Supabase).

## Stack
- **Frontend**: React 18, Vite, TailwindCSS, shadcn/ui, Wouter (routing), TanStack Query
- **Backend**: Express 5, Passport.js (local auth), express-session
- **Database**: PostgreSQL via Supabase, Drizzle ORM
- **Payments**: NOWPayments SDK

## How to run
```
npm run dev
```
Server starts on port 5000. Requires `SUPABASE_DATABASE_URL` secret.

## Environment secrets
- `SUPABASE_DATABASE_URL` — Supabase PostgreSQL pooler connection string
- `SESSION_SECRET` — Express session secret

## Build for production
```
npm run build   # outputs to dist/
npm run start   # runs dist/index.cjs
```

## Database
```
npm run db:push   # push schema changes via Drizzle Kit
```

## User preferences
