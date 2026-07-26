# PowerAdd - Plateforme d'investissement

## Overview

PowerAdd est une plateforme d'investissement mobile ciblant les pays francophones d'Afrique. Les utilisateurs peuvent acheter des produits virtuels qui génèrent des gains quotidiens, gérer des dépôts/retraits via mobile money, constituer des équipes de parrainage pour des commissions, et accomplir des tâches pour des bonus. La plateforme dispose d'un panneau d'administration complet pour gérer les utilisateurs, les transactions, les produits et les paramètres.

## Running Locally on Replit

- Database: `server/db.ts` prefers `SUPABASE_DATABASE_URL` over `DATABASE_URL` if set. This project is configured to use an external Supabase Postgres database via the `SUPABASE_DATABASE_URL` secret (SSL enabled automatically when that var is set), instead of Replit's built-in Postgres.
- On first run after import: `npm install`, then `npm run db:push -- --force` to sync the schema, then start the `Start application` workflow (`npm run dev`). The server seeds default data (super admin, countries, products, tasks, settings) on boot, but preserves existing rows if they're already present (e.g. products/tasks/settings already seeded in the connected Supabase DB are left untouched).
- Super admin login: the account with `isSuperAdmin = true` in the connected DB's `users` table — do not assume a fixed phone/password here, since `server/seed.ts` only creates a brand-new super admin (with a hardcoded default phone/password) when none exists yet, and otherwise just re-applies the current `ADMIN_PASSWORD` env var / default to whichever row is already the super admin. **Never record the actual super admin phone or password in this file or any tracked file** — look it up via a direct DB query (`isSuperAdmin = true`) or ask the user, and keep the real password out of docs/commits. If you need to change it, set/rotate it via the `ADMIN_PASSWORD` secret rather than hardcoding it in code or docs. Note: the Supabase project's `public.users` table coexists with Supabase's own `auth.users` table (both named `users`, different schemas) — always query `public.users` explicitly when inspecting data directly.

## Déploiement Plesk

### Structure de build
- `npm run build` produit deux artefacts :
  - `dist/public/` — frontend React compilé (Vite)
  - `dist/index.cjs` — backend Express bundlé (esbuild, ~1.1 MB)
- `dist/index.cjs` sert à la fois l'API Express (`/api/*`) et le frontend compilé (catch-all → `dist/public/index.html`)

### Étapes de déploiement sur Plesk
1. Depuis Replit, lancer `npm run build` avant le push Git
2. Pousser le commit contenant `dist/index.cjs` et `dist/public/`
3. Dans Plesk, faire `pull`, puis `Deploy now` et `restart`
4. Plesk pointe l'entrée Node.js sur `dist/index.cjs` — aucun build n'est nécessaire sur Plesk
5. Configurer les variables d'environnement dans Plesk :
   - `DATABASE_URL` — connexion PostgreSQL
   - `SESSION_SECRET` — secret pour les sessions Express
   - `NODE_ENV=production`
   - `PORT` — port d'écoute (défaut : 5000)
6. Au premier démarrage, le serveur seed automatiquement la base de données

### Points importants
- Pas de proxy Vite en production — Express sert directement les fichiers statiques
- Le frontend et le backend tournent sur le même process Node.js / même port
- `server/static.ts` sert `dist/public/` et renvoie `index.html` pour toutes les routes non-API

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React Context for auth state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming (dark mode default)
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **Session Management**: express-session with MemoryStore (development) or connect-pg-simple (production)
- **Authentication**: Session-based auth with bcrypt password hashing
- **API Design**: RESTful JSON API under `/api` prefix

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with `db:push` command
- **Key Tables**: users, products, userProducts, deposits, withdrawals, withdrawalWallets, paymentChannels, tasks, userTasks, transactions, platformSettings

### Authentication & Authorization
- **User Auth**: Phone number + country + password combination
- **Session Storage**: Server-side sessions with httpOnly cookies
- **Role System**: Regular users, Admins, Super Admins
- **Middleware**: `requireAuth` and `requireAdmin` middleware for route protection

### Key Features
- **Multi-country Support**: 7 African countries with different currencies (XAF, XOF, CDF) and payment methods
- **Product System**: Virtual industrial robot products with daily earnings cycles
- **Referral System**: 3-level commission structure for team building
- **Task System**: Invite-based tasks with bonus rewards
- **Admin Panel**: Full CRUD for users, deposits, withdrawals, products, payment channels, and settings

