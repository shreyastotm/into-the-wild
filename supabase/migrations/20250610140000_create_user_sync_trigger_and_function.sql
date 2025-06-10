-- Creates the user handling function and the trigger to call it.
-- This is a consolidated and corrected version.

-- 1. Define the function to handle new user creation and updates.
-- This version explicitly protects the 'admin' user_type from being overwritten.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  existing_user_type public.user_type_enum;
BEGIN
  -- Check if a user with this email already exists and get their user_type
  SELECT user_type INTO existing_user_type FROM public.users WHERE email = NEW.email;

  -- If the user exists and is an 'admin', do not perform any action.
  IF FOUND AND existing_user_type = 'admin' THEN
    -- Admin user exists, so we return NEW to complete the trigger without any changes to the users table.
    RETURN NEW;
  END IF;

  -- If the user is not an admin (or doesn't exist), proceed with the upsert logic.
  INSERT INTO public.users (user_id, email, name, avatar_url, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      (NEW.raw_app_meta_data->'claims'->>'full_name'),
      (NEW.raw_app_meta_data->'claims'->>'name')
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      (NEW.raw_app_meta_data->'claims'->>'avatar_url'),
      (NEW.raw_app_meta_data->'claims'->>'picture')
    ),
    true
  )
  ON CONFLICT (email) DO UPDATE 
  SET
    user_id = NEW.id,
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW(),
    is_verified = true;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the old trigger if it exists, to prevent errors.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create the trigger to execute the function after a new user is created in auth.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();