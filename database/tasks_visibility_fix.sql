-- RESTRICT TASKS VISIBILITY
-- Ensure users can ONLY see their own tasks
-- Run this in Supabase SQL Editor

-- 1. Drop the existing policy to avoid duplicates or overrides
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;

-- 2. Create a strict SELECT policy
CREATE POLICY "Users can view own tasks"
    ON public.tasks
    FOR SELECT
    USING (auth.uid() = user_id);

-- 3. Verify other policies are also restricted to owner
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks"
    ON public.tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks"
    ON public.tasks
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks"
    ON public.tasks
    FOR DELETE
    USING (auth.uid() = user_id);
