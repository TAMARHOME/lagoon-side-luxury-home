DROP POLICY IF EXISTS "Anyone can read the landing page content" ON public.site_content;
CREATE POLICY "Anyone can read the published landing page content"
  ON public.site_content
  FOR SELECT
  TO anon, authenticated
  USING (id = 'main');

DROP POLICY IF EXISTS "Anyone can view listing photos" ON storage.objects;