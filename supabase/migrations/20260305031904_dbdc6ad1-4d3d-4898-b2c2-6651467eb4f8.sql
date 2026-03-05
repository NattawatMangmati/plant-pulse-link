
-- Rename Inspectors table and columns to lowercase
ALTER TABLE public."Inspectors" RENAME TO inspectors;
ALTER TABLE public.inspectors RENAME COLUMN "Name" TO name;
ALTER TABLE public.inspectors RENAME COLUMN "Phone" TO phone;
ALTER TABLE public.inspectors RENAME COLUMN "Position" TO position;
ALTER TABLE public.inspectors RENAME COLUMN "Photo URL" TO photo;

-- Add missing email column
ALTER TABLE public.inspectors ADD COLUMN email text;

-- RLS for inspectors (allow authenticated users full access)
CREATE POLICY "Authenticated users can view inspectors" ON public.inspectors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert inspectors" ON public.inspectors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update inspectors" ON public.inspectors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete inspectors" ON public.inspectors FOR DELETE TO authenticated USING (true);

-- Create farmers table
CREATE TABLE public.farmers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_name text NOT NULL,
  farmer_no text,
  address text,
  province text,
  district text,
  subdistrict text,
  bank text,
  account_no text,
  branch text,
  contract text,
  inspector_id uuid REFERENCES public.inspectors(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE POLICY "Authenticated users can view farmers" ON public.farmers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert farmers" ON public.farmers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update farmers" ON public.farmers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete farmers" ON public.farmers FOR DELETE TO authenticated USING (true);

-- Create plantations table
CREATE TABLE public.plantations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid REFERENCES public.farmers(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE POLICY "Authenticated users can view plantations" ON public.plantations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert plantations" ON public.plantations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update plantations" ON public.plantations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete plantations" ON public.plantations FOR DELETE TO authenticated USING (true);

-- Create inspections table
CREATE TABLE public.inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plantation_id uuid REFERENCES public.plantations(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  details text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE POLICY "Authenticated users can view inspections" ON public.inspections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert inspections" ON public.inspections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update inspections" ON public.inspections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete inspections" ON public.inspections FOR DELETE TO authenticated USING (true);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
