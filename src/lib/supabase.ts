import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://batnflwsnbtyobzcpegj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhdG5mbHdzbmJ0eW9iemNwZWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NzY4NzEsImV4cCI6MjA4ODI1Mjg3MX0.01xEmZdXCMvxRaituUFSqR4BEx8kbajSyY4v1QBSHdc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
