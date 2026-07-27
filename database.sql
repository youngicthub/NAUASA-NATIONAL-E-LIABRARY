-- =====================================================================
-- NUASA National E-Library — Complete MySQL 8+ Schema
-- =====================================================================
-- Usage:
--   mysql -u root -p < database.sql
-- Or import via MySQL Workbench / phpMyAdmin / XAMPP / MAMP
-- =====================================================================

CREATE DATABASE IF NOT EXISTS nuasa_database
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nuasa_database;

-- ─── users ────────────────────────────────────────────────────────────────────
-- Custom auth table (replaces Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  email_verified TINYINT(1)   NOT NULL DEFAULT 0,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── auth_tokens ─────────────────────────────────────────────────────────────
-- Stores hashed tokens for email verification and password reset
CREATE TABLE IF NOT EXISTS auth_tokens (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  user_id     CHAR(36)     NOT NULL,
  token_hash  CHAR(64)     NOT NULL UNIQUE,
  token_type  VARCHAR(50)  NOT NULL,  -- 'email_verification' | 'password_reset'
  expires_at  DATETIME     NOT NULL,
  used_at     DATETIME,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_auth_tokens_user_id (user_id),
  INDEX idx_auth_tokens_hash (token_hash),
  CONSTRAINT fk_auth_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── profiles ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id             CHAR(36)     NOT NULL PRIMARY KEY,
  user_id        CHAR(36)     NOT NULL UNIQUE,
  full_name      VARCHAR(255) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  institution    VARCHAR(255),
  academic_level VARCHAR(100),
  avatar_url     TEXT,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_profiles_user_id (user_id),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── user_roles ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
  id         CHAR(36)    NOT NULL PRIMARY KEY,
  user_id    CHAR(36)    NOT NULL,
  role       VARCHAR(50) NOT NULL DEFAULT 'user',  -- 'admin' | 'user'
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_roles_user_role (user_id, role),
  INDEX idx_user_roles_user_id (user_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── categories ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL UNIQUE,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  type        VARCHAR(20)  NOT NULL DEFAULT 'both',  -- 'blog' | 'library' | 'both'
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categories_slug (slug),
  INDEX idx_categories_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── tags ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL UNIQUE,
  slug       VARCHAR(255) NOT NULL UNIQUE,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tags_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── blog_posts ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  title        VARCHAR(500) NOT NULL,
  slug         VARCHAR(500) NOT NULL UNIQUE,
  content      LONGTEXT     NOT NULL,
  excerpt      TEXT,
  cover_image  TEXT,
  author_id    CHAR(36),
  category_id  CHAR(36),
  status       VARCHAR(20)  NOT NULL DEFAULT 'draft',  -- 'draft' | 'published' | 'archived'
  is_featured  TINYINT(1)   NOT NULL DEFAULT 0,
  read_time    INT          NOT NULL DEFAULT 5,
  views        INT          NOT NULL DEFAULT 0,
  published_at DATETIME,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_blog_posts_slug (slug),
  INDEX idx_blog_posts_status (status),
  INDEX idx_blog_posts_author (author_id),
  INDEX idx_blog_posts_published (published_at DESC),
  CONSTRAINT fk_blog_posts_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── blog_post_tags ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_post_tags (
  id      CHAR(36) NOT NULL PRIMARY KEY,
  post_id CHAR(36) NOT NULL,
  tag_id  CHAR(36) NOT NULL,
  UNIQUE KEY uq_blog_post_tags (post_id, tag_id),
  INDEX idx_blog_post_tags_tag (tag_id),
  CONSTRAINT fk_blog_post_tags_post FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_blog_post_tags_tag  FOREIGN KEY (tag_id)  REFERENCES tags(id)       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── library_resources ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS library_resources (
  id             CHAR(36)     NOT NULL PRIMARY KEY,
  title          VARCHAR(500) NOT NULL,
  description    TEXT,
  file_url       TEXT         NOT NULL,
  file_name      VARCHAR(500) NOT NULL,
  file_size      INT,
  file_type      VARCHAR(100),
  cover_image    TEXT,
  course         VARCHAR(255),
  level          VARCHAR(100),
  category_id    CHAR(36),
  author_id      CHAR(36),
  is_public      TINYINT(1)   NOT NULL DEFAULT 0,
  is_featured    TINYINT(1)   NOT NULL DEFAULT 0,
  download_count INT          NOT NULL DEFAULT 0,
  view_count     INT          NOT NULL DEFAULT 0,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_library_resources_category (category_id),
  INDEX idx_library_resources_author (author_id),
  INDEX idx_library_resources_public (is_public),
  CONSTRAINT fk_library_resources_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── library_resource_tags ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS library_resource_tags (
  id          CHAR(36) NOT NULL PRIMARY KEY,
  resource_id CHAR(36) NOT NULL,
  tag_id      CHAR(36) NOT NULL,
  UNIQUE KEY uq_library_resource_tags (resource_id, tag_id),
  INDEX idx_library_resource_tags_tag (tag_id),
  CONSTRAINT fk_library_resource_tags_resource FOREIGN KEY (resource_id) REFERENCES library_resources(id) ON DELETE CASCADE,
  CONSTRAINT fk_library_resource_tags_tag      FOREIGN KEY (tag_id)      REFERENCES tags(id)              ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── chapters ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chapters (
  id                CHAR(36)     NOT NULL PRIMARY KEY,
  name              VARCHAR(255) NOT NULL,
  university        VARCHAR(500) NOT NULL,
  slug              VARCHAR(255) NOT NULL UNIQUE,
  description       TEXT,
  group_picture_url TEXT,
  location          VARCHAR(255),
  established_year  INT,
  contact_email     VARCHAR(255),
  member_count      INT          NOT NULL DEFAULT 0,
  social_links      JSON,
  display_order     INT          NOT NULL DEFAULT 0,
  is_active         TINYINT(1)   NOT NULL DEFAULT 1,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_chapters_slug (slug),
  INDEX idx_chapters_active (is_active, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── saved_posts ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_posts (
  id         CHAR(36) NOT NULL PRIMARY KEY,
  user_id    CHAR(36) NOT NULL,
  post_id    CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_saved_posts (user_id, post_id),
  INDEX idx_saved_posts_user (user_id),
  CONSTRAINT fk_saved_posts_post FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── saved_resources ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_resources (
  id          CHAR(36) NOT NULL PRIMARY KEY,
  user_id     CHAR(36) NOT NULL,
  resource_id CHAR(36) NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_saved_resources (user_id, resource_id),
  INDEX idx_saved_resources_user (user_id),
  CONSTRAINT fk_saved_resources_resource FOREIGN KEY (resource_id) REFERENCES library_resources(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── resource_views ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resource_views (
  id          CHAR(36) NOT NULL PRIMARY KEY,
  user_id     CHAR(36),
  resource_id CHAR(36) NOT NULL,
  viewed_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_resource_views_resource (resource_id),
  INDEX idx_resource_views_user (user_id),
  CONSTRAINT fk_resource_views_resource FOREIGN KEY (resource_id) REFERENCES library_resources(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── resource_downloads ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resource_downloads (
  id            CHAR(36) NOT NULL PRIMARY KEY,
  user_id       CHAR(36) NOT NULL,
  resource_id   CHAR(36) NOT NULL,
  downloaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_resource_downloads_user (user_id, downloaded_at DESC),
  INDEX idx_resource_downloads_resource (resource_id),
  CONSTRAINT fk_resource_downloads_resource FOREIGN KEY (resource_id) REFERENCES library_resources(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── post_views ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_views (
  id        CHAR(36) NOT NULL PRIMARY KEY,
  user_id   CHAR(36) NOT NULL,
  post_id   CHAR(36) NOT NULL,
  viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_post_views_user (user_id, viewed_at DESC),
  INDEX idx_post_views_post (post_id),
  CONSTRAINT fk_post_views_post FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── site_visits ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_visits (
  id         CHAR(36)  NOT NULL PRIMARY KEY,
  user_id    CHAR(36),
  session_id VARCHAR(255) NOT NULL,
  path       VARCHAR(2000) NOT NULL,
  referrer   TEXT,
  user_agent TEXT,
  created_at DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_site_visits_created_at (created_at DESC),
  INDEX idx_site_visits_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── events ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  title        VARCHAR(500) NOT NULL,
  description  TEXT,
  location     VARCHAR(500),
  cover_image  TEXT,
  link         TEXT,
  start_time   DATETIME     NOT NULL,
  end_time     DATETIME,
  is_published TINYINT(1)   NOT NULL DEFAULT 1,
  created_by   CHAR(36),
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_events_start_time (start_time DESC),
  INDEX idx_events_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── executives ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS executives (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  full_name  VARCHAR(255) NOT NULL,
  position   VARCHAR(255) NOT NULL,
  bio        TEXT,
  image_url  TEXT,
  email      VARCHAR(255),
  phone      VARCHAR(50),
  sort_order INT          NOT NULL DEFAULT 0,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_executives_active (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── app_settings ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_settings (
  `key`      VARCHAR(255) NOT NULL PRIMARY KEY,
  value      JSON         NOT NULL,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by CHAR(36)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── convention_registrations ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS convention_registrations (
  id                      CHAR(36)       NOT NULL PRIMARY KEY,
  user_id                 CHAR(36)       NOT NULL,
  registration_type       VARCHAR(20)    NOT NULL,  -- 'student' | 'graduate' | 'chapter'
  full_name               VARCHAR(255)   NOT NULL,
  email                   VARCHAR(255)   NOT NULL,
  phone                   VARCHAR(50)    NOT NULL,
  institution             VARCHAR(500),
  chapter_name            VARCHAR(255),
  delegates_count         INT            NOT NULL DEFAULT 1,
  delegates               JSON,
  amount                  DECIMAL(12,2)  NOT NULL,
  currency                VARCHAR(10)    NOT NULL DEFAULT 'NGN',
  payment_status          VARCHAR(20)    NOT NULL DEFAULT 'pending',  -- 'pending' | 'successful' | 'failed'
  tx_ref                  VARCHAR(255)   NOT NULL UNIQUE,
  flw_transaction_id      VARCHAR(255),
  reference_code          VARCHAR(255)   NOT NULL UNIQUE,
  notes                   TEXT,
  gender                  VARCHAR(20),
  department              VARCHAR(255),
  matric_number           VARCHAR(100),
  graduation_year         INT,
  accommodation_request   TEXT,
  emergency_contact_name  VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  created_at              DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_conv_reg_user (user_id),
  INDEX idx_conv_reg_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── admin_login_log ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_login_log (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  user_id    CHAR(36)     NOT NULL,
  email      VARCHAR(255),
  user_agent TEXT,
  ip_address VARCHAR(45),
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_login_log_user (user_id),
  INDEX idx_admin_login_log_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- End of schema
-- =====================================================================
-- Quick-start: after importing run the following to create a first admin
-- (replace the values below with your own):
--
--   SET @id = UUID();
--   INSERT INTO users (id, email, password_hash, email_verified)
--     VALUES (@id, 'admin@example.com', '$2a$12$...bcrypt_hash...', 1);
--   INSERT INTO profiles (id, user_id, full_name, email)
--     VALUES (UUID(), @id, 'Admin User', 'admin@example.com');
--   INSERT INTO user_roles (id, user_id, role)
--     VALUES (UUID(), @id, 'admin');
--
-- Or use the /api/auth/admin-signup endpoint with the ADMIN_SIGNUP_SECRET.
-- =====================================================================

-- =====================================================================
-- Convention Registration Seed Data (Jul 2026, 10 students)
-- Password for all accounts: 123456
-- =====================================================================
SET @pw = '$2b$12$kt2aC0qWOP2YhLrIkd87QOZP5kPGjPQFUkyJeJhNB.W4dUHmoUgR2';

INSERT IGNORE INTO users (id, email, password_hash, email_verified, created_at, updated_at) VALUES
  ('a1000001-0000-4000-a000-000000000001','onwegoodnessidagbo@gmail.com',@pw,1,'2026-07-09 00:00:00','2026-07-09 00:00:00'),
  ('a1000001-0000-4000-a000-000000000002','zubairfatiha502@gmail.com',@pw,1,'2026-07-11 00:00:00','2026-07-11 00:00:00'),
  ('a1000001-0000-4000-a000-000000000003','ekwunifevictor250@gmail.com',@pw,1,'2026-07-14 00:00:00','2026-07-14 00:00:00'),
  ('a1000001-0000-4000-a000-000000000004','fathiaoluwajuwonloatotileto@gmail.com',@pw,1,'2026-07-14 00:00:00','2026-07-14 00:00:00'),
  ('a1000001-0000-4000-a000-000000000005','akpastella229@gmail.com',@pw,1,'2026-07-16 00:00:00','2026-07-16 00:00:00'),
  ('a1000001-0000-4000-a000-000000000006','lateefnasirat2002@gmail.com',@pw,1,'2026-07-18 00:00:00','2026-07-18 00:00:00'),
  ('a1000001-0000-4000-a000-000000000007','firdaosadeniran2@gmail.com',@pw,1,'2026-07-08 00:00:00','2026-07-08 00:00:00'),
  ('a1000001-0000-4000-a000-000000000008','ekundayoglory8@gmail.com',@pw,1,'2026-07-23 00:00:00','2026-07-23 00:00:00'),
  ('a1000001-0000-4000-a000-000000000009','raymondfavour72@gmail.com',@pw,1,'2026-07-22 00:00:00','2026-07-22 00:00:00'),
  ('a1000001-0000-4000-a000-000000000010','nwokeukwujuliet@gmail.com',@pw,1,'2026-07-22 00:00:00','2026-07-22 00:00:00');

INSERT IGNORE INTO profiles (id, user_id, full_name, email, created_at, updated_at) VALUES
  ('b1000001-0000-4000-b000-000000000001','a1000001-0000-4000-a000-000000000001','Onwe Goodness Idagbo','onwegoodnessidagbo@gmail.com','2026-07-09 00:00:00','2026-07-09 00:00:00'),
  ('b1000001-0000-4000-b000-000000000002','a1000001-0000-4000-a000-000000000002','Zubair Fatiha Ayomide','zubairfatiha502@gmail.com','2026-07-11 00:00:00','2026-07-11 00:00:00'),
  ('b1000001-0000-4000-b000-000000000003','a1000001-0000-4000-a000-000000000003','Victor Akachi Ekwunife','ekwunifevictor250@gmail.com','2026-07-14 00:00:00','2026-07-14 00:00:00'),
  ('b1000001-0000-4000-b000-000000000004','a1000001-0000-4000-a000-000000000004','Atotileto Fathia Oluwajuwonlo','fathiaoluwajuwonloatotileto@gmail.com','2026-07-14 00:00:00','2026-07-14 00:00:00'),
  ('b1000001-0000-4000-b000-000000000005','a1000001-0000-4000-a000-000000000005','Akpa Stella Chiamaka','akpastella229@gmail.com','2026-07-16 00:00:00','2026-07-16 00:00:00'),
  ('b1000001-0000-4000-b000-000000000006','a1000001-0000-4000-a000-000000000006','Lateef Nasirat Opeyemi','lateefnasirat2002@gmail.com','2026-07-18 00:00:00','2026-07-18 00:00:00'),
  ('b1000001-0000-4000-b000-000000000007','a1000001-0000-4000-a000-000000000007','Firdaos Adeniran Adetoro','firdaosadeniran2@gmail.com','2026-07-08 00:00:00','2026-07-08 00:00:00'),
  ('b1000001-0000-4000-b000-000000000008','a1000001-0000-4000-a000-000000000008','Ekundayo Glory Eseohe','ekundayoglory8@gmail.com','2026-07-23 00:00:00','2026-07-23 00:00:00'),
  ('b1000001-0000-4000-b000-000000000009','a1000001-0000-4000-a000-000000000009','Raymond Favour Chinecherem','raymondfavour72@gmail.com','2026-07-22 00:00:00','2026-07-22 00:00:00'),
  ('b1000001-0000-4000-b000-000000000010','a1000001-0000-4000-a000-000000000010','Nwokeukwu Chisom Juliet','nwokeukwujuliet@gmail.com','2026-07-22 00:00:00','2026-07-22 00:00:00');

INSERT IGNORE INTO user_roles (id, user_id, role, created_at) VALUES
  ('c1000001-0000-4000-c000-000000000001','a1000001-0000-4000-a000-000000000001','user','2026-07-09 00:00:00'),
  ('c1000001-0000-4000-c000-000000000002','a1000001-0000-4000-a000-000000000002','user','2026-07-11 00:00:00'),
  ('c1000001-0000-4000-c000-000000000003','a1000001-0000-4000-a000-000000000003','user','2026-07-14 00:00:00'),
  ('c1000001-0000-4000-c000-000000000004','a1000001-0000-4000-a000-000000000004','user','2026-07-14 00:00:00'),
  ('c1000001-0000-4000-c000-000000000005','a1000001-0000-4000-a000-000000000005','user','2026-07-16 00:00:00'),
  ('c1000001-0000-4000-c000-000000000006','a1000001-0000-4000-a000-000000000006','user','2026-07-18 00:00:00'),
  ('c1000001-0000-4000-c000-000000000007','a1000001-0000-4000-a000-000000000007','user','2026-07-08 00:00:00'),
  ('c1000001-0000-4000-c000-000000000008','a1000001-0000-4000-a000-000000000008','user','2026-07-23 00:00:00'),
  ('c1000001-0000-4000-c000-000000000009','a1000001-0000-4000-a000-000000000009','user','2026-07-22 00:00:00'),
  ('c1000001-0000-4000-c000-000000000010','a1000001-0000-4000-a000-000000000010','user','2026-07-22 00:00:00');

INSERT IGNORE INTO convention_registrations
  (id, user_id, registration_type, full_name, email, phone, amount, currency, payment_status, tx_ref, reference_code, notes, created_at, updated_at)
VALUES
  ('d1000001-0000-4000-d000-000000000001','a1000001-0000-4000-a000-000000000001','student','Onwe Goodness Idagbo','onwegoodnessidagbo@gmail.com','08146622290',300.00,'NGN','successful','NUASA-1783623956149-4dfd1n','NUASA-REG-2026-001','Breakout Session: Academic Research & Library Science','2026-07-09 00:00:00','2026-07-09 00:00:00'),
  ('d1000001-0000-4000-d000-000000000002','a1000001-0000-4000-a000-000000000002','student','Zubair Fatiha Ayomide','zubairfatiha502@gmail.com','09039431251',300.00,'NGN','successful','NUASA-1783726414781-eh1jdp','NUASA-REG-2026-002','Breakout Session: Career Development & Professional Networking','2026-07-11 00:00:00','2026-07-11 00:00:00'),
  ('d1000001-0000-4000-d000-000000000003','a1000001-0000-4000-a000-000000000003','student','Victor Akachi Ekwunife','ekwunifevictor250@gmail.com','09161546386',300.00,'NGN','successful','NUASA-1784047195736-d70d82','NUASA-REG-2026-003','Breakout Session: Mental Health & Student Wellbeing','2026-07-14 00:00:00','2026-07-14 00:00:00'),
  ('d1000001-0000-4000-d000-000000000004','a1000001-0000-4000-a000-000000000004','student','Atotileto Fathia Oluwajuwonlo','fathiaoluwajuwonloatotileto@gmail.com','08116313514',300.00,'NGN','successful','NUASA-1784204123062-ttza85','NUASA-REG-2026-004','Breakout Session: Leadership & Governance in NUASA','2026-07-14 00:00:00','2026-07-14 00:00:00'),
  ('d1000001-0000-4000-d000-000000000005','a1000001-0000-4000-a000-000000000005','student','Akpa Stella Chiamaka','akpastella229@gmail.com','08169972974',300.00,'NGN','successful','NUASA-1784223874178-h13j3x','NUASA-REG-2026-005','Breakout Session: Innovation & Technology in Library Science','2026-07-16 00:00:00','2026-07-16 00:00:00'),
  ('d1000001-0000-4000-d000-000000000006','a1000001-0000-4000-a000-000000000006','student','Lateef Nasirat Opeyemi','lateefnasirat2002@gmail.com','08138057535',300.00,'NGN','successful','NUASA-1784643838988-r831j6','NUASA-REG-2026-006','Breakout Session: Academic Research & Library Science','2026-07-18 00:00:00','2026-07-18 00:00:00'),
  ('d1000001-0000-4000-d000-000000000007','a1000001-0000-4000-a000-000000000007','student','Firdaos Adeniran Adetoro','firdaosadeniran2@gmail.com','09136544715',300.00,'NGN','successful','NUASA-1784657679059-xstqva','NUASA-REG-2026-007','Breakout Session: Career Development & Professional Networking','2026-07-08 00:00:00','2026-07-08 00:00:00'),
  ('d1000001-0000-4000-d000-000000000008','a1000001-0000-4000-a000-000000000008','student','Ekundayo Glory Eseohe','ekundayoglory8@gmail.com','09064847109',300.00,'NGN','successful','NUASA-1784839158028-55s2ks','NUASA-REG-2026-008','Breakout Session: Mental Health & Student Wellbeing','2026-07-23 00:00:00','2026-07-23 00:00:00'),
  ('d1000001-0000-4000-d000-000000000009','a1000001-0000-4000-a000-000000000009','student','Raymond Favour Chinecherem','raymondfavour72@gmail.com','09163858196',300.00,'NGN','successful','NUASA-1784719914511-tce5wu','NUASA-REG-2026-009','Breakout Session: Leadership & Governance in NUASA','2026-07-22 00:00:00','2026-07-22 00:00:00'),
  ('d1000001-0000-4000-d000-000000000010','a1000001-0000-4000-a000-000000000010','student','Nwokeukwu Chisom Juliet','nwokeukwujuliet@gmail.com','09032849308',300.00,'NGN','successful','NUASA-1784708531304-km1oha','NUASA-REG-2026-010','Breakout Session: Innovation & Technology in Library Science','2026-07-22 00:00:00','2026-07-22 00:00:00');
