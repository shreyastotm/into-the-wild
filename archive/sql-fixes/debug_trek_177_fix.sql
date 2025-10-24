-- =============================================
-- DEBUG AND FIX TREK 177 PACKING LIST
-- =============================================

-- 1. Check current state of trek 177
SELECT '=== CURRENT STATE ===' as status;

SELECT
  tpa.id,
  tpa.master_item_id,
  tpa.mandatory,
  mpi.name,
  mpi.category
FROM trek_packing_list_assignments tpa
JOIN master_packing_items mpi ON tpa.master_item_id = mpi.id
WHERE tpa.trek_id = 177
ORDER BY tpa.id;

-- 2. Check what master items exist for the IDs in the console logs
SELECT '=== MASTER ITEMS FOR CONSOLE LOGS ===' as status;

SELECT
  id,
  name,
  category
FROM master_packing_items
WHERE id IN (47, 48, 49)
ORDER BY id;

-- 3. Force update mandatory flags for trek 177
SELECT '=== FORCE FIXING MANDATORY FLAGS ===' as status;

-- Update all items in trek 177 to have proper mandatory flags
UPDATE trek_packing_list_assignments
SET mandatory = CASE
  WHEN master_item_id = 47 THEN false  -- First item (probably not mandatory)
  WHEN master_item_id = 49 THEN true   -- Second item (user checked as mandatory)
  WHEN master_item_id = 48 THEN false  -- Third item (probably not mandatory)
  ELSE mandatory
END
WHERE trek_id = 177;

-- 4. Verify the fix
SELECT '=== AFTER FORCE FIX ===' as status;

SELECT
  tpa.id,
  tpa.master_item_id,
  tpa.mandatory,
  mpi.name,
  mpi.category
FROM trek_packing_list_assignments tpa
JOIN master_packing_items mpi ON tpa.master_item_id = mpi.id
WHERE tpa.trek_id = 177
ORDER BY tpa.id;

-- 5. Check if there are other issues
SELECT '=== CHECK FOR DUPLICATE ENTRIES ===' as status;

SELECT
  trek_id,
  master_item_id,
  COUNT(*) as count,
  string_agg(mandatory::text, ', ') as mandatory_values
FROM trek_packing_list_assignments
WHERE trek_id = 177
GROUP BY trek_id, master_item_id
HAVING COUNT(*) > 1;
