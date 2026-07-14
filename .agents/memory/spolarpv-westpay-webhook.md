---
name: SpolarPV WestPay webhook secret storage
description: WESTPAY_WEBHOOK_SECRET is now readable from the platform_settings DB row (admin-panel editable), not just the env var.
---

The WestPay deposit webhook (`POST /api/webhook/westpay` in `server/routes.ts`) verifies HMAC signatures using a secret resolved as `settings.westpayWebhookSecret` (platform_settings table, editable via Admin > Paramètres > WestPay) first, falling back to the `WESTPAY_WEBHOOK_SECRET` env var.

**Why:** the production deployment runs on an external Plesk server the agent/dev has no shell access to. Setting env vars there requires the user to do it manually and redeploy; storing the secret as a DB setting lets it be configured/rotated from the admin UI without touching Plesk. Same pattern already existed for `omnipayCallbackKey`.

**How to apply:** if WestPay (or similar gateway) deposits aren't auto-crediting, check first whether `westpayWebhookSecret` is set in `platform_settings` (or the env var as fallback) — a missing secret makes the webhook handler silently no-op (still returns 200 to the gateway, so it looks like delivery "succeeded" but nothing is credited). Also: the public `GET /api/settings` route strips `westpayWebhookSecret` and `omnipayCallbackKey` before responding — keep any new secret-like setting key added there excluded too.

Also noted: this Replit workspace's dev DB connects to the same external Supabase Postgres (`SUPABASE_DATABASE_URL`) that appears to be the shared/production database (real seeded products, tasks, users already present) — changes made to `platform_settings` from this workspace take effect for production immediately, independent of when the Plesk server's code is redeployed.
