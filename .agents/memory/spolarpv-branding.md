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
