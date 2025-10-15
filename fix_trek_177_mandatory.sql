-- =============================================
-- FIX MANDATORY FLAGS FOR TREK 177
-- =============================================

-- Check current state of trek 177 packing list
SELECT '=== CURRENT STATE OF TREK 177 ===' as status;

SELECT
  tpa.id,
  tpa.mandatory,
  mpi.name,
  mpi.category
FROM trek_packing_list_assignments tpa
JOIN master_packing_items mpi ON tpa.master_item_id = mpi.id
WHERE tpa.trek_id = 177
ORDER BY mpi.category, mpi.name;

-- Fix: Set mandatory flags for essential items in trek 177
SELECT '=== FIXING MANDATORY FLAGS ===' as status;

UPDATE trek_packing_list_assignments
SET mandatory = true
WHERE trek_id = 177
  AND master_item_id IN (
    SELECT id FROM master_packing_items
    WHERE name IN ('Hiking Boots', 'Backpack (50L)', 'Water Bottle', 'First Aid Kit')
  );

-- Verify the fix
SELECT '=== AFTER FIX ===' as status;

SELECT
  tpa.id,
  tpa.mandatory,
  mpi.name,
  mpi.category
FROM trek_packing_list_assignments tpa
JOIN master_packing_items mpi ON tpa.master_item_id = mpi.id
WHERE tpa.trek_id = 177
ORDER BY mpi.category, mpi.name;

-- Show summary
SELECT
  te.trek_id,
  te.name,
  COUNT(tpa.id) as total_items,
  SUM(CASE WHEN tpa.mandatory = true THEN 1 ELSE 0 END) as mandatory_items
FROM trek_events te
LEFT JOIN trek_packing_list_assignments tpa ON te.trek_id = tpa.trek_id
WHERE te.trek_id = 177
GROUP BY te.trek_id, te.name;
