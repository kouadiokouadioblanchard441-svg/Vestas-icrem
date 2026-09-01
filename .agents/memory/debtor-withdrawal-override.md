---
name: Debtor withdrawal override
description: Business rule for negative balances and administrator-approved withdrawal exceptions.
---

A user with a negative deposit balance is blocked from withdrawing by default. An administrator may explicitly override that block after review; the override must prevent automatic re-blocking until the administrator changes it.

**Why:** A negative balance represents a real debt, but support may approve an exception without changing the debt amount itself.

**How to apply:** Keep the debt balance and withdrawable earnings separate. Use an explicit persisted override for administrator decisions rather than deriving the block only from the current balance.