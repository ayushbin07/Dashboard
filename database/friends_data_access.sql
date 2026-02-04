-- Allow authenticated users to view streaks of other users
-- (needed for friends list)
DROP POLICY IF EXISTS "Users can view all streaks" ON streak_data;
CREATE POLICY "Users can view all streaks"
    ON streak_data
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow authenticated users to view habits of other users
-- (needed for friends list progress calculation)
DROP POLICY IF EXISTS "Users can view all habits" ON habits;
CREATE POLICY "Users can view all habits"
    ON habits
    FOR SELECT
    USING (auth.role() = 'authenticated');
