-- This is the definitive fix for the user creation logic.
-- It correctly handles existing users by checking for their email address.
-- If a user with the same email signs in again (e.g., via a different OAuth provider),
-- this function updates their auth user_id without resetting their user_type.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_type_value TEXT;
BEGIN
  -- Default to 'trekker' for genuinely new users.
  user_type_value := COALESCE(
    NEW.raw_user_meta_data->>'user_type',
    'trekker'
  );

  INSERT INTO public.users (
    user_id,
    email,
    name,
    avatar_url,
    user_type
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      (NEW.raw_app_meta_data->'claims'->>'full_name'),
      (NEW.raw_app_meta_data->>'claims'->>'name')
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      (NEW.raw_app_meta_data->'claims'->>'avatar_url'),
      (NEW.raw_app_meta_data->'claims'->>'picture')
    ),
    user_type_value::public.user_type_enum
  )
  ON CONFLICT (email) DO UPDATE SET
    user_id = NEW.id, -- Update the user_id to the latest one from auth.
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW(); -- Note: user_type is NOT updated, preserving existing roles.

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 