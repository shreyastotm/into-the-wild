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

INSERT INTO "public"."trek_events" ("trek_id", "trek_name", "description", "category", "start_datetime", "duration", "cost", "cancellation_policy", "penalty_details", "max_participants", "location", "route_data", "transport_mode", "vendor_contacts", "pickup_time_window", "event_creator_type", "partner_id", "created_at", "updated_at", "booking_amount", "collect_full_fee", "image_url", "gpx_file_url", "is_finalized") VALUES
	(4, 'K', 'GG', 'family', '2025-04-30 08:30:00+00', '00:00:02', 1500.00, '2:00', NULL, 10, NULL, NULL, 'mini_van', NULL, '2', 'internal', NULL, '2025-04-16 03:01:09.546701+00', '2025-04-16 03:01:09.546701+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744772467804-y0uhyn41z.webp', NULL, false),
	(55, 'sasasasasa', NULL, 'asaDS', '2025-04-30 11:49:00+00', NULL, 111.00, NULL, NULL, 11, NULL, NULL, NULL, NULL, NULL, 'internal', NULL, '2025-04-18 08:32:11.306107+00', '2025-04-18 08:32:11.306107+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/1744965129673-frhd68.jpg', NULL, false),
	(43, 'fggggg', 'weff', 'Family', '2025-04-23 14:32:00+00', NULL, 111.00, NULL, NULL, 11, 'wqewqe', '{"points": 1864, "distance_km": "9.88", "elevation_max": 768.28, "elevation_min": 677.14, "elevation_gain": "91.1"}', NULL, NULL, NULL, 'internal', NULL, '2025-04-17 17:41:03.769856+00', '2025-04-17 17:41:03.769856+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-images/1744911661027-1jvpgdci1.jpg', 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/trek-gpx/1744911661723-2zlt0741x.gpx', false),
	(56, 'Thayee Betta and lake Swim', NULL, 'Family', '2025-04-27 14:33:00+00', NULL, 1200.00, NULL, NULL, 10, NULL, NULL, NULL, NULL, NULL, 'internal', NULL, '2025-04-21 10:12:56.223998+00', '2025-04-21 10:12:56.223998+00', NULL, false, 'https://lojnpkunoufmwwcifwan.supabase.co/storage/v1/object/public/trek-assets/1745230374041-artbbh.jpg', NULL, false);


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
	(13, 'Cap'),
	(14, 'ABC');


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
	(1, '6ce9b479-9414-401a-adf5-c3336352ff93', 55, '2025-04-19 13:59:05.895+00', 'Pending', NULL, NULL, '2025-04-19 13:59:07.72557+00'),
	(2, '61946fd4-bbba-40a7-904a-6223c20dd358', 4, '2025-04-19 14:02:38.827+00', 'Pending', NULL, NULL, '2025-04-19 14:02:40.636559+00'),
	(5, '6ce9b479-9414-401a-adf5-c3336352ff93', 43, '2025-04-19 14:04:54.132+00', 'Pending', NULL, NULL, '2025-04-19 14:04:55.896048+00'),
	(6, '6ce9b479-9414-401a-adf5-c3336352ff93', 4, '2025-04-19 14:04:59.492+00', 'Pending', NULL, NULL, '2025-04-19 14:05:01.252033+00'),
	(7, '61946fd4-bbba-40a7-904a-6223c20dd358', 55, '2025-04-19 14:44:46.41+00', 'Pending', NULL, NULL, '2025-04-19 14:44:48.235251+00'),
	(8, '6ce9b479-9414-401a-adf5-c3336352ff93', 56, '2025-04-21 10:13:16.463+00', 'Pending', NULL, NULL, '2025-04-21 10:13:17.74103+00'),
	(9, '61946fd4-bbba-40a7-904a-6223c20dd358', 56, '2025-04-21 10:17:01.325+00', 'Pending', NULL, NULL, '2025-04-21 10:17:02.636702+00');


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

INSERT INTO "public"."users" ("full_name", "email", "password_hash", "phone_number", "address", "date_of_birth", "subscription_type", "id_verification_status", "health_data", "trekking_experience", "badges", "interests", "pet_details", "created_at", "updated_at", "user_id", "image_url", "user_type", "partner_id", "indemnity_accepted", "indemnity_accepted_at", "verification_status", "verification_docs", "avatar_url") VALUES
	('Totemic', 'shreyas@totm.in', NULL, '1203012830283', NULL, NULL, 'self_service', 'Pending', NULL, NULL, NULL, NULL, NULL, '2025-04-19 11:58:29.941653+00', '2025-04-19 11:58:29.941653+00', '61946fd4-bbba-40a7-904a-6223c20dd358', NULL, NULL, NULL, false, NULL, 'pending', NULL, NULL),
	('HWEIHW', 'shreyasmadhan@gmail.com', NULL, '121124', NULL, NULL, 'community', 'Pending', NULL, NULL, NULL, NULL, NULL, '2025-04-19 10:34:06.690453+00', '2025-04-19 13:51:05.483098+00', '6ce9b479-9414-401a-adf5-c3336352ff93', NULL, 'micro_community', NULL, false, NULL, 'pending', NULL, NULL),
	('Shreyas', 'shreyasmadhan82@gmail.com', 'handled_by_auth_system', '090-9988989809', 'kkkj 90980989', '1993-06-09', 'community', 'Pending', '"wqwd qw"', 'wqeqwe', NULL, '"wqeqweqw"', '"wqeqweqw"', '2025-04-10 19:44:49.247956+00', '2025-04-21 08:47:21.826+00', '947bae31-4f04-436a-b4ff-7687c13aa31a', NULL, 'admin', NULL, false, NULL, 'verified', NULL, NULL);


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

SELECT pg_catalog.setval('"public"."packing_items_item_id_seq"', 14, true);


--
-- Name: partners_partner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."partners_partner_id_seq"', 1, false);


--
-- Name: registrations_registration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."registrations_registration_id_seq"', 9, true);


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

SELECT pg_catalog.setval('"public"."trek_events_trek_id_seq"', 56, true);


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
