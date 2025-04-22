-- CLEAN START: Remove all old expenses and migrate payer_id to UUID

-- 1. Delete all existing records (irrecoverable mapping)
DELETE FROM public.trek_ad_hoc_expenses;

-- 2. Drop the old integer payer_id column
ALTER TABLE public.trek_ad_hoc_expenses DROP COLUMN payer_id;

-- 3. Add the new UUID payer_id column
ALTER TABLE public.trek_ad_hoc_expenses ADD COLUMN payer_id uuid;

-- 4. (Optional) Add a foreign key constraint for future inserts
ALTER TABLE public.trek_ad_hoc_expenses
ADD CONSTRAINT fk_payer_id
FOREIGN KEY (payer_id)
REFERENCES public.users(id)
ON DELETE SET NULL;
