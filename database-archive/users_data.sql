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



--
-- Data for Name: trek_ad_hoc_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ad_hoc_expense_shares; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: community_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: packing_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



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



--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: roles_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
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



--
-- Data for Name: trek_fixed_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: trek_packing_lists; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: votes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: comments_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."comments_comment_id_seq"', 1, false);


--
-- Name: community_posts_post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."community_posts_post_id_seq"', 1, false);


--
-- Name: packing_items_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."packing_items_item_id_seq"', 1, false);


--
-- Name: partners_partner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."partners_partner_id_seq"', 1, false);


--
-- Name: registrations_registration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."registrations_registration_id_seq"', 1, false);


--
-- Name: roles_assignments_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."roles_assignments_role_id_seq"', 1, false);


--
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."roles_role_id_seq"', 1, false);


--
-- Name: subscriptions_billing_subscription_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."subscriptions_billing_subscription_id_seq"', 1, false);


--
-- Name: trek_events_trek_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."trek_events_trek_id_seq"', 1, false);


--
-- Name: trek_expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."trek_expenses_id_seq"', 1, false);


--
-- Name: votes_vote_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."votes_vote_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
