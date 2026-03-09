
-- RLS policies for Farmer photo bucket
CREATE POLICY "Auth users can upload farmer photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'Farmer photo');

CREATE POLICY "Auth users can view farmer photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'Farmer photo');

CREATE POLICY "Auth users can update farmer photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'Farmer photo');

CREATE POLICY "Auth users can delete farmer photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'Farmer photo');

CREATE POLICY "Public can view farmer photos"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'Farmer photo');

-- RLS policies for Farmer ID card photo bucket
CREATE POLICY "Auth users can upload farmer id card photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'Farmer ID card photo');

CREATE POLICY "Auth users can view farmer id card photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'Farmer ID card photo');

CREATE POLICY "Auth users can update farmer id card photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'Farmer ID card photo');

CREATE POLICY "Auth users can delete farmer id card photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'Farmer ID card photo');

CREATE POLICY "Public can view farmer id card photos"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'Farmer ID card photo');

-- RLS policies for Farmer bank account photo bucket
CREATE POLICY "Auth users can upload farmer bank photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'Farmer bank account photo');

CREATE POLICY "Auth users can view farmer bank photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'Farmer bank account photo');

CREATE POLICY "Auth users can update farmer bank photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'Farmer bank account photo');

CREATE POLICY "Auth users can delete farmer bank photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'Farmer bank account photo');

CREATE POLICY "Public can view farmer bank photos"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'Farmer bank account photo');
