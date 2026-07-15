---
name: SpolarPV WestPay webhook secret storage
description: WESTPAY_WEBHOOK_SECRET is now readable from the platform_settings DB row (admin-panel editable), not just the env var.
---

The WestPay deposit webhook (`POST /api/webhook/westpay` in `server/routes.ts`) verifies HMAC signatures using a secret resolved as `settings.westpayWebhookSecret` (platform_settings table, editable via Admin > Paramètres > WestPay) first, falling back to the `WESTPAY_WEBHOOK_SECRET` env var.

**Why:** the production deployment runs on an external Plesk server the agent/dev has no shell access to. Setting env vars there requires the user to do it manually and redeploy; storing the secret as a DB setting lets it be configured/rotated from the admin UI without touching Plesk. Same pattern already existed for `omnipayCallbackKey`.

**How to apply:** if WestPay (or similar gateway) deposits aren't auto-crediting, check first whether `westpayWebhookSecret` is set in `platform_settings` (or the env var as fallback) — a missing secret makes the webhook handler silently no-op (still returns 200 to the gateway, so it looks like delivery "succeeded" but nothing is credited). Also: the public `GET /api/settings` route strips `westpayWebhookSecret` and `omnipayCallbackKey` before responding — keep any new secret-like setting key added there excluded too.

Correction (verified 2026-07-15): this Replit workspace's `SUPABASE_DATABASE_URL` is a SEPARATE dev/test database, NOT shared with the Plesk production deployment — confirmed by querying for a real user known to exist only in prod and finding 0 rows (workspace DB had only 3 test users). Products/tasks/settings look similar only because both DBs were seeded from the same `seed.ts` defaults, not because they're the same instance. Do not assume DB-level changes made from this workspace affect production; verify independently (e.g. via curl against the live prod domain) before treating a DB write as having fixed anything live.
