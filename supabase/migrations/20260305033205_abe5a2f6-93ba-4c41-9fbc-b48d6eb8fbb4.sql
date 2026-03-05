
-- Drop all restrictive policies and recreate as permissive

-- inspectors
DROP POLICY IF EXISTS "Authenticated users can view inspectors" ON public.inspectors;
DROP POLICY IF EXISTS "Authenticated users can insert inspectors" ON public.inspectors;
DROP POLICY IF EXISTS "Authenticated users can update inspectors" ON public.inspectors;
DROP POLICY IF EXISTS "Authenticated users can delete inspectors" ON public.inspectors;

CREATE POLICY "Authenticated users can view inspectors" ON public.inspectors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert inspectors" ON public.inspectors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update inspectors" ON public.inspectors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete inspectors" ON public.inspectors FOR DELETE TO authenticated USING (true);

-- farmers
DROP POLICY IF EXISTS "Authenticated users can view farmers" ON public.farmers;
DROP POLICY IF EXISTS "Authenticated users can insert farmers" ON public.farmers;
DROP POLICY IF EXISTS "Authenticated users can update farmers" ON public.farmers;
DROP POLICY IF EXISTS "Authenticated users can delete farmers" ON public.farmers;

CREATE POLICY "Authenticated users can view farmers" ON public.farmers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert farmers" ON public.farmers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update farmers" ON public.farmers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete farmers" ON public.farmers FOR DELETE TO authenticated USING (true);

-- plantations
DROP POLICY IF EXISTS "Authenticated users can view plantations" ON public.plantations;
DROP POLICY IF EXISTS "Authenticated users can insert plantations" ON public.plantations;
DROP POLICY IF EXISTS "Authenticated users can update plantations" ON public.plantations;
DROP POLICY IF EXISTS "Authenticated users can delete plantations" ON public.plantations;

CREATE POLICY "Authenticated users can view plantations" ON public.plantations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert plantations" ON public.plantations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update plantations" ON public.plantations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete plantations" ON public.plantations FOR DELETE TO authenticated USING (true);

-- inspections
DROP POLICY IF EXISTS "Authenticated users can view inspections" ON public.inspections;
DROP POLICY IF EXISTS "Authenticated users can insert inspections" ON public.inspections;
DROP POLICY IF EXISTS "Authenticated users can update inspections" ON public.inspections;
DROP POLICY IF EXISTS "Authenticated users can delete inspections" ON public.inspections;

CREATE POLICY "Authenticated users can view inspections" ON public.inspections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert inspections" ON public.inspections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update inspections" ON public.inspections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete inspections" ON public.inspections FOR DELETE TO authenticated USING (true);

-- Add missing foreign keys (if not already exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'farmers_inspector_id_fkey') THEN
    ALTER TABLE public.farmers ADD CONSTRAINT farmers_inspector_id_fkey FOREIGN KEY (inspector_id) REFERENCES public.inspectors(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'plantations_farmer_id_fkey') THEN
    ALTER TABLE public.plantations ADD CONSTRAINT plantations_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmers(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'inspections_plantation_id_fkey') THEN
    ALTER TABLE public.inspections ADD CONSTRAINT inspections_plantation_id_fkey FOREIGN KEY (plantation_id) REFERENCES public.plantations(id) ON DELETE CASCADE;
  END IF;
END $$;
