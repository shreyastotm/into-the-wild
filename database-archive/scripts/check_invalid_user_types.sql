-- Find users with missing or invalid user_type
SELECT user_id, email, user_type
FROM public.users
WHERE user_type IS NULL
   OR user_type NOT IN ('admin', 'micro_community', 'trekker');
