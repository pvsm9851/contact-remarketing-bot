-- Set the correct role for schema operations
SET ROLE postgres;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO postgres, authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, authenticated;

-- First, disable RLS to clean up policies
ALTER TABLE public.stats DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own stats" ON public.stats;
DROP POLICY IF EXISTS "Users can insert their own stats" ON public.stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON public.stats;
DROP POLICY IF EXISTS "System can manage stats" ON public.stats;

-- Enable RLS again
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to view their own stats
CREATE POLICY "Users can view their own stats"
ON public.stats FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);

-- Create a policy that allows users to insert their own stats
CREATE POLICY "Users can insert their own stats"
ON public.stats FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

-- Create a policy that allows users to update their own stats
CREATE POLICY "Users can update their own stats"
ON public.stats FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

-- Create a policy that allows the system to manage stats through triggers
CREATE POLICY "System can manage stats"
ON public.stats
FOR ALL
TO postgres
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.stats TO authenticated;

-- Reset role
RESET ROLE; 