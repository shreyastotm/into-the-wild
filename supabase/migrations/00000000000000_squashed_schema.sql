-- Squashed Migration: Defines the target schema state after cleanup and consolidation

BEGIN;

-- Define custom ENUM types first (if not already existing implicitly)
DROP TYPE IF EXISTS public.user_type_enum CASCADE;
CREATE TYPE public.user_type_enum AS ENUM (
    'admin',
    'trekker',
    'micro_community'
);
-- Consider adding DROP TYPE IF EXISTS public.user_type_enum CASCADE; before CREATE TYPE if needed.

DROP TYPE IF EXISTS public.subscription_renewal_status CASCADE;
CREATE TYPE public.subscription_renewal_status AS ENUM (
    'active',
    'inactive',
    'cancelled'
);
-- Consider adding DROP TYPE IF EXISTS public.subscription_renewal_status CASCADE; before CREATE TYPE if needed.

DROP TYPE IF EXISTS public.transport_mode CASCADE;
CREATE TYPE public.transport_mode AS ENUM (
    'cars',
    'mini_van',
    'bus',
    'self_drive'
    -- Removed 'none' based on user feedback
);
-- Consider adding DROP TYPE IF EXISTS public.transport_mode CASCADE; before CREATE TYPE if needed.

DROP TYPE IF EXISTS public.event_creator_type CASCADE;
CREATE TYPE public.event_creator_type AS ENUM (
    'internal', -- e.g., created by admin
    'external'  -- e.g., created by micro_community partner
);
-- Consider adding DROP TYPE IF EXISTS public.event_creator_type CASCADE; before CREATE TYPE if needed.

-- TODO: Add definitions for other potential ENUMs like public.transport_mode, public.event_creator_type if they don't exist implicitly.

-- Drop potentially conflicting/redundant tables first
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.trek_ad_hoc_expense_shares CASCADE;
DROP TABLE IF EXISTS public.trek_ad_hoc_expenses CASCADE;
DROP TABLE IF EXISTS public.trek_fixed_expenses CASCADE;
DROP TABLE IF EXISTS public.trek_admin_approved_expenses CASCADE;
DROP TABLE IF EXISTS public.packing_items CASCADE;
DROP TABLE IF EXISTS public.packing_list_templates CASCADE;
DROP TABLE IF EXISTS public.trek_packing_lists CASCADE; -- Drop old/intermediate packing list table
DROP TABLE IF EXISTS public.expense_shares CASCADE; -- Add explicit drop here

-- ==============================
--       CORE TABLES
-- ==============================
-- Users Table (Reflecting additions from migrations)
CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    name VARCHAR(255), -- Use 'name' instead of 'full_name'
    email VARCHAR(255) UNIQUE,
    user_type public.user_type_enum DEFAULT 'trekker'::public.user_type_enum,
    phone_number VARCHAR(20),
    bio TEXT,
    location VARCHAR(255),
    avatar_url TEXT,
    indemnity_accepted BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Added columns from migrations
    has_car BOOLEAN DEFAULT false,
    car_seating_capacity INTEGER, -- Type fixed to INTEGER
    vehicle_number TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);
COMMENT ON TABLE public.users IS 'Stores public user profile information.';
COMMENT ON COLUMN public.users.car_seating_capacity IS 'How many passengers can the user''s car accommodate (excluding driver).';

-- Ensure users.user_id is PRIMARY KEY
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the existing primary key constraint name, if any
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public' AND tc.table_name = 'users' AND tc.constraint_type = 'PRIMARY KEY';

    -- Drop the existing primary key constraint if found and it's not already on user_id
    IF constraint_name IS NOT NULL THEN
        -- Check if the existing PK is already on user_id (no need to drop/re-add)
        IF NOT EXISTS (SELECT 1
                       FROM information_schema.key_column_usage kcu
                       WHERE kcu.constraint_name = constraint_name
                       AND kcu.table_schema = 'public'
                       AND kcu.table_name = 'users'
                       AND kcu.column_name = 'user_id') THEN
            RAISE NOTICE 'Dropping existing primary key constraint % on public.users', constraint_name;
            EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT ' || quote_ident(constraint_name);
            RAISE NOTICE 'Adding PRIMARY KEY constraint to user_id on public.users';
            ALTER TABLE public.users ADD PRIMARY KEY (user_id);
        ELSE
             RAISE NOTICE 'Primary key on public.users(user_id) already exists.';
        END IF;
    ELSE
        -- If no primary key exists, add it
        RAISE NOTICE 'Adding PRIMARY KEY constraint to user_id on public.users';
        ALTER TABLE public.users ADD PRIMARY KEY (user_id);
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'Table public.users does not exist, skipping primary key check.';
    WHEN others THEN
        RAISE WARNING 'Error ensuring primary key on public.users: %', SQLERRM;
