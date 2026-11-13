CREATE TABLE public.site_content (
  id text PRIMARY KEY DEFAULT 'main',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read the landing page content"
  ON public.site_content FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.admin_unlock_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX admin_unlock_attempts_client_time_idx ON public.admin_unlock_attempts (client_key, created_at DESC);
GRANT ALL ON public.admin_unlock_attempts TO service_role;
ALTER TABLE public.admin_unlock_attempts ENABLE ROW LEVEL SECURITY;