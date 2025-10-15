-- =============================================
-- COMPREHENSIVE FIX AND VERIFICATION SCRIPT
-- =============================================

-- 1. Check current state before fixes
SELECT '=== BEFORE FIXES ===' as status;

SELECT
  'trek_id_requirements' as table_name, COUNT(*) as count FROM trek_id_requirements
UNION ALL
SELECT 'trek_packing_list_assignments', COUNT(*) FROM trek_packing_list_assignments;

-- 2. Fix missing ID requirements for treks with government_id_required = true
SELECT '=== FIXING ID REQUIREMENTS ===' as status;

INSERT INTO trek_id_requirements (trek_id, id_type_id, is_mandatory)
SELECT
  te.trek_id,
  it.id_type_id,
  true as is_mandatory
FROM trek_events te
CROSS JOIN id_types it
WHERE te.government_id_required = true
  AND it.name = 'aadhaar'  -- Default to Aadhaar card
  AND NOT EXISTS (
    SELECT 1 FROM trek_id_requirements tir
    WHERE tir.trek_id = te.trek_id
  );

-- 3. Verify ID requirements fix
SELECT '=== AFTER ID REQUIREMENTS FIX ===' as status;

SELECT
  te.trek_id,
  te.name,
  te.government_id_required,
  COUNT(tir.id_type_id) as id_requirements_count,
  string_agg(it.display_name || ' (' || CASE WHEN tir.is_mandatory THEN 'Mandatory' ELSE 'Optional' END || ')', ', ') as requirements
FROM trek_events te
LEFT JOIN trek_id_requirements tir ON te.trek_id = tir.trek_id
LEFT JOIN id_types it ON tir.id_type_id = it.id_type_id
WHERE te.government_id_required = true
GROUP BY te.trek_id, te.name, te.government_id_required
ORDER BY te.trek_id;

-- 4. Check packing list assignments
SELECT '=== PACKING LIST VERIFICATION ===' as status;

SELECT
  te.trek_id,
  te.name,
  COUNT(tpa.id) as packing_items_count,
  SUM(CASE WHEN tpa.mandatory = true THEN 1 ELSE 0 END) as mandatory_items_count
FROM trek_events te
LEFT JOIN trek_packing_list_assignments tpa ON te.trek_id = tpa.trek_id
GROUP BY te.trek_id, te.name
ORDER BY te.trek_id;

-- 5. Test the actual frontend queries
SELECT '=== TESTING FRONTEND QUERIES ===' as status;

-- Test ID requirements query (what TrekRequirements.tsx does)
SELECT
  te.trek_id,
  te.name,
  te.government_id_required,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM trek_id_requirements tir
      JOIN id_types it ON tir.id_type_id = it.id_type_id
      WHERE tir.trek_id = te.trek_id AND it.is_active = true
    ) THEN '✅ Has Active ID Requirements'
    ELSE '❌ No Active ID Requirements'
  END as frontend_id_status
FROM trek_events te
WHERE te.trek_id IN (1, 2, 3)  -- Test first few treks
ORDER BY te.trek_id;

-- Test packing list query (what TrekPackingList.tsx does)
SELECT
  te.trek_id,
  te.name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM trek_packing_list_assignments tpa
      WHERE tpa.trek_id = te.trek_id
    ) THEN '✅ Has Packing List'
    ELSE '❌ No Packing List'
  END as frontend_packing_status
FROM trek_events te
WHERE te.trek_id IN (1, 2, 3)  -- Test first few treks
ORDER BY te.trek_id;

-- 6. Final summary
SELECT '=== FINAL SUMMARY ===' as status;

SELECT
  'Total Treks' as metric, COUNT(*)::text as value FROM trek_events
UNION ALL
SELECT 'Treks with Government ID Required', COUNT(*)::text FROM trek_events WHERE government_id_required = true
UNION ALL
SELECT 'Treks with ID Requirements Configured', COUNT(DISTINCT tir.trek_id)::text FROM trek_id_requirements tir
UNION ALL
SELECT 'Treks with Packing Lists', COUNT(DISTINCT tpa.trek_id)::text FROM trek_packing_list_assignments tpa
UNION ALL
SELECT 'Total ID Types Available', COUNT(*)::text FROM id_types
UNION ALL
SELECT 'Total Master Packing Items', COUNT(*)::text FROM master_packing_items;
