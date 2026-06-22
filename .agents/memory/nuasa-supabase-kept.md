---
name: NUASA migration - Supabase kept
description: The NUASA app was migrated from Lovable but Supabase was kept as-is due to scope; replacing it is a separate project.
---

The NUASA app has heavy Supabase usage (15+ tables, auth, file storage). During the Lovable→Replit migration, Supabase was deliberately kept connected rather than replaced with Replit primitives. The migration task plan allows this when the Supabase footprint is too large to swap inline.

**Why:** Replacing Supabase would require: new Drizzle schema for 15+ tables, Express routes for all data access, Clerk auth setup, Replit Object Storage for images. This is a separate major project tracked as a follow-up task.

**How to apply:** When the user asks to "remove Supabase" or "migrate to Replit database", treat it as a full backend migration project — scope it carefully before starting.
