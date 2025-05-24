-- Revoke all permissions first
REVOKE ALL ON stats FROM authenticated;

-- Grant specific permissions
GRANT SELECT, INSERT, UPDATE ON stats TO authenticated;

-- Ensure sequence permissions if needed
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 