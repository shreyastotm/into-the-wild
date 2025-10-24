-- Fixed Database Verification Script
-- Run this in Supabase SQL Editor to verify everything is working

BEGIN;

-- 1. VERIFY ALL REQUIRED FUNCTIONS EXIST
DO $$
DECLARE
    missing_functions TEXT[] := ARRAY[]::TEXT[];
    func_name TEXT;
    required_functions TEXT[] := ARRAY[
        'get_trek_participant_count',
        'create_notification',
        'mark_notification_as_read',
        'get_user_notifications',
        'is_admin',
        'get_tent_reserved_count'
    ];
BEGIN
    FOREACH func_name IN ARRAY required_functions
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = func_name 
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ) THEN
            missing_functions := array_append(missing_functions, func_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_functions, 1) > 0 THEN
        RAISE NOTICE 'Missing functions: %', array_to_string(missing_functions, ', ');
    ELSE
        RAISE NOTICE 'All required functions exist!';
    END IF;
END $$;

-- 2. VERIFY ALL REQUIRED TABLES EXIST
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    tbl_name TEXT;
    required_tables TEXT[] := ARRAY[
        'users',
        'trek_events',
        'trek_registrations',
        'trek_comments',
        'notifications',
        'master_packing_items',
        'trek_costs',
        'tent_rentals'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = tbl_name 
            AND table_schema = 'public'
        ) THEN
            missing_tables := array_append(missing_tables, tbl_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE 'All required tables exist!';
    END IF;
END $$;

-- 3. VERIFY STORAGE BUCKETS
DO $$
DECLARE
    missing_buckets TEXT[] := ARRAY[]::TEXT[];
    bucket_name TEXT;
    required_buckets TEXT[] := ARRAY[
        'payment-proofs',
        'avatars',
        'trek-images'
    ];
BEGIN
    FOREACH bucket_name IN ARRAY required_buckets
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM storage.buckets 
            WHERE id = bucket_name
        ) THEN
            missing_buckets := array_append(missing_buckets, bucket_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_buckets, 1) > 0 THEN
        RAISE NOTICE 'Missing buckets: %', array_to_string(missing_buckets, ', ');
    ELSE
        RAISE NOTICE 'All required storage buckets exist!';
    END IF;
END $$;

-- 4. TEST is_admin FUNCTION
DO $$
DECLARE
    test_result BOOLEAN;
BEGIN
    SELECT public.is_admin() INTO test_result;
    RAISE NOTICE 'is_admin function test result: %', test_result;
END $$;

-- 5. TEST get_tent_reserved_count FUNCTION
DO $$
DECLARE
    test_result INTEGER;
BEGIN
    SELECT public.get_tent_reserved_count(1) INTO test_result;
    RAISE NOTICE 'get_tent_reserved_count function test result: %', test_result;
END $$;

-- 6. CHECK RLS POLICIES
DO $$
DECLARE
    rls_enabled_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
    all_tables TEXT[] := ARRAY['users', 'trek_events', 'trek_registrations', 'trek_comments', 'notifications', 'tent_rentals'];
BEGIN
    FOREACH table_name IN ARRAY all_tables
    LOOP
        IF EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' 
            AND c.relname = table_name
            AND c.relrowsecurity = true
        ) THEN
            rls_enabled_tables := array_append(rls_enabled_tables, table_name);
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Tables with RLS enabled: %', array_to_string(rls_enabled_tables, ', ');
END $$;

COMMIT;

-- Final summary
SELECT 
    'Database verification completed successfully' AS status,
    NOW() AS completed_at;
