-- ============================================================================
-- DIAGNOSTIC AND FIX SCRIPT
-- ============================================================================
-- This script diagnoses the current production schema and applies targeted fixes
-- Run this in your Supabase Dashboard SQL Editor
-- ============================================================================

-- Step 1: Check what tables actually exist
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Step 2: Check trek_registrations table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'trek_registrations'
ORDER BY ordinal_position;

-- Step 3: Check users table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 4: Check trek_events table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'trek_events'
ORDER BY ordinal_position;

-- ============================================================================
-- TARGETED FIXES BASED ON DIAGNOSTIC RESULTS
-- ============================================================================

-- After running the diagnostic queries above, uncomment and run the appropriate fixes:

-- If trek_registrations table doesn't exist, create it:
/*
CREATE TABLE IF NOT EXISTS public.trek_registrations (
    registration_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    booking_datetime TIMESTAMPTZ DEFAULT NOW(),
    payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
*/


-- If trek_events table has wrong primary key, fix it:
/*
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public'
               AND table_name = 'trek_events'
               AND column_name = 'id')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_schema = 'public'
                       AND table_name = 'trek_events'
                       AND column_name = 'trek_id') THEN
        ALTER TABLE public.trek_events ADD COLUMN trek_id SERIAL PRIMARY KEY;
        ALTER TABLE public.trek_events DROP COLUMN id;
    END IF;
END $$;
*/

-- Enable RLS on tables if not already enabled:
/*
ALTER TABLE public.trek_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_events ENABLE ROW LEVEL SECURITY;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- After applying fixes, run these to verify:

-- 1. Check trek_registrations can be queried
/*
SELECT COUNT(*) as total_registrations FROM trek_registrations;
*/

-- 2. Check if user_id column exists and works
/*
SELECT
    registration_id,
    user_id,
    trek_id,
    payment_status
FROM trek_registrations
LIMIT 5;
*/

-- 3. Check if foreign key constraints work
/*
SELECT
    tr.registration_id,
    tr.user_id,
    u.email,
    te.name as trek_name
FROM trek_registrations tr
LEFT JOIN users u ON tr.user_id = u.id
LEFT JOIN trek_events te ON tr.trek_id = te.trek_id
LIMIT 5;
*/
