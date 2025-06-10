-- First, drop the existing foreign key constraint
ALTER TABLE public.trek_events
DROP CONSTRAINT IF EXISTS trek_events_partner_id_fkey;

-- Then, add the new foreign key constraint with ON UPDATE CASCADE
ALTER TABLE public.trek_events
ADD CONSTRAINT trek_events_partner_id_fkey
FOREIGN KEY (partner_id)
REFERENCES public.users(user_id)
ON DELETE SET NULL
ON UPDATE CASCADE; 