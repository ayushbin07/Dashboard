-- Create user_feedback table to store user comments
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CHECK (length(comment) > 0 AND length(comment) <= 500)
);

-- Enable Row Level Security
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view all feedback (public testimonials)
CREATE POLICY "Anyone can view feedback"
    ON user_feedback
    FOR SELECT
    USING (true);

-- Policy: Authenticated users can add their own feedback
CREATE POLICY "Users can add feedback"
    ON user_feedback
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own feedback
CREATE POLICY "Users can delete own feedback"
    ON user_feedback
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON user_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON user_feedback(user_id);
