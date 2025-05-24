-- Create stats table
CREATE TABLE IF NOT EXISTS stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_messages_sent INTEGER DEFAULT 0,
    total_contacts INTEGER DEFAULT 0,
    total_messages_failed INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT unique_user_stats UNIQUE (user_id)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_stats_updated_at
    BEFORE UPDATE ON stats
    FOR EACH ROW
    EXECUTE FUNCTION update_stats_updated_at();

-- Create RLS policies
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Policy for select (users can only see their own stats)
CREATE POLICY "Users can view their own stats"
    ON stats
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for insert (users can only insert their own stats)
CREATE POLICY "Users can insert their own stats"
    ON stats
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for update (users can only update their own stats)
CREATE POLICY "Users can update their own stats"
    ON stats
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create function to initialize stats for new users
CREATE OR REPLACE FUNCTION initialize_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO stats (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create stats for new users
CREATE TRIGGER create_user_stats
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_user_stats();

-- Grant permissions
GRANT ALL ON stats TO authenticated; 