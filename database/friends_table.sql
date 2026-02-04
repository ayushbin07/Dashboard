-- Create friends table to store friend relationships
CREATE TABLE IF NOT EXISTS friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure no duplicate friend relationships
    UNIQUE(user_id, friend_id)
);

-- Enable Row Level Security
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own friend relationships
CREATE POLICY "Users can view their own friends"
    ON friends
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can add friends
CREATE POLICY "Users can add friends"
    ON friends
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can remove friends
CREATE POLICY "Users can remove friends"
    ON friends
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
