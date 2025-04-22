-- Migration: Backfill missing user_type, indemnity_accepted, and verification_status for existing users
UPDATE public.users
SET user_type = 'trekker'
WHERE user_type IS NULL;

UPDATE public.users
SET indemnity_accepted = true, indemnity_accepted_at = NOW()
WHERE indemnity_accepted = false AND user_id IN ('e6eceef9-bd36-4b4b-b35a-71aa4fbe1568', '6ce9b479-9414-401a-adf5-c3336352ff93', '61946fd4-bbba-40a7-904a-6223c20dd358');

UPDATE public.users
SET verification_status = 'verified'
WHERE user_id IN ('e6eceef9-bd36-4b4b-b35a-71aa4fbe1568', '6ce9b479-9414-401a-adf5-c3336352ff93', '61946fd4-bbba-40a7-904a-6223c20dd358');
