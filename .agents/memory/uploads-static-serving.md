---
name: PowerAdd uploads static serving
description: Production fix for uploaded images not appearing — wrong upload directory for Plesk/production.
---

## Rule
Uploaded files must be saved to `<project_root>/uploads/` (not `client/public/uploads/`) and served via an explicit `app.use("/uploads", express.static(...))` registered **before** vite/serveStatic in `server/index.ts`.

**Why:** In production, `serveStatic` only serves `dist/public/`. Files uploaded at runtime go to `client/public/uploads/` which is not `dist/public/`, so they 404 in production even though the URL `/uploads/filename` is correct. The root-level `uploads/` dir + explicit static middleware works in both dev and production.

**How to apply:** Any new file-upload route must use `path.join(process.cwd(), "uploads")` as the destination. The middleware `app.use("/uploads", express.static(uploadsDir))` is already registered in `server/index.ts`. The `uploads/` directory is gitignored by default — ensure it is NOT gitignored (add `!uploads/` or manage separately on each server).
