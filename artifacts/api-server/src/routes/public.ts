import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

// ─── Blog Posts ───────────────────────────────────────────────────────────────

router.get("/posts", async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : null;
    const limitClause = limit ? `LIMIT ${limit}` : "";
    const { rows } = await pool.query(`
      SELECT bp.*,
             c.name  AS category_name,
             c.slug  AS category_slug,
             COALESCE(p.full_name, 'Admin') AS author_name
      FROM   blog_posts bp
      LEFT JOIN categories c ON c.id = bp.category_id
      LEFT JOIN profiles   p ON p.user_id = bp.author_id
      WHERE  bp.status = 'published'
      ORDER  BY bp.published_at DESC
      ${limitClause}
    `);
    res.json(
      rows.map((r) => ({
        ...r,
        category: r.category_name
          ? { name: r.category_name, slug: r.category_slug }
          : null,
      })),
    );
  } catch (err) {
    next(err);
  }
});

router.get("/posts/:slug", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT bp.*,
              c.name  AS category_name,
              c.slug  AS category_slug,
              COALESCE(p.full_name, 'Admin') AS author_name
       FROM   blog_posts bp
       LEFT JOIN categories c ON c.id = bp.category_id
       LEFT JOIN profiles   p ON p.user_id = bp.author_id
       WHERE  bp.slug = $1 AND bp.status = 'published'`,
      [req.params.slug],
    );
    if (!rows[0]) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    // Increment view count (fire-and-forget)
    pool.query("UPDATE blog_posts SET views = views + 1 WHERE id = $1", [rows[0].id]).catch(() => {});
    res.json({
      ...rows[0],
      category: rows[0].category_name
        ? { name: rows[0].category_name, slug: rows[0].category_slug }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/posts/:id/tags", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.* FROM tags t
       JOIN   blog_post_tags bpt ON bpt.tag_id = t.id
       WHERE  bpt.post_id = $1`,
      [req.params.id],
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/posts/:id/related", async (req, res, next) => {
  try {
    const { categoryId } = req.query;
    if (!categoryId) {
      res.json([]);
      return;
    }
    const { rows } = await pool.query(
      `SELECT id, title, slug, read_time FROM blog_posts
       WHERE  status = 'published' AND category_id = $1 AND id != $2
       LIMIT  3`,
      [categoryId, req.params.id],
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ─── Categories ───────────────────────────────────────────────────────────────

router.get("/categories", async (req, res, next) => {
  try {
    const { type } = req.query;
    let query = "SELECT * FROM categories";
    if (type === "blog") {
      query += " WHERE type IN ('blog', 'both')";
    } else if (type === "library") {
      query += " WHERE type IN ('library', 'both')";
    }
    query += " ORDER BY name";
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ─── Tags ─────────────────────────────────────────────────────────────────────

router.get("/tags", async (_req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM tags ORDER BY name");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ─── Events ───────────────────────────────────────────────────────────────────

router.get("/events", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM events WHERE is_published = true ORDER BY start_time DESC",
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ─── Chapters ─────────────────────────────────────────────────────────────────

router.get("/chapters", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM chapters WHERE is_active = true ORDER BY display_order ASC, name ASC",
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ─── Library Resources ────────────────────────────────────────────────────────

router.get("/resources", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT lr.*,
             c.name AS category_name,
             c.slug AS category_slug
      FROM   library_resources lr
      LEFT JOIN categories c ON c.id = lr.category_id
      ORDER  BY lr.created_at DESC
    `);
    res.json(
      rows.map((r) => ({
        ...r,
        category: r.category_name
          ? { name: r.category_name, slug: r.category_slug }
          : null,
      })),
    );
  } catch (err) {
    next(err);
  }
});

router.get("/resources/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT lr.*, c.name AS category_name, c.slug AS category_slug
       FROM   library_resources lr
       LEFT JOIN categories c ON c.id = lr.category_id
       WHERE  lr.id = $1`,
      [req.params.id],
    );
    if (!rows[0]) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({
      ...rows[0],
      category: rows[0].category_name
        ? { name: rows[0].category_name, slug: rows[0].category_slug }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/resources/:id/download", async (req, res, next) => {
  try {
    await pool.query(
      "UPDATE library_resources SET download_count = download_count + 1 WHERE id = $1",
      [req.params.id],
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ─── Executives ───────────────────────────────────────────────────────────────

router.get("/executives", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM executives WHERE is_active = true ORDER BY sort_order ASC",
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
