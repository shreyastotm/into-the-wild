-- Fix missing ID requirements for treks with government_id_required = true

-- 1. First, let's see which treks need ID requirements
SELECT
  te.trek_id,
  te.name,
  te.government_id_required,
  CASE
    WHEN EXISTS (SELECT 1 FROM trek_id_requirements tir WHERE tir.trek_id = te.trek_id)
    THEN 'Has Requirements'
    ELSE 'Missing Requirements'
  END as status
FROM trek_events te
WHERE te.government_id_required = true;

-- 2. Create ID requirements for treks that need them
-- Use appropriate ID types for treks (exclude Aadhaar)
INSERT INTO trek_id_requirements (trek_id, id_type_id, is_mandatory)
SELECT
  te.trek_id,
  it.id_type_id,
  true as is_mandatory
FROM trek_events te
CROSS JOIN id_types it
WHERE te.government_id_required = true
  AND it.name IN ('pan_card', 'passport', 'driving_license', 'ration_card')  -- Only these ID types for treks
  AND NOT EXISTS (
    SELECT 1 FROM trek_id_requirements tir
    WHERE tir.trek_id = te.trek_id
  );

-- 3. Verify the fix
SELECT
  te.trek_id,
  te.name,
  te.government_id_required,
  COUNT(tir.id_type_id) as id_requirements_count,
  string_agg(it.display_name, ', ') as required_ids
FROM trek_events te
LEFT JOIN trek_id_requirements tir ON te.trek_id = tir.trek_id
LEFT JOIN id_types it ON tir.id_type_id = it.id_type_id
WHERE te.government_id_required = true
GROUP BY te.trek_id, te.name, te.government_id_required
ORDER BY te.trek_id;

-- 4. Also check that we have the right ID types
SELECT id_type_id, name, display_name FROM id_types ORDER BY display_name;
