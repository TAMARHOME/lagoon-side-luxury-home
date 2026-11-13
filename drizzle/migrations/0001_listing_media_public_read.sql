CREATE POLICY "Anyone can view listing photos"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'listing-media');