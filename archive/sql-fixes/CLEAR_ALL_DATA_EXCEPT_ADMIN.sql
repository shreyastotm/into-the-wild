-- CLEAR ALL DATA EXCEPT ADMIN USER
-- This script will remove all data except for shreyasmadhan82@gmail.com
-- Run this script in your Supabase SQL editor

-- First, let's identify the admin user ID
-- (This is just for reference - we'll use the email directly in the WHERE clauses)

-- 1. Clear expense_shares (expense sharing data)
DELETE FROM expense_shares 
WHERE user_id IN (
  SELECT user_id FROM users 
  WHERE email != 'shreyasmadhan82@gmail.com'
);

-- 2. Clear trek_expenses (expense records)
DELETE FROM trek_expenses 
WHERE creator_id IN (
  SELECT user_id FROM users 
  WHERE email != 'shreyasmadhan82@gmail.com'
);

-- 3. Clear trek_comments (comments on treks)
DELETE FROM trek_comments 
WHERE user_id IN (
  SELECT user_id FROM users 
  WHERE email != 'shreyasmadhan82@gmail.com'
);

-- 4. Clear trek_registrations (user registrations for treks)
DELETE FROM trek_registrations 
WHERE user_id IN (
  SELECT user_id FROM users 
  WHERE email != 'shreyasmadhan82@gmail.com'
);

-- 5. Clear notifications
DELETE FROM notifications 
WHERE user_id IN (
  SELECT user_id FROM users 
  WHERE email != 'shreyasmadhan82@gmail.com'
);

-- 6. Clear tent_rentals (this table doesn't have user_id, so we'll clear all)
-- Note: tent_rentals is a catalog table, not user-specific data
DELETE FROM tent_rentals;

-- 7. Clear trek_events (trek events created by non-admin users)
DELETE FROM trek_events 
WHERE created_by IN (
  SELECT user_id FROM users 
  WHERE email != 'shreyasmadhan82@gmail.com'
);

-- 8. Clear trek_ratings
DELETE FROM trek_ratings 
WHERE user_id IN (
  SELECT user_id FROM users 
  WHERE email != 'shreyasmadhan82@gmail.com'
);

-- 9. Clear trek_participant_ratings
DELETE FROM trek_participant_ratings 
WHERE rated_user_id IN (
  SELECT user_id FROM users 
  WHERE email != 'shreyasmadhan82@gmail.com'
) OR rated_by_user_id IN (
  SELECT user_id FROM users 
  WHERE email != 'shreyasmadhan82@gmail.com'
);

-- 10. Finally, clear users (except admin)
DELETE FROM users 
WHERE email != 'shreyasmadhan82@gmail.com';

-- 9. Reset sequences (optional - helps with clean IDs)
-- Note: Only run these if you want to reset auto-increment counters
-- ALTER SEQUENCE trek_events_trek_id_seq RESTART WITH 1;
-- ALTER SEQUENCE trek_registrations_registration_id_seq RESTART WITH 1;
-- ALTER SEQUENCE trek_comments_comment_id_seq RESTART WITH 1;
-- ALTER SEQUENCE trek_expenses_id_seq RESTART WITH 1;
-- ALTER SEQUENCE trek_expense_shares_id_seq RESTART WITH 1;
-- ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
-- ALTER SEQUENCE tent_rentals_id_seq RESTART WITH 1;

-- Verification query - check what data remains
SELECT 
  'users' as table_name, 
  COUNT(*) as remaining_records 
FROM users
UNION ALL
SELECT 
  'trek_events' as table_name, 
  COUNT(*) as remaining_records 
FROM trek_events
UNION ALL
SELECT 
  'trek_registrations' as table_name, 
  COUNT(*) as remaining_records 
FROM trek_registrations
UNION ALL
SELECT 
  'trek_comments' as table_name, 
  COUNT(*) as remaining_records 
FROM trek_comments
UNION ALL
SELECT 
  'trek_expenses' as table_name, 
  COUNT(*) as remaining_records 
FROM trek_expenses
UNION ALL
SELECT 
  'expense_shares' as table_name, 
  COUNT(*) as remaining_records 
FROM expense_shares
UNION ALL
SELECT 
  'notifications' as table_name, 
  COUNT(*) as remaining_records 
FROM notifications
UNION ALL
SELECT 
  'tent_rentals' as table_name, 
  COUNT(*) as remaining_records 
FROM tent_rentals
UNION ALL
SELECT 
  'trek_ratings' as table_name, 
  COUNT(*) as remaining_records 
FROM trek_ratings
UNION ALL
SELECT 
  'trek_participant_ratings' as table_name, 
  COUNT(*) as remaining_records 
FROM trek_participant_ratings;

-- Show the remaining admin user
SELECT user_id, email, full_name, created_at 
FROM users 
WHERE email = 'shreyasmadhan82@gmail.com';
