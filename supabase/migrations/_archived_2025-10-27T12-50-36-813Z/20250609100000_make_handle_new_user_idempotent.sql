-- Function to handle new user creation and populate public.users table
-- Now with ON CONFLICT to handle re-registrations or failed previous attempts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_type_value TEXT;
BEGIN
  -- Determine user_type, defaulting to 'trekker'
  user_type_value := COALESCE(
    NEW.raw_user_meta_data->>'user_type', 
    'trekker'
  );

  -- Insert into public.users, handling different sign-up methods
  INSERT INTO public.users (
    user_id, 
    name, 
    email, 
    avatar_url,
    user_type
  )
  VALUES (
    NEW.id,
    -- For email signup, 'full_name' is in raw_user_meta_data.
    -- For OAuth, it's in raw_app_meta_data under 'provider' specific claims.
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      -- Google specific (and common OAuth)
      (NEW.raw_app_meta_data->'claims'->>'full_name'),
      (NEW.raw_app_meta_data->'claims'->>'name')
    ),
    NEW.email,
    -- Get avatar from raw_user_meta_data or common OAuth claims
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      (NEW.raw_app_meta_data->'claims'->>'avatar_url'),
      (NEW.raw_app_meta_data->'claims'->>'picture')
    ),
    user_type_value::public.user_type_enum
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 