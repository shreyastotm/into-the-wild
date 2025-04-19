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
	(2, 'Raincoat'),
	(3, 'First Aid Kit'),
	(4, 'Snacks'),
	(5, 'Flashlight'),
	(10, 'Jerry Can');


--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
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

INSERT INTO "public"."trek_packing_lists" ("item_id", "trek_id", "item_order", "mandatory", "name") VALUES
	('58930b38-cd44-42d1-84e4-b8295b397c5d', 1, 0, false, NULL),
	('aa14d6f3-fd3d-45d3-ac6a-0e23b63fefbd', 1, 0, false, NULL),
	('b53a3d16-fcc1-46a5-a795-213537976e9a', 1, 0, false, NULL),
	('caec2bd7-f313-403f-823b-784df246aaed', 1, 0, false, NULL),
	('368188d5-77cc-4013-97a2-b1d8ca0613af', 1, 0, false, NULL),
	('283b7293-8252-4264-8a9c-2a46f9106fa4', 1, 0, false, NULL),
	('b2291062-a3e0-4700-baf2-533126b93c0c', 1, 0, false, NULL),
	('e2875ada-65aa-4aa8-af61-79ad69e15384', 1, 0, false, NULL),
	('a4609784-95c8-451d-92a3-1486288f0cde', 1, 0, false, NULL),
	('e1f62e55-ad7d-4286-ad0c-dbc641e16e63', 1, 0, false, NULL),
	('6c32198a-09b7-418f-8877-31daaae0dc99', 1, 1, true, 'Sample Item');


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

SELECT pg_catalog.setval('"public"."packing_items_item_id_seq"', 10, true);


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
