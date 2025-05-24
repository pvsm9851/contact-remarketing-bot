-- Drop existing table and its dependencies
DROP TABLE IF EXISTS public.stats CASCADE;

-- Create the stats table as an append-only log
CREATE TABLE public.stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    total_messages_sent INTEGER NOT NULL DEFAULT 0,
    total_messages_failed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create function to initialize stats for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO public.stats (
        user_id,
        total_messages_sent,
        total_messages_failed
    ) VALUES (
        NEW.id,
        0,
        0
    );
    RETURN NEW;
END;
$$;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Set up RLS
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read for users" ON public.stats;
DROP POLICY IF EXISTS "Enable insert for users" ON public.stats;
DROP POLICY IF EXISTS "Enable delete for users" ON public.stats;
DROP POLICY IF EXISTS "Enable all for service role" ON public.stats;

-- Create policies for anon and authenticated
CREATE POLICY "Enable read access for all users"
    ON public.stats
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Enable insert access for all users"
    ON public.stats
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Grant privileges
GRANT USAGE ON SCHEMA public TO postgres, authenticated, anon;
GRANT ALL ON public.stats TO postgres;
GRANT ALL ON public.stats TO anon;
GRANT ALL ON public.stats TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create indexes for performance
CREATE INDEX idx_stats_user_id ON public.stats(user_id);
CREATE INDEX idx_stats_created_at ON public.stats(created_at DESC);

-- Insert initial stats for existing users if needed
INSERT INTO public.stats (
    user_id,
    total_messages_sent,
    total_messages_failed
)
SELECT 
    id,
    0,
    0
FROM auth.users
WHERE id NOT IN (
    SELECT DISTINCT user_id 
    FROM public.stats
); 