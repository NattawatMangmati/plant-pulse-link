
-- 60days: INSERT, UPDATE, DELETE for authenticated
CREATE POLICY "Auth can insert 60days" ON public."60days" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update 60days" ON public."60days" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete 60days" ON public."60days" FOR DELETE TO authenticated USING (true);

-- 120days: INSERT, UPDATE, DELETE for authenticated
CREATE POLICY "Auth can insert 120days" ON public."120days" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update 120days" ON public."120days" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete 120days" ON public."120days" FOR DELETE TO authenticated USING (true);

-- 140days: INSERT, UPDATE, DELETE for authenticated
CREATE POLICY "Auth can insert 140days" ON public."140days" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update 140days" ON public."140days" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete 140days" ON public."140days" FOR DELETE TO authenticated USING (true);

-- harvest_plan: SELECT, INSERT, UPDATE, DELETE for authenticated
CREATE POLICY "Auth can select harvest_plan" ON public.harvest_plan FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can insert harvest_plan" ON public.harvest_plan FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update harvest_plan" ON public.harvest_plan FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete harvest_plan" ON public.harvest_plan FOR DELETE TO authenticated USING (true);

-- Storage: Plantation photo bucket
CREATE POLICY "Auth can upload plantation photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'Plantation photo');
CREATE POLICY "Auth can view plantation photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'Plantation photo');
CREATE POLICY "Auth can update plantation photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'Plantation photo');
CREATE POLICY "Auth can delete plantation photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'Plantation photo');
CREATE POLICY "Public can view plantation photos" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'Plantation photo');

-- Storage: Inspection photo bucket
CREATE POLICY "Auth can upload inspection photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'Inspection photo');
CREATE POLICY "Auth can view inspection photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'Inspection photo');
CREATE POLICY "Auth can update inspection photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'Inspection photo');
CREATE POLICY "Auth can delete inspection photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'Inspection photo');
CREATE POLICY "Public can view inspection photos" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'Inspection photo');

-- Storage: 60D photo bucket
CREATE POLICY "Auth can upload 60d photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = '60D photo');
CREATE POLICY "Auth can view 60d photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = '60D photo');
CREATE POLICY "Auth can update 60d photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = '60D photo');
CREATE POLICY "Auth can delete 60d photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = '60D photo');
CREATE POLICY "Public can view 60d photos" ON storage.objects FOR SELECT TO anon USING (bucket_id = '60D photo');

-- Storage: 120D photo bucket
CREATE POLICY "Auth can upload 120d photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = '120D photo');
CREATE POLICY "Auth can view 120d photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = '120D photo');
CREATE POLICY "Auth can update 120d photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = '120D photo');
CREATE POLICY "Auth can delete 120d photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = '120D photo');
CREATE POLICY "Public can view 120d photos" ON storage.objects FOR SELECT TO anon USING (bucket_id = '120D photo');
