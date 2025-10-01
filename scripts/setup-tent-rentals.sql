-- Tent Rental Setup Script
-- Run this script to set up tent rental feature for camping events

-- 1. Check if tent rental tables exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tent_types') THEN
        RAISE NOTICE 'Tent rental tables not found. Please run: supabase db push';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Tent rental tables found. Setting up inventory...';
END $$;

-- 2. Add tent inventory for existing camping events
-- (Replace with actual event IDs from your database)
INSERT INTO tent_inventory (event_id, tent_type_id, total_available)
SELECT 
    te.trek_id as event_id,
    tt.id as tent_type_id,
    CASE 
        WHEN tt.name = '2-Person Tent' THEN 10
        WHEN tt.name = '3-Person Tent' THEN 8
        ELSE 5
    END as total_available
FROM trek_events te
CROSS JOIN tent_types tt
WHERE te.event_type = 'camping'
  AND te.status NOT IN ('cancelled', 'completed')
  AND NOT EXISTS (
    SELECT 1 FROM tent_inventory ti 
    WHERE ti.event_id = te.trek_id AND ti.tent_type_id = tt.id
  )
ON CONFLICT (event_id, tent_type_id) DO NOTHING;

-- 3. Verify setup
SELECT 
    'Setup Complete' as status,
    COUNT(DISTINCT ti.event_id) as events_with_inventory,
    COUNT(ti.id) as total_inventory_items,
    SUM(ti.total_available) as total_tents_available
FROM tent_inventory ti;

-- 4. Show available tent inventory
SELECT 
    te.name as event_name,
    te.start_datetime,
    tt.name as tent_type,
    tt.capacity,
    tt.rental_price_per_night,
    ti.total_available,
    ti.reserved_count,
    (ti.total_available - ti.reserved_count) as available_now
FROM tent_inventory ti
JOIN trek_events te ON ti.event_id = te.trek_id
JOIN tent_types tt ON ti.tent_type_id = tt.id
WHERE te.event_type = 'camping'
ORDER BY te.start_datetime, tt.name;
