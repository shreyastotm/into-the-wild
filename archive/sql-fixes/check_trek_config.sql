-- Check trek events configuration
-- Replace 123 with the actual trek ID you're checking

-- Check if the trek exists and its government_id_required status
SELECT
  trek_id,
  name,
  government_id_required,
  status,
  start_datetime
FROM trek_events
WHERE trek_id = 123;

-- Check ID requirements for this trek
SELECT
  tir.*,
  it.name as id_type_name,
  it.display_name,
  it.description
FROM trek_id_requirements tir
JOIN id_types it ON tir.id_type_id = it.id_type_id
WHERE tir.trek_id = 123;

-- Check packing list assignments for this trek
SELECT
  tpa.*,
  mpi.name as item_name,
  mpi.category
FROM trek_packing_list_assignments tpa
JOIN master_packing_items mpi ON tpa.master_item_id = mpi.id
WHERE tpa.trek_id = 123
ORDER BY mpi.category, mpi.name;

-- List all treks to help you find the correct ID
SELECT trek_id, name, government_id_required FROM trek_events ORDER BY trek_id;
