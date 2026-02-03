-- Add email column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update handle_new_user to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar, theme, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'avatar', '👨‍💻'),
        'light',
        NEW.email
    );
    
    -- Initialize streak data
    INSERT INTO public.streak_data (user_id, count, last_check_in, status)
    VALUES (NEW.id, 1, CURRENT_DATE, 'active');
    
    -- Initialize notification settings
    INSERT INTO public.notification_settings (user_id, push_notifications, audio_alarms)
    VALUES (NEW.id, true, true);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get email by username (accessible by anon)
CREATE OR REPLACE FUNCTION public.get_email_by_username(username_input TEXT)
RETURNS TEXT AS $$
DECLARE
    found_email TEXT;
BEGIN
    SELECT email INTO found_email
    FROM public.profiles
    WHERE username = username_input;
    
    RETURN found_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to anon (so login page can call it)
GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO service_role;

-- OPTIONAL: Backfill email for existing profiles (Try this, might fail if auth.users is restricted)
-- DO $$
-- BEGIN
--     UPDATE public.profiles p
--     SET email = u.email
--     FROM auth.users u
--     WHERE p.id = u.id AND p.email IS NULL;
-- EXCEPTION WHEN OTHERS THEN
--     -- Ignore errors if auth.users is not accessible
-- END $$;
