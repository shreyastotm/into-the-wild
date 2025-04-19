SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '02f1d20d-2c89-4323-bfd1-a5457b460df6', '{"action":"user_confirmation_requested","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas K","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-10 18:46:04.5628+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a884734b-c0e4-44d1-be18-7d02ed01eaaa', '{"action":"user_signedup","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas K","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"team"}', '2025-04-10 18:46:42.825111+00', ''),
	('00000000-0000-0000-0000-000000000000', '7e93a0c2-daf7-4d8e-8032-79c3bda6352b', '{"action":"login","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas K","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-10 18:47:06.162341+00', ''),
	('00000000-0000-0000-0000-000000000000', '8d7740ce-32bb-4d9a-b802-182a57113815', '{"action":"user_modified","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas K","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-10 18:49:26.468543+00', ''),
	('00000000-0000-0000-0000-000000000000', '4bc00c2b-eb5f-4248-81aa-13566d3bd178', '{"action":"user_modified","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas K","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-10 18:50:12.221195+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b2f74846-a6f8-4f30-8746-61331cabe725', '{"action":"user_modified","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas K","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-10 18:53:11.821845+00', ''),
	('00000000-0000-0000-0000-000000000000', '84f3f696-3bdc-44d9-9e1c-f8815d003930', '{"action":"user_modified","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas K","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-10 18:53:14.221179+00', ''),
	('00000000-0000-0000-0000-000000000000', '4574630d-e7e9-4ebe-a43f-8f8955ad06e6', '{"action":"user_modified","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas K","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-10 18:53:14.990816+00', ''),
	('00000000-0000-0000-0000-000000000000', '6a465c5c-9937-4707-96eb-64551bb0088b', '{"action":"user_modified","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas K","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-10 18:53:15.700522+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd0b819d8-eddb-4a28-9d7e-0b587f104e91', '{"action":"user_modified","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas K","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-10 18:53:16.365682+00', ''),
	('00000000-0000-0000-0000-000000000000', '271a610f-65fb-4cba-ad84-dc38535a2d79', '{"action":"user_modified","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas K","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-10 18:53:24.809721+00', ''),
	('00000000-0000-0000-0000-000000000000', '5ae33205-24f8-443a-a0db-874d249cb727', '{"action":"user_modified","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas K","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-10 18:54:02.264168+00', ''),
	('00000000-0000-0000-0000-000000000000', 'da23b238-320d-43fc-9a8e-cd5196de9395', '{"action":"logout","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas K","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-10 18:55:29.901284+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e2183d0a-1cb9-4b2f-bd73-adeb6cfb3be8', '{"action":"login","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas K","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-10 18:55:36.691178+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f5535046-8718-4d5c-99b6-4dde2ab05ab3', '{"action":"user_modified","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas J","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-10 18:56:29.573996+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a3384cb6-a48c-46b0-8033-1ffe89234bd5', '{"action":"user_modified","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"S","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-10 19:24:52.411258+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bb42222b-e632-415d-8666-e74d466c900d', '{"action":"user_modified","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"S","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-10 19:26:13.268067+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bd830508-156d-41cf-b701-5778efcbd758', '{"action":"user_modified","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"qwdqwd","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-10 19:27:49.149963+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f1cbf0c5-179d-4bd0-b518-8f5ef90238af', '{"action":"logout","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"qwdqwd","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-10 19:31:17.335187+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e756abbe-d48a-4dab-8526-4157df5c4d81', '{"action":"login","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"qwdqwd","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-10 19:31:22.463429+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ee9421d0-4ffb-4fa9-895e-40917a735a55', '{"action":"logout","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"qwdqwd","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-10 19:31:38.302867+00', ''),
	('00000000-0000-0000-0000-000000000000', '989680a8-a4e6-401b-b0ce-95313d805adc', '{"action":"login","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"qwdqwd","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-10 19:33:56.288829+00', ''),
	('00000000-0000-0000-0000-000000000000', '38b5c4fd-d5ed-4dc2-82fa-adbec1566458', '{"action":"user_modified","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-10 19:44:48.993744+00', ''),
	('00000000-0000-0000-0000-000000000000', '4482e154-7761-4397-ac9d-a20c2e216a2f', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-11 05:53:16.300291+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e8d8f9ed-819a-487b-a704-23b14db99ad3', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-11 05:53:16.303518+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd9c10d25-72d9-48e1-bc4e-c4cb820f119a', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-11 12:28:51.860139+00', ''),
	('00000000-0000-0000-0000-000000000000', '8afa46ed-c864-48f6-ba9d-377c5d97ea44', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-11 12:28:51.862109+00', ''),
	('00000000-0000-0000-0000-000000000000', '48519b29-c817-4704-8274-c9f218c0de26', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-11 18:17:06.473272+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c75e9ba1-b4fc-4856-86ef-b967e7e88bf2', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-11 18:17:06.484496+00', ''),
	('00000000-0000-0000-0000-000000000000', '0b2ebc56-7dcb-49f7-80ac-905d446f5ad2', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-13 05:54:40.270571+00', ''),
	('00000000-0000-0000-0000-000000000000', '4c72481e-1da8-449d-8078-c6d663522275', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-13 05:54:40.288454+00', ''),
	('00000000-0000-0000-0000-000000000000', 'be35d09b-b0e9-4537-b2ad-b6324fe3eff5', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-14 14:27:03.010062+00', ''),
	('00000000-0000-0000-0000-000000000000', '60f7da49-f924-4ae0-a4f1-58d46d38834b', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-14 14:27:03.029708+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c574894f-f41c-4d7b-aaad-be5ca1764018', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-14 16:24:03.619569+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ce8107d6-a8a7-42fe-ac54-f46da5b0196b', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-14 16:24:03.62201+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ea3658ea-bee6-4522-93d4-e1f5c0c080ef', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-15 12:34:27.472915+00', ''),
	('00000000-0000-0000-0000-000000000000', '013a6925-6cb5-4d66-899e-1aba87d5d896', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-15 12:34:27.488708+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eda8f6c3-59d8-424a-bf9e-be91395950f6', '{"action":"user_recovery_requested","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-15 15:17:24.653217+00', ''),
	('00000000-0000-0000-0000-000000000000', '81f2a292-603e-4049-b9dd-4b2d1787a0de', '{"action":"login","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-15 15:17:58.902955+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b1301606-74ca-4d37-b672-491e2f786c85', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-15 16:17:02.912629+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b4958a9e-4605-4e78-9889-ba442df96f48', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-15 16:17:02.916486+00', ''),
	('00000000-0000-0000-0000-000000000000', '42cfeaaf-4b22-4f5f-97f7-feec87dce0a5', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-15 17:37:00.136428+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a920e2b0-1187-4339-bfbe-29b62ac0c2d2', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-15 17:37:00.146447+00', ''),
	('00000000-0000-0000-0000-000000000000', '3c4ba3ba-7ed0-430f-a0f1-ce269594bf30', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-15 17:40:24.50095+00', ''),
	('00000000-0000-0000-0000-000000000000', '9afb5099-938c-4e15-b158-0e153b521959', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-15 17:40:24.501903+00', ''),
	('00000000-0000-0000-0000-000000000000', '440a472b-0b26-4640-89a0-a057f42bd70b', '{"action":"user_recovery_requested","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-15 17:44:21.465435+00', ''),
	('00000000-0000-0000-0000-000000000000', '408d495f-64f5-4e5b-b6a9-8f8888b89d2b', '{"action":"login","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-15 17:59:27.144847+00', ''),
	('00000000-0000-0000-0000-000000000000', '95aeb5f5-3669-4009-9bdf-424826939a42', '{"action":"user_recovery_requested","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-15 18:59:13.455607+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd1acda64-fc68-4079-89f7-a9b99a569880', '{"action":"login","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-15 18:59:52.895013+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c7139977-4218-4cce-8929-b2af5221541a', '{"action":"user_recovery_requested","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-15 19:01:05.359968+00', ''),
	('00000000-0000-0000-0000-000000000000', '4ce6641e-4b51-4bf2-bd9f-29c7456f8ac6', '{"action":"login","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-15 19:01:18.587894+00', ''),
	('00000000-0000-0000-0000-000000000000', '52f5fb3e-704a-4c17-bb5f-ad974eb9da27', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-15 20:15:00.029979+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c5dac5ac-8fee-4b6a-a937-868e657e6f36', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-15 20:15:00.039061+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cd207a86-9932-4d01-bca8-073221de9ad0', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-15 20:15:20.128159+00', ''),
	('00000000-0000-0000-0000-000000000000', '05c6602d-a49b-4bd6-ac57-1f0c123045c2', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-15 20:15:20.128859+00', ''),
	('00000000-0000-0000-0000-000000000000', '2cf52cdd-ccf0-4c58-abab-4c03ea4e6cfc', '{"action":"user_recovery_requested","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-15 20:34:25.818904+00', ''),
	('00000000-0000-0000-0000-000000000000', '3a391a35-6fa2-4f54-be12-4ea78c09d27d', '{"action":"login","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-15 20:34:39.84975+00', ''),
	('00000000-0000-0000-0000-000000000000', '11ed464e-3c8a-4d9f-b230-6fd4f4d4818d', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-16 02:58:15.590204+00', ''),
	('00000000-0000-0000-0000-000000000000', '49affc9a-b528-4631-9aa4-727ff651ff62', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-16 02:58:15.597893+00', ''),
	('00000000-0000-0000-0000-000000000000', '6f33e026-d5d0-4d14-bcea-608e24abe2d8', '{"action":"user_recovery_requested","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-16 02:59:06.183018+00', ''),
	('00000000-0000-0000-0000-000000000000', '35701cbb-59c3-4e1d-81a2-09781de53703', '{"action":"login","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-16 02:59:40.628293+00', ''),
	('00000000-0000-0000-0000-000000000000', '01af1811-5945-48d3-9c93-5f63cd48d2e2', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-16 04:32:55.869393+00', ''),
	('00000000-0000-0000-0000-000000000000', '33955adc-4aa5-44fa-b353-118dbb6994ad', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-16 04:32:55.8727+00', ''),
	('00000000-0000-0000-0000-000000000000', '52308830-8856-4d1a-b103-b3a17f3887d3', '{"action":"user_recovery_requested","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-16 04:53:06.972603+00', ''),
	('00000000-0000-0000-0000-000000000000', 'de884469-b7c1-424a-81d4-380517bff2c0', '{"action":"login","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-16 04:53:22.240722+00', ''),
	('00000000-0000-0000-0000-000000000000', '72f27f9e-95c5-4caa-8056-00a8817d4c37', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-16 18:21:01.894832+00', ''),
	('00000000-0000-0000-0000-000000000000', 'efb47da3-1fcf-4c99-883c-b926bef8516d', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-16 18:21:01.908453+00', ''),
	('00000000-0000-0000-0000-000000000000', '726b6b1b-cddc-4c8f-a5e2-6c909fd5a875', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-17 10:38:49.434444+00', ''),
	('00000000-0000-0000-0000-000000000000', '87ac8367-1f94-4f7c-9bb8-3c49ca5e099e', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-17 10:38:49.449953+00', ''),
	('00000000-0000-0000-0000-000000000000', '4ae8b657-b8a4-4088-b67b-51e2554c4475', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-17 11:47:39.668699+00', ''),
	('00000000-0000-0000-0000-000000000000', '7d018bb6-880e-43f3-bfd5-18e8a61111d8', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-17 11:47:39.671783+00', ''),
	('00000000-0000-0000-0000-000000000000', 'feb8b6fb-2f13-4855-8a45-acf44f693692', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-17 13:01:59.77903+00', ''),
	('00000000-0000-0000-0000-000000000000', '88e70198-ff24-4712-a154-fe03aa072e51', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-17 13:01:59.786289+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e1a4d723-66a6-49d5-8423-4351da7b1509', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-17 13:02:01.429391+00', ''),
	('00000000-0000-0000-0000-000000000000', 'af80708c-d0cf-4b9c-a2cd-ff8da585ef42', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-17 14:05:01.476412+00', ''),
	('00000000-0000-0000-0000-000000000000', '231b03a5-b80d-44ed-995f-ba4f4e06e555', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-17 14:05:01.488706+00', ''),
	('00000000-0000-0000-0000-000000000000', '839f0b8d-cfed-4dc8-b0db-bb3b1ce7251d', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-17 14:12:07.757677+00', ''),
	('00000000-0000-0000-0000-000000000000', '2de88691-aa0b-4746-a4c5-5d15da645906', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-17 14:12:07.75931+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ace5ebdf-070d-4941-95f6-febce156ac41', '{"action":"user_recovery_requested","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-17 14:47:35.109492+00', ''),
	('00000000-0000-0000-0000-000000000000', '5afcb5d5-363b-4bd1-a8c9-d89782223149', '{"action":"login","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-17 14:48:00.306652+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e934fed5-481d-4294-bb56-45daf289da80', '{"action":"user_recovery_requested","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-17 15:05:48.065688+00', ''),
	('00000000-0000-0000-0000-000000000000', '53de0b6c-3da7-4013-a691-fc29e76a6961', '{"action":"login","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-17 15:06:02.233197+00', ''),
	('00000000-0000-0000-0000-000000000000', '6a00a7c5-a52d-43b5-8a6d-0e5577837a36', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-17 15:53:30.780497+00', ''),
	('00000000-0000-0000-0000-000000000000', '8472c3f1-5f92-41b4-86fc-8f718a1d9173', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-17 15:53:30.783466+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c8a0a523-6106-455d-8361-5fa67c375319', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-17 16:54:33.935546+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b6181e4c-fb09-4570-9fa7-42645f8db057', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-17 16:54:33.936518+00', ''),
	('00000000-0000-0000-0000-000000000000', '2cb9fc09-fb94-44a1-95ae-8fd079d10ebc', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-17 17:02:11.834323+00', ''),
	('00000000-0000-0000-0000-000000000000', '85853c90-a90e-4deb-b79f-8e2e22b2bb92', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-17 17:02:11.836259+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd44ae40f-ef18-42b4-854b-3b6e1ed97d0b', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-18 04:25:22.900007+00', ''),
	('00000000-0000-0000-0000-000000000000', '674774c6-159b-4372-a0f1-c70769ca3a41', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-18 04:25:22.918844+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a60eb810-79b9-4abb-8177-0ce0e8d3a50f', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-18 05:29:49.501656+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cb015d50-a8e7-4cc4-9f4a-bf53583d6c16', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-18 05:29:49.504422+00', ''),
	('00000000-0000-0000-0000-000000000000', '7d7ce927-7263-4209-baed-d30812bf4bb8', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-18 05:36:36.112914+00', ''),
	('00000000-0000-0000-0000-000000000000', '20668d7a-9d6a-48e3-a51b-b645c6e659e3', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-18 05:36:36.114568+00', ''),
	('00000000-0000-0000-0000-000000000000', '6d4464a3-b60f-41a9-b9b1-acd869271f50', '{"action":"user_recovery_requested","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-18 07:30:07.825558+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ea250aec-57c3-4ed4-a506-62a9b7b39425', '{"action":"login","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-18 07:30:37.084814+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cdbb36b6-4b1b-4eaa-bd71-561b97cd26b2', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-18 08:08:23.907604+00', ''),
	('00000000-0000-0000-0000-000000000000', '0646e4b9-6318-4ff8-ab5a-7dcfd9c0599a', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-18 08:08:23.909384+00', ''),
	('00000000-0000-0000-0000-000000000000', '46be4003-245a-4042-a77b-4b6f2ce31f16', '{"action":"user_recovery_requested","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"user"}', '2025-04-18 09:36:31.277504+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c6dd4acf-d823-4c46-acfe-34763fac55f0', '{"action":"login","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-18 09:36:48.355593+00', ''),
	('00000000-0000-0000-0000-000000000000', '34db6ee0-3447-4f9f-a2dc-77d15493dc9f', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-18 10:36:14.792487+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ac53a63d-557a-4178-b608-b7caf5ca9e39', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-18 10:36:14.794296+00', ''),
	('00000000-0000-0000-0000-000000000000', '18e7c16e-9475-4ea5-9a7e-07169eb02c06', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-18 14:28:05.678245+00', ''),
	('00000000-0000-0000-0000-000000000000', '0fdc0c01-af94-4bbf-86e8-8fbb1cb29fc0', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-18 14:28:05.692866+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e4153bd5-8884-4625-bb75-73a4d7ba9287', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-18 16:31:08.816298+00', ''),
	('00000000-0000-0000-0000-000000000000', '0b6961a1-32f9-4a71-aa0e-e20965a2327a', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-18 16:31:08.821875+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cce74d35-3c4a-4fe1-82f4-8111bf7c7d9a', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-18 17:29:20.192161+00', ''),
	('00000000-0000-0000-0000-000000000000', '4d0a689b-aeb2-4515-8ead-89cf35140ca1', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-18 17:29:20.205924+00', ''),
	('00000000-0000-0000-0000-000000000000', '3d2674ce-ddf5-49e2-896a-f35d5a0f9cc5', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-19 04:26:36.953114+00', ''),
	('00000000-0000-0000-0000-000000000000', '2c212be0-065a-4194-aa5b-09a320ba7188', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-19 04:26:36.965364+00', ''),
	('00000000-0000-0000-0000-000000000000', '3173d385-23ff-4f27-8dbd-2a7f596d0446', '{"action":"token_refreshed","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-19 05:25:37.738267+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c3252a7d-037a-4ece-a216-38aceaaecb20', '{"action":"token_revoked","actor_id":"947bae31-4f04-436a-b4ff-7687c13aa31a","actor_name":"Shreyas","actor_username":"shreyasmadhan82@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-19 05:25:37.750904+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '947bae31-4f04-436a-b4ff-7687c13aa31a', 'authenticated', 'authenticated', 'shreyasmadhan82@gmail.com', '$2a$10$F2pEorvr3vZmUranLM8gOunza4b/vP4hUiYlrjCceR5epWQaQCM.W', '2025-04-10 18:46:42.825815+00', NULL, '', '2025-04-10 18:46:04.566817+00', '', '2025-04-18 09:36:31.279684+00', '', '', NULL, '2025-04-18 09:36:48.357918+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "947bae31-4f04-436a-b4ff-7687c13aa31a", "email": "shreyasmadhan82@gmail.com", "phone": "090-9988989809", "full_name": "Shreyas", "email_verified": true, "phone_verified": false, "subscription_type": "community"}', NULL, '2025-04-10 18:46:04.523759+00', '2025-04-19 05:25:37.755838+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('947bae31-4f04-436a-b4ff-7687c13aa31a', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{"sub": "947bae31-4f04-436a-b4ff-7687c13aa31a", "email": "shreyasmadhan82@gmail.com", "phone": "7708086777", "full_name": "Shreyas K", "email_verified": true, "phone_verified": false, "subscription_type": "community"}', 'email', '2025-04-10 18:46:04.54923+00', '2025-04-10 18:46:04.549283+00', '2025-04-10 18:46:04.549283+00', '5c47162d-f998-4c53-b56d-4fc3a49b218c');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('c92bc712-e62c-4134-ab58-e3361794c9df', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 15:06:02.236936+00', '2025-04-17 15:06:02.236936+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '171.76.80.62', NULL),
	('ed28d41b-2273-4ff4-81c9-c74e374f0cd6', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-16 04:53:22.243889+00', '2025-04-17 17:02:11.841572+00', NULL, 'aal1', NULL, '2025-04-17 17:02:11.840934', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '171.76.80.62', NULL),
	('72438161-4bda-4d8b-a39a-f969e5b35d37', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 14:48:00.314512+00', '2025-04-18 05:29:49.512032+00', NULL, 'aal1', NULL, '2025-04-18 05:29:49.511963', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '171.76.87.22', NULL),
	('ed78fa47-4b27-4596-9474-954268164610', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-18 07:30:37.092823+00', '2025-04-18 07:30:37.092823+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '171.76.87.22', NULL),
	('cfb62f3f-cf8f-421d-bb9b-a2f2a45510b6', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-10 19:33:56.29142+00', '2025-04-15 17:37:00.157006+00', NULL, 'aal1', NULL, '2025-04-15 17:37:00.156906', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '171.76.84.213', NULL),
	('af738271-fa78-4c4d-9c7b-e615fce82717', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-15 15:17:58.909924+00', '2025-04-15 17:40:24.506646+00', NULL, 'aal1', NULL, '2025-04-15 17:40:24.506572', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '171.76.84.213', NULL),
	('1f3ad31c-10f4-4d78-862f-d2f6a4bf821f', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-15 17:59:27.149606+00', '2025-04-15 17:59:27.149606+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '171.76.84.213', NULL),
	('cd5e8bc3-c0d7-4191-957b-f843f1b40f52', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-15 19:01:18.591055+00', '2025-04-18 08:08:23.915993+00', NULL, 'aal1', NULL, '2025-04-18 08:08:23.915906', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '171.76.87.22', NULL),
	('3cdcf965-3ade-4887-8542-ada70d2399fa', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-15 18:59:52.899636+00', '2025-04-15 20:15:20.133975+00', NULL, 'aal1', NULL, '2025-04-15 20:15:20.13387', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '171.76.80.62', NULL),
	('bfe13931-b186-412d-b15e-aedf43108a56', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-15 20:34:39.853044+00', '2025-04-16 02:58:15.612464+00', NULL, 'aal1', NULL, '2025-04-16 02:58:15.612383', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '171.76.80.62', NULL),
	('13bb5841-e7ef-4524-9465-69105c5a7269', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-16 02:59:40.634027+00', '2025-04-16 04:32:55.877603+00', NULL, 'aal1', NULL, '2025-04-16 04:32:55.877533', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '171.76.80.62', NULL),
	('4c58b274-fb83-4eec-a26d-0332e99175e9', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-18 09:36:48.357988+00', '2025-04-19 05:25:37.760274+00', NULL, 'aal1', NULL, '2025-04-19 05:25:37.760186', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', '171.76.86.9', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('cfb62f3f-cf8f-421d-bb9b-a2f2a45510b6', '2025-04-10 19:33:56.296449+00', '2025-04-10 19:33:56.296449+00', 'password', '9f81e197-a573-40e2-8cbd-b9c4f1184a5b'),
	('af738271-fa78-4c4d-9c7b-e615fce82717', '2025-04-15 15:17:58.919516+00', '2025-04-15 15:17:58.919516+00', 'otp', '83a36f91-5a58-4a74-bda2-36d41f96f161'),
	('1f3ad31c-10f4-4d78-862f-d2f6a4bf821f', '2025-04-15 17:59:27.156345+00', '2025-04-15 17:59:27.156345+00', 'otp', '88326182-9be0-45f0-9262-2d10c348b8e7'),
	('3cdcf965-3ade-4887-8542-ada70d2399fa', '2025-04-15 18:59:52.904884+00', '2025-04-15 18:59:52.904884+00', 'otp', '5a942516-b9ea-4cfc-a559-c5a04f3da572'),
	('cd5e8bc3-c0d7-4191-957b-f843f1b40f52', '2025-04-15 19:01:18.594665+00', '2025-04-15 19:01:18.594665+00', 'otp', '2ad2e854-71cb-477a-83d7-68bb0953e6a9'),
	('bfe13931-b186-412d-b15e-aedf43108a56', '2025-04-15 20:34:39.85951+00', '2025-04-15 20:34:39.85951+00', 'otp', '48ae5c1a-c57d-40e4-835e-9fc5b1d92a36'),
	('13bb5841-e7ef-4524-9465-69105c5a7269', '2025-04-16 02:59:40.638158+00', '2025-04-16 02:59:40.638158+00', 'otp', 'e3992e3f-64df-4ef9-b086-4821d2af6eae'),
	('ed28d41b-2273-4ff4-81c9-c74e374f0cd6', '2025-04-16 04:53:22.248371+00', '2025-04-16 04:53:22.248371+00', 'otp', '1fa62933-9795-4137-a267-c5eb8662a6ad'),
	('72438161-4bda-4d8b-a39a-f969e5b35d37', '2025-04-17 14:48:00.324062+00', '2025-04-17 14:48:00.324062+00', 'otp', '3fc330f4-e808-42a4-8d92-ff26b815b6a3'),
	('c92bc712-e62c-4134-ab58-e3361794c9df', '2025-04-17 15:06:02.250417+00', '2025-04-17 15:06:02.250417+00', 'otp', 'ad525f56-e08e-4237-afd6-6af4dcc97cfc'),
	('ed78fa47-4b27-4596-9474-954268164610', '2025-04-18 07:30:37.121053+00', '2025-04-18 07:30:37.121053+00', 'otp', '9e096bc7-e142-4b79-964c-102ecf4d93fc'),
	('4c58b274-fb83-4eec-a26d-0332e99175e9', '2025-04-18 09:36:48.363975+00', '2025-04-18 09:36:48.363975+00', 'otp', '47fb30df-67fd-470c-907d-c2f40158bd4e');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 5, 'S4rk8fs-ebOtzrfXnEO2qA', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-10 19:33:56.293712+00', '2025-04-11 05:53:16.304067+00', NULL, 'cfb62f3f-cf8f-421d-bb9b-a2f2a45510b6'),
	('00000000-0000-0000-0000-000000000000', 6, 'YzBuFpl-yBIBy1Frf-ZsTQ', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-11 05:53:16.307446+00', '2025-04-11 12:28:51.862677+00', 'S4rk8fs-ebOtzrfXnEO2qA', 'cfb62f3f-cf8f-421d-bb9b-a2f2a45510b6'),
	('00000000-0000-0000-0000-000000000000', 7, 'tJt7h97sfycfPIZWIvFQfQ', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-11 12:28:51.863324+00', '2025-04-11 18:17:06.485049+00', 'YzBuFpl-yBIBy1Frf-ZsTQ', 'cfb62f3f-cf8f-421d-bb9b-a2f2a45510b6'),
	('00000000-0000-0000-0000-000000000000', 8, 'Hx1JAn1tTOpZY1KG_3ogow', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-11 18:17:06.48867+00', '2025-04-13 05:54:40.290562+00', 'tJt7h97sfycfPIZWIvFQfQ', 'cfb62f3f-cf8f-421d-bb9b-a2f2a45510b6'),
	('00000000-0000-0000-0000-000000000000', 9, 'prk_3Q2cAZJu66ExzzStYw', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-13 05:54:40.295751+00', '2025-04-14 14:27:03.032293+00', 'Hx1JAn1tTOpZY1KG_3ogow', 'cfb62f3f-cf8f-421d-bb9b-a2f2a45510b6'),
	('00000000-0000-0000-0000-000000000000', 10, 'rLTjavCliQJMBzj3TLV2dQ', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-14 14:27:03.039106+00', '2025-04-14 16:24:03.622569+00', 'prk_3Q2cAZJu66ExzzStYw', 'cfb62f3f-cf8f-421d-bb9b-a2f2a45510b6'),
	('00000000-0000-0000-0000-000000000000', 11, 'NmKVz_UgrjEwvWPcS0KUmA', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-14 16:24:03.625531+00', '2025-04-15 12:34:27.489917+00', 'rLTjavCliQJMBzj3TLV2dQ', 'cfb62f3f-cf8f-421d-bb9b-a2f2a45510b6'),
	('00000000-0000-0000-0000-000000000000', 13, '1Uh_xUkATIgEgKBwRvbqRg', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-15 15:17:58.914243+00', '2025-04-15 16:17:02.917734+00', NULL, 'af738271-fa78-4c4d-9c7b-e615fce82717'),
	('00000000-0000-0000-0000-000000000000', 12, 'tkk8xmryiLWoKwqio9vQag', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-15 12:34:27.499799+00', '2025-04-15 17:37:00.147438+00', 'NmKVz_UgrjEwvWPcS0KUmA', 'cfb62f3f-cf8f-421d-bb9b-a2f2a45510b6'),
	('00000000-0000-0000-0000-000000000000', 15, 'RM1YCeCc-nXS5EFHLGjhEw', '947bae31-4f04-436a-b4ff-7687c13aa31a', false, '2025-04-15 17:37:00.151167+00', '2025-04-15 17:37:00.151167+00', 'tkk8xmryiLWoKwqio9vQag', 'cfb62f3f-cf8f-421d-bb9b-a2f2a45510b6'),
	('00000000-0000-0000-0000-000000000000', 14, 'OIc-djhNKoZgyDE-qmK9Rg', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-15 16:17:02.920007+00', '2025-04-15 17:40:24.502396+00', '1Uh_xUkATIgEgKBwRvbqRg', 'af738271-fa78-4c4d-9c7b-e615fce82717'),
	('00000000-0000-0000-0000-000000000000', 16, '4LDFXwBhuPMyByyd0V4nmw', '947bae31-4f04-436a-b4ff-7687c13aa31a', false, '2025-04-15 17:40:24.503062+00', '2025-04-15 17:40:24.503062+00', 'OIc-djhNKoZgyDE-qmK9Rg', 'af738271-fa78-4c4d-9c7b-e615fce82717'),
	('00000000-0000-0000-0000-000000000000', 17, 'k6TfErQMeI4u4-IQOrRLbA', '947bae31-4f04-436a-b4ff-7687c13aa31a', false, '2025-04-15 17:59:27.152+00', '2025-04-15 17:59:27.152+00', NULL, '1f3ad31c-10f4-4d78-862f-d2f6a4bf821f'),
	('00000000-0000-0000-0000-000000000000', 19, 'BIjGRLnEZrN_gA2ePWuBwA', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-15 19:01:18.592685+00', '2025-04-15 20:15:00.039785+00', NULL, 'cd5e8bc3-c0d7-4191-957b-f843f1b40f52'),
	('00000000-0000-0000-0000-000000000000', 18, 'rsQFsXpmVvd6HMufXDqKNQ', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-15 18:59:52.901405+00', '2025-04-15 20:15:20.130287+00', NULL, '3cdcf965-3ade-4887-8542-ada70d2399fa'),
	('00000000-0000-0000-0000-000000000000', 21, '9HCwWDxnGkxbJp_EQUds_Q', '947bae31-4f04-436a-b4ff-7687c13aa31a', false, '2025-04-15 20:15:20.131409+00', '2025-04-15 20:15:20.131409+00', 'rsQFsXpmVvd6HMufXDqKNQ', '3cdcf965-3ade-4887-8542-ada70d2399fa'),
	('00000000-0000-0000-0000-000000000000', 22, '5AO1hgZdujmvcS6m0Xh-QA', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-15 20:34:39.856297+00', '2025-04-16 02:58:15.598485+00', NULL, 'bfe13931-b186-412d-b15e-aedf43108a56'),
	('00000000-0000-0000-0000-000000000000', 23, 'GceWL9raqS_RUdDJEtL21A', '947bae31-4f04-436a-b4ff-7687c13aa31a', false, '2025-04-16 02:58:15.605161+00', '2025-04-16 02:58:15.605161+00', '5AO1hgZdujmvcS6m0Xh-QA', 'bfe13931-b186-412d-b15e-aedf43108a56'),
	('00000000-0000-0000-0000-000000000000', 24, 'OOmUv7jb-IOnrn2CW1K00g', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-16 02:59:40.634922+00', '2025-04-16 04:32:55.873217+00', NULL, '13bb5841-e7ef-4524-9465-69105c5a7269'),
	('00000000-0000-0000-0000-000000000000', 25, '3R5y0fyzcpuyprRLdWQW8Q', '947bae31-4f04-436a-b4ff-7687c13aa31a', false, '2025-04-16 04:32:55.874544+00', '2025-04-16 04:32:55.874544+00', 'OOmUv7jb-IOnrn2CW1K00g', '13bb5841-e7ef-4524-9465-69105c5a7269'),
	('00000000-0000-0000-0000-000000000000', 26, 'pNlzAY6zyL35670QgJUDDQ', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-16 04:53:22.245761+00', '2025-04-16 18:21:01.909808+00', NULL, 'ed28d41b-2273-4ff4-81c9-c74e374f0cd6'),
	('00000000-0000-0000-0000-000000000000', 27, '2E6uvJees1N53JmuVHEDLA', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-16 18:21:01.916896+00', '2025-04-17 10:38:49.453651+00', 'pNlzAY6zyL35670QgJUDDQ', 'ed28d41b-2273-4ff4-81c9-c74e374f0cd6'),
	('00000000-0000-0000-0000-000000000000', 28, '3YmFv4bWNB7VOZTHwvbKow', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-17 10:38:49.466944+00', '2025-04-17 11:47:39.672423+00', '2E6uvJees1N53JmuVHEDLA', 'ed28d41b-2273-4ff4-81c9-c74e374f0cd6'),
	('00000000-0000-0000-0000-000000000000', 29, '4pVok1B7b4H3j05n0QCPxA', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-17 11:47:39.67414+00', '2025-04-17 13:01:59.786956+00', '3YmFv4bWNB7VOZTHwvbKow', 'ed28d41b-2273-4ff4-81c9-c74e374f0cd6'),
	('00000000-0000-0000-0000-000000000000', 30, 'Zs1UqWVgv_aXVKsYFWVTew', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-17 13:01:59.790731+00', '2025-04-17 14:05:01.490554+00', '4pVok1B7b4H3j05n0QCPxA', 'ed28d41b-2273-4ff4-81c9-c74e374f0cd6'),
	('00000000-0000-0000-0000-000000000000', 20, 'nuqjgoys2q-mTK5vN4o7Og', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-15 20:15:00.043745+00', '2025-04-17 14:12:07.7599+00', 'BIjGRLnEZrN_gA2ePWuBwA', 'cd5e8bc3-c0d7-4191-957b-f843f1b40f52'),
	('00000000-0000-0000-0000-000000000000', 34, 'e3U-ENKVjl6x3AD4acCGEQ', '947bae31-4f04-436a-b4ff-7687c13aa31a', false, '2025-04-17 15:06:02.239789+00', '2025-04-17 15:06:02.239789+00', NULL, 'c92bc712-e62c-4134-ab58-e3361794c9df'),
	('00000000-0000-0000-0000-000000000000', 33, 'SjbTL7dB6Pim_wvhAoDEtA', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-17 14:48:00.318021+00', '2025-04-17 15:53:30.784021+00', NULL, '72438161-4bda-4d8b-a39a-f969e5b35d37'),
	('00000000-0000-0000-0000-000000000000', 35, 'jGW7pDmKPKRSbxesGbMKzA', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-17 15:53:30.7894+00', '2025-04-17 16:54:33.937007+00', 'SjbTL7dB6Pim_wvhAoDEtA', '72438161-4bda-4d8b-a39a-f969e5b35d37'),
	('00000000-0000-0000-0000-000000000000', 31, 'n3vFhHyx_h6npMDU-y7PHA', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-17 14:05:01.497866+00', '2025-04-17 17:02:11.836843+00', 'Zs1UqWVgv_aXVKsYFWVTew', 'ed28d41b-2273-4ff4-81c9-c74e374f0cd6'),
	('00000000-0000-0000-0000-000000000000', 37, 'hVcxLz1UJOnN-xdx-jqvUA', '947bae31-4f04-436a-b4ff-7687c13aa31a', false, '2025-04-17 17:02:11.838599+00', '2025-04-17 17:02:11.838599+00', 'n3vFhHyx_h6npMDU-y7PHA', 'ed28d41b-2273-4ff4-81c9-c74e374f0cd6'),
	('00000000-0000-0000-0000-000000000000', 36, 'Rs8_-zA62nkpUs6by6gDCg', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-17 16:54:33.938256+00', '2025-04-18 04:25:22.921369+00', 'jGW7pDmKPKRSbxesGbMKzA', '72438161-4bda-4d8b-a39a-f969e5b35d37'),
	('00000000-0000-0000-0000-000000000000', 38, '4iGWWHnXGOjTT5XWJ93emg', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-18 04:25:22.934123+00', '2025-04-18 05:29:49.504991+00', 'Rs8_-zA62nkpUs6by6gDCg', '72438161-4bda-4d8b-a39a-f969e5b35d37'),
	('00000000-0000-0000-0000-000000000000', 39, 'mObdk36K8gT1L-LkfTQoKg', '947bae31-4f04-436a-b4ff-7687c13aa31a', false, '2025-04-18 05:29:49.507513+00', '2025-04-18 05:29:49.507513+00', '4iGWWHnXGOjTT5XWJ93emg', '72438161-4bda-4d8b-a39a-f969e5b35d37'),
	('00000000-0000-0000-0000-000000000000', 32, 'VlZryi0kk7tpZuFnhoHUpQ', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-17 14:12:07.761245+00', '2025-04-18 05:36:36.115162+00', 'nuqjgoys2q-mTK5vN4o7Og', 'cd5e8bc3-c0d7-4191-957b-f843f1b40f52'),
	('00000000-0000-0000-0000-000000000000', 41, 'K8wqDS6Tuvnu-8sI6uJUgw', '947bae31-4f04-436a-b4ff-7687c13aa31a', false, '2025-04-18 07:30:37.100022+00', '2025-04-18 07:30:37.100022+00', NULL, 'ed78fa47-4b27-4596-9474-954268164610'),
	('00000000-0000-0000-0000-000000000000', 40, 'UP6BucgwNTr62hMUD_MOiQ', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-18 05:36:36.117169+00', '2025-04-18 08:08:23.910009+00', 'VlZryi0kk7tpZuFnhoHUpQ', 'cd5e8bc3-c0d7-4191-957b-f843f1b40f52'),
	('00000000-0000-0000-0000-000000000000', 42, 'bSFeY99AOrJwArgJypurjw', '947bae31-4f04-436a-b4ff-7687c13aa31a', false, '2025-04-18 08:08:23.912392+00', '2025-04-18 08:08:23.912392+00', 'UP6BucgwNTr62hMUD_MOiQ', 'cd5e8bc3-c0d7-4191-957b-f843f1b40f52'),
	('00000000-0000-0000-0000-000000000000', 43, 'WbMM-TRVIfB7rIuNCe6l1w', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-18 09:36:48.360274+00', '2025-04-18 10:36:14.794894+00', NULL, '4c58b274-fb83-4eec-a26d-0332e99175e9'),
	('00000000-0000-0000-0000-000000000000', 44, 'MrK0dTxfwQGYnz6n6zgfTg', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-18 10:36:14.796899+00', '2025-04-18 14:28:05.695283+00', 'WbMM-TRVIfB7rIuNCe6l1w', '4c58b274-fb83-4eec-a26d-0332e99175e9'),
	('00000000-0000-0000-0000-000000000000', 45, 'qQ0IDqRqLDHqf_dQF1EX2g', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-18 14:28:05.706403+00', '2025-04-18 16:31:08.822482+00', 'MrK0dTxfwQGYnz6n6zgfTg', '4c58b274-fb83-4eec-a26d-0332e99175e9'),
	('00000000-0000-0000-0000-000000000000', 46, 'MnAu7cp-fCnYq7S52lpK3w', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-18 16:31:08.825669+00', '2025-04-18 17:29:20.206602+00', 'qQ0IDqRqLDHqf_dQF1EX2g', '4c58b274-fb83-4eec-a26d-0332e99175e9'),
	('00000000-0000-0000-0000-000000000000', 47, 'YtTbnH2Hb6GaYiOSTBDK1A', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-18 17:29:20.214586+00', '2025-04-19 04:26:36.967003+00', 'MnAu7cp-fCnYq7S52lpK3w', '4c58b274-fb83-4eec-a26d-0332e99175e9'),
	('00000000-0000-0000-0000-000000000000', 48, 'mnqXqWfZo-FXq5alrR7nYQ', '947bae31-4f04-436a-b4ff-7687c13aa31a', true, '2025-04-19 04:26:36.972554+00', '2025-04-19 05:25:37.751541+00', 'YtTbnH2Hb6GaYiOSTBDK1A', '4c58b274-fb83-4eec-a26d-0332e99175e9'),
	('00000000-0000-0000-0000-000000000000', 49, 'vJN_jPR1GYDAgP4bYFAcNQ', '947bae31-4f04-436a-b4ff-7687c13aa31a', false, '2025-04-19 05:25:37.75461+00', '2025-04-19 05:25:37.75461+00', 'mnqXqWfZo-FXq5alrR7nYQ', '4c58b274-fb83-4eec-a26d-0332e99175e9');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: trek_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."trek_events" ("trek_id", "trek_name", "description", "category", "start_datetime", "duration", "cost", "cancellation_policy", "penalty_details", "max_participants", "current_participants", "location", "route_data", "transport_mode", "vendor_contacts", "pickup_time_window", "event_creator_type", "partner_id", "created_at", "updated_at", "booking_amount", "collect_full_fee", "image_url", "gpx_file_url") VALUES
	(1, 'Maydala Kere and Boligutta Loop', 'Lake swim and Trek', 'family', '2025-04-18 02:01:00+00', '00:00:01', 1000.00, 'Cancellation Fee - INR 200', NULL, 10, 1, NULL, NULL, 'cars', NULL, '2:00 - 3:00 AM', 'internal', NULL, '2025-04-11 12:32:38.100242+00', '2025-04-11 12:32:38.100242+00', NULL, false, NULL, NULL),
	(2, 'Tenginakallu Betta', 'Swim + Village Walk', 'curated-experience', '2025-04-21 04:30:00+00', '00:00:01', 200.00, '200', NULL, 5, 1, NULL, NULL, 'cars', NULL, '2:30AM - 3:00AM', 'internal', NULL, '2025-04-15 16:38:07.921914+00', '2025-04-15 16:38:07.921914+00', NULL, false, NULL, NULL),
	(4, 'K', 'GG', 'family', '2025-04-30 08:30:00+00', '00:00:02', 1500.00, '2:00', NULL, 10, 0, NULL, NULL, 'mini_van', NULL, '2', 'internal', NULL, '2025-04-16 03:01:09.546701+00', '2025-04-16 03:01:09.546701+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744772467804-y0uhyn41z.webp', NULL),
	(11, 'Achalu Betta', 'Great', NULL, '2025-04-24 18:12:00+00', NULL, 200.00, NULL, NULL, 10, 0, 'Achalu Betta Car Parking', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 12:43:35.985496+00', '2025-04-17 12:43:35.985496+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744893813667-lqa3jbldf.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744893814588-jgpwjla6o.gpx'),
	(12, 'Achalu Betta', 'Great', NULL, '2025-04-24 18:34:00+00', NULL, 200.00, NULL, NULL, 10, 0, 'Achalu Betta Car Parking', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 13:04:54.653787+00', '2025-04-17 13:04:54.653787+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744895092343-9hm2i229b.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744895093109-e0hw62pse.gpx'),
	(13, 'Achalu Betta', 'Great', NULL, '2025-04-24 18:34:00+00', NULL, 200.00, NULL, NULL, 10, 0, 'Achalu Betta Car Parking', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 13:14:28.918401+00', '2025-04-17 13:14:28.918401+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744895667090-2aejw2759.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744895667520-fonslpoty.gpx'),
	(14, 'Achalu Betta', 'Gre', NULL, '2025-04-24 18:44:00+00', NULL, 200.00, NULL, NULL, 10, 0, 'Achalu Betta Car Parking', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 13:15:30.37136+00', '2025-04-17 13:15:30.37136+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744895727865-8c8pr1gg3.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744895728568-lta5cptbc.gpx'),
	(15, 'Achalu Betta', 'Great', NULL, '2025-04-24 18:57:00+00', NULL, 200.00, NULL, NULL, 10, 0, 'Achalu Betta Car Parkign', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 13:28:23.29768+00', '2025-04-17 13:28:23.29768+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744896501250-rscny4s9l.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744896501804-dgdihqke8.gpx'),
	(16, 'Achalu Betta', 'Great', NULL, '2025-04-24 18:57:00+00', NULL, 200.00, NULL, NULL, 10, 0, 'Achalu Betta Car Parkign', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 13:32:26.218562+00', '2025-04-17 13:32:26.218562+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744896744059-dkbn6wj08.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744896744579-el961quck.gpx'),
	(17, 'Achalu Betta', 'Great', NULL, '2025-04-24 18:57:00+00', NULL, 200.00, NULL, NULL, 10, 0, 'Achalu Betta Car Parkign', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 13:41:52.365704+00', '2025-04-17 13:41:52.365704+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744897310252-dzh8fejbi.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744897310663-zkemlm01p.gpx'),
	(18, 'Achalu Betta', 'Great trek', NULL, '2025-04-24 19:12:00+00', NULL, 200.00, NULL, NULL, 10, 0, 'Achalu Betta Car Parking', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 13:44:07.841233+00', '2025-04-17 13:44:07.841233+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744897445401-os0aq644r.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744897446244-dtmakh0j7.gpx'),
	(19, 'Achalu Bette', 'Great', NULL, '2025-04-24 19:18:00+00', NULL, 200.00, NULL, NULL, 10, 0, 'Achalu Betta Car Parking', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 13:49:15.976996+00', '2025-04-17 13:49:15.976996+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744897754041-ceonm5jy5.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744897754517-99nwevbrv.gpx'),
	(20, 'Achalu Bette', 'Great', NULL, '2025-04-24 19:18:00+00', NULL, 200.00, NULL, NULL, 10, 0, 'Achalu Betta Car Parking', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 13:51:17.420248+00', '2025-04-17 13:51:17.420248+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744897875403-gj0d0zybn.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744897875949-13p3gszjh.gpx'),
	(21, 'Achalu Bette', 'Great', NULL, '2025-04-24 19:18:00+00', NULL, 200.00, NULL, NULL, 10, 0, 'Achalu Betta Car Parking', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 13:53:06.704777+00', '2025-04-17 13:53:06.704777+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744897984699-uiswa9a30.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744897985234-pyovce3xt.gpx'),
	(22, 'Achalu Bette', 'Great', NULL, '2025-04-24 19:18:00+00', NULL, 200.00, NULL, NULL, 10, 0, 'Achalu Betta Car Parking', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 13:53:58.67621+00', '2025-04-17 13:53:58.67621+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744898036393-3a4ormcmz.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744898037092-jdy2myukq.gpx'),
	(23, 'Achalu Bette', 'Great', NULL, '2025-04-24 19:18:00+00', NULL, 200.00, NULL, NULL, 10, 0, 'Achalu Betta Car Parking', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 14:05:13.053055+00', '2025-04-17 14:05:13.053055+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744898710848-jmvrvxhap.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744898711366-zl7ks4j5c.gpx'),
	(24, 'Achalu Bette', 'Great', NULL, '2025-04-24 19:18:00+00', NULL, 200.00, NULL, NULL, 10, 0, 'Achalu Betta Car Parking', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 14:08:49.876708+00', '2025-04-17 14:08:49.876708+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744898927773-9xkiph9po.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744898928338-1imm6un53.gpx'),
	(25, 'Achalu Betta', 'Great', NULL, '2025-04-24 19:39:00+00', NULL, 200.00, NULL, NULL, 10, 0, 'Achalu Betta Car Parking', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 14:09:50.403263+00', '2025-04-17 14:09:50.403263+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744898987639-ouo7xw6cu.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744898988727-ocm3qv1gf.gpx'),
	(26, 'Achalu Betta', 'Great', NULL, '2025-04-24 19:39:00+00', NULL, 200.00, NULL, NULL, 10, 0, 'Achalu Betta Car Parking', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 14:11:37.136878+00', '2025-04-17 14:11:37.136878+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744899094877-7etqnqobr.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744899095478-4fjdwn5ej.gpx'),
	(27, 'asas', 'fafa', NULL, '2025-04-27 20:39:00+00', NULL, 133.00, NULL, NULL, 12, 0, 'dsadsa', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 15:09:43.209272+00', '2025-04-17 15:09:43.209272+00', NULL, false, NULL, NULL),
	(28, 'oihoih', 'oio', NULL, '2025-04-28 20:49:00+00', NULL, 1212.00, NULL, NULL, 11, 0, 'adasd', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 15:19:22.058207+00', '2025-04-17 15:19:22.058207+00', NULL, false, NULL, NULL),
	(29, 'oihoih', 'oio', NULL, '2025-04-28 20:49:00+00', NULL, 1212.00, NULL, NULL, 11, 0, 'adasd', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 15:20:50.416129+00', '2025-04-17 15:20:50.416129+00', NULL, false, NULL, NULL),
	(30, 'AAAAA', 'asas', NULL, '2025-05-01 20:55:00+00', NULL, 12122.00, NULL, NULL, 6, 0, 'dwqeqw', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 15:26:29.001754+00', '2025-04-17 15:26:29.001754+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744903586709-if20csric.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744903587257-0re80xepa.gpx'),
	(31, 'AAAAA', 'asas', NULL, '2025-05-01 20:55:00+00', NULL, 12122.00, NULL, NULL, 6, 0, 'dwqeqw', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 15:28:41.067262+00', '2025-04-17 15:28:41.067262+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744903718948-5oheu4tgl.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744903719429-43kp5h6kh.gpx'),
	(32, 'AAAAA', 'asas', NULL, '2025-05-01 20:55:00+00', NULL, 12122.00, NULL, NULL, 6, 0, 'dwqeqw', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 15:34:28.473219+00', '2025-04-17 15:34:28.473219+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744904066073-0gtxg0vm7.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744904066766-ixl4m45xv.gpx'),
	(33, 'asdasd', 'asdasd', NULL, '2025-04-29 21:05:00+00', NULL, 111.00, NULL, NULL, 11, 0, 'asdas', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 15:35:48.454444+00', '2025-04-17 15:35:48.454444+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744904145403-sb5162pk1.png', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744904146775-2gbk5pvmo.gpx'),
	(34, 'asdasd', 'asdasd', NULL, '2025-04-29 21:05:00+00', NULL, 111.00, NULL, NULL, 11, 0, 'asdas', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 15:42:20.945063+00', '2025-04-17 15:42:20.945063+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744904538329-htbpdfsk9.png', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744904539313-wqpwh1cgw.gpx'),
	(35, 'asdasd', 'asdasd', NULL, '2025-04-29 21:05:00+00', NULL, 111.00, NULL, NULL, 11, 0, 'asdas', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 16:07:38.076114+00', '2025-04-17 16:07:38.076114+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744906055104-ftnb1t59c.png', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744906056293-8u5jduglv.gpx'),
	(36, 'dgdddg', 'sadasd', NULL, '2025-04-22 21:39:00+00', NULL, 455.00, NULL, NULL, 55, 0, 'asdas', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 16:09:54.987189+00', '2025-04-17 16:09:54.987189+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744906192376-zx3jbancb.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744906193226-mpyhank1d.gpx'),
	(37, 'BBBB', 'dsas', NULL, '2025-04-22 22:33:00+00', NULL, 111.00, NULL, NULL, 11, 0, 'ad', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 17:03:27.756192+00', '2025-04-17 17:03:27.756192+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744909405540-hyp9tjr0r.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744909405975-9y6whh06g.gpx'),
	(38, 'uuuuuu', 'sdasdas', NULL, '2025-04-22 22:39:00+00', NULL, 2222.00, NULL, NULL, 3, 0, 'asfas', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 17:09:30.580775+00', '2025-04-17 17:09:30.580775+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744909768065-c4346a68y.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744909768613-mhie6psgt.gpx'),
	(39, 'vfffff', 'sdsa', NULL, '2025-04-29 22:48:00+00', NULL, 111.00, NULL, NULL, 11, 0, 'adad', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 17:19:00.514539+00', '2025-04-17 17:19:00.514539+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744910338009-4rfpwvr79.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744910338607-1949r43ff.gpx'),
	(40, 'vfffff', 'sdsa', NULL, '2025-04-29 22:48:00+00', NULL, 111.00, NULL, NULL, 11, 0, 'adad', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 17:28:22.432916+00', '2025-04-17 17:28:22.432916+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744910900004-vtcscuhv2.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744910900533-t0dtu1kbf.gpx'),
	(41, 'lolllll', 'ddd', NULL, '2025-04-30 22:58:00+00', NULL, 1111.00, NULL, NULL, 121, 0, 'asda', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 17:29:07.683006+00', '2025-04-17 17:29:07.683006+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744910945277-faq7bn328.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744910945832-swo1uyl5r.gpx'),
	(42, 'lolllll', 'ddd', NULL, '2025-04-30 22:58:00+00', NULL, 1111.00, NULL, NULL, 121, 0, 'asda', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 17:39:45.787892+00', '2025-04-17 17:39:45.787892+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744911582988-ov3d73rho.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744911583850-ahrv8vq0j.gpx'),
	(43, 'fggggg', 'weff', NULL, '2025-04-29 23:10:00+00', NULL, 111.00, NULL, NULL, 111, 0, 'wqewqe', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 17:41:03.769856+00', '2025-04-17 17:41:03.769856+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744911661027-1jvpgdci1.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744911661723-2zlt0741x.gpx'),
	(44, 'fggggg', 'weff', NULL, '2025-04-29 23:10:00+00', NULL, 111.00, NULL, NULL, 111, 0, 'wqewqe', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 17:43:17.249565+00', '2025-04-17 17:43:17.249565+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744911793308-elqu6wzxs.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744911795318-7pptlmc72.gpx'),
	(45, 'fggggg', 'weff', NULL, '2025-04-29 23:10:00+00', NULL, 111.00, NULL, NULL, 111, 0, 'wqewqe', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 17:47:52.252283+00', '2025-04-17 17:47:52.252283+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744912069898-54jsnj1ad.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744912070357-utt3snpdl.gpx'),
	(46, 'dddddd', 'dddd', NULL, '2025-04-22 11:07:00+00', NULL, 1.00, NULL, NULL, 2, 0, '', NULL, NULL, NULL, NULL, 'internal', NULL, '2025-04-18 05:37:45.513141+00', '2025-04-18 05:37:45.513141+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744954664222-yrvydn70n.jpg', NULL),
	(53, 'AAAAAAAAAAAAAA', NULL, 'dsdasd', '2025-04-28 13:39:00+00', NULL, 5.00, NULL, NULL, 5, 0, NULL, NULL, NULL, NULL, NULL, 'internal', NULL, '2025-04-18 08:22:24.749681+00', '2025-04-18 08:22:24.749681+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/1744964543027-9i3uc2.jpg', NULL),
	(54, 'AAAAAAAA', NULL, 'sdasd', '2025-04-30 13:59:00+00', NULL, 111.00, NULL, NULL, 11, 0, NULL, NULL, NULL, NULL, NULL, 'internal', NULL, '2025-04-18 08:29:25.445352+00', '2025-04-18 08:29:25.445352+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/1744964963898-7pb4mn.jpg', NULL),
	(55, 'sasasasasa', NULL, 'asaDS', '2025-04-29 14:01:00+00', NULL, 111.00, NULL, NULL, 1, 0, NULL, NULL, NULL, NULL, NULL, 'internal', NULL, '2025-04-18 08:32:11.306107+00', '2025-04-18 08:32:11.306107+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/1744965129673-frhd68.jpg', NULL);


--
-- Data for Name: trek_ad_hoc_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ad_hoc_expense_shares; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."comments" ("comment_id", "post_id", "user_id", "body", "created_at") VALUES
	(5, 1, 947, 'yo
 😊 ', '2025-04-16 03:02:27.102+00'),
	(6, 4, 947, 'hi
', '2025-04-16 03:50:11.218+00'),
	(7, 2, 947, 'hey', '2025-04-16 03:50:56.748+00'),
	(8, 1, 947, 'ho 😊 ', '2025-04-16 03:51:19.065+00'),
	(9, 4, 947, 'HI', '2025-04-17 12:41:15.208+00');


--
-- Data for Name: community_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: expense_sharing; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: logistics; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: packing_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."packing_items" ("item_id", "name") VALUES
	(11, 'Jerry Can'),
	(12, 'Sunglasses'),
	(13, 'Cap');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: packing_list_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: packing_list_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."registrations" ("registration_id", "user_id", "trek_id", "booking_datetime", "payment_status", "cancellation_datetime", "penalty_applied", "created_at") VALUES
	(1, 947, 1, '2025-04-14 15:07:38.471+00', 'Pending', NULL, NULL, '2025-04-14 15:07:40.338045+00'),
	(2, 947, 2, '2025-04-15 19:04:25.571+00', 'Pending', NULL, NULL, '2025-04-15 19:04:26.776047+00'),
	(3, 947, 4, '2025-04-16 03:49:59.92+00', 'Pending', NULL, NULL, '2025-04-16 03:50:00.533794+00');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."roles" ("role_id", "role_name", "description") VALUES
	(1, 'Admin', 'Full site control, user management, trek/event oversight'),
	(2, 'Moderator', 'Manage treks, moderate discussions, handle reports'),
	(3, 'Trekker', 'Regular user, can join treks, comment, and participate');


--
-- Data for Name: roles_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--



--
-- Data for Name: subscriptions_billing; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: trek_admin_approved_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: trek_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."trek_expenses" ("id", "trek_id", "title", "amount", "type", "created_by", "created_at") VALUES
	(1, 15, 'Trek Fee', 100, NULL, NULL, '2025-04-17 13:28:23.409409+00'),
	(2, 16, 'Trek Fee', 100, NULL, NULL, '2025-04-17 13:32:26.357842+00'),
	(3, 17, 'Trek Fee', 100, NULL, NULL, '2025-04-17 13:41:52.483687+00'),
	(4, 18, 'Trek Fee', 100, NULL, NULL, '2025-04-17 13:44:07.962516+00'),
	(5, 19, 'Trek Fee', 100, NULL, NULL, '2025-04-17 13:49:16.06951+00'),
	(6, 20, 'Trek Fee', 100, NULL, NULL, '2025-04-17 13:51:17.516672+00'),
	(7, 21, 'Trek Fee', 100, NULL, NULL, '2025-04-17 13:53:06.787582+00'),
	(8, 22, 'Trek Fee', 100, NULL, NULL, '2025-04-17 13:53:58.794713+00'),
	(9, 23, 'Trek Fee', 100, NULL, NULL, '2025-04-17 14:05:13.16412+00'),
	(10, 24, 'Trek Fee', 100, NULL, NULL, '2025-04-17 14:08:49.989175+00'),
	(11, 25, 'Trek Fee', 100, NULL, NULL, '2025-04-17 14:09:50.499767+00'),
	(12, 26, 'Trek Fee', 100, NULL, NULL, '2025-04-17 14:11:37.249009+00'),
	(13, 27, 'Fee', 111, NULL, NULL, '2025-04-17 15:09:43.431075+00'),
	(14, 28, 'sdf', 1212, NULL, NULL, '2025-04-17 15:19:22.217265+00'),
	(15, 29, 'sdf', 1212, NULL, NULL, '2025-04-17 15:20:50.519733+00'),
	(16, 30, 'aaaa', 111111, NULL, NULL, '2025-04-17 15:26:29.116156+00'),
	(17, 31, 'aaaa', 111111, NULL, NULL, '2025-04-17 15:28:41.164491+00'),
	(18, 32, 'aaaa', 111111, NULL, NULL, '2025-04-17 15:34:28.564077+00'),
	(19, 33, 'ss', 344, NULL, NULL, '2025-04-17 15:35:48.586677+00'),
	(20, 33, 'sadad', 11111, NULL, NULL, '2025-04-17 15:35:48.689389+00'),
	(21, 34, 'ss', 344, NULL, NULL, '2025-04-17 15:42:21.050558+00'),
	(22, 34, 'sadad', 11111, NULL, NULL, '2025-04-17 15:42:21.18108+00'),
	(23, 35, 'ss', 344, NULL, NULL, '2025-04-17 16:07:38.192509+00'),
	(24, 35, 'sadad', 11111, NULL, NULL, '2025-04-17 16:07:38.339122+00'),
	(25, 36, 'dfgdg', 234324, NULL, NULL, '2025-04-17 16:09:55.140992+00'),
	(26, 37, 'ss', 121, NULL, NULL, '2025-04-17 17:03:27.902534+00'),
	(27, 38, 'Ass', 1111, NULL, NULL, '2025-04-17 17:09:30.747939+00'),
	(28, 39, 'aaa', 1111, NULL, NULL, '2025-04-17 17:19:00.609669+00'),
	(29, 40, 'aaa', 1111, NULL, NULL, '2025-04-17 17:28:22.588298+00'),
	(30, 41, 'as', 111, NULL, NULL, '2025-04-17 17:29:07.769319+00'),
	(31, 42, 'as', 111, NULL, NULL, '2025-04-17 17:39:45.920094+00'),
	(32, 43, 'sdad', 111, NULL, NULL, '2025-04-17 17:41:03.863812+00'),
	(33, 44, 'sdad', 111, NULL, NULL, '2025-04-17 17:43:17.342525+00'),
	(34, 45, 'sdad', 111, NULL, NULL, '2025-04-17 17:47:52.323182+00'),
	(35, 46, '1', 11, NULL, NULL, '2025-04-18 05:37:45.746603+00');


--
-- Data for Name: trek_fixed_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: trek_packing_lists; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_expense_penalties; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("full_name", "email", "password_hash", "phone_number", "address", "date_of_birth", "subscription_type", "id_verification_status", "health_data", "trekking_experience", "badges", "interests", "pet_details", "created_at", "updated_at", "user_id", "image_url") VALUES
	('Shreyas', 'shreyasmadhan82@gmail.com', 'handled_by_auth_system', '090-9988989809', 'kkkj 90980989', '1993-06-09', 'community', 'Pending', '"wqwd qw"', 'wqeqwe', NULL, '"wqeqweqw"', '"wqeqweqw"', '2025-04-10 19:44:49.247956+00', '2025-04-10 19:44:49.247956+00', '947bae31-4f04-436a-b4ff-7687c13aa31a', NULL);


--
-- Data for Name: votes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id") VALUES
	('user_verification_docs', 'User Verification Documents', NULL, '2025-04-10 18:11:43.330723+00', '2025-04-10 18:11:43.330723+00', false, false, NULL, NULL, NULL),
	('trek_route_files', 'Trek Route Files', NULL, '2025-04-10 18:11:43.330723+00', '2025-04-10 18:11:43.330723+00', true, false, NULL, NULL, NULL),
	('community_media', 'Community Media', NULL, '2025-04-10 18:11:43.330723+00', '2025-04-10 18:11:43.330723+00', true, false, NULL, NULL, NULL),
	('partner_docs', 'Partner Verification Documents', NULL, '2025-04-10 18:11:43.330723+00', '2025-04-10 18:11:43.330723+00', false, false, NULL, NULL, NULL),
	('expense_receipts', 'Expense Receipts', NULL, '2025-04-10 18:11:43.330723+00', '2025-04-10 18:11:43.330723+00', false, false, NULL, NULL, NULL),
	('trek-assets', 'trek-assets', NULL, '2025-04-15 17:11:29.227565+00', '2025-04-15 17:11:29.227565+00', true, false, NULL, NULL, NULL);


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") VALUES
	('353a6822-e6bd-43ec-b40f-3e8d4f7295ec', 'trek-assets', 'trek-images/1744749344549-xhh0af1nk.webp', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-15 20:35:46.601509+00', '2025-04-15 20:35:46.601509+00', '2025-04-15 20:35:46.601509+00', '{"eTag": "\"0d4cd62ec0e73d4d8a33f957f2b97331\"", "size": 430930, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2025-04-15T20:35:47.000Z", "contentLength": 430930, "httpStatusCode": 200}', '130fe1fa-5e67-4255-9fe2-1a654d618232', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('c54ce369-fca3-4e56-95bb-9989982eb46e', 'trek-assets', 'trek-images/1744898987639-ouo7xw6cu.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 14:09:49.694919+00', '2025-04-17 14:09:49.694919+00', '2025-04-17 14:09:49.694919+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T14:09:50.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'f11b4f63-115f-4986-891d-496955141a9e', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('521860ed-2937-42ca-af98-7a9f09d11ac7', 'trek-assets', 'trek-images/1744772467804-y0uhyn41z.webp', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-16 03:01:09.360196+00', '2025-04-16 03:01:09.360196+00', '2025-04-16 03:01:09.360196+00', '{"eTag": "\"0d4cd62ec0e73d4d8a33f957f2b97331\"", "size": 430930, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2025-04-16T03:01:10.000Z", "contentLength": 430930, "httpStatusCode": 200}', '4706e4a9-fe73-4cbb-8885-19eb7a750bc7', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('65b02b07-3303-4235-94f0-8bd2d86c9175', 'trek-assets', 'trek-images/1744887292658-huhne301k.webp', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 10:54:54.314367+00', '2025-04-17 10:54:54.314367+00', '2025-04-17 10:54:54.314367+00', '{"eTag": "\"0d4cd62ec0e73d4d8a33f957f2b97331\"", "size": 430930, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T10:54:55.000Z", "contentLength": 430930, "httpStatusCode": 200}', '61b594b3-410a-4033-8e9b-b13e5489ee61', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('c401f2f0-f432-481b-9cc6-42af9b659528', 'trek-assets', 'trek-gpx/1744898988727-ocm3qv1gf.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 14:09:50.189851+00', '2025-04-17 14:09:50.189851+00', '2025-04-17 14:09:50.189851+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T14:09:51.000Z", "contentLength": 158600, "httpStatusCode": 200}', '1564c293-7520-4776-aa79-082d1c8bd77b', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('819e246e-9ecc-4692-a3cf-03034bcad9a4', 'trek-assets', 'trek-gpx/1744887293725-ap2qxnshq.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 10:54:54.744631+00', '2025-04-17 10:54:54.744631+00', '2025-04-17 10:54:54.744631+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T10:54:55.000Z", "contentLength": 158600, "httpStatusCode": 200}', '8604b5d1-d29a-4d37-b5bc-8fb4185d457a', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('1f08398d-21f8-450f-87ff-90ea1cfb1876', 'trek-assets', 'trek-images/1744887306644-ngf511y21.webp', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 10:55:08.069859+00', '2025-04-17 10:55:08.069859+00', '2025-04-17 10:55:08.069859+00', '{"eTag": "\"0d4cd62ec0e73d4d8a33f957f2b97331\"", "size": 430930, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T10:55:08.000Z", "contentLength": 430930, "httpStatusCode": 200}', 'ffec9186-5c5b-4845-baac-0af647d1b2cd', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('29ac73c3-5a27-4764-99b3-948ab856107f', 'trek-assets', 'trek-images/1744899094877-7etqnqobr.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 14:11:36.366198+00', '2025-04-17 14:11:36.366198+00', '2025-04-17 14:11:36.366198+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T14:11:37.000Z", "contentLength": 174226, "httpStatusCode": 200}', '0c54d7b5-21fd-4bb0-b5d9-c0833bf3db7c', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('6c14712d-89fb-4899-a28e-c765b71d694e', 'trek-assets', 'trek-gpx/1744887307501-r7sff4mz9.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 10:55:08.71443+00', '2025-04-17 10:55:08.71443+00', '2025-04-17 10:55:08.71443+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T10:55:09.000Z", "contentLength": 158600, "httpStatusCode": 200}', '13887da2-7211-48b3-a125-73967180be1d', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('c86bed07-4bb3-4853-ba01-785e3b4b3d7c', 'trek-assets', 'trek-images/1744887819616-hob1557r1.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 11:03:40.976323+00', '2025-04-17 11:03:40.976323+00', '2025-04-17 11:03:40.976323+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T11:03:41.000Z", "contentLength": 174226, "httpStatusCode": 200}', '645ca5a3-87b2-45ff-9669-1aeb83687df8', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('4fd8b021-4036-4c8d-b2fa-90ae909d02f1', 'trek-assets', 'trek-gpx/1744887820368-bmgwgnaks.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 11:03:41.50974+00', '2025-04-17 11:03:41.50974+00', '2025-04-17 11:03:41.50974+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T11:03:42.000Z", "contentLength": 158600, "httpStatusCode": 200}', 'd8d266bd-186b-4bc3-9250-976c3a2eeae6', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('ffeadf95-aaf0-446a-94aa-121aa6db32cb', 'trek-assets', 'trek-images/1744888319738-etcoyvr9u.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 11:12:01.010397+00', '2025-04-17 11:12:01.010397+00', '2025-04-17 11:12:01.010397+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T11:12:01.000Z", "contentLength": 174226, "httpStatusCode": 200}', '8c5c549e-8c6b-418e-a2bb-5e49fbdf246e', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('5c7276d4-6291-4ccb-8fe7-5fed401508b6', 'trek-assets', 'trek-gpx/1744888320592-p92hnk745.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 11:12:02.132251+00', '2025-04-17 11:12:02.132251+00', '2025-04-17 11:12:02.132251+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T11:12:02.000Z", "contentLength": 158600, "httpStatusCode": 200}', '3c98ce9c-0930-4a06-96b0-865bbcd82180', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('a5cf58a8-8fd7-4559-b71d-1749508593f0', 'trek-assets', 'trek-gpx/1744899095478-4fjdwn5ej.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 14:11:36.9832+00', '2025-04-17 14:11:36.9832+00', '2025-04-17 14:11:36.9832+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T14:11:37.000Z", "contentLength": 158600, "httpStatusCode": 200}', '2853ac07-2377-4d1a-92bd-543639b6627a', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('5a42f69c-52af-4e69-aa54-e95d527cec85', 'trek-assets', 'trek-images/1744888403766-2d6psy31k.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 11:13:25.327058+00', '2025-04-17 11:13:25.327058+00', '2025-04-17 11:13:25.327058+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T11:13:26.000Z", "contentLength": 174226, "httpStatusCode": 200}', '18b9d273-ff1c-4d87-98ce-682879f03d65', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('f5d47cca-8e9b-4984-b312-f0063c6e4f59', 'trek-assets', 'trek-images/1744904538329-htbpdfsk9.png', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 15:42:20.469621+00', '2025-04-17 15:42:20.469621+00', '2025-04-17 15:42:20.469621+00', '{"eTag": "\"b9d3c6db530290dc22544126631f77f4\"", "size": 1414229, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T15:42:21.000Z", "contentLength": 1414229, "httpStatusCode": 200}', '8aa39270-b8da-4695-963a-320a43ffb92f', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('54bcaadc-d8e6-4b13-baef-561294be22ff', 'trek-assets', 'trek-gpx/1744888404710-zt17u83o1.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 11:13:25.868748+00', '2025-04-17 11:13:25.868748+00', '2025-04-17 11:13:25.868748+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T11:13:26.000Z", "contentLength": 158600, "httpStatusCode": 200}', '6994965a-7d73-44d0-8e41-8dc262763a13', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('69c1460d-fdad-43ac-8943-38e337e688e3', 'trek-assets', 'trek-images/1744888754353-opcy35aqw.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 11:19:15.603998+00', '2025-04-17 11:19:15.603998+00', '2025-04-17 11:19:15.603998+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T11:19:16.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'e768a87d-f676-40ce-abfb-aef9bacb17f4', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('726492ac-9812-4e93-abe6-57e04f319e27', 'trek-assets', 'trek-gpx/1744904539313-wqpwh1cgw.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 15:42:20.821545+00', '2025-04-17 15:42:20.821545+00', '2025-04-17 15:42:20.821545+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T15:42:21.000Z", "contentLength": 158600, "httpStatusCode": 200}', '8d1516de-f3b3-4373-9986-ded8745e9b95', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('f1e66266-cfb9-4644-bf57-15d5912bc485', 'trek-assets', 'trek-gpx/1744888754979-idgzpw67w.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 11:19:15.979436+00', '2025-04-17 11:19:15.979436+00', '2025-04-17 11:19:15.979436+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T11:19:16.000Z", "contentLength": 158600, "httpStatusCode": 200}', '657b9c54-7713-4150-b7c9-39dd589b136d', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('3e5de209-8553-4bdd-9beb-422cfdbb06f2', 'trek-assets', 'trek-images/1744909405540-hyp9tjr0r.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:03:27.286255+00', '2025-04-17 17:03:27.286255+00', '2025-04-17 17:03:27.286255+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:03:28.000Z", "contentLength": 174226, "httpStatusCode": 200}', '055c6fd8-8e86-48b8-bfd6-3a97bf375ca7', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('6de70c52-9cc6-498e-a1e3-56b0c9e6b962', 'trek-assets', 'trek-images/1744889201550-5p4rj16yg.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 11:26:42.709688+00', '2025-04-17 11:26:42.709688+00', '2025-04-17 11:26:42.709688+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T11:26:43.000Z", "contentLength": 174226, "httpStatusCode": 200}', '8cbd1f4d-4969-4976-bca6-a39549be0229', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('8f94b75c-f6d2-4de8-8430-367d144429b2', 'trek-assets', 'trek-gpx/1744889202066-ya4may1oz.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 11:26:43.107792+00', '2025-04-17 11:26:43.107792+00', '2025-04-17 11:26:43.107792+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T11:26:43.000Z", "contentLength": 158600, "httpStatusCode": 200}', '22e17f87-ff52-48f5-a343-2aa710815f9c', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('dc9819de-cc9e-4ad1-9fae-983e301cd24e', 'trek-assets', 'trek-images/1744889424902-qgtjm3k6a.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 11:30:26.111506+00', '2025-04-17 11:30:26.111506+00', '2025-04-17 11:30:26.111506+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T11:30:26.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'aa2c4a83-d5fc-4233-8272-ef0b96e4503e', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('2463bc30-862d-4714-ac39-d76750818a92', 'trek-assets', 'trek-gpx/1744889425540-5i2xl76pv.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 11:30:26.517897+00', '2025-04-17 11:30:26.517897+00', '2025-04-17 11:30:26.517897+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T11:30:27.000Z", "contentLength": 158600, "httpStatusCode": 200}', 'b491785d-5862-4a7b-957a-722e9858efe4', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('7c8039ab-dcdd-469c-8207-ad41268ecf3b', 'trek-assets', 'trek-images/1744890533962-fmu2uyizw.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 11:48:55.141631+00', '2025-04-17 11:48:55.141631+00', '2025-04-17 11:48:55.141631+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T11:48:55.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'd496e969-fd2b-4ece-81be-23ab7f6500b4', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('ae8d526b-2bb4-4e71-9041-8df790ff98a2', 'trek-assets', 'trek-gpx/1744890534448-9eloky5zs.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 11:48:55.532366+00', '2025-04-17 11:48:55.532366+00', '2025-04-17 11:48:55.532366+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T11:48:56.000Z", "contentLength": 158600, "httpStatusCode": 200}', 'd922823f-5a5d-44ce-96fc-c27ce2db5402', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('c251cbf3-8d4c-4bba-9d7d-1a914aefdb0f', 'trek-assets', 'trek-images/1744891451656-7opgo2tdi.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 12:04:12.901664+00', '2025-04-17 12:04:12.901664+00', '2025-04-17 12:04:12.901664+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T12:04:13.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'a801b738-d540-474b-924e-f45f1222daa1', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('832fde5b-ea7d-4c47-a4f0-6afab9e60d3d', 'trek-assets', 'trek-images/1744902580282-8csbtqebq.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 15:09:42.323631+00', '2025-04-17 15:09:42.323631+00', '2025-04-17 15:09:42.323631+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T15:09:43.000Z", "contentLength": 174226, "httpStatusCode": 200}', '9688edf2-3a9f-4416-ba98-8684745e64c2', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('42492719-caef-4329-ba82-d840f4e3ed17', 'trek-assets', 'trek-gpx/1744891452170-i3kvr2k40.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 12:04:13.357709+00', '2025-04-17 12:04:13.357709+00', '2025-04-17 12:04:13.357709+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T12:04:14.000Z", "contentLength": 158600, "httpStatusCode": 200}', '3e9d24f5-88e4-43a7-b90f-23fde7bc765a', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('ba78d5a9-5698-459b-a4e8-89759e1533dd', 'trek-assets', 'trek-images/1744892582676-yspqx522c.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 12:23:03.986654+00', '2025-04-17 12:23:03.986654+00', '2025-04-17 12:23:03.986654+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T12:23:04.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'a6402499-a000-444d-959e-1539ed6ac657', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('71457531-c91a-4835-bab2-7554c9df0a7b', 'trek-assets', 'trek-gpx/1744902581373-rs3b0o6wy.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 15:09:42.916199+00', '2025-04-17 15:09:42.916199+00', '2025-04-17 15:09:42.916199+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T15:09:43.000Z", "contentLength": 158600, "httpStatusCode": 200}', '30f5aa21-c751-4ca6-8620-5a828921d6fe', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('9cb88743-c8a7-45f5-ad15-e06702984f04', 'trek-assets', 'trek-gpx/1744892583226-lvbvqhqpx.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 12:23:04.48841+00', '2025-04-17 12:23:04.48841+00', '2025-04-17 12:23:04.48841+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T12:23:05.000Z", "contentLength": 158600, "httpStatusCode": 200}', '2493ef08-df6d-4723-8ef3-6ed8dedd4db3', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('f0350dd2-1187-4f6f-90d8-7e433d12fd3f', 'trek-assets', 'trek-images/1744893813667-lqa3jbldf.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 12:43:35.388272+00', '2025-04-17 12:43:35.388272+00', '2025-04-17 12:43:35.388272+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T12:43:36.000Z", "contentLength": 174226, "httpStatusCode": 200}', '5adf88a8-a6c6-46c9-91c3-2fac2533bfdf', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('fdd86ac1-9de1-4729-ba89-218c26947ead', 'trek-assets', 'trek-images/1744906055104-ftnb1t59c.png', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 16:07:37.47752+00', '2025-04-17 16:07:37.47752+00', '2025-04-17 16:07:37.47752+00', '{"eTag": "\"b9d3c6db530290dc22544126631f77f4\"", "size": 1414229, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T16:07:38.000Z", "contentLength": 1414229, "httpStatusCode": 200}', 'c19b0a71-097c-4451-89cf-8667ea9167b3', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('bc203627-13d3-4785-9b30-ebf2ba4607b3', 'trek-assets', 'trek-gpx/1744893814588-jgpwjla6o.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 12:43:35.772196+00', '2025-04-17 12:43:35.772196+00', '2025-04-17 12:43:35.772196+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T12:43:36.000Z", "contentLength": 158600, "httpStatusCode": 200}', 'cf8418ff-2d06-4b2e-b7b3-443b7411f0ef', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('02270eb4-0867-49c7-aea6-219468964002', 'trek-assets', 'trek-images/1744895092343-9hm2i229b.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:04:53.890742+00', '2025-04-17 13:04:53.890742+00', '2025-04-17 13:04:53.890742+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:04:54.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'c21abee8-1fbd-4824-a4ce-ee4f5f44d856', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('57c094a5-8351-42be-8cc1-b529545dd51c', 'trek-assets', 'trek-gpx/1744895093109-e0hw62pse.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:04:54.432435+00', '2025-04-17 13:04:54.432435+00', '2025-04-17 13:04:54.432435+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:04:55.000Z", "contentLength": 158600, "httpStatusCode": 200}', 'abd9a45c-92c2-4b66-b1d9-7d4f6218052c', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('169b237f-d124-423c-b59b-e18e959fbb88', 'trek-assets', 'trek-images/1744895667090-2aejw2759.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:14:28.367531+00', '2025-04-17 13:14:28.367531+00', '2025-04-17 13:14:28.367531+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:14:29.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'd3eead51-2fa6-4c50-9916-98536e50a34c', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('cac3c85f-b848-4f2e-b52c-3d3ce4ddf121', 'trek-assets', 'trek-gpx/1744895667520-fonslpoty.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:14:28.767184+00', '2025-04-17 13:14:28.767184+00', '2025-04-17 13:14:28.767184+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:14:29.000Z", "contentLength": 158600, "httpStatusCode": 200}', '8ef7eaa1-4393-42ea-9269-4900112b79d6', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('75f713c4-46f8-4889-94fd-38525fac60a2', 'trek-assets', 'trek-images/1744895727865-8c8pr1gg3.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:15:29.418141+00', '2025-04-17 13:15:29.418141+00', '2025-04-17 13:15:29.418141+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:15:30.000Z", "contentLength": 174226, "httpStatusCode": 200}', '6ca752bc-e895-49db-b206-0d3a5782d92b', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('502efd41-227b-4c7f-a333-b0cae9ce6b13', 'trek-assets', 'trek-images/1744903159390-gglytzw45.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 15:19:21.457933+00', '2025-04-17 15:19:21.457933+00', '2025-04-17 15:19:21.457933+00', '{"eTag": "\"dc3ec68847d796e83f713d6bc1cfdd40\"", "size": 332259, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T15:19:22.000Z", "contentLength": 332259, "httpStatusCode": 200}', '07d80b47-09f2-4945-979d-679c01c31bee', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('a085394c-4bc2-4978-9bb5-8df773d58c50', 'trek-assets', 'trek-gpx/1744895728568-lta5cptbc.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:15:30.104169+00', '2025-04-17 13:15:30.104169+00', '2025-04-17 13:15:30.104169+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:15:30.000Z", "contentLength": 158600, "httpStatusCode": 200}', '8479ee74-6eba-461b-a27c-7b74a76f5885', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('f83399d4-b382-41d9-bf02-61b2300c03fc', 'trek-assets', 'trek-images/1744896501250-rscny4s9l.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:28:22.680678+00', '2025-04-17 13:28:22.680678+00', '2025-04-17 13:28:22.680678+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:28:23.000Z", "contentLength": 174226, "httpStatusCode": 200}', '7acf4897-b312-4cb3-b117-d155b2f802ae', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('ea3be7cd-0012-42f8-b472-18d2dcafb635', 'trek-assets', 'trek-gpx/1744903160346-hcjdwncav.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 15:19:21.872321+00', '2025-04-17 15:19:21.872321+00', '2025-04-17 15:19:21.872321+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T15:19:22.000Z", "contentLength": 158600, "httpStatusCode": 200}', '40cb8456-32d3-4cb4-84c6-e3871e012ed5', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('406d7cfb-46a0-457a-a226-14424fa9037b', 'trek-assets', 'trek-gpx/1744896501804-dgdihqke8.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:28:23.131807+00', '2025-04-17 13:28:23.131807+00', '2025-04-17 13:28:23.131807+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:28:24.000Z", "contentLength": 158600, "httpStatusCode": 200}', '61f17bde-78d9-4dd4-97b0-dc4dd68608be', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('f5cd4bb6-7769-44f9-a4dc-14f5dd55aff2', 'trek-assets', 'trek-images/1744896744059-dkbn6wj08.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:32:25.462496+00', '2025-04-17 13:32:25.462496+00', '2025-04-17 13:32:25.462496+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:32:26.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'cd45227e-aecc-41bf-909a-cf014b56d602', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('8e45907d-74cc-466f-80d5-57aa01f46bb9', 'trek-assets', 'trek-images/1744903248228-ru0x8y31e.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 15:20:49.922706+00', '2025-04-17 15:20:49.922706+00', '2025-04-17 15:20:49.922706+00', '{"eTag": "\"dc3ec68847d796e83f713d6bc1cfdd40\"", "size": 332259, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T15:20:50.000Z", "contentLength": 332259, "httpStatusCode": 200}', '51eb4c85-7f7b-403e-a30d-fc2c24a2f75d', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('357fb5f4-de26-4cfa-9de7-1ab14bc39c56', 'trek-assets', 'trek-gpx/1744896744579-el961quck.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:32:25.947321+00', '2025-04-17 13:32:25.947321+00', '2025-04-17 13:32:25.947321+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:32:26.000Z", "contentLength": 158600, "httpStatusCode": 200}', 'e1eaf237-6ecf-431e-a71e-783f7785d896', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('d227d800-56b7-4ef6-969c-1f65b3de8ad8', 'trek-assets', 'trek-images/1744897310252-dzh8fejbi.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:41:51.572229+00', '2025-04-17 13:41:51.572229+00', '2025-04-17 13:41:51.572229+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:41:52.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'f9bd3262-238a-4ced-80fd-c9816ca430ae', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('eab609da-0c77-416a-9548-2e78fe7ca06a', 'trek-assets', 'trek-gpx/1744897310663-zkemlm01p.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:41:52.23419+00', '2025-04-17 13:41:52.23419+00', '2025-04-17 13:41:52.23419+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:41:53.000Z", "contentLength": 158600, "httpStatusCode": 200}', 'cf910ca5-43b6-4e8b-bc1e-1d1aaaa77fa1', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('5df1ccae-920e-45bc-8493-31530d69e154', 'trek-assets', 'trek-images/1744897445401-os0aq644r.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:44:07.172213+00', '2025-04-17 13:44:07.172213+00', '2025-04-17 13:44:07.172213+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:44:08.000Z", "contentLength": 174226, "httpStatusCode": 200}', '0223c85e-2230-4b60-8bab-0d25b30a15f1', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('ecbc5e28-157a-4ca0-a0cb-617261138a1f', 'trek-assets', 'trek-gpx/1744897446244-dtmakh0j7.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:44:07.686988+00', '2025-04-17 13:44:07.686988+00', '2025-04-17 13:44:07.686988+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:44:08.000Z", "contentLength": 158600, "httpStatusCode": 200}', '3ead97ad-6f32-4ab9-9d2f-e5735e05ff47', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('6ab55cce-44ab-4c32-88d1-2d5e6fb98eb7', 'trek-assets', 'trek-gpx/1744903248832-b3ttttqkf.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 15:20:50.278131+00', '2025-04-17 15:20:50.278131+00', '2025-04-17 15:20:50.278131+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T15:20:51.000Z", "contentLength": 158600, "httpStatusCode": 200}', 'c16bed7e-eff5-4031-9d06-d348c0cfb926', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('784c08bc-bc69-44d2-959d-f69cc2fb15f7', 'trek-assets', 'trek-images/1744897754041-ceonm5jy5.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:49:15.451751+00', '2025-04-17 13:49:15.451751+00', '2025-04-17 13:49:15.451751+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:49:16.000Z", "contentLength": 174226, "httpStatusCode": 200}', '400ad7d4-87db-4f43-8390-f19b178fe6f2', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('40f95ab4-417f-4dbf-bac1-408f8496bcf2', 'trek-assets', 'trek-gpx/1744906056293-8u5jduglv.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 16:07:37.906304+00', '2025-04-17 16:07:37.906304+00', '2025-04-17 16:07:37.906304+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T16:07:38.000Z", "contentLength": 158600, "httpStatusCode": 200}', '632c7f8a-4a32-4a26-82db-75f49ad21b32', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('9d5eb094-989c-45ef-8ffd-d6663cddae65', 'trek-assets', 'trek-gpx/1744897754517-99nwevbrv.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:49:15.823312+00', '2025-04-17 13:49:15.823312+00', '2025-04-17 13:49:15.823312+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:49:16.000Z", "contentLength": 158600, "httpStatusCode": 200}', '117fd1b9-f883-4eae-bd97-d4ba507b245d', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('a79a848b-1221-486b-a6fe-dec3d9bc25e9', 'trek-assets', 'trek-images/1744897875403-gj0d0zybn.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:51:16.855701+00', '2025-04-17 13:51:16.855701+00', '2025-04-17 13:51:16.855701+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:51:17.000Z", "contentLength": 174226, "httpStatusCode": 200}', '00ae63fd-7a0a-4594-b011-a3f20e448928', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('521db602-a1a0-40b4-ac36-8d5a3e9f71a7', 'trek-assets', 'trek-images/1744906192376-zx3jbancb.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 16:09:54.432702+00', '2025-04-17 16:09:54.432702+00', '2025-04-17 16:09:54.432702+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T16:09:55.000Z", "contentLength": 174226, "httpStatusCode": 200}', '222e7084-5e34-4892-89e6-bb0e813e0247', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('1781f8fd-f094-4bf0-9da4-8c34c4c3a882', 'trek-assets', 'trek-gpx/1744897875949-13p3gszjh.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:51:17.289648+00', '2025-04-17 13:51:17.289648+00', '2025-04-17 13:51:17.289648+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:51:18.000Z", "contentLength": 158600, "httpStatusCode": 200}', '306d07ad-3471-4e3c-a92c-8d8601dd03a5', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('1094198a-98c1-4620-adee-896a3d5cf4c4', 'trek-assets', 'trek-images/1744897984699-uiswa9a30.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:53:06.175017+00', '2025-04-17 13:53:06.175017+00', '2025-04-17 13:53:06.175017+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:53:07.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'efbc535e-0939-44b0-8704-7b4cd59b2e37', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('c8f965e3-e8ff-4fb8-911a-8fde2cc8f049', 'trek-assets', 'trek-gpx/1744906193226-mpyhank1d.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 16:09:54.784603+00', '2025-04-17 16:09:54.784603+00', '2025-04-17 16:09:54.784603+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T16:09:55.000Z", "contentLength": 158600, "httpStatusCode": 200}', '5325fb0f-d256-43e6-9fe0-588e140c01df', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('e225fbb3-0ae7-4ee4-a711-9c56a9b2f891', 'trek-assets', 'trek-gpx/1744897985234-pyovce3xt.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:53:06.552837+00', '2025-04-17 13:53:06.552837+00', '2025-04-17 13:53:06.552837+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:53:07.000Z", "contentLength": 158600, "httpStatusCode": 200}', 'ca32335c-7876-4be6-94e8-1e1cd602e44d', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('e926734e-c2a1-4456-b588-e9e7e776402c', 'trek-assets', 'trek-images/1744898036393-3a4ormcmz.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:53:58.024692+00', '2025-04-17 13:53:58.024692+00', '2025-04-17 13:53:58.024692+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:53:58.000Z", "contentLength": 174226, "httpStatusCode": 200}', '9709f2a5-2b7f-454c-bac3-b71e579831a4', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('8def4113-6903-4e49-9cab-4d74117e6643', 'trek-assets', 'trek-gpx/1744898037092-jdy2myukq.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 13:53:58.500051+00', '2025-04-17 13:53:58.500051+00', '2025-04-17 13:53:58.500051+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T13:53:59.000Z", "contentLength": 158600, "httpStatusCode": 200}', '3c4c8ea2-839c-423c-b96e-75a25b72fa4d', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('f102cc44-0ef8-40e6-b72e-53f5729e836c', 'trek-assets', 'trek-images/1744898710848-jmvrvxhap.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 14:05:12.315318+00', '2025-04-17 14:05:12.315318+00', '2025-04-17 14:05:12.315318+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T14:05:13.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'c220e132-eade-4f45-af74-700a82046c44', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('7f69ba56-2bd6-4272-92a8-c4688f259f8c', 'trek-assets', 'trek-gpx/1744898711366-zl7ks4j5c.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 14:05:12.846774+00', '2025-04-17 14:05:12.846774+00', '2025-04-17 14:05:12.846774+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T14:05:13.000Z", "contentLength": 158600, "httpStatusCode": 200}', '00803683-d4f4-487a-9b58-0b2049792efe', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('cac98254-762b-469a-9948-55814ebc0173', 'trek-assets', 'trek-images/1744898927773-9xkiph9po.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 14:08:49.288792+00', '2025-04-17 14:08:49.288792+00', '2025-04-17 14:08:49.288792+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T14:08:50.000Z", "contentLength": 174226, "httpStatusCode": 200}', '847a2926-1c45-4979-a080-125d8d8fbe38', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('af490074-816d-44b5-a007-903fa407e805', 'trek-assets', 'trek-images/1744903586709-if20csric.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 15:26:28.339768+00', '2025-04-17 15:26:28.339768+00', '2025-04-17 15:26:28.339768+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T15:26:29.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'a3ddae3f-eb0d-40b7-8c01-d6a9304a43d0', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('19b46dd1-8406-48f0-8e27-9244fc1c1ab8', 'trek-assets', 'trek-gpx/1744898928338-1imm6un53.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 14:08:49.746618+00', '2025-04-17 14:08:49.746618+00', '2025-04-17 14:08:49.746618+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T14:08:50.000Z", "contentLength": 158600, "httpStatusCode": 200}', 'c4045003-6850-422a-8461-7bbaa75ef41c', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('56cd4113-1260-47bc-a855-7a1c967a5610', 'trek-assets', 'trek-gpx/1744903587257-0re80xepa.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 15:26:28.845883+00', '2025-04-17 15:26:28.845883+00', '2025-04-17 15:26:28.845883+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T15:26:29.000Z", "contentLength": 158600, "httpStatusCode": 200}', 'bdf96383-3272-4c72-aa24-8de3a3d29f1a', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('e8f6c68b-6a21-44bf-b45c-f6d9631b602c', 'trek-assets', 'trek-images/1744903718948-5oheu4tgl.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 15:28:40.558146+00', '2025-04-17 15:28:40.558146+00', '2025-04-17 15:28:40.558146+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T15:28:41.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'd9c6d3b0-85c6-4ecf-a173-33e5531375e2', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('87da94d5-4ceb-4358-9295-50b3d9920900', 'trek-assets', 'trek-gpx/1744903719429-43kp5h6kh.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 15:28:40.956517+00', '2025-04-17 15:28:40.956517+00', '2025-04-17 15:28:40.956517+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T15:28:41.000Z", "contentLength": 158600, "httpStatusCode": 200}', '68420844-6fb2-41b6-8e64-75e85c8739c3', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('1ca50d06-289c-46fc-ade4-72c17d189215', 'trek-assets', 'trek-images/1744904066073-0gtxg0vm7.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 15:34:27.907068+00', '2025-04-17 15:34:27.907068+00', '2025-04-17 15:34:27.907068+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T15:34:28.000Z", "contentLength": 174226, "httpStatusCode": 200}', '2140f767-af9d-4ccc-a14e-c30cc91905fe', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('ee4d9d17-9093-4942-81b1-9a27c9de97d1', 'trek-assets', 'trek-gpx/1744904066766-ixl4m45xv.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 15:34:28.357384+00', '2025-04-17 15:34:28.357384+00', '2025-04-17 15:34:28.357384+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T15:34:29.000Z", "contentLength": 158600, "httpStatusCode": 200}', 'b95332a7-e2b8-4d89-b033-a908e387efb2', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('4cc1622f-a37c-4217-928c-6b594f7480e3', 'trek-assets', 'trek-images/1744904145403-sb5162pk1.png', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 15:35:47.870782+00', '2025-04-17 15:35:47.870782+00', '2025-04-17 15:35:47.870782+00', '{"eTag": "\"b9d3c6db530290dc22544126631f77f4\"", "size": 1414229, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T15:35:48.000Z", "contentLength": 1414229, "httpStatusCode": 200}', '12fe254a-4f81-4499-bbe7-b146af4a6d14', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('d81b0810-ea9a-4772-9a2a-6cf3d7d021f2', 'trek-assets', 'trek-gpx/1744904146775-2gbk5pvmo.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 15:35:48.301628+00', '2025-04-17 15:35:48.301628+00', '2025-04-17 15:35:48.301628+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T15:35:49.000Z", "contentLength": 158600, "httpStatusCode": 200}', '73b9aac4-4c8a-40ec-ac2a-318f052eab17', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('0ce571ab-790d-4c34-8977-ce539126cc88', 'trek-assets', 'trek-gpx/1744909405975-9y6whh06g.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:03:27.57183+00', '2025-04-17 17:03:27.57183+00', '2025-04-17 17:03:27.57183+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:03:28.000Z", "contentLength": 158600, "httpStatusCode": 200}', 'fe3ac816-1313-4d71-bfe9-3bb847620819', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('d5417eee-7aa7-4d3a-8e4f-90744b3a97e5', 'trek-assets', 'trek-images/1744909768065-c4346a68y.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:09:29.936668+00', '2025-04-17 17:09:29.936668+00', '2025-04-17 17:09:29.936668+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:09:30.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'deeb7fc6-5fb8-4acd-86f2-4c3dac1e3a57', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('0c7e4603-e731-4534-ae76-e09bc09e63f6', 'trek-assets', 'trek-gpx/1744909768613-mhie6psgt.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:09:30.371236+00', '2025-04-17 17:09:30.371236+00', '2025-04-17 17:09:30.371236+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:09:31.000Z", "contentLength": 158600, "httpStatusCode": 200}', '6765a710-f1c0-4774-9efc-8486e65d0538', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('54d8868b-f4f5-41c0-a827-7e72cf6aa552', 'trek-assets', 'trek-images/1744910338009-4rfpwvr79.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:18:59.943091+00', '2025-04-17 17:18:59.943091+00', '2025-04-17 17:18:59.943091+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:19:00.000Z", "contentLength": 174226, "httpStatusCode": 200}', '7c5a6c0f-76d8-4393-b9f2-606ea01e8a28', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('79ac28f2-9b34-4b74-b010-54ad16201371', 'trek-assets', 'trek-gpx/1744910338607-1949r43ff.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:19:00.415762+00', '2025-04-17 17:19:00.415762+00', '2025-04-17 17:19:00.415762+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:19:01.000Z", "contentLength": 158600, "httpStatusCode": 200}', '6e1ee8eb-2ecc-4c06-b971-2eec52c5c251', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('01ceefbd-4ea7-43b2-8a3a-1f6c9b2f02fb', 'trek-assets', 'trek-images/1744910900004-vtcscuhv2.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:28:21.88576+00', '2025-04-17 17:28:21.88576+00', '2025-04-17 17:28:21.88576+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:28:22.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'da2be843-d4de-40a8-95cd-7044060b070c', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('233dd418-9e93-47ba-8eb0-543d7a143ae4', 'trek-assets', 'trek-gpx/1744910900533-t0dtu1kbf.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:28:22.27197+00', '2025-04-17 17:28:22.27197+00', '2025-04-17 17:28:22.27197+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:28:23.000Z", "contentLength": 158600, "httpStatusCode": 200}', '76c43445-359f-40c9-92ba-09212e73aa5d', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('e44a8590-8f79-4c20-9b58-6d32d0d68a9c', 'trek-assets', 'trek-images/1744910945277-faq7bn328.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:29:07.186832+00', '2025-04-17 17:29:07.186832+00', '2025-04-17 17:29:07.186832+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:29:08.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'acaec995-ca10-4a43-8f75-4a38b4cd4fd7', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('3542ebf4-1cf5-4250-afc7-b025891f893c', 'trek-assets', 'trek-gpx/1744910945832-swo1uyl5r.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:29:07.534112+00', '2025-04-17 17:29:07.534112+00', '2025-04-17 17:29:07.534112+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:29:08.000Z", "contentLength": 158600, "httpStatusCode": 200}', '78b6961a-6c05-4d66-aa1d-54b251d3e0cd', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('8e368b49-b6cf-4842-bf5c-7bc56656240e', 'trek-assets', 'trek-images/1744911582988-ov3d73rho.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:39:45.196914+00', '2025-04-17 17:39:45.196914+00', '2025-04-17 17:39:45.196914+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:39:45.000Z", "contentLength": 174226, "httpStatusCode": 200}', '3f09ce03-3dda-4d65-b207-168588baf7d0', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('b41dc040-341c-444a-9970-ff7c84ebfac3', 'trek-assets', 'trek-gpx/1744911583850-ahrv8vq0j.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:39:45.630893+00', '2025-04-17 17:39:45.630893+00', '2025-04-17 17:39:45.630893+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:39:46.000Z", "contentLength": 158600, "httpStatusCode": 200}', '84cea674-24a2-48ff-98df-9b8f8df51a66', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('28c8b394-c01b-4364-9c9f-51b1f0fb89e1', 'trek-assets', 'trek-images/1744911661027-1jvpgdci1.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:41:03.071037+00', '2025-04-17 17:41:03.071037+00', '2025-04-17 17:41:03.071037+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:41:03.000Z", "contentLength": 174226, "httpStatusCode": 200}', '624a7cc2-3b29-4824-8a63-5fddb63e5fb2', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('3dd16bcd-6c12-4dc3-bcb9-361050ec53cb', 'trek-assets', 'trek-gpx/1744911661723-2zlt0741x.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:41:03.638168+00', '2025-04-17 17:41:03.638168+00', '2025-04-17 17:41:03.638168+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:41:04.000Z", "contentLength": 158600, "httpStatusCode": 200}', 'a5833045-da10-4c38-8d9d-7073a7f4e10d', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('f12227f4-5045-46bd-8323-a25cc892274f', 'trek-assets', 'trek-images/1744911793308-elqu6wzxs.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:43:16.700727+00', '2025-04-17 17:43:16.700727+00', '2025-04-17 17:43:16.700727+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:43:17.000Z", "contentLength": 174226, "httpStatusCode": 200}', '494a5cd9-52ab-4b49-a81e-603d4c7f4840', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('84baa81a-fc6b-4ac6-85ca-435b5772f338', 'trek-assets', 'trek-gpx/1744911795318-7pptlmc72.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:43:17.124265+00', '2025-04-17 17:43:17.124265+00', '2025-04-17 17:43:17.124265+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:43:18.000Z", "contentLength": 158600, "httpStatusCode": 200}', 'd20b2b6e-2beb-4e5f-bc0b-7ad740af70fe', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('b9e8aae1-6d0d-4f56-b028-cf125ff4f49f', 'trek-assets', 'trek-images/1744912069898-54jsnj1ad.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:47:51.763873+00', '2025-04-17 17:47:51.763873+00', '2025-04-17 17:47:51.763873+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:47:52.000Z", "contentLength": 174226, "httpStatusCode": 200}', 'ffc34522-7e96-4a78-8da2-a3c18702592e', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('d2b616fc-ed94-41f6-a0ce-37506ff56e87', 'trek-assets', 'trek-gpx/1744912070357-utt3snpdl.gpx', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-17 17:47:52.078004+00', '2025-04-17 17:47:52.078004+00', '2025-04-17 17:47:52.078004+00', '{"eTag": "\"7e9118638704c7811bffafeb6677bbc7\"", "size": 158600, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-17T17:47:52.000Z", "contentLength": 158600, "httpStatusCode": 200}', '937cc66e-701a-43a9-9197-6a36209a6c5a', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('1243f5ab-b510-45a6-9ddd-4566b6820ff7', 'trek-assets', 'trek-images/1744954664222-yrvydn70n.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-18 05:37:45.263935+00', '2025-04-18 05:37:45.263935+00', '2025-04-18 05:37:45.263935+00', '{"eTag": "\"05fcc737f85f43971d18e2084eacfa88\"", "size": 174226, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-18T05:37:46.000Z", "contentLength": 174226, "httpStatusCode": 200}', '3de9184d-dedd-48ff-8f2b-957b478b1735', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('5ee0c8f8-3860-4d60-ba1e-024bf3ce97a3', 'trek-assets', '1744962052290-uxlzcu.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-18 07:40:54.478381+00', '2025-04-18 07:40:54.478381+00', '2025-04-18 07:40:54.478381+00', '{"eTag": "\"d8c36b8bbb5d19e35554ba708966cd30\"", "size": 284304, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-18T07:40:55.000Z", "contentLength": 284304, "httpStatusCode": 200}', '5744e692-4471-4488-89d7-29b09c72026f', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('7cf5a2ff-2c70-47a7-864c-526c3351919b', 'trek-assets', '1744963663192-6fekpi.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-18 08:07:44.83146+00', '2025-04-18 08:07:44.83146+00', '2025-04-18 08:07:44.83146+00', '{"eTag": "\"d8c36b8bbb5d19e35554ba708966cd30\"", "size": 284304, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-18T08:07:45.000Z", "contentLength": 284304, "httpStatusCode": 200}', 'adab4219-8e1f-4d6f-a07a-ce92eb63394c', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('8b2b83a1-fd48-4d16-8c05-c6f15016f788', 'trek-assets', '1744963769068-z9qbbt.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-18 08:09:30.466494+00', '2025-04-18 08:09:30.466494+00', '2025-04-18 08:09:30.466494+00', '{"eTag": "\"d8c36b8bbb5d19e35554ba708966cd30\"", "size": 284304, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-18T08:09:31.000Z", "contentLength": 284304, "httpStatusCode": 200}', 'ee8d2add-e8e4-4083-8d8a-b4c59aa6ec3a', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('979eb81d-2c85-4aac-96e6-064467306631', 'trek-assets', '1744964197780-qmf2pi.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-18 08:16:39.357288+00', '2025-04-18 08:16:39.357288+00', '2025-04-18 08:16:39.357288+00', '{"eTag": "\"d8c36b8bbb5d19e35554ba708966cd30\"", "size": 284304, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-18T08:16:40.000Z", "contentLength": 284304, "httpStatusCode": 200}', '631010a6-16b5-49c8-8226-54f539cbeaf2', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('e6e80ced-0282-40b0-8840-35774d00a4ae', 'trek-assets', '1744964200016-krd17f.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-18 08:16:41.365955+00', '2025-04-18 08:16:41.365955+00', '2025-04-18 08:16:41.365955+00', '{"eTag": "\"d8c36b8bbb5d19e35554ba708966cd30\"", "size": 284304, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-18T08:16:42.000Z", "contentLength": 284304, "httpStatusCode": 200}', '44e5b387-8704-40a2-b982-8562c8776234', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('0b38972d-ccb4-4f62-87f2-eff0978f8112', 'trek-assets', '1744964412176-izkuc8.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-18 08:20:13.694048+00', '2025-04-18 08:20:13.694048+00', '2025-04-18 08:20:13.694048+00', '{"eTag": "\"d8c36b8bbb5d19e35554ba708966cd30\"", "size": 284304, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-18T08:20:14.000Z", "contentLength": 284304, "httpStatusCode": 200}', '953adaed-2c3b-4fbe-acca-1fe140fcd0e8', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('431c3833-2510-447e-8f96-2d90ae8cc8c1', 'trek-assets', '1744964543027-9i3uc2.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-18 08:22:24.581036+00', '2025-04-18 08:22:24.581036+00', '2025-04-18 08:22:24.581036+00', '{"eTag": "\"d8c36b8bbb5d19e35554ba708966cd30\"", "size": 284304, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-18T08:22:25.000Z", "contentLength": 284304, "httpStatusCode": 200}', '3ca18cde-21de-456f-911c-049d143eb938', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('99199a8e-9bba-4825-aec4-4373c813cb9d', 'trek-assets', '1744964927978-2iska5.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-18 08:28:49.306697+00', '2025-04-18 08:28:49.306697+00', '2025-04-18 08:28:49.306697+00', '{"eTag": "\"d8c36b8bbb5d19e35554ba708966cd30\"", "size": 284304, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-18T08:28:50.000Z", "contentLength": 284304, "httpStatusCode": 200}', 'efda42b2-5980-49c4-9d24-facfc72d697c', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('04f9867e-8fc1-4759-b34b-74ecf3a21589', 'trek-assets', '1744964963898-7pb4mn.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-18 08:29:25.359328+00', '2025-04-18 08:29:25.359328+00', '2025-04-18 08:29:25.359328+00', '{"eTag": "\"d8c36b8bbb5d19e35554ba708966cd30\"", "size": 284304, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-18T08:29:26.000Z", "contentLength": 284304, "httpStatusCode": 200}', '12dc565f-a141-4a34-9ceb-b440558610d3', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('d999c01d-22ab-4d83-9b3a-3a5a8020090f', 'trek-assets', '1744965129673-frhd68.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-18 08:32:11.16786+00', '2025-04-18 08:32:11.16786+00', '2025-04-18 08:32:11.16786+00', '{"eTag": "\"d8c36b8bbb5d19e35554ba708966cd30\"", "size": 284304, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-18T08:32:12.000Z", "contentLength": 284304, "httpStatusCode": 200}', '3d3305af-45bf-4c36-b06b-e54e072fb7ad', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('6b9c5cd9-4dce-4086-8f78-a0127165ee2b', 'trek-assets', '1744965401677-dcifsp.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-18 08:36:43.211633+00', '2025-04-18 08:36:43.211633+00', '2025-04-18 08:36:43.211633+00', '{"eTag": "\"d8c36b8bbb5d19e35554ba708966cd30\"", "size": 284304, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-18T08:36:44.000Z", "contentLength": 284304, "httpStatusCode": 200}', '1f883512-7aa0-47cb-a966-ee237d8c4c18', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('ca0ea6e0-7ecf-4eb5-b55d-ca5c09117f8e', 'trek-assets', '1744969060261-izti7l.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-18 09:37:42.028332+00', '2025-04-18 09:37:42.028332+00', '2025-04-18 09:37:42.028332+00', '{"eTag": "\"d8c36b8bbb5d19e35554ba708966cd30\"", "size": 284304, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-18T09:37:42.000Z", "contentLength": 284304, "httpStatusCode": 200}', 'd7916c73-e189-47bd-ba8e-cc09a3aa76f3', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('3e24e995-2de6-49e3-b23a-5f3b735bb80f', 'trek-assets', '1744969423754-w5eg42.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-18 09:43:47.472093+00', '2025-04-18 09:43:47.472093+00', '2025-04-18 09:43:47.472093+00', '{"eTag": "\"d8c36b8bbb5d19e35554ba708966cd30\"", "size": 284304, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-18T09:43:47.000Z", "contentLength": 284304, "httpStatusCode": 200}', '6ffec0bc-2d34-49f2-9cc4-36eb02b69c33', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}'),
	('8a1b686d-1631-419c-b9ac-3c74b3841416', 'trek-assets', '1744970846765-73e9g6.jpg', '947bae31-4f04-436a-b4ff-7687c13aa31a', '2025-04-18 10:07:28.42956+00', '2025-04-18 10:07:28.42956+00', '2025-04-18 10:07:28.42956+00', '{"eTag": "\"d8c36b8bbb5d19e35554ba708966cd30\"", "size": 284304, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-18T10:07:29.000Z", "contentLength": 284304, "httpStatusCode": 200}', '7b87f7d1-a5ff-436c-908c-f0c7cd28cc31', '947bae31-4f04-436a-b4ff-7687c13aa31a', '{}');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 49, true);


--
-- Name: comments_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."comments_comment_id_seq"', 9, true);


--
-- Name: community_posts_post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."community_posts_post_id_seq"', 1, false);


--
-- Name: expense_sharing_expense_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."expense_sharing_expense_id_seq"', 1, false);


--
-- Name: logistics_logistics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."logistics_logistics_id_seq"', 1, false);


--
-- Name: packing_items_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."packing_items_item_id_seq"', 13, true);


--
-- Name: partners_partner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."partners_partner_id_seq"', 1, false);


--
-- Name: registrations_registration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."registrations_registration_id_seq"', 3, true);


--
-- Name: roles_assignments_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."roles_assignments_role_id_seq"', 1, false);


--
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."roles_role_id_seq"', 3, true);


--
-- Name: subscriptions_billing_subscription_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."subscriptions_billing_subscription_id_seq"', 1, false);


--
-- Name: trek_events_trek_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."trek_events_trek_id_seq"', 55, true);


--
-- Name: trek_expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."trek_expenses_id_seq"', 35, true);


--
-- Name: votes_vote_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."votes_vote_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