END $$;

-- Trek Events Table (Consolidated columns)
CREATE TABLE IF NOT EXISTS public.trek_events (
    trek_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL, -- Use 'name'
    description TEXT,
    category VARCHAR(100), -- Keep category as per dbSchema.txt
    difficulty VARCHAR(50), -- Keep difficulty added by migration
    start_datetime TIMESTAMPTZ NOT NULL,
    duration INTERVAL,
    base_price DECIMAL(10, 2), -- Use 'base_price'
    cancellation_policy TEXT,
    penalty_details DECIMAL(10, 2),
    max_participants INTEGER NOT NULL,
    location TEXT,
    route_data JSONB,
    transport_mode public.transport_mode,
    vendor_contacts JSONB,
    pickup_time_window TEXT,
    event_creator_type public.event_creator_type DEFAULT 'internal'::public.event_creator_type,
    partner_id UUID REFERENCES public.users(user_id) ON DELETE SET NULL, -- FK to users for micro-communities
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    booking_amount DECIMAL(10, 2),
    collect_full_fee BOOLEAN DEFAULT false,
    image_url TEXT, -- Added by migration
    gpx_file_url TEXT,
    is_finalized BOOLEAN DEFAULT false, -- Added by migration
    created_by UUID REFERENCES public.users(user_id) ON DELETE SET NULL -- Assuming trek creator link
);
COMMENT ON TABLE public.trek_events IS 'Defines the details of each trek event.';
COMMENT ON COLUMN public.trek_events.partner_id IS 'Null for internal events; set for micro-community (external) events';
COMMENT ON COLUMN public.trek_events.is_finalized IS 'True if trek event is fully detailed and registration requires payment/terms';



-- Rename trek_events.trek_name to name if necessary
DO $$
BEGIN
    -- Check if 'trek_name' exists and 'name' does not
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='trek_name') AND
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='name') THEN

        RAISE NOTICE 'Renaming column trek_name to name in public.trek_events';
        ALTER TABLE public.trek_events RENAME COLUMN trek_name TO name;

    END IF;
END $$;

-- Rename trek_events.cost to base_price if necessary
DO $$
BEGIN
    -- Check if 'cost' exists and 'base_price' does not
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='cost') AND
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='base_price') THEN

        RAISE NOTICE 'Renaming column cost to base_price in public.trek_events';
        ALTER TABLE public.trek_events RENAME COLUMN cost TO base_price;

    END IF;
END $$;

-- Add trek_events.end_datetime column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='trek_events' AND column_name='end_datetime') THEN

        RAISE NOTICE 'Adding column end_datetime to public.trek_events';
        ALTER TABLE public.trek_events ADD COLUMN end_datetime TIMESTAMPTZ;

    END IF;
END $$;

-- Add trek_events.difficulty column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='trek_events' AND column_name='difficulty') THEN

        RAISE NOTICE 'Adding column difficulty to public.trek_events';
        ALTER TABLE public.trek_events ADD COLUMN difficulty VARCHAR(50);

    END IF;
END $$;

-- Add trek_events.status column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='public' AND table_name='trek_events' AND column_name='status') THEN

        RAISE NOTICE 'Adding column status to public.trek_events';
        ALTER TABLE public.trek_events ADD COLUMN status VARCHAR(50);

    END IF;
END $$;

