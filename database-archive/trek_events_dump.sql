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
-- Data for Name: trek_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."trek_events" ("trek_id", "trek_name", "description", "category", "start_datetime", "duration", "cost", "cancellation_policy", "penalty_details", "max_participants", "current_participants", "location", "route_data", "transport_mode", "vendor_contacts", "pickup_time_window", "event_creator_type", "partner_id", "created_at", "updated_at", "booking_amount", "collect_full_fee", "image_url", "gpx_file_url") VALUES
	(4, 'K', 'GG', 'family', '2025-04-30 08:30:00+00', '00:00:02', 1500.00, '2:00', NULL, 10, 0, NULL, NULL, 'mini_van', NULL, '2', 'internal', NULL, '2025-04-16 03:01:09.546701+00', '2025-04-16 03:01:09.546701+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744772467804-y0uhyn41z.webp', NULL),
	(43, 'fggggg', 'weff', NULL, '2025-04-29 23:10:00+00', NULL, 111.00, NULL, NULL, 111, 0, 'wqewqe', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 17:41:03.769856+00', '2025-04-17 17:41:03.769856+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744911661027-1jvpgdci1.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744911661723-2zlt0741x.gpx'),
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
	(6, 4, 947, 'hi
', '2025-04-16 03:50:11.218+00'),
	(9, 4, 947, 'HI', '2025-04-17 12:41:15.208+00');


--
-- Data for Name: community_posts; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."roles" ("role_id", "role_name", "description") VALUES
	(1, 'Admin', 'Full site control, user management, trek/event oversight'),
	(2, 'Moderator', 'Manage treks, moderate discussions, handle reports'),
	(3, 'Trekker', 'Regular user, can join treks, comment, and participate');


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
	(32, 43, 'sdad', 111, NULL, NULL, '2025-04-17 17:41:03.863812+00');


--
-- Data for Name: trek_fixed_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: trek_packing_lists; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- Name: comments_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."comments_comment_id_seq"', 9, true);


--
-- Name: community_posts_post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."community_posts_post_id_seq"', 1, false);


--
-- Name: packing_items_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."packing_items_item_id_seq"', 13, true);


--
-- Name: partners_partner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."partners_partner_id_seq"', 1, false);


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
