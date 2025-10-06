-- SAFE CLEANUP AUTH USERS
-- Run this step by step to safely clean up the auth.users table

-- STEP 1: First, let's see what we have
SELECT 'Current auth.users count:' as status;
SELECT COUNT(*) as auth_user_count FROM auth.users;

SELECT 'Current public.users count:' as status;
SELECT COUNT(*) as public_user_count FROM public.users;

-- STEP 2: Identify test users (emails that look like test data)
SELECT 'Test users to remove:' as status;
SELECT id, email, created_at 
FROM auth.users 
WHERE email LIKE '%@iiii.%' 
   OR email LIKE '%@kkk.%'
   OR email LIKE '%@lkjlk.%'
   OR email LIKE '%@00000.%'
   OR email LIKE '%@222222.%'
   OR email LIKE '%@kkkkk.%'
   OR email LIKE '%@asdasd.%'
   OR email LIKE '%@okok.%'
   OR email LIKE '%@weeew.%'
   OR email LIKE '%@ooj.%'
   OR email LIKE '%@dqwdq.%'
   OR email LIKE '%@totm.in'
   OR email LIKE '%@egastech.in'
   OR email LIKE '%@gmail.com'
ORDER BY created_at;

-- STEP 3: Count how many will be deleted
SELECT 'Number of test users to delete:' as status;
SELECT COUNT(*) as test_user_count
FROM auth.users 
WHERE email LIKE '%@iiii.%' 
   OR email LIKE '%@kkk.%'
   OR email LIKE '%@lkjlk.%'
   OR email LIKE '%@00000.%'
   OR email LIKE '%@222222.%'
   OR email LIKE '%@kkkkk.%'
   OR email LIKE '%@asdasd.%'
   OR email LIKE '%@okok.%'
   OR email LIKE '%@weeew.%'
   OR email LIKE '%@ooj.%'
   OR email LIKE '%@dqwdq.%'
   OR email LIKE '%@totm.in'
   OR email LIKE '%@egastech.in'
   OR email LIKE '%@gmail.com';

-- STEP 4: Show which users will be kept
SELECT 'Users to keep:' as status;
SELECT id, email, created_at 
FROM auth.users 
WHERE email NOT LIKE '%@iiii.%' 
  AND email NOT LIKE '%@kkk.%'
  AND email NOT LIKE '%@lkjlk.%'
  AND email NOT LIKE '%@00000.%'
  AND email NOT LIKE '%@222222.%'
  AND email NOT LIKE '%@kkkkk.%'
  AND email NOT LIKE '%@asdasd.%'
  AND email NOT LIKE '%@okok.%'
  AND email NOT LIKE '%@weeew.%'
  AND email NOT LIKE '%@ooj.%'
  AND email NOT LIKE '%@dqwdq.%'
  AND email NOT LIKE '%@totm.in'
  AND email NOT LIKE '%@egastech.in'
  AND email NOT LIKE '%@gmail.com'
ORDER BY created_at;

-- STEP 5: If you're satisfied with the above results, uncomment and run this:
-- DELETE FROM auth.users 
-- WHERE email LIKE '%@iiii.%' 
--    OR email LIKE '%@kkk.%'
--    OR email LIKE '%@lkjlk.%'
--    OR email LIKE '%@00000.%'
--    OR email LIKE '%@222222.%'
--    OR email LIKE '%@kkkkk.%'
--    OR email LIKE '%@asdasd.%'
--    OR email LIKE '%@okok.%'
--    OR email LIKE '%@weeew.%'
--    OR email LIKE '%@ooj.%'
--    OR email LIKE '%@dqwdq.%'
--    OR email LIKE '%@totm.in'
--    OR email LIKE '%@egastech.in'
--    OR email LIKE '%@gmail.com';

-- STEP 6: After deletion, verify the cleanup
-- SELECT 'After cleanup - auth.users count:' as status;
-- SELECT COUNT(*) as auth_user_count FROM auth.users;

-- SELECT 'After cleanup - remaining users:' as status;
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at;