-- Trek Pickup Locations Table (MOVED EARLIER)
CREATE TABLE IF NOT EXISTS public.trek_pickup_locations (
    id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.trek_pickup_locations IS 'Defines pickup points for a trek.';

-- Trek Registrations Table (Depends on trek_pickup_locations)
CREATE TABLE IF NOT EXISTS public.trek_registrations (
    registration_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    booking_datetime TIMESTAMPTZ DEFAULT NOW(),
    cancellation_datetime TIMESTAMPTZ,
    penalty_applied DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    pickup_location_id INTEGER REFERENCES public.trek_pickup_locations(id) ON DELETE SET NULL, -- FK added
    is_driver BOOLEAN DEFAULT false, -- Added
    payment_status TEXT DEFAULT 'Pending', -- Added based on migration 20240101000038
    indemnity_agreed BOOLEAN DEFAULT false -- Added based on migration 20240101000023
);
COMMENT ON TABLE public.trek_registrations IS 'Tracks user registrations for treks.';
CREATE INDEX IF NOT EXISTS idx_trek_registrations_user_id ON public.trek_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_trek_registrations_trek_id ON public.trek_registrations(trek_id);

-- Trek Comments Table (With synced body/comment_text)
CREATE TABLE IF NOT EXISTS public.trek_comments (
    comment_id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES public.trek_comments(comment_id) ON DELETE CASCADE,
    body TEXT, -- Added by migration
    comment_text TEXT, -- Added by migration
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.trek_comments IS 'Stores comments related to specific treks.';

-- Function & Triggers to sync body/comment_text in trek_comments
CREATE OR REPLACE FUNCTION sync_body_to_comment_text()
RETURNS TRIGGER AS $$
BEGIN
    NEW.comment_text = NEW.body;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_comment_text_to_body()
RETURNS TRIGGER AS $$
BEGIN
    NEW.body = NEW.comment_text;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_body_to_comment_text ON public.trek_comments;
CREATE TRIGGER sync_body_to_comment_text
BEFORE INSERT OR UPDATE OF body ON public.trek_comments
FOR EACH ROW
WHEN (NEW.body IS NOT NULL AND (NEW.comment_text IS NULL OR NEW.comment_text IS DISTINCT FROM NEW.body))
EXECUTE FUNCTION sync_body_to_comment_text();

DROP TRIGGER IF EXISTS sync_comment_text_to_body ON public.trek_comments;
CREATE TRIGGER sync_comment_text_to_body
BEFORE INSERT OR UPDATE OF comment_text ON public.trek_comments
FOR EACH ROW
WHEN (NEW.comment_text IS NOT NULL AND (NEW.body IS NULL OR NEW.body IS DISTINCT FROM NEW.comment_text))
EXECUTE FUNCTION sync_comment_text_to_body();

-- ==============================
--      TRANSPORT TABLES
-- ==============================

-- Trek Pickup Locations Table (Definition is now above trek_registrations)

-- Trek Drivers Table
CREATE TABLE IF NOT EXISTS public.trek_drivers (
    id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50),
    vehicle_name VARCHAR(100),
    registration_number VARCHAR(50),
    seats_available INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trek_id, user_id)
);
COMMENT ON TABLE public.trek_drivers IS 'Lists users acting as drivers for a specific trek.';

-- Trek Driver Assignments Table
CREATE TABLE IF NOT EXISTS public.trek_driver_assignments (
    id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE, -- Refers to user_id from trek_drivers
    participant_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE, -- Refers to user_id from trek_registrations
    status VARCHAR(20) DEFAULT 'pending', -- Corrected: use 'status'
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trek_id, driver_id, participant_id),
    CONSTRAINT valid_assignment_status CHECK (status IN ('pending', 'confirmed', 'picked_up', 'cancelled')) -- Corrected: check 'status'
);
COMMENT ON TABLE public.trek_driver_assignments IS 'Assigns participants to specific drivers for a trek.';


-- ==============================
--      EXPENSE TABLES
-- ==============================

-- Trek Expense Categories Table
CREATE TABLE IF NOT EXISTS public.trek_expense_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.trek_expense_categories IS 'Lookup table for different types of trek expenses.';

-- Insert default expense categories if they don't exist
INSERT INTO public.trek_expense_categories (name, description, icon)
VALUES
    ('Food', 'Meals, snacks, groceries, etc.', 'utensils'),
    ('Transport', 'Fuel, tolls, parking, etc.', 'car'),
    ('Accommodation', 'Hotel, camping, homestay charges', 'home'),
    ('Activities', 'Tickets, rentals, guides, etc.', 'map'),
    ('Equipment', 'Gear rentals, purchases, etc.', 'tool'),
    ('Tickets', 'Entry tickets, permits, etc.', 'ticket'), -- Specific type for admin fixed costs
    ('Stay', 'Fixed accommodation cost added by admin', 'bed'), -- Specific type for admin fixed costs
    ('Misc', 'Other uncategorized expenses', 'package')
ON CONFLICT (name) DO NOTHING;


-- Trek Expenses Table (Consolidated)
CREATE TABLE IF NOT EXISTS public.trek_expenses (
    id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE, -- User who added the expense
    category_id INTEGER REFERENCES public.trek_expense_categories(id) ON DELETE SET NULL, -- FK to categories
    expense_type VARCHAR(50), -- Keep original type for now, may deprecate if category_id is sufficient
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    expense_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
    -- Note: dbSchema.txt had 'created_by' and 'creator_id'. Using 'creator_id' as it aligns better with migrations/code.
    -- Note: dbSchema.txt had 'id' as integer, but expense splitting migration implies SERIAL PK. Using SERIAL.
);
COMMENT ON TABLE public.trek_expenses IS 'Stores all expenses (admin fixed + participant ad-hoc) related to a trek.';

