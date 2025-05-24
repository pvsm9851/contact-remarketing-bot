-- Drop the existing function and trigger
DROP TRIGGER IF EXISTS update_stats_updated_at ON stats;
DROP FUNCTION IF EXISTS update_stats_updated_at();

-- Recreate the function with explicit search path
CREATE OR REPLACE FUNCTION update_stats_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_stats_updated_at
    BEFORE UPDATE ON stats
    FOR EACH ROW
    EXECUTE FUNCTION update_stats_updated_at();

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_stats_updated_at() TO authenticated; 