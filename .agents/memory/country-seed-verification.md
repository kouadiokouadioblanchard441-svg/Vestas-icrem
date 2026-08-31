---
name: Country seed verification
description: Verification rule for seeded country configuration in this app
---

When changing supported countries or operators, verify the result through the running application's API after restart, not only through seed logs. If the seed reports a country was added but the API does not expose it, reconcile the record in the database connection used by the app before completing the change.

**Why:** During a country update, the startup log reported the new country while the live API still returned the previous list; direct database/API verification exposed the mismatch before delivery.

**How to apply:** For every country/operator change, check `/api/countries`, the authenticated operator route when possible, and the relevant deposit-channel records after restarting the workflow.