-- Expense Shares Table (Aligns with expense splitting migration)
CREATE TABLE IF NOT EXISTS public.expense_shares (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER NOT NULL REFERENCES public.trek_expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, rejected
    payment_method VARCHAR(50),
    payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(expense_id, user_id), -- User should only have one share per expense
    CONSTRAINT valid_expense_share_status CHECK (status IN ('pending', 'paid', 'rejected'))
);
COMMENT ON TABLE public.expense_shares IS 'Tracks how individual expenses are shared among participants.';


-- ==============================
--      RATING TABLES
-- ==============================

-- Trek Ratings Table
CREATE TABLE IF NOT EXISTS public.trek_ratings (
    id BIGSERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
    enjoyment_rating INTEGER CHECK (enjoyment_rating BETWEEN 1 AND 5),
    scenic_rating INTEGER CHECK (scenic_rating BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trek_id, user_id)
);
COMMENT ON TABLE public.trek_ratings IS 'Stores user ratings for the overall trek.';

-- Trek Participant Ratings Table
CREATE TABLE IF NOT EXISTS public.trek_participant_ratings (
    id BIGSERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    rated_user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE, -- User being rated
    rated_by_user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE, -- User giving the rating
    teamwork_rating INTEGER CHECK (teamwork_rating BETWEEN 1 AND 5),
    punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
    contribution_rating INTEGER CHECK (contribution_rating BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trek_id, rated_user_id, rated_by_user_id)
);
COMMENT ON TABLE public.trek_participant_ratings IS 'Stores ratings given by participants to each other.';


-- ==============================
--   PACKING LIST TABLES (NEW)
-- ==============================

-- Master Packing Items Table
CREATE TABLE IF NOT EXISTS public.master_packing_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.master_packing_items IS 'Master list of reusable packing items for treks.';

-- Trek Packing List Assignments Table
CREATE TABLE IF NOT EXISTS public.trek_packing_list_assignments (
    id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    master_item_id INTEGER NOT NULL REFERENCES public.master_packing_items(id) ON DELETE CASCADE,
    mandatory BOOLEAN DEFAULT FALSE,
    item_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trek_id, master_item_id) -- Ensure item uniqueness per trek
);
COMMENT ON TABLE public.trek_packing_list_assignments IS 'Assigns items from master_packing_items to specific treks with details.';
CREATE INDEX IF NOT EXISTS idx_trek_packing_list_assignments_trek_id ON public.trek_packing_list_assignments(trek_id);
CREATE INDEX IF NOT EXISTS idx_trek_packing_list_assignments_item_id ON public.trek_packing_list_assignments(master_item_id);


-- ==============================
--      OTHER TABLES (Verify Use)
-- ==============================

-- Keep subscriptions_billing and comments if they are still used
-- Subscriptions Billing Table
CREATE TABLE IF NOT EXISTS public.subscriptions_billing (
    id SERIAL PRIMARY KEY, -- Use SERIAL PK if not defined
    subscription_id INTEGER, -- Consider if this should be FK
    user_id UUID REFERENCES public.users(user_id), -- FK to public.users
    amount NUMERIC,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    renewal_status public.subscription_renewal_status, -- Ensure this ENUM type exists
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments Table (Generic, verify if used alongside trek_comments)
CREATE TABLE IF NOT EXISTS public.comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INTEGER, -- Refers to what?
    user_id UUID REFERENCES public.users(user_id), -- FK to public.users
    body TEXT, -- Assuming body is the comment text
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================
--   NOTIFICATIONS & FORUM TABLES
-- ==============================

-- Notification enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status_enum') THEN
    CREATE TYPE public.notification_status_enum AS ENUM ('unread', 'read');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type_enum') THEN
    CREATE TYPE public.notification_type_enum AS ENUM (
        'registration_confirmed',
        'payment_verified',
        'trek_cancelled',
        'trek_status_changed',
        'general_info'
    );
  END IF;
END $$;

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    link TEXT,
    status notification_status_enum NOT NULL DEFAULT 'unread',
    type notification_type_enum NOT NULL DEFAULT 'general_info',
    trek_id INTEGER REFERENCES public.trek_events(trek_id) ON DELETE SET NULL,
    related_entity_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON public.notifications (user_id, status);

-- Scheduled Notifications Table
CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    channels TEXT[] DEFAULT '{}',
    priority INTEGER DEFAULT 1,
    trek_id INTEGER REFERENCES public.trek_events(trek_id) ON DELETE SET NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum Categories Table
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(user_id) ON DELETE SET NULL
);

-- Forum Threads Table
CREATE TABLE IF NOT EXISTS public.forum_threads (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    author_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false
);

-- Forum Posts Table
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id SERIAL PRIMARY KEY,
    thread_id INTEGER NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    parent_id INTEGER REFERENCES public.forum_posts(id) ON DELETE CASCADE
);

