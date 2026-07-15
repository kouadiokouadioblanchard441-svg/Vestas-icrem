---
name: SpolarPV WestPay webhook secret & deposit matching
description: WESTPAY_WEBHOOK_SECRET resolution, and a critical fix to deposit-matching safety after a real mis-credit incident.
---

The WestPay deposit webhook (`POST /api/webhook/westpay` in `server/routes.ts`) verifies HMAC signatures using a secret resolved as `settings.westpayWebhookSecret` (platform_settings table, editable via Admin > Paramètres > WestPay) first, falling back to the `WESTPAY_WEBHOOK_SECRET` env var.

**Why:** the production deployment runs on an external Plesk server the agent/dev has no shell access to. Setting env vars there requires the user to do it manually and redeploy; storing the secret as a DB setting lets it be configured/rotated from the admin UI without touching Plesk. Same pattern already existed for `omnipayCallbackKey`.

**How to apply:** if WestPay (or similar gateway) deposits aren't auto-crediting, check first whether `westpayWebhookSecret` is set in `platform_settings` (or the env var as fallback) — a missing secret makes the webhook handler silently no-op (still returns 200 to the gateway, so it looks like delivery "succeeded" but nothing is credited). Also: the public `GET /api/settings` route strips `westpayWebhookSecret` and `omnipayCallbackKey` before responding — keep any new secret-like setting key added there excluded too.

Correction (verified 2026-07-15): this Replit workspace's `SUPABASE_DATABASE_URL` is a SEPARATE dev/test database, NOT shared with the Plesk production deployment — confirmed by querying for a real user known to exist only in prod and finding 0 rows. Products/tasks/settings look similar only because both DBs were seeded from the same `seed.ts` defaults, not because they're the same instance. Do not assume DB-level changes made from this workspace affect production; verify independently (e.g. via curl against the live prod domain) before treating a DB write as having fixed anything live.

## Deposit-matching fallback caused a real mis-credit — fixed 2026-07-15

`storage.findProcessingWestpayDeposit(amount, payerPhone)` used to fall back to FIFO (oldest processing deposit of that amount) whenever the payer phone didn't match any candidate's stored `accountNumber` — even when a payer phone WAS given but simply didn't match anyone on file. In production this credited a *different* user's unrelated same-amount deposit instead of leaving it unmatched, verified with a live test webhook (200 XOF test credited the super-admin's own pending 200 deposit instead of the real depositor's).

**Why:** guessing is unsafe when money is involved — the safe default when a payer phone doesn't match anyone is to NOT auto-approve, not to pick the closest thing.

**How to apply:** the fixed rule (in `server/storage.ts`) only falls back to FIFO when either (a) the gateway didn't supply a payer phone at all, or (b) there is exactly one processing candidate for that amount (so amount alone is unambiguous). If a payer phone is supplied and doesn't match, and there are 2+ same-amount candidates, the deposit is left unmatched (requires manual admin review) rather than guessing. Apply the same caution to any other gateway matching logic (Soleaspay/OmniPay) if it has a similar blind FIFO fallback.

Also fixed same day: `approveWestpayDeposit` now overwrites the deposit's `accountNumber` with the real payer phone reported by the webhook (previously it kept showing the account owner's registered phone, not the actual mobile-money number used to pay — confusing in the admin panel).

Status: verified fixed and confirmed working end-to-end in production (Plesk) on 2026-07-15 — signature check, deposit matching, balance crediting, and payer-number display all confirmed via a live test deposit.
