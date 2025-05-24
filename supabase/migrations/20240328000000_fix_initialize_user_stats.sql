-- Drop existing function with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS initialize_user_stats() CASCADE;

-- Recreate initialize_user_stats function without total_contacts
CREATE OR REPLACE FUNCTION initialize_user_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO stats (user_id, total_messages_sent, total_messages_failed)
    VALUES (NEW.id, 0, 0);
    RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER create_user_stats
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_user_stats();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION initialize_user_stats() TO authenticated; 