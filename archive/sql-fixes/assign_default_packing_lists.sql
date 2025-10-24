-- =============================================
-- ASSIGN DEFAULT PACKING LISTS TO TREKS
-- =============================================

-- 1. Check which treks don't have packing lists
SELECT '=== TREKS WITHOUT PACKING LISTS ===' as status;

SELECT
  te.trek_id,
  te.name,
  te.event_type
FROM trek_events te
WHERE te.trek_id NOT IN (
  SELECT DISTINCT trek_id FROM trek_packing_list_assignments
)
AND te.status = 'published'
ORDER BY te.trek_id;

-- 2. Assign default packing list to treks without any packing items
-- Essential items that should be mandatory for all treks
SELECT '=== ASSIGNING DEFAULT PACKING LISTS ===' as status;

INSERT INTO trek_packing_list_assignments (trek_id, master_item_id, mandatory)
SELECT DISTINCT
  te.trek_id,
  mpi.id,
  CASE
    WHEN mpi.name IN ('Hiking Boots', 'Backpack (50L)', 'Water Bottle', 'First Aid Kit') THEN true
    ELSE false
  END as is_mandatory
FROM trek_events te
CROSS JOIN master_packing_items mpi
WHERE te.trek_id NOT IN (
  SELECT DISTINCT trek_id FROM trek_packing_list_assignments
)
AND te.status = 'published'
AND mpi.name IN (
  'Hiking Boots', 'Backpack (50L)', 'Tent', 'Sleeping Bag',
  'Water Bottle', 'First Aid Kit', 'Headlamp', 'Sunscreen',
  'Energy Bars', 'Dry Fruits & Nuts'
);

-- 3. Verify the assignments
SELECT '=== VERIFICATION ===' as status;

SELECT
  te.trek_id,
  te.name,
  COUNT(tpa.id) as packing_items,
  SUM(CASE WHEN tpa.mandatory = true THEN 1 ELSE 0 END) as mandatory_items
FROM trek_events te
LEFT JOIN trek_packing_list_assignments tpa ON te.trek_id = tpa.trek_id
WHERE te.status = 'published'
GROUP BY te.trek_id, te.name
ORDER BY te.trek_id;
