-- 1. Add a new column with UUID type
ALTER TABLE public.trek_ad_hoc_expenses ADD COLUMN payer_id_uuid uuid;

-- 2. Update the new column with the correct UUIDs from the users table (assuming users.id is uuid and payer_id was originally an integer foreign key to users)
UPDATE public.trek_ad_hoc_expenses AS e
SET payer_id_uuid = u.id
FROM public.users AS u
WHERE u.legacy_int_id = e.payer_id; -- legacy_int_id is a placeholder; replace with the correct mapping if available

-- 3. If you don't have a mapping, you must manually map each integer to the correct UUID.
--    If payer_id values are not mappable, stop here and resolve mapping issues.

-- 4. Drop the old integer column
ALTER TABLE public.trek_ad_hoc_expenses DROP COLUMN payer_id;

-- 5. Rename the new column to payer_id
ALTER TABLE public.trek_ad_hoc_expenses RENAME COLUMN payer_id_uuid TO payer_id;

-- 6. (Optional) Add a foreign key constraint
ALTER TABLE public.trek_ad_hoc_expenses
ADD CONSTRAINT fk_payer_id
FOREIGN KEY (payer_id)
REFERENCES public.users(id)
ON DELETE SET NULL;
