-- Run this in your Supabase SQL Editor to enable:
--   • Two chapter delegates (name/phone/email) on registrations
--   • Executives table + storage bucket for the public Executives page

-- 1) Chapter delegates stored as JSON array on convention_registrations
ALTER TABLE public.convention_registrations
  ADD COLUMN IF NOT EXISTS delegates jsonb;

-- 2) Executives table (admin-managed)
CREATE TABLE IF NOT EXISTS public.executives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  position text NOT NULL,
  bio text,
  image_url text,
  email text,
  phone text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.executives TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.executives TO authenticated;
GRANT ALL ON public.executives TO service_role;

ALTER TABLE public.executives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Executives are publicly viewable" ON public.executives;
CREATE POLICY "Executives are publicly viewable"
  ON public.executives FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can view all executives" ON public.executives;
CREATE POLICY "Admins can view all executives"
  ON public.executives FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert executives" ON public.executives;
CREATE POLICY "Admins can insert executives"
  ON public.executives FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update executives" ON public.executives;
CREATE POLICY "Admins can update executives"
  ON public.executives FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete executives" ON public.executives;
CREATE POLICY "Admins can delete executives"
  ON public.executives FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3) Storage bucket for executive photos
INSERT INTO storage.buckets (id, name, public)
  VALUES ('executives', 'executives', true)
  ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Executive photos are publicly accessible" ON storage.objects;
CREATE POLICY "Executive photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'executives');

DROP POLICY IF EXISTS "Admins can upload executive photos" ON storage.objects;
CREATE POLICY "Admins can upload executive photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'executives' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update executive photos" ON storage.objects;
CREATE POLICY "Admins can update executive photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'executives' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete executive photos" ON storage.objects;
CREATE POLICY "Admins can delete executive photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'executives' AND public.has_role(auth.uid(), 'admin'));
