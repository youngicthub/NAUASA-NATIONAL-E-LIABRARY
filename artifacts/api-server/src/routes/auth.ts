import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { query } from "@workspace/db";
import { issueToken, optionalAuth } from "../middleware/auth";

const router = Router();

function publicUser(row: any) {
  return {
    id: row.id,
    email: row.email,
    user_metadata: {
      full_name: row.full_name,
      institution: row.institution,
      academic_level: row.academic_level,
    },
  };
}

router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, metadata = {} } = req.body ?? {};
    if (!email || !password || password.length < 8) {
      res.status(400).json({ error: "Email and a password of at least 8 characters are required" });
      return;
    }
    const existing = await query<any[]>("SELECT id FROM users WHERE email = ? LIMIT 1", [email.toLowerCase()]);
    if (existing.length) {
      res.status(409).json({ error: "User already registered" });
      return;
    }
    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);
    // Roles are never accepted from the browser. An administrator must be
    // provisioned directly in MySQL or through an authenticated admin action.
    const role = "user";
    await query(
      "INSERT INTO users (id, email, password_hash, email_verified, created_at, updated_at) VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [id, email.toLowerCase(), passwordHash],
    );
    await query(
      "INSERT INTO profiles (id, user_id, full_name, email, institution, academic_level, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [crypto.randomUUID(), id, metadata.full_name || "User", email.toLowerCase(), metadata.institution || null, metadata.academic_level || null],
    );
    await query("INSERT INTO user_roles (id, user_id, role, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)", [crypto.randomUUID(), id, role]);
    const user = { id, email: email.toLowerCase(), role, full_name: metadata.full_name || "User" } as const;
    res.status(201).json({ user: publicUser({ ...user, ...metadata }), session: { access_token: issueToken(user), user: publicUser({ ...user, ...metadata }) } });
  } catch (err) {
    next(err);
  }
});

router.post("/signin", async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    const rows = await query<any[]>(
      "SELECT u.*, COALESCE(p.full_name, 'User') AS full_name, COALESCE(ur.role, 'user') AS role FROM users u LEFT JOIN profiles p ON p.user_id = u.id LEFT JOIN user_roles ur ON ur.user_id = u.id WHERE u.email = ? LIMIT 1",
      [String(email || "").toLowerCase()],
    );
    const row = rows[0];
    if (!row || !(await bcrypt.compare(password || "", row.password_hash))) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const user = { id: row.id, email: row.email, role: row.role, full_name: row.full_name };
    const access_token = issueToken(user);
    res.json({ user: publicUser(row), session: { access_token, user: publicUser(row) } });
  } catch (err) {
    next(err);
  }
});

router.get("/session", optionalAuth, async (req, res, next) => {
  try {
    if (!req.authUser) {
      res.json({ session: null });
      return;
    }
    const rows = await query<any[]>(
      "SELECT u.*, p.full_name, p.institution, p.academic_level FROM users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.id = ? LIMIT 1",
      [req.authUser.id],
    );
    if (!rows[0]) {
      res.json({ session: null });
      return;
    }
    const user = publicUser(rows[0]);
    res.json({ session: { access_token: req.get("authorization")?.slice(7), user } });
  } catch (err) {
    next(err);
  }
});

router.get("/me", optionalAuth, async (req, res) => {
  if (!req.authUser) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const rows = await query<any[]>(
    "SELECT p.*, COALESCE(ur.role, 'user') AS role FROM profiles p LEFT JOIN user_roles ur ON ur.user_id = p.user_id WHERE p.user_id = ? LIMIT 1",
    [req.authUser.id],
  );
  res.json({ profile: rows[0] || null, role: req.authUser.role });
});

router.post("/password", optionalAuth, async (req, res, next) => {
  try {
    if (!req.authUser) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const { password } = req.body ?? {};
    if (typeof password !== "string" || password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }
    const hash = await bcrypt.hash(password, 12);
    await query("UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [hash, req.authUser.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const { email, token, password } = req.body ?? {};
    if (token && password) {
      const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");
      const tokenRows = await query<any[]>(
        "SELECT id, user_id FROM auth_tokens WHERE token_hash = ? AND token_type = 'password_reset' AND expires_at > CURRENT_TIMESTAMP AND used_at IS NULL LIMIT 1",
        [tokenHash],
      );
      if (!tokenRows[0]) {
        res.status(400).json({ error: "Reset link is invalid or expired" });
        return;
      }
      const hash = await bcrypt.hash(password, 12);
      await query("UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [hash, tokenRows[0].user_id]);
      await query("UPDATE auth_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?", [tokenRows[0].id]);
      res.json({ success: true });
      return;
    }
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    const users = await query<any[]>("SELECT id FROM users WHERE email = ? LIMIT 1", [String(email).toLowerCase()]);
    // Do not disclose whether an email exists.
    if (users[0]) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      await query(
        "INSERT INTO auth_tokens (id, user_id, token_hash, token_type, expires_at, created_at) VALUES (?, ?, ?, 'password_reset', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 60 MINUTE), CURRENT_TIMESTAMP)",
        [crypto.randomUUID(), users[0].id, tokenHash],
      );
      // A configured SMTP service can send this token through the mailer
      // integration. In development the token is intentionally not returned.
      if (process.env.SMTP_HOST) {
        const nodemailer = await import("nodemailer");
        const transport = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === "true",
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
        });
        const origin = process.env.APP_ORIGIN || "http://localhost";
        await transport.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: String(email),
          subject: "NUASA password reset",
          text: `Reset your password: ${origin}/admin/reset-password?token=${rawToken}`,
        });
      }
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post("/verify-email", async (req, res, next) => {
  try {
    const tokenHash = crypto.createHash("sha256").update(String(req.body?.token || "")).digest("hex");
    const rows = await query<any[]>(
      "SELECT id, user_id FROM auth_tokens WHERE token_hash = ? AND token_type = 'email_verification' AND expires_at > CURRENT_TIMESTAMP AND used_at IS NULL LIMIT 1",
      [tokenHash],
    );
    if (!rows[0]) {
      res.status(400).json({ error: "Verification link is invalid or expired" });
      return;
    }
    await query("UPDATE users SET email_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [rows[0].user_id]);
    await query("UPDATE auth_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?", [rows[0].id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;