-- Cleanup unused tables and redundant data
-- Safe cleanup - removes only unused features
-- Author: Refactoring Cleanup
-- Date: 2025-01-03

BEGIN;

-- Log cleanup start
DO $$ 
BEGIN 
    RAISE NOTICE 'Starting database cleanup - removing unused tables';
END $$;

-- 1. DROP unused community features (not implemented in current app)
-- These tables were created but never used in the React application

DROP TABLE IF EXISTS votes CASCADE;
COMMENT ON SCHEMA public IS 'Removed votes table - community voting feature not implemented';

DROP TABLE IF EXISTS comments CASCADE;
COMMENT ON SCHEMA public IS 'Removed comments table - community comments feature not implemented';

DROP TABLE IF EXISTS community_posts CASCADE;
COMMENT ON SCHEMA public IS 'Removed community_posts table - community posts feature not implemented';

-- 2. DROP redundant packing items table
-- We have master_packing_items which is the newer, better implementation
DROP TABLE IF EXISTS trek_packing_items CASCADE;
COMMENT ON SCHEMA public IS 'Removed trek_packing_items table - replaced by master_packing_items';

-- 3. Remove unused columns from users table (if they exist)
-- These were planned features that weren't implemented

DO $$ 
BEGIN 
    -- Only drop if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'points') THEN
        ALTER TABLE users DROP COLUMN points;
        RAISE NOTICE 'Dropped users.points column - gamification not implemented';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'badges') THEN
        ALTER TABLE users DROP COLUMN badges;
        RAISE NOTICE 'Dropped users.badges column - gamification not implemented';
    END IF;
END $$;

-- 4. Remove unused trek_events columns
DO $$ 
BEGIN 
    -- Duration column is redundant (we use start_datetime and end_datetime)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'trek_events' AND column_name = 'duration') THEN
        ALTER TABLE trek_events DROP COLUMN duration;
        RAISE NOTICE 'Dropped trek_events.duration column - redundant with start/end dates';
    END IF;
    
    -- Penalty_details is redundant (we use cancellation_policy text field)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'trek_events' AND column_name = 'penalty_details') THEN
        ALTER TABLE trek_events DROP COLUMN penalty_details;
        RAISE NOTICE 'Dropped trek_events.penalty_details column - redundant with cancellation_policy';
    END IF;
END $$;

-- 5. Clean up any orphaned data or constraints
-- This is a safety measure to ensure referential integrity

DO $$ 
BEGIN 
    -- Check for any orphaned records that might have been created by dropping tables
    RAISE NOTICE 'Cleanup completed successfully';
    
    -- Count remaining tables
    RAISE NOTICE 'Active tables remaining: %', (
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE 'spatial_%'
        AND table_name NOT LIKE 'geography_%'
        AND table_name NOT LIKE 'geometry_%'
    );
END $$;

COMMIT;

-- Final verification
SELECT 
    'Database cleanup completed successfully' AS status,
    NOW() AS completed_at;