-- Votes Table
CREATE TABLE IF NOT EXISTS public.votes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- 'thread', 'post', etc.
    entity_id INTEGER NOT NULL,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, entity_type, entity_id)
);

-- ==============================
--  SCHEMA CORRECTIONS (Before RLS)
-- ==============================

-- Ensure users.user_id is PRIMARY KEY
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the existing primary key constraint name, if any
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public' AND tc.table_name = 'users' AND tc.constraint_type = 'PRIMARY KEY';

    -- Drop the existing primary key constraint if found and it's not already on user_id
    IF constraint_name IS NOT NULL THEN
        -- Check if the existing PK is already on user_id (no need to drop/re-add)
        IF NOT EXISTS (SELECT 1
                       FROM information_schema.key_column_usage kcu
                       WHERE kcu.constraint_name = constraint_name
                       AND kcu.table_schema = 'public'
                       AND kcu.table_name = 'users'
                       AND kcu.column_name = 'user_id') THEN
            RAISE NOTICE 'Dropping existing primary key constraint % on public.users', constraint_name;
            EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT ' || quote_ident(constraint_name);
            RAISE NOTICE 'Adding PRIMARY KEY constraint to user_id on public.users';
            ALTER TABLE public.users ADD PRIMARY KEY (user_id);
        ELSE
             RAISE NOTICE 'Primary key on public.users(user_id) already exists.';
        END IF;
    ELSE
        -- If no primary key exists, add it
        RAISE NOTICE 'Adding PRIMARY KEY constraint to user_id on public.users';
        ALTER TABLE public.users ADD PRIMARY KEY (user_id);
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'Table public.users does not exist, skipping primary key check.';
    WHEN others THEN
        RAISE WARNING 'Error ensuring primary key on public.users: %', SQLERRM;
END $$;

-- Rename trek_events.trek_name to name if necessary
DO $$
BEGIN
    -- Check if 'trek_name' exists and 'name' does not
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='trek_name') AND
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='name') THEN

        RAISE NOTICE 'Renaming column trek_name to name in public.trek_events';
        ALTER TABLE public.trek_events RENAME COLUMN trek_name TO name;

    END IF;
END $$;

-- Rename trek_events.cost to base_price if necessary
DO $$
BEGIN
    -- Check if 'cost' exists and 'base_price' does not
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='cost') AND
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='base_price') THEN

        RAISE NOTICE 'Renaming column cost to base_price in public.trek_events';
        ALTER TABLE public.trek_events RENAME COLUMN cost TO base_price;

    END IF;
END $$;

