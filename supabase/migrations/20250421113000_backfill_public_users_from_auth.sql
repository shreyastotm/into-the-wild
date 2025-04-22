-- Migration: Backfill missing users from auth.users to public.users
INSERT INTO public.users (user_id, email, full_name, avatar_url, subscription_type)
SELECT a.id, a.email, a.raw_user_meta_data->>'full_name', NULL, 'self_service'
FROM auth.users a
LEFT JOIN public.users u ON a.id = u.user_id
WHERE u.user_id IS NULL;

-- Note: Adjust subscription_type or add more columns as needed for your schema.
-- You may want to update avatar_url later via the app or admin UI.
