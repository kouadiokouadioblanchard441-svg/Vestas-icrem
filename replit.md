# SpolarPV - Solar Energy Investment Platform

## Overview

SpolarPV is a mobile-first investment platform targeting French-speaking African countries. Users can purchase virtual solar photovoltaic products that generate daily earnings, manage deposits/withdrawals via mobile money, build referral teams for commission income, and complete tasks for bonuses. The platform features a full admin panel for managing users, transactions, products, and platform settings.

## Running Locally on Replit

- `DATABASE_URL` (PostgreSQL) must be set — it is provisioned automatically by Replit.
- On first run after import: `npm install`, then `npm run db:push` to create the schema (this prompts per-table; answer "create table" for each), then start the `Start application` workflow (`npm run dev`). The server seeds default data (super admin, countries, products, tasks, settings) automatically on first boot.
- Super admin login: Phone `99935673`, Country Cameroun (CM), Password `AAbb11##` (default; override via `ADMIN_PASSWORD` env var). The seed script re-applies this password/country on every server boot, overriding any manual change to the admin account.

## Déploiement Plesk

### Structure de build
- `npm run build` produit deux artefacts :
  - `dist/public/` — frontend React compilé (Vite)
  - `dist/index.cjs` — backend Express bundlé (esbuild, ~1.1 MB)
- `dist/index.cjs` sert à la fois l'API Express (`/api/*`) et le frontend compilé (catch-all → `dist/public/index.html`)

### Étapes de déploiement sur Plesk
1. `npm install`
2. `npm run build`
3. Plesk pointe l'entrée Node.js sur `dist/index.cjs`
4. Configurer les variables d'environnement dans Plesk :
   - `DATABASE_URL` — connexion PostgreSQL
   - `SESSION_SECRET` — secret pour les sessions Express
   - `NODE_ENV=production`
   - `PORT` — port d'écoute (défaut : 5000)
5. Au premier démarrage, le serveur seed automatiquement la base de données

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
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption (optional, has fallback)

## Recent Changes (July 2026)
- Re-imported project (third time): reinstalled dependencies (`npm install`), pushed DB schema (`npm run db:push --force`), restarted the `Start application` workflow — it seeds data and serves on port 5000. Verified end-to-end: login page renders, and `POST /api/auth/login` succeeds with the actual super admin credentials (phone 99935673, country CM, password AAbb11##). Corrected this file: the previously documented admin country/password (Togo/pagetstudio) were stale — `server/seed.ts` actually seeds country `CM` and password from `ADMIN_PASSWORD` env var (default `AAbb11##`).
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
- Created super admin account (Togo +99935673 / password: pagetstudio)
- Removed emoji usage in favor of text country codes

## Admin Credentials
- **Super Admin**: Phone: 99935673, Country: Cameroun (CM), Password: AAbb11## (default; set `ADMIN_PASSWORD` env var to override — seed.ts re-applies it on every boot)
- Access the admin panel from Account page when logged in as admin

## Business Rules
- **Signup Bonus**: 500 FCFA
- **Free Daily Product**: 50 FCFA per day
- **Withdrawal Fees**: 15%
- **Minimum Deposit**: 3000 FCFA
- **Minimum Withdrawal**: 1200 FCFA
- **Withdrawal Hours**: 8h-17h (9h-18h for Cameroon/Benin)
- **Max Withdrawals/Day**: 2
- **Referral Commissions**: Level 1 (27%), Level 2 (2%), Level 3 (1%)
- **Product Cycle**: 80 days by default

## Supported Countries
- Cameroun (CM) - XAF - Orange Money, MTN
- Burkina Faso (BF) - XOF - Orange Money, Moov Money
- Togo (TG) - XOF - Moov Money, Mixx by Yas
- Benin (BJ) - XOF - Celtis, Moov Money, MTN, Momo
- Cote d'Ivoire (CI) - XOF - Wave, MTN, Orange Money, Moov Money
- Congo Brazzaville (CG) - XAF - MTN
- RDC (CD) - CDF (4:1 conversion) - Airtel Money