-- Add potentially missing columns to trek_events
DO $$
BEGIN
    -- Text/Varchar Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='description') THEN
        ALTER TABLE public.trek_events ADD COLUMN description TEXT;
        RAISE NOTICE 'Added column description to public.trek_events';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='category') THEN
        ALTER TABLE public.trek_events ADD COLUMN category VARCHAR(100);
        RAISE NOTICE 'Added column category to public.trek_events';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='difficulty') THEN
        ALTER TABLE public.trek_events ADD COLUMN difficulty VARCHAR(50);
        RAISE NOTICE 'Added column difficulty to public.trek_events';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='cancellation_policy') THEN
        ALTER TABLE public.trek_events ADD COLUMN cancellation_policy TEXT;
        RAISE NOTICE 'Added column cancellation_policy to public.trek_events';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='location') THEN
        ALTER TABLE public.trek_events ADD COLUMN location TEXT;
        RAISE NOTICE 'Added column location to public.trek_events';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='pickup_time_window') THEN
        ALTER TABLE public.trek_events ADD COLUMN pickup_time_window TEXT;
        RAISE NOTICE 'Added column pickup_time_window to public.trek_events';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='image_url') THEN
        ALTER TABLE public.trek_events ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Added column image_url to public.trek_events';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='gpx_file_url') THEN
        ALTER TABLE public.trek_events ADD COLUMN gpx_file_url TEXT;
        RAISE NOTICE 'Added column gpx_file_url to public.trek_events';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='status') THEN
        ALTER TABLE public.trek_events ADD COLUMN status VARCHAR(50);
        RAISE NOTICE 'Added column status to public.trek_events';
    END IF;

    -- Timestamp Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='end_datetime') THEN
        ALTER TABLE public.trek_events ADD COLUMN end_datetime TIMESTAMPTZ;
        RAISE NOTICE 'Added column end_datetime to public.trek_events';
    END IF;

    -- Interval Column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='duration') THEN
        ALTER TABLE public.trek_events ADD COLUMN duration INTERVAL;
        RAISE NOTICE 'Added column duration to public.trek_events';
    END IF;

    -- Numeric/Decimal Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='penalty_details') THEN
        ALTER TABLE public.trek_events ADD COLUMN penalty_details DECIMAL(10, 2);
        RAISE NOTICE 'Added column penalty_details to public.trek_events';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='booking_amount') THEN
        ALTER TABLE public.trek_events ADD COLUMN booking_amount DECIMAL(10, 2);
        RAISE NOTICE 'Added column booking_amount to public.trek_events';
    END IF;

    -- JSONB Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='route_data') THEN
        ALTER TABLE public.trek_events ADD COLUMN route_data JSONB;
        RAISE NOTICE 'Added column route_data to public.trek_events';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='vendor_contacts') THEN
        ALTER TABLE public.trek_events ADD COLUMN vendor_contacts JSONB;
        RAISE NOTICE 'Added column vendor_contacts to public.trek_events';
    END IF;

    -- ENUM Columns (Ensure Type Exists First - handled earlier)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='transport_mode') THEN
        ALTER TABLE public.trek_events ADD COLUMN transport_mode public.transport_mode;
        RAISE NOTICE 'Added column transport_mode to public.trek_events';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='event_creator_type') THEN
        ALTER TABLE public.trek_events ADD COLUMN event_creator_type public.event_creator_type DEFAULT 'internal'::public.event_creator_type;
        RAISE NOTICE 'Added column event_creator_type to public.trek_events';
    END IF;

    -- UUID Columns (Handle FK separately if needed)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='created_by') THEN
        ALTER TABLE public.trek_events ADD COLUMN created_by UUID;
        RAISE NOTICE 'Added column created_by to public.trek_events';
        -- Optional: Add FK constraint if users table is guaranteed to exist
        -- ALTER TABLE public.trek_events ADD CONSTRAINT trek_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL;
    END IF;

    -- Boolean Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='collect_full_fee') THEN
        ALTER TABLE public.trek_events ADD COLUMN collect_full_fee BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added column collect_full_fee to public.trek_events';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='is_finalized') THEN
        ALTER TABLE public.trek_events ADD COLUMN is_finalized BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added column is_finalized to public.trek_events';
    END IF;

    -- Double Precision Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='destination_latitude') THEN
        ALTER TABLE public.trek_events ADD COLUMN destination_latitude DOUBLE PRECISION;
        RAISE NOTICE 'Added column destination_latitude to public.trek_events';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='trek_events' AND column_name='destination_longitude') THEN
        ALTER TABLE public.trek_events ADD COLUMN destination_longitude DOUBLE PRECISION;
        RAISE NOTICE 'Added column destination_longitude to public.trek_events';
    END IF;

END $$;

-- Correct partner_id type in trek_events if it exists with the wrong type
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'trek_events' AND column_name = 'partner_id' AND data_type <> 'uuid') THEN

        -- Attempt to drop potential old FK constraint (adjust constraint name if known)
        BEGIN
            ALTER TABLE public.trek_events DROP CONSTRAINT IF EXISTS trek_events_partner_id_fkey;
        EXCEPTION WHEN undefined_object THEN
            -- Ignore if constraint doesn't exist
        END;

        -- Alter the column type
        ALTER TABLE public.trek_events ALTER COLUMN partner_id TYPE UUID USING partner_id::text::uuid;

        -- Re-add the correct FK constraint
        ALTER TABLE public.trek_events ADD CONSTRAINT trek_events_partner_id_fkey
            FOREIGN KEY (partner_id) REFERENCES public.users(user_id) ON DELETE SET NULL;

        RAISE NOTICE 'Corrected trek_events.partner_id column type to UUID.';
    END IF;
END $$;

-- ==============================
--      RLS POLICIES (SIMPLIFIED)
-- ==============================
-- Apply basic RLS policies for core tables

-- Enable RLS on key tables (without auth dependencies for now)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_registrations ENABLE ROW LEVEL SECURITY;

-- Basic policies that work without auth schema
DROP POLICY IF EXISTS "Allow read access to users" ON public.users;
CREATE POLICY "Allow read access to users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read access to trek events" ON public.trek_events;
CREATE POLICY "Allow read access to trek events" ON public.trek_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read access to trek registrations" ON public.trek_registrations;
CREATE POLICY "Allow read access to trek registrations" ON public.trek_registrations FOR SELECT USING (true);


