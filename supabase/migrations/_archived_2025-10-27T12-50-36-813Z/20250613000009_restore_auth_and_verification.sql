-- Create necessary types if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type_enum') THEN
    CREATE TYPE public.user_type_enum AS ENUM ('trekker', 'micro_community', 'admin');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_verification_status') THEN
    CREATE TYPE public.user_verification_status AS ENUM ('NOT_SUBMITTED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED');
  END IF;
END $$;

-- Ensure users table has all required columns
DO $$ 
BEGIN
  -- Add verification_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE public.users ADD COLUMN verification_status public.user_verification_status NOT NULL DEFAULT 'NOT_SUBMITTED';
  END IF;

  -- Add verification_docs if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'verification_docs'
  ) THEN
    ALTER TABLE public.users ADD COLUMN verification_docs JSONB;
  END IF;

  -- Add user_type if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'user_type'
  ) THEN
    ALTER TABLE public.users ADD COLUMN user_type public.user_type_enum DEFAULT 'trekker';
  END IF;
END $$;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to view basic user info" ON public.users;
DROP POLICY IF EXISTS "Allow users to update verification docs" ON public.users;
DROP POLICY IF EXISTS "Allow admins to update verification status" ON public.users;
DROP POLICY IF EXISTS "Allow users to upload their own docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their own docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to view all docs" ON storage.objects;

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create basic user policies
CREATE POLICY "Allow users to view their own profile"
ON public.users FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own profile"
ON public.users FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to view basic user info"
ON public.users FOR SELECT
USING (true);

-- Create verification-specific policies
CREATE POLICY "Allow users to update verification docs"
ON public.users
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND (
    -- Allow updating verification_docs without changing status
    (verification_status = (SELECT verification_status FROM public.users WHERE user_id = auth.uid()))
    OR 
    -- Or allow setting status to PENDING_REVIEW when submitting docs
    (verification_status = 'PENDING_REVIEW' AND (SELECT verification_status FROM public.users WHERE user_id = auth.uid()) = 'NOT_SUBMITTED')
  )
);

CREATE POLICY "Allow admins to update verification status"
ON public.users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.user_type = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.user_type = 'admin'
  )
);

-- Create storage bucket for verification docs if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Allow users to upload their own docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to view their own docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow admins to view all docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'verification-documents'
  AND EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.user_id = auth.uid() 
    AND u.user_type = 'admin'
  )
); 