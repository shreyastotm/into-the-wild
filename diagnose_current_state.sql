-- Check current state of treks and their configurations

-- 1. Check treks with government_id_required = true
SELECT
  trek_id,
  name,
  government_id_required,
  status
FROM trek_events
WHERE government_id_required = true
ORDER BY trek_id;

-- 2. Check all treks and their ID requirement status
SELECT
  te.trek_id,
  te.name,
  te.government_id_required,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM trek_id_requirements tir
      WHERE tir.trek_id = te.trek_id
    ) THEN '✅ Has ID Requirements'
    ELSE '❌ No ID Requirements'
  END as id_requirements_status,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM trek_packing_list_assignments tpa
      WHERE tpa.trek_id = te.trek_id
    ) THEN '✅ Has Packing List'
    ELSE '❌ No Packing List'
  END as packing_list_status
FROM trek_events te
ORDER BY te.trek_id;

-- 3. Check sample of packing list assignments
SELECT
  tpa.trek_id,
  te.name as trek_name,
  mpi.name as item_name,
  mpi.category,
  tpa.mandatory
FROM trek_packing_list_assignments tpa
JOIN trek_events te ON tpa.trek_id = te.trek_id
JOIN master_packing_items mpi ON tpa.master_item_id = mpi.id
ORDER BY tpa.trek_id, mpi.category, mpi.name
LIMIT 20;

-- 4. Check if any treks have both government_id_required=true AND id requirements
SELECT
  te.trek_id,
  te.name,
  te.government_id_required,
  COUNT(tir.id_type_id) as id_types_count
FROM trek_events te
LEFT JOIN trek_id_requirements tir ON te.trek_id = tir.trek_id
WHERE te.government_id_required = true
GROUP BY te.trek_id, te.name, te.government_id_required
ORDER BY te.trek_id;