-- Trek Comments
ALTER TABLE public.trek_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to all for trek comments" ON public.trek_comments;
CREATE POLICY "Allow read access to all for trek comments" ON public.trek_comments FOR SELECT USING (true); -- Publicly viewable?
DROP POLICY IF EXISTS "Allow users to insert comments" ON public.trek_comments;
CREATE POLICY "Allow users to insert comments" ON public.trek_comments FOR INSERT WITH CHECK (true); -- Simplified for now
DROP POLICY IF EXISTS "Allow users to update their own comments" ON public.trek_comments;
CREATE POLICY "Allow users to update their own comments" ON public.trek_comments FOR UPDATE USING (true); -- Simplified for now
DROP POLICY IF EXISTS "Allow users to delete their own comments" ON public.trek_comments;
CREATE POLICY "Allow users to delete their own comments" ON public.trek_comments FOR DELETE USING (true); -- Simplified for now

-- Transport Tables (Simplified policies)
ALTER TABLE public.trek_pickup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_driver_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read access to transport info" ON public.trek_pickup_locations;
CREATE POLICY "Allow read access to transport info" ON public.trek_pickup_locations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated read access to transport info" ON public.trek_drivers;
CREATE POLICY "Allow read access to transport info" ON public.trek_drivers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated read access to transport info" ON public.trek_driver_assignments;
CREATE POLICY "Allow read access to transport info" ON public.trek_driver_assignments FOR SELECT USING (true);

-- Expense Tables (Simplified policies)
ALTER TABLE public.trek_expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to expense categories" ON public.trek_expense_categories;
CREATE POLICY "Allow read access to expense categories" ON public.trek_expense_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to view expenses for their treks" ON public.trek_expenses;
CREATE POLICY "Allow users to view expenses for their treks" ON public.trek_expenses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow users to insert expenses for their treks" ON public.trek_expenses;
CREATE POLICY "Allow users to insert expenses for their treks" ON public.trek_expenses FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow users to update own expenses" ON public.trek_expenses;
CREATE POLICY "Allow users to update own expenses" ON public.trek_expenses FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow users to delete own expenses" ON public.trek_expenses;
CREATE POLICY "Allow users to delete own expenses" ON public.trek_expenses FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow users to view shares they are part of" ON public.expense_shares;
CREATE POLICY "Allow users to view shares they are part of" ON public.expense_shares FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow expense creator to insert shares" ON public.expense_shares;
CREATE POLICY "Allow expense creator to insert shares" ON public.expense_shares FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow users to update status/payment for their shares" ON public.expense_shares;
CREATE POLICY "Allow users to update status/payment for their shares" ON public.expense_shares FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow expense creator to delete shares (before paid?)" ON public.expense_shares;
CREATE POLICY "Allow expense creator to delete shares (before paid?)" ON public.expense_shares FOR DELETE USING (true);


-- Rating Tables (Simplified)
ALTER TABLE public.trek_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_participant_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to trek ratings" ON public.trek_ratings;
CREATE POLICY "Allow read access to trek ratings" ON public.trek_ratings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert trek ratings" ON public.trek_ratings;
CREATE POLICY "Allow insert trek ratings" ON public.trek_ratings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update trek ratings" ON public.trek_ratings;
CREATE POLICY "Allow update trek ratings" ON public.trek_ratings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow read access to participant ratings" ON public.trek_participant_ratings;
CREATE POLICY "Allow read access to participant ratings" ON public.trek_participant_ratings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert participant ratings" ON public.trek_participant_ratings;
CREATE POLICY "Allow insert participant ratings" ON public.trek_participant_ratings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update participant ratings" ON public.trek_participant_ratings;
CREATE POLICY "Allow update participant ratings" ON public.trek_participant_ratings FOR UPDATE USING (true);

-- Packing List Tables (Simplified)
ALTER TABLE public.master_packing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_packing_list_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to master packing items" ON public.master_packing_items;
CREATE POLICY "Allow read access to master packing items" ON public.master_packing_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin full access to master packing items" ON public.master_packing_items;
CREATE POLICY "Allow admin full access to master packing items" ON public.master_packing_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow read access to trek packing assignments" ON public.trek_packing_list_assignments;
CREATE POLICY "Allow read access to trek packing assignments" ON public.trek_packing_list_assignments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin full access to trek packing assignments" ON public.trek_packing_list_assignments;
CREATE POLICY "Allow admin full access to trek packing assignments" ON public.trek_packing_list_assignments FOR ALL USING (true);

