-- =============================================
-- DELETE TREKS WITH ALL ASSOCIATED DATA
-- =============================================
-- This script deletes the specified treks and ALL their related data
-- including registrations, comments, expenses, etc.

-- WARNING: This operation is irreversible!
-- Make sure you have a backup before running this.

-- Set the trek names you want to delete
-- Replace these with your actual trek names
DO $$
DECLARE
    trek_record RECORD;
BEGIN
    -- Log what we're about to delete
    RAISE NOTICE '=== DELETING TREKS WITH REGISTRANTS ===';
    RAISE NOTICE 'Target treks: Test999, Test9991, Trek #55 - Kudremukha Trek';

    -- 1. Delete notifications related to these treks
    DELETE FROM notifications
    WHERE trek_id IN (
        SELECT trek_id FROM trek_events
        WHERE name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek')
    );

    -- 2. Delete registration ID proofs (references trek_registrations)
    DELETE FROM registration_id_proofs
    WHERE registration_id IN (
        SELECT r.registration_id FROM trek_registrations r
        INNER JOIN trek_events te ON r.trek_id = te.trek_id
        WHERE te.name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek')
    );

    -- 3. Delete trek transport assignments
    DELETE FROM trek_transport_assignments
    WHERE trek_id IN (
        SELECT trek_id FROM trek_events
        WHERE name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek')
    );

    -- 4. Delete trek participant ratings
    DELETE FROM trek_participant_ratings
    WHERE trek_id IN (
        SELECT trek_id FROM trek_events
        WHERE name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek')
    );

    -- 5. Delete trek ratings
    DELETE FROM trek_ratings
    WHERE trek_id IN (
        SELECT trek_id FROM trek_events
        WHERE name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek')
    );

    -- 6. Delete trek expenses
    DELETE FROM trek_expenses
    WHERE trek_id IN (
        SELECT trek_id FROM trek_events
        WHERE name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek')
    );

    -- 7. Delete trek driver assignments
    DELETE FROM trek_driver_assignments
    WHERE trek_id IN (
        SELECT trek_id FROM trek_events
        WHERE name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek')
    );

    -- 8. Delete trek drivers
    DELETE FROM trek_drivers
    WHERE trek_id IN (
        SELECT trek_id FROM trek_events
        WHERE name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek')
    );

    -- 9. Delete trek comments
    DELETE FROM trek_comments
    WHERE trek_id IN (
        SELECT trek_id FROM trek_events
        WHERE name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek')
    );

    -- 10. Delete trek registrations (this is the main one!)
    DELETE FROM trek_registrations
    WHERE trek_id IN (
        SELECT trek_id FROM trek_events
        WHERE name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek')
    );

    -- 11. Delete trek packing list assignments
    DELETE FROM trek_packing_list_assignments
    WHERE trek_id IN (
        SELECT trek_id FROM trek_events
        WHERE name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek')
    );

    -- 12. Delete trek pickup locations
    DELETE FROM trek_pickup_locations
    WHERE trek_id IN (
        SELECT trek_id FROM trek_events
        WHERE name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek')
    );

    -- 13. Delete trek ID requirements
    DELETE FROM trek_id_requirements
    WHERE trek_id IN (
        SELECT trek_id FROM trek_events
        WHERE name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek')
    );

    -- 14. Delete trek costs
    DELETE FROM trek_costs
    WHERE trek_id IN (
        SELECT trek_id FROM trek_events
        WHERE name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek')
    );

    -- 15. Delete tent inventory
    DELETE FROM tent_inventory
    WHERE event_id IN (
        SELECT trek_id FROM trek_events
        WHERE name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek')
    );

    -- 16. Delete trek event images
    DELETE FROM trek_event_images
    WHERE trek_id IN (
        SELECT trek_id FROM trek_events
        WHERE name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek')
    );

    -- 17. FINALLY: Delete the actual treks
    DELETE FROM trek_events
    WHERE name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek');

    -- Verification: Check what was deleted
    RAISE NOTICE '=== DELETION SUMMARY ===';
    RAISE NOTICE 'Treks remaining: %',
        (SELECT COUNT(*) FROM trek_events WHERE name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek'));
    RAISE NOTICE 'Registrations remaining: %',
        (SELECT COUNT(*) FROM trek_registrations r INNER JOIN trek_events te ON r.trek_id = te.trek_id
         WHERE te.name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek'));
    RAISE NOTICE 'Comments remaining: %',
        (SELECT COUNT(*) FROM trek_comments c INNER JOIN trek_events te ON c.trek_id = te.trek_id
         WHERE te.name IN ('Test999', 'Test9991', 'Trek #55 - Kudremukha Trek'));

    RAISE NOTICE '=== DELETION COMPLETED SUCCESSFULLY ===';
END $$;
