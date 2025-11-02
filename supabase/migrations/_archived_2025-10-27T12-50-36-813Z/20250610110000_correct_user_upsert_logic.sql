-- This is the definitive, correct version of the user creation logic.
-- It uses ON CONFLICT(email) to find existing users.
-- When a conflict occurs, it updates the user_id to match the latest
-- one from the auth system, while preserving the existing user_type and other data.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    user_id,
    email,
    name,
    avatar_url
  )
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
    )
  )
  ON CONFLICT (email) DO UPDATE SET
    user_id = NEW.id, -- This is the critical line that keeps the auth user in sync with the public user
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW(); -- Note: user_type is NOT updated, preserving existing roles.

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 