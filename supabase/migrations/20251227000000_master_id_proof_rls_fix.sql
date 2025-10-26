-- Master Migration: Complete ID Proof System Fix
-- This resolves ALL local/remote database disparity issues
-- Consolidates fixes from previous partial migrations

BEGIN;

-- ====================================================================
-- PHASE 1: ENSURE TABLE STRUCTURE IS CORRECT
-- ====================================================================

-- Verify registration_id_proofs table exists with correct columns
-- Note: Table likely already exists from previous migrations

-- Convert uploaded_by column to UUID type if needed (handle existing policies)
DO $$
BEGIN
  -- Check if uploaded_by column exists and is VARCHAR
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registration_id_proofs'
    AND column_name = 'uploaded_by'
    AND data_type = 'character varying'
  ) THEN
    -- Drop existing policies first to allow column modification
    DROP POLICY IF EXISTS "Users can manage own ID proofs" ON public.registration_id_proofs;
    DROP POLICY IF EXISTS "Users can upload own ID proofs" ON public.registration_id_proofs;
    DROP POLICY IF EXISTS "Users can view own ID proofs" ON public.registration_id_proofs;
    DROP POLICY IF EXISTS "Admins can manage all ID proofs" ON public.registration_id_proofs;
    DROP POLICY IF EXISTS "Admins can verify ID proofs" ON public.registration_id_proofs;

    -- Create temporary column
    ALTER TABLE public.registration_id_proofs ADD COLUMN uploaded_by_uuid UUID;

    -- Copy and convert data
    UPDATE public.registration_id_proofs
    SET uploaded_by_uuid = uploaded_by::UUID
    WHERE uploaded_by IS NOT NULL;

    -- Drop old column
    ALTER TABLE public.registration_id_proofs DROP COLUMN uploaded_by;

    -- Rename new column
    ALTER TABLE public.registration_id_proofs RENAME COLUMN uploaded_by_uuid TO uploaded_by;

    -- Add NOT NULL constraint
    ALTER TABLE public.registration_id_proofs ALTER COLUMN uploaded_by SET NOT NULL;

    RAISE NOTICE 'Converted uploaded_by from VARCHAR to UUID';
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registration_id_proofs'
    AND column_name = 'uploaded_by'
  ) THEN
    ALTER TABLE public.registration_id_proofs ADD COLUMN uploaded_by UUID NOT NULL;
  END IF;
END $$;

-- ====================================================================
-- PHASE 2: DROP ALL CONFLICTING RLS POLICIES
-- ====================================================================

DROP POLICY IF EXISTS "Users can manage own ID proofs" ON public.registration_id_proofs;
DROP POLICY IF EXISTS "Users can upload own ID proofs" ON public.registration_id_proofs;
DROP POLICY IF EXISTS "Users can view own ID proofs" ON public.registration_id_proofs;
DROP POLICY IF EXISTS "Admins can manage all ID proofs" ON public.registration_id_proofs;
DROP POLICY IF EXISTS "Admins can verify ID proofs" ON public.registration_id_proofs;

-- ====================================================================
-- PHASE 3: CREATE CLEAN RLS POLICIES (with proper UUID handling)
-- ====================================================================

-- Enable RLS if not already enabled
ALTER TABLE public.registration_id_proofs ENABLE ROW LEVEL SECURITY;

-- Policy 1: INSERT - Users can upload proofs for their own registrations
CREATE POLICY "Users can upload own ID proofs" ON public.registration_id_proofs
FOR INSERT WITH CHECK (
  auth.uid() = uploaded_by
  AND registration_id IN (
    SELECT registration_id
    FROM public.trek_registrations
    WHERE user_id = auth.uid()
  )
);

-- Policy 2: SELECT - Users see their own, admins see all
CREATE POLICY "Users can view own ID proofs" ON public.registration_id_proofs
FOR SELECT USING (
  auth.uid() = uploaded_by
  OR EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid()
    AND user_type = 'admin'::public.user_type_enum
  )
);

-- Policy 3: UPDATE - Only admins can update
CREATE POLICY "Admins can verify ID proofs" ON public.registration_id_proofs
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid()
    AND user_type = 'admin'::public.user_type_enum
  )
);

-- ====================================================================
-- PHASE 4: FIX STORAGE BUCKET POLICIES
-- ====================================================================

-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('id-proofs', 'id-proofs', false, false, 52428800, '{"image/*","application/pdf"}')
ON CONFLICT (id) DO NOTHING;

-- Drop all conflicting storage policies
DROP POLICY IF EXISTS "Users can manage own ID proofs storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own ID proofs storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own ID proofs storage" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all ID proofs storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own ID proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own ID proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all ID proofs" ON storage.objects;

-- Note: storage.objects RLS should already be enabled by Supabase

-- Policy 1: Storage INSERT - Users upload to their folder
CREATE POLICY "Allow users upload to id-proofs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'id-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Storage SELECT - Users see their files, admins see all
CREATE POLICY "Allow users view own id-proofs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'id-proofs'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND user_type = 'admin'::public.user_type_enum
    )
  )
);

-- Policy 3: Storage DELETE - Users delete their own, admins delete any
CREATE POLICY "Allow users delete own id-proofs" ON storage.objects
FOR DELETE USING (
  bucket_id = 'id-proofs'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = auth.uid()
      AND user_type = 'admin'::public.user_type_enum
    )
  )
);

-- ====================================================================
-- PHASE 5: CREATE INDEXES FOR PERFORMANCE
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_registration_id_proofs_uploaded_by
ON public.registration_id_proofs(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_registration_id_proofs_registration_id
ON public.registration_id_proofs(registration_id);

CREATE INDEX IF NOT EXISTS idx_registration_id_proofs_verification_status
ON public.registration_id_proofs(verification_status);

-- ====================================================================
-- PHASE 6: GRANT PERMISSIONS
-- ====================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT USAGE ON SCHEMA storage TO anon, authenticated;

GRANT SELECT ON public.id_types TO anon, authenticated;
GRANT SELECT ON public.trek_id_requirements TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.registration_id_proofs TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.get_trek_required_id_types(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_approved_id_proofs(UUID, INTEGER) TO anon, authenticated;

COMMIT;
