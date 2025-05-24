-- Ensure the stats table has the updated_at column with the correct default
DO $$ 
BEGIN
    -- Check if updated_at column exists and has the correct default
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'stats' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE stats ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
    END IF;
END $$;

-- Verify trigger exists and recreate if needed
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'update_stats_updated_at'
    ) THEN
        CREATE TRIGGER update_stats_updated_at
            BEFORE UPDATE ON stats
            FOR EACH ROW
            EXECUTE FUNCTION update_stats_updated_at();
    END IF;
END $$; 