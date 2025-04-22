-- Remove orphaned trek_registrations where trek_id does not exist in trek_events
DELETE FROM public.trek_registrations
WHERE trek_id NOT IN (SELECT trek_id FROM public.trek_events);

-- (Optional) Add a foreign key constraint to prevent future orphans
ALTER TABLE public.trek_registrations
ADD CONSTRAINT fk_trek_id
FOREIGN KEY (trek_id)
REFERENCES public.trek_events(trek_id)
ON DELETE CASCADE;
