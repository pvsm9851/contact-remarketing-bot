-- Drop existing triggers first
DROP TRIGGER IF EXISTS create_user_stats ON users;
DROP TRIGGER IF EXISTS update_updated_at_column ON stats;
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;

-- Drop existing functions with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS initialize_user_stats() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Recreate initialize_user_stats function with proper search path
CREATE OR REPLACE FUNCTION initialize_user_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO stats (user_id, total_messages_sent, total_contacts, total_messages_failed)
    VALUES (NEW.id, 0, 0, 0);
    RETURN NEW;
END;
$$;

-- Recreate update_updated_at_column function with proper search path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER create_user_stats
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_user_stats();

CREATE TRIGGER update_updated_at_column
    BEFORE UPDATE ON stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Recreate contacts trigger
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION initialize_user_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;

-- Verify stats table has updated_at column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'stats' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE stats ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
    END IF;
END $$;

-- Verify contacts table has updated_at column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contacts' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE contacts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
    END IF;
END $$; 