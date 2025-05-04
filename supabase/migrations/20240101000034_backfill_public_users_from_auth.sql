-- Migration: Backfill missing users from auth.users to public.users
INSERT INTO public.users (user_id, name, avatar_url)
SELECT
    id,
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.users);

-- Note: Adjust subscription_type or add more columns as needed for your schema.
-- You may want to update avatar_url later via the app or admin UI.
