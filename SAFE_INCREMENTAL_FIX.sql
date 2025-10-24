-- ============================================================================
-- SAFE INCREMENTAL FIX FOR PRODUCTION DATABASE
-- ============================================================================
-- This script applies minimal, safe fixes to make the database work with the code
-- Run this in Supabase Dashboard SQL Editor instead of the full squashed schema
-- ============================================================================

BEGIN;

-- Step 1: Check current schema (run these first to understand what exists)
SELECT '=== CURRENT TABLES ===' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

SELECT '=== TREK_REGISTRATIONS SCHEMA ===' as info;
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'trek_registrations'
ORDER BY ordinal_position;

SELECT '=== USERS SCHEMA ===' as info;
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 2: Apply targeted fixes based on what actually exists

-- Fix 1: Create trek_registrations table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public'
                   AND table_name = 'trek_registrations') THEN

        CREATE TABLE public.trek_registrations (
            registration_id SERIAL PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
            trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
            booking_datetime TIMESTAMPTZ DEFAULT NOW(),
            cancellation_datetime TIMESTAMPTZ,
            payment_status TEXT DEFAULT 'pending',
            penalty_applied DECIMAL(10, 2),
            pickup_location_id INTEGER REFERENCES public.trek_pickup_locations(id) ON DELETE SET NULL,
            is_driver BOOLEAN DEFAULT false,
            indemnity_agreed BOOLEAN DEFAULT false,
            indemnity_agreed_at TIMESTAMPTZ,
            payment_proof_url TEXT,
            id_verification_notes TEXT,
            id_verification_status TEXT,
            registrant_name TEXT,
            registrant_phone TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        RAISE NOTICE 'Created trek_registrations table with correct schema';
    END IF;
END $$;

-- Fix 2: If trek_events has wrong primary key
DO $$
BEGIN
    -- If there's an 'id' column but no 'trek_id', fix it
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public'
               AND table_name = 'trek_events'
               AND column_name = 'id')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_schema = 'public'
                       AND table_name = 'trek_events'
                       AND column_name = 'trek_id') THEN
        -- Add trek_id column and copy data
        ALTER TABLE public.trek_events ADD COLUMN trek_id SERIAL;
        UPDATE public.trek_events SET trek_id = id;
        ALTER TABLE public.trek_events ADD PRIMARY KEY (trek_id);
        ALTER TABLE public.trek_events DROP COLUMN id;
        RAISE NOTICE 'Fixed trek_events primary key to trek_id';
    END IF;
END $$;

-- Fix 3: Add missing columns if they don't exist
ALTER TABLE public.trek_registrations ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.trek_registrations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.trek_events ADD COLUMN IF NOT EXISTS trek_id SERIAL PRIMARY KEY;

-- Fix 4: Ensure foreign key constraints exist (only if both tables and columns exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'trek_registrations')
       AND EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = 'users')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'trek_registrations'
                   AND column_name = 'user_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'users'
                   AND column_name = 'user_id') THEN

        -- Add foreign key constraint if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                       WHERE table_schema = 'public'
                       AND table_name = 'trek_registrations'
                       AND constraint_type = 'FOREIGN KEY'
                       AND constraint_name LIKE '%user_id%') THEN
            ALTER TABLE public.trek_registrations
            ADD CONSTRAINT fk_trek_registrations_user_id
            FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
            RAISE NOTICE 'Added foreign key constraint for user_id';
        END IF;
    END IF;
END $$;

-- Fix 5: Create the RPC function that the code needs
CREATE OR REPLACE FUNCTION get_trek_participant_count(trek_id_param INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    participant_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO participant_count
    FROM trek_registrations
    WHERE trek_id = trek_id_param
    AND payment_status IN ('paid', 'pending', 'proof_uploaded');

    RETURN COALESCE(participant_count, 0);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_trek_participant_count(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trek_participant_count(INTEGER) TO anon;

-- Step 3: Verification
SELECT '=== VERIFICATION ===' as info;

SELECT 'Tables after fix:' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

SELECT 'trek_registrations columns:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'trek_registrations'
ORDER BY ordinal_position;

SELECT 'RPC function exists:' as info;
SELECT proname, pg_get_function_identity_arguments(oid) as args
FROM pg_proc WHERE proname = 'get_trek_participant_count';

COMMIT;

-- Final test query (should work after the fix)
SELECT '=== TEST QUERY ===' as info;
SELECT
    COUNT(*) as total_regs,
    COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_regs
FROM trek_registrations;
