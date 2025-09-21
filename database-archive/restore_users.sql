-- This file is for restoring users from the old dump file into the new schema.
-- It only includes the users table.
-- It now correctly sets is_verified to true for all restored users.

INSERT INTO "public"."users" (user_id, email, name, user_type, is_verified) VALUES
('61946fd4-bbba-40a7-904a-6223c20dd358', 'shreyas@totm.in', 'Totemic', 'trekker', true),
('6ce9b479-9414-401a-adf5-c3336352ff93', 'shreyasmadhan@gmail.com', 'HWEIHW', 'micro_community', true),
('947bae31-4f04-436a-b4ff-7687c13aa31a', 'shreyasmadhan82@gmail.com', 'Shreyas', 'admin', true); 