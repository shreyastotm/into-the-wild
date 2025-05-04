-- Re-create view policies for drivers
CREATE POLICY "Admin can view all drivers"
ON public.trek_drivers
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
    OR EXISTS (
        SELECT 1 FROM public.trek_registrations
        WHERE trek_registrations.trek_id = trek_drivers.trek_id
        AND trek_registrations.user_id = auth.uid()
        -- AND trek_registrations.payment_status != 'Cancelled' -- Removed dependency
    )
);

-- Re-create policies for pickup locations
CREATE POLICY "Anyone can view pickup locations for treks they're registered for"
ON public.trek_pickup_locations
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.trek_registrations
        WHERE trek_registrations.trek_id = trek_pickup_locations.trek_id
        AND trek_registrations.user_id = auth.uid()
        -- AND trek_registrations.payment_status != 'Cancelled' -- Removed dependency
    )
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
); 