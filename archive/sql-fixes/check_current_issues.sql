-- =============================================
-- CHECK CURRENT ISSUES
-- =============================================

-- 1. Check which treks have government_id_required = true but wrong ID types
SELECT '=== TREKS WITH ID ISSUES ===' as status;

SELECT
  te.trek_id,
  te.name,
  te.government_id_required,
  COUNT(tir.id_type_id) as current_id_count,
  string_agg(it.display_name, ', ') as current_ids
FROM trek_events te
LEFT JOIN trek_id_requirements tir ON te.trek_id = tir.trek_id
LEFT JOIN id_types it ON tir.id_type_id = it.id_type_id
WHERE te.government_id_required = true
GROUP BY te.trek_id, te.name, te.government_id_required
HAVING COUNT(tir.id_type_id) = 0 OR MAX(it.name) = 'aadhaar'
ORDER BY te.trek_id;

-- 2. Check packing list mandatory flags
SELECT '=== PACKING LIST MANDATORY FLAGS ===' as status;

SELECT
  tpa.trek_id,
  te.name,
  COUNT(*) as total_items,
  SUM(CASE WHEN tpa.mandatory = true THEN 1 ELSE 0 END) as mandatory_items,
  SUM(CASE WHEN tpa.mandatory = false THEN 1 ELSE 0 END) as optional_items
FROM trek_packing_list_assignments tpa
JOIN trek_events te ON tpa.trek_id = te.trek_id
GROUP BY tpa.trek_id, te.name
ORDER BY tpa.trek_id;

-- 3. Show available ID types for reference
SELECT '=== AVAILABLE ID TYPES ===' as status;

SELECT
  id_type_id,
  name,
  display_name,
  is_active
FROM id_types
ORDER BY display_name;
