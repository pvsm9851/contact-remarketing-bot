-- First, disable RLS to clean up policies
ALTER TABLE public.stats DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own stats" ON public.stats;
DROP POLICY IF EXISTS "Users can insert their own stats" ON public.stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON public.stats;
DROP POLICY IF EXISTS "System can manage stats" ON public.stats;

-- Enable RLS again
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

-- Create policies matching the dashboard
CREATE POLICY "System can manage stats"
ON public.stats
FOR ALL
TO postgres
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can insert their own stats"
ON public.stats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own stats"
ON public.stats
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own stats"
ON public.stats
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);

-- Grant necessary permissions
GRANT ALL ON public.stats TO postgres;
GRANT ALL ON public.stats TO authenticated; 