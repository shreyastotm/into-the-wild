-- Auto-verify all existing users for basic profile verification
-- This implements the new verification strategy where users are auto-verified by default

-- 1. Set all existing users to VERIFIED status
UPDATE public.users
SET verification_status = 'VERIFIED',
    updated_at = NOW()
WHERE verification_status IS NULL
   OR verification_status = 'NOT_SUBMITTED'
   OR verification_status = 'REJECTED';

-- 2. Add comment to verification_status column for clarity
COMMENT ON COLUMN public.users.verification_status IS 'User verification status: VERIFIED (auto/quick/full), PENDING_REVIEW, REJECTED';
