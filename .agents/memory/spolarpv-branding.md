---
name: SpolarPV brand color migration
description: SpolarPV client UI was migrated from a green brand palette to an orange/sky-blue palette. Use this to know the current canonical colors before styling any page.
---

The SpolarPV client (French-language solar investment app) was re-themed away from the original green (#00A651) brand:
- Page backgrounds: `#87CEEB` (sky blue) — applied to home, invest, my-products, team, account, products, deposit, withdrawal, wallet page containers.
- Primary accent / CTA buttons and former brand-green elements: orange gradient family, replacing the old green hex 1:1 wherever it appeared as a literal hex:
  - `#00A651` → `#F59E0B`
  - `#008C3A` → `#D97706`
  - `#007A32` → `#B45309`
  - `#00C853` → `#FBBF24`
- Card surfaces on themed pages use translucent white `rgba(255,255,255,0.90)` rounded-2xl cards on top of the sky-blue background (pattern established on wallet.tsx "add card" form, then reused on deposit.tsx).

**Why:** User explicitly requested moving the whole app off the green identity onto orange + sky blue, page by page, then finally as a blanket "replace all green with orange" pass across `client/src`.

**How to apply:** When touching any client page, check current background/accent colors against this palette before assuming the old green (#00A651 family) is still correct — it was intentionally removed. Tailwind semantic `green-500/50/etc.` utility classes (success states, checkmarks) were deliberately left untouched — only the literal brand hex codes were swapped, not semantic status colors. If asked to continue "greenify → orange" work, check remaining files for `green-` Tailwind classes only if the user asks about status/semantic colors specifically, not brand ones.

## WestPay per-country automatic payment (2026-07-13)
Added `countries.autoPaymentEnabled` (boolean, default false) so admins choose per-country whether deposits are automatic (WestPay) or manual (payment numbers), instead of a hardcoded country exclusion list.
**Why:** the old logic hardcoded `WESTPAY_EXCLUDED = ["CM"]` in deposit.tsx, which wasn't admin-configurable and didn't scale as countries are added/removed.
**How to apply:** gating requires BOTH `platform_settings.westpayEnabled === "true"` (global switch) AND the user's country row having `autoPaymentEnabled = true`. Enforced in both the frontend (`isWestpayEligible` in deposit.tsx, controls whether "Rechargez maintenant" redirects straight to WestPay vs. shows manual operator selection) and the backend (`/api/deposits/westpay/initiate` re-checks both before issuing a WestPay URL, since frontend gating alone is bypassable). `WESTPAY_WEBHOOK_SECRET` must also be set for automatic confirmation to actually complete (webhook silently no-ops without it).

## Product images were bypassing admin edits (fixed 2026-07-13)
`products.tsx`, `my-products.tsx`, and `invest.tsx` displayed products via a hardcoded static image array indexed by position, completely ignoring the `imageUrl` field editable in Admin > Produits.
**Why:** the admin form always saved `imageUrl` correctly to the DB, but the storefront pages never read it — so uploading a new product image in the admin panel had zero visible effect for users.
**How to apply:** any product image anywhere in the app must render `product.imageUrl || <fallback>`, never a static array indexed by position/sortOrder. Check for reintroduced `PRODUCT_IMAGES`-style arrays if this bug resurfaces.