### Project Structure
```
├── client/src/          # React frontend
│   ├── components/      # UI components including admin panel
│   ├── pages/           # Route pages (home, invest, tasks, team, account, admin)
│   ├── lib/             # Utilities (auth, queryClient, countries)
│   └── hooks/           # Custom React hooks
├── server/              # Express backend
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database operations interface
│   ├── db.ts            # Database connection
│   └── seed.ts          # Initial data seeding
├── shared/              # Shared code between client/server
│   └── schema.ts        # Drizzle schema and Zod validators
└── migrations/          # Database migrations
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database (connection via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Type-safe database queries and schema management

### Frontend Libraries
- **Radix UI**: Accessible UI primitives (dialogs, dropdowns, tabs, etc.)
- **TanStack Query**: Server state management and caching
- **Lucide React**: Icon library

### Backend Libraries
- **bcrypt**: Password hashing
- **express-session**: Session management
- **memorystore**: In-memory session store for development

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Backend bundling for production
- **TypeScript**: Type checking across full stack

### Environment Variables Required
- `SUPABASE_DATABASE_URL`: PostgreSQL connection string for the external Supabase database (preferred; SSL is enabled automatically)
- `DATABASE_URL`: PostgreSQL connection string fallback when Supabase is not configured
- `SESSION_SECRET`: Secret for session encryption (optional, has fallback)
- `NOWPAYMENTS_API_KEY`: NOWPayments API key for crypto deposits and payouts
- `NOWPAYMENTS_IPN_SECRET`: NOWPayments IPN signature secret
- `NOWPAYMENTS_ACCOUNT_EMAIL` / `NOWPAYMENTS_ACCOUNT_PASSWORD`: NOWPayments merchant account credentials used to request payout JWTs (stored as Replit Secrets)

## Recent Changes (July 2026)
- Current Replit setup: configured the `SUPABASE_DATABASE_URL` secret, installed dependencies, synchronized the Drizzle schema with Supabase using `npm run db:push -- --force`, and restarted `Start application`. The application is operational on port 5000 and existing Supabase products, tasks, and settings were preserved.
- NOWPayments integration: crypto deposits use the official Node SDK and signed IPN callbacks; withdrawals create a NOWPayments payout and require the merchant's NOWPayments 2FA verification before processing. Payout status callbacks update the withdrawal and refund users automatically when NOWPayments reports a failure or rejection.
- Re-imported project (fifth time): ran `npm install` (tsx was missing), pushed DB schema with `npm run db:push -- --force`, configured `SUPABASE_DATABASE_URL` secret (user-provided, points to aws-1-us-west-2 pooler), restarted `Start application` workflow — 8 produits, 6 tâches et tous les paramètres Supabase préservés. Application opérationnelle sur port 5000.
- Re-imported project (fourth time): reinstalled dependencies (`npm install`), added the `SUPABASE_DATABASE_URL` secret (user-provided), ran `npm run db:push -- --force` against that Supabase DB, restarted the `Start application` workflow. Verified end-to-end via a direct DB query and a login request that the pre-existing super admin row in Supabase (found via `isSuperAdmin = true`) logs in successfully — its phone/password differ from whatever this file previously (and incorrectly) hardcoded; removed those hardcoded values from this file since they are live credentials, not documentation. Confirmed 3 users, 8 products, 6 tasks, and settings already present in Supabase were preserved (not overwritten) by the seed step.
- Re-imported project (third time): reinstalled dependencies (`npm install`), pushed DB schema (`npm run db:push --force`), restarted the `Start application` workflow — it seeds data and serves on port 5000. Verified end-to-end that the login page renders and admin login succeeds against the actual super admin row in the DB.
- Re-imported project (second time): reinstalled dependencies (`npm install`), pushed DB schema (`npm run db:push --force`), verified `npm run build` succeeds and the `Start application` workflow seeds data and serves on port 5000. Login page renders correctly, no client console errors beyond an expected 401 on the unauthenticated session check.
- Note: `npx tsc --noEmit` reports pre-existing type errors in `server/routes.ts` (req.query values typed as `string | string[]`) and `server/storage.ts` (Map iteration needs `--downlevelIteration`). These don't block the dev server (tsx) or the production build (esbuild/vite), but `npm run check` will fail until fixed.
- Fixed a leftover-from-rebranding bug: `client/src/pages/tasks.tsx` referenced an undefined `landscapeImg` (missing import); added the same import used elsewhere (`@assets/High-Efficiency-Cis-Solar-Panel-Monocrystalline-Solar-Module-_1783948797085.webp`)

## Recent Changes (February 2026)
- Deposit system now uses dual approach: Soleaspay (automatic) per-country OR manual recharge channels
- Admin can enable Soleaspay globally and select specific countries for automatic payment
- Users from Soleaspay-enabled countries get automatic mobile money flow (no channel selection)
- Users from non-Soleaspay countries see manual recharge channels managed by admin
- Platform setting `soleaspayEnabled` controls global Soleaspay on/off
- Platform setting `soleaspayCountries` stores comma-separated country codes (e.g. "TG,BF,CI")
- Backend enforces Soleaspay for enabled countries (cannot bypass to manual)
- InPay Africa integration still exists in backend but removed from deposit frontend
- InPay webhooks and admin balance check still functional for withdrawals

## Recent Changes (January 2026)
- Completed full frontend implementation with all pages and modals
- Implemented complete backend with all API routes
- Added database seeding for products, tasks, payment channels, and settings
- Created initial super admin account (default credentials set via seed script, not recorded here)
- Removed emoji usage in favor of text country codes

## Admin Credentials
- **Super Admin**: credentials are not recorded in this file. Look up the account with `isSuperAdmin = true` in the DB, or set/rotate it via the `ADMIN_PASSWORD` secret — `server/seed.ts` re-applies that password on every boot to whichever row is already the super admin. Ask the user if you need to log in as admin and don't already have the credentials.
- Access the admin panel from Account page when logged in as admin

## Business Rules
- **Signup Bonus**: 500 USDT
- **Free Daily Product**: 50 USDT per day
- **Withdrawal Fees**: 15%
- **Minimum Deposit**: 3000 USDT
- **Minimum Withdrawal**: 1200 USDT
- **Withdrawal Hours**: 8h-17h (9h-18h for Cameroon/Benin)
- **Max Withdrawals/Day**: 2
- **Referral Commissions**: Level 1 (27%), Level 2 (2%), Level 3 (1%)
- **Product Cycle**: 80 days by default

## Supported Countries
All countries use USDT as the platform currency.
- Cameroun (CM) - USDT - Orange Money, MTN
- Burkina Faso (BF) - USDT - Orange Money, Moov Money
- Togo (TG) - USDT - Moov Money, Mixx by Yas
- Benin (BJ) - USDT - Celtis, Moov Money, MTN, Momo
- Cote d'Ivoire (CI) - USDT - Wave, MTN, Orange Money, Moov Money
- Congo Brazzaville (CG) - USDT - MTN
- RDC (CD) - USDT - Airtel Money