-- Add category_id to trek_expenses if it doesn't exist and add FK constraint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trek_expenses' AND column_name = 'category_id') THEN
        ALTER TABLE public.trek_expenses ADD COLUMN category_id INTEGER;
    END IF;

    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_schema = 'public' AND table_name = 'trek_expenses' AND constraint_name = 'trek_expenses_category_id_fkey') THEN
        ALTER TABLE public.trek_expenses
        ADD CONSTRAINT trek_expenses_category_id_fkey
        FOREIGN KEY (category_id)
        REFERENCES public.trek_expense_categories (id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- ==============================
--   RLS POLICIES FOR NEW TABLES
-- ==============================

-- Enable RLS and policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow users to select their own notifications" ON public.notifications;
CREATE POLICY "Allow users to select their own notifications"
ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update status of their own notifications" ON public.notifications;
CREATE POLICY "Allow users to update status of their own notifications"
ON public.notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow backend to insert notifications" ON public.notifications;
CREATE POLICY "Allow backend to insert notifications"
ON public.notifications FOR INSERT WITH CHECK (true);

-- Enable RLS and policies for scheduled_notifications
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to scheduled notifications" ON public.scheduled_notifications;
CREATE POLICY "Allow read access to scheduled notifications"
ON public.scheduled_notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow backend to manage scheduled notifications" ON public.scheduled_notifications;
CREATE POLICY "Allow backend to manage scheduled notifications"
ON public.scheduled_notifications FOR ALL USING (true);

-- ==============================
--   DATABASE FUNCTIONS
-- ==============================

-- get_trek_participant_count function
CREATE OR REPLACE FUNCTION public.get_trek_participant_count(trek_id_param INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT COUNT(*) FROM public.trek_registrations WHERE trek_id = trek_id_param), 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- create_notification function
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'general_info',
  p_trek_id INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, message, link, type, trek_id)
  VALUES (p_user_id, p_message, p_link, p_type, p_trek_id)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- get_my_notifications function
CREATE OR REPLACE FUNCTION public.get_my_notifications(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  id BIGINT,
  message TEXT,
  link TEXT,
  status TEXT,
  type TEXT,
  trek_id INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.message,
    n.link,
    n.status::TEXT,
    n.type::TEXT,
    n.trek_id,
    n.created_at
  FROM public.notifications n
  WHERE n.user_id = auth.uid()
  ORDER BY n.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- mark_notification_as_read function
CREATE OR REPLACE FUNCTION public.mark_notification_as_read(notification_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.notifications
  SET status = 'read'
  WHERE id = notification_id AND user_id = auth.uid();

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- mark_all_notifications_as_read function
CREATE OR REPLACE FUNCTION public.mark_all_notifications_as_read()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET status = 'read'
  WHERE user_id = auth.uid() AND status = 'unread';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- update_tent_reserved_count function
CREATE OR REPLACE FUNCTION public.update_tent_reserved_count(trek_id_param INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(reserved_quantity)
     FROM public.tent_rentals
     WHERE trek_id = trek_id_param),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_trek_participant_count(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_trek_participant_count(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_notifications(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notification_as_read(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_as_read() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_tent_reserved_count(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_tent_reserved_count(INTEGER) TO anon;

-- Enable RLS and policies for forum tables
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Forum categories policies
DROP POLICY IF EXISTS "Allow public read access to forum categories" ON public.forum_categories;
CREATE POLICY "Allow public read access to forum categories"
ON public.forum_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create forum categories" ON public.forum_categories;
CREATE POLICY "Allow authenticated users to create forum categories"
ON public.forum_categories FOR INSERT TO authenticated WITH CHECK (true);

-- Forum threads policies
DROP POLICY IF EXISTS "Allow public read access to forum threads" ON public.forum_threads;
CREATE POLICY "Allow public read access to forum threads"
ON public.forum_threads FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create threads" ON public.forum_threads;
CREATE POLICY "Allow authenticated users to create threads"
ON public.forum_threads FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Allow thread authors to update threads" ON public.forum_threads;
CREATE POLICY "Allow thread authors to update threads"
ON public.forum_threads FOR UPDATE USING (auth.uid() = author_id);

-- Forum posts policies
DROP POLICY IF EXISTS "Allow public read access to forum posts" ON public.forum_posts;
CREATE POLICY "Allow public read access to forum posts"
ON public.forum_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to create posts" ON public.forum_posts;
CREATE POLICY "Allow authenticated users to create posts"
ON public.forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Allow post authors to update posts" ON public.forum_posts;
CREATE POLICY "Allow post authors to update posts"
ON public.forum_posts FOR UPDATE USING (auth.uid() = author_id);

-- Votes policies
DROP POLICY IF EXISTS "Allow authenticated users to vote" ON public.votes;
CREATE POLICY "Allow authenticated users to vote"
ON public.votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to view votes" ON public.votes;
CREATE POLICY "Allow users to view votes"
ON public.votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to update their own votes" ON public.votes;
CREATE POLICY "Allow users to update their own votes"
ON public.votes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own votes" ON public.votes;
CREATE POLICY "Allow users to delete their own votes"
ON public.votes FOR DELETE USING (auth.uid() = user_id);

COMMIT;

