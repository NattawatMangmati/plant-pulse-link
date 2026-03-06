
CREATE POLICY "Authenticated users can upload inspector photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'Inspector photo');

CREATE POLICY "Authenticated users can view inspector photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'Inspector photo');

CREATE POLICY "Authenticated users can update inspector photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'Inspector photo');

CREATE POLICY "Authenticated users can delete inspector photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'Inspector photo');

CREATE POLICY "Public can view inspector photos"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'Inspector photo');
