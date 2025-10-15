-- Auto-verify all existing users
-- Run this directly in your database

UPDATE public.users
SET verification_status = 'VERIFIED',
    updated_at = NOW()
WHERE verification_status IS NULL
   OR verification_status = 'NOT_SUBMITTED'
   OR verification_status = 'REJECTED';

-- Add comment for clarity
COMMENT ON COLUMN public.users.verification_status IS 'User verification status: VERIFIED (auto/quick/full), PENDING_REVIEW, REJECTED';
