-- Add policy to allow users to search for other users' profiles by username
-- This is needed for the friend search functionality

-- First, check if the policy already exists and drop it if needed
DROP POLICY IF EXISTS "Users can search other profiles" ON profiles;

-- Create policy to allow all authenticated users to view all profiles
-- (needed for friend search, viewing friend data, etc.)
CREATE POLICY "Users can search other profiles"
    ON profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Note: This allows authenticated users to view basic profile info (username, avatar)
-- which is necessary for:
-- 1. Searching for friends by username
-- 2. Displaying friend cards with their data
-- 3. Viewing leaderboard/social features
