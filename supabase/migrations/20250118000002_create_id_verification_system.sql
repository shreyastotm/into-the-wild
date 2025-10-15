-- Create ID verification system for trek registration
-- This system allows treks to specify required ID types and tracks proof uploads

-- 1. Create ID types master table
CREATE TABLE IF NOT EXISTS public.id_types (
  id_type_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE, -- 'aadhaar', 'passport', 'driving_license', 'pan_card', 'ration_card'
  display_name VARCHAR(100) NOT NULL, -- 'Aadhaar Card', 'Passport', etc.
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create trek ID requirements table (which IDs are required for specific treks)
CREATE TABLE IF NOT EXISTS public.trek_id_requirements (
  requirement_id SERIAL PRIMARY KEY,
  trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
  id_type_id INTEGER NOT NULL REFERENCES public.id_types(id_type_id) ON DELETE CASCADE,
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(trek_id, id_type_id)
);

-- 3. Create registration ID proofs table (uploaded proofs by registrants)
CREATE TABLE IF NOT EXISTS public.registration_id_proofs (
  proof_id SERIAL PRIMARY KEY,
  registration_id INTEGER NOT NULL REFERENCES public.trek_registrations(registration_id) ON DELETE CASCADE,
  id_type_id INTEGER NOT NULL REFERENCES public.id_types(id_type_id) ON DELETE CASCADE,
  proof_url TEXT NOT NULL,
  uploaded_by VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP,
  verification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes TEXT,
  UNIQUE(registration_id, id_type_id)
);

-- 4. Insert default ID types
INSERT INTO public.id_types (name, display_name, description) VALUES
('aadhaar', 'Aadhaar Card', 'Government of India identity card'),
('passport', 'Passport', 'International travel document'),
('driving_license', 'Driving License', 'Motor vehicle driving license'),
('pan_card', 'PAN Card', 'Permanent Account Number card'),
('ration_card', 'Ration Card', 'Government food subsidy card')
ON CONFLICT (name) DO NOTHING;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trek_id_requirements_trek_id ON public.trek_id_requirements(trek_id);
CREATE INDEX IF NOT EXISTS idx_trek_id_requirements_id_type ON public.trek_id_requirements(id_type_id);
CREATE INDEX IF NOT EXISTS idx_registration_id_proofs_registration_id ON public.registration_id_proofs(registration_id);
CREATE INDEX IF NOT EXISTS idx_registration_id_proofs_verification_status ON public.registration_id_proofs(verification_status);

-- 6. Create RLS policies
ALTER TABLE public.id_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_id_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_id_proofs ENABLE ROW LEVEL SECURITY;

-- ID types are public readable
CREATE POLICY "Allow read access to ID types" ON public.id_types FOR SELECT USING (true);

-- Trek ID requirements are public readable
CREATE POLICY "Allow read access to trek ID requirements" ON public.trek_id_requirements FOR SELECT USING (true);

-- Registration ID proofs - users can read their own, admins can read all
CREATE POLICY "Users can view own ID proofs" ON public.registration_id_proofs FOR SELECT USING (
  auth.uid()::text = uploaded_by OR
  EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin')
);

CREATE POLICY "Users can upload own ID proofs" ON public.registration_id_proofs FOR INSERT WITH CHECK (
  auth.uid()::text = uploaded_by
);

CREATE POLICY "Admins can verify ID proofs" ON public.registration_id_proofs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin')
);

-- 7. Create helper functions
CREATE OR REPLACE FUNCTION public.get_trek_required_id_types(trek_id_param INTEGER)
RETURNS TABLE (
  id_type_id INTEGER,
  name VARCHAR(100),
  display_name VARCHAR(100),
  description TEXT,
  is_mandatory BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    it.id_type_id,
    it.name,
    it.display_name,
    it.description,
    tir.is_mandatory
  FROM public.trek_id_requirements tir
  JOIN public.id_types it ON tir.id_type_id = it.id_type_id
  WHERE tir.trek_id = trek_id_param AND it.is_active = true
  ORDER BY tir.is_mandatory DESC, it.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has approved ID proofs for a trek
CREATE OR REPLACE FUNCTION public.user_has_approved_id_proofs(user_id_param UUID, trek_id_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  required_count INTEGER;
  approved_count INTEGER;
BEGIN
  -- Get count of required ID types for this trek
  SELECT COUNT(*) INTO required_count
  FROM public.get_trek_required_id_types(trek_id_param);

  -- If no requirements, return true
  IF required_count = 0 THEN
    RETURN true;
  END IF;

  -- Count how many required ID types the user has approved proofs for
  SELECT COUNT(*) INTO approved_count
  FROM public.trek_registrations tr
  JOIN public.registration_id_proofs rip ON tr.registration_id = rip.registration_id
  JOIN public.trek_id_requirements tir ON rip.id_type_id = tir.id_type_id
  WHERE tr.user_id::uuid = user_id_param
    AND tr.trek_id = trek_id_param
    AND rip.verification_status = 'approved'
    AND tr.payment_status != 'Cancelled';

  -- User has all required approved proofs
  RETURN approved_count >= required_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.id_types TO anon, authenticated;
GRANT SELECT ON public.trek_id_requirements TO anon, authenticated;
GRANT SELECT, INSERT ON public.registration_id_proofs TO authenticated;
GRANT UPDATE ON public.registration_id_proofs TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_trek_required_id_types(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_approved_id_proofs(UUID, INTEGER) TO anon, authenticated;
