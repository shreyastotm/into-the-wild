-- =============================================
-- RUN THESE FIXES IN YOUR SUPABASE SQL EDITOR
-- =============================================

-- Fix 1: Update trek_id_requirements to use correct ID types (exclude Aadhaar)
DELETE FROM trek_id_requirements
WHERE id_type_id IN (SELECT id_type_id FROM id_types WHERE name = 'aadhaar')
  AND trek_id IN (SELECT trek_id FROM trek_events WHERE government_id_required = true);

INSERT INTO trek_id_requirements (trek_id, id_type_id, is_mandatory)
SELECT DISTINCT
  te.trek_id,
  it.id_type_id,
  true as is_mandatory
FROM trek_events te
CROSS JOIN id_types it
WHERE te.government_id_required = true
  AND it.name IN ('pan_card', 'passport', 'driving_license', 'ration_card')
  AND NOT EXISTS (
    SELECT 1 FROM trek_id_requirements tir
    WHERE tir.trek_id = te.trek_id AND tir.id_type_id = it.id_type_id
  );

-- Fix 2: Update packing list mandatory flags (ensure they're properly set)
UPDATE trek_packing_list_assignments
SET mandatory = CASE
  WHEN master_item_id IN (
    SELECT id FROM master_packing_items
    WHERE name IN ('Hiking Boots', 'Backpack (50L)', 'Water Bottle', 'First Aid Kit')
  ) THEN true
  ELSE false
END
WHERE mandatory IS NULL OR mandatory = false;

-- Fix 3: Verify the fixes worked
SELECT '=== VERIFICATION ===' as status;

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

SELECT
  te.trek_id,
  te.name,
  COUNT(tpa.id) as packing_items,
  SUM(CASE WHEN tpa.mandatory = true THEN 1 ELSE 0 END) as mandatory_items
FROM trek_events te
LEFT JOIN trek_packing_list_assignments tpa ON te.trek_id = tpa.trek_id
GROUP BY te.trek_id, te.name
ORDER BY te.trek_id;
