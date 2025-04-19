-- Migration: Fix subscription_type enum cast in handle_new_user trigger
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (user_id, full_name, email, phone_number, subscription_type)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone',
    (new.raw_user_meta_data->>'subscription_type')::public.subscription_type
  );
  RETURN new;
END;
$$;

-- Re-create the trigger if it was dropped
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
