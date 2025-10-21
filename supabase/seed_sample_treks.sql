-- Sample data for testing the public gallery
-- Run this after applying all migrations to populate the gallery with test data

-- Insert sample past treks (set dates in the past)
INSERT INTO public.trek_events (
    trek_name,
    description,
    location,
    start_datetime,
    duration,
    cost,
    max_participants,
    difficulty,
    category,
    image_url
) VALUES
(
    'Kudremukh Trek - Western Ghats Adventure',
    'Experience the breathtaking beauty of Kudremukh National Park with rolling hills, lush green valleys, and diverse wildlife. This moderate trek offers stunning views of the Western Ghats and is perfect for nature enthusiasts.',
    'Kudremukh, Karnataka',
    NOW() - INTERVAL '30 days', -- 30 days ago
    INTERVAL '2 days',
    2500.00,
    15,
    'Moderate',
    'Nature',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
),
(
    'Valley of Flowers - Himalayan Paradise',
    'Discover the UNESCO World Heritage site Valley of Flowers in the Himalayas. Walk through meadows filled with endemic alpine flowers, cross crystal-clear streams, and witness breathtaking mountain vistas.',
    'Valley of Flowers, Uttarakhand',
    NOW() - INTERVAL '45 days', -- 45 days ago
    INTERVAL '3 days',
    4200.00,
    12,
    'Moderate',
    'Nature',
    'https://images.unsplash.com/photo-1464822759844-d150baec93d5?w=800&h=600&fit=crop'
),
(
    'Rajasthan Desert Safari Adventure',
    'Experience the golden sands of the Thar Desert with camel safaris, traditional Rajasthani culture, and starlit nights under the desert sky. A unique cultural and adventure experience.',
    'Jaisalmer, Rajasthan',
    NOW() - INTERVAL '60 days', -- 60 days ago
    INTERVAL '2 days',
    3800.00,
    20,
    'Easy',
    'Cultural',
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop'
),
(
    'Everest Base Camp - Ultimate Challenge',
    'Conquer the mighty Himalayas and reach the base of the world\'s highest peak. This challenging trek offers unparalleled views of Everest, Lhotse, and other 8000m peaks.',
    'Everest Region, Nepal',
    NOW() - INTERVAL '90 days', -- 90 days ago
    INTERVAL '14 days',
    8500.00,
    10,
    'Hard',
    'Adventure',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop'
),
(
    'Kerala Backwaters Kayaking Expedition',
    'Paddle through the serene backwaters of Kerala, exploring coconut groves, traditional villages, and diverse birdlife. A peaceful yet adventurous water-based journey.',
    'Alleppey, Kerala',
    NOW() - INTERVAL '15 days', -- 15 days ago
    INTERVAL '3 days',
    3200.00,
    8,
    'Easy',
    'Water',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
)
ON CONFLICT DO NOTHING;

-- Add sample images for these treks (up to 5 per trek)
INSERT INTO public.trek_event_images (trek_id, image_url, position)
SELECT
    te.trek_id,
    CASE
        WHEN te.trek_name LIKE '%Kudremukh%' THEN
            CASE
                WHEN position = 1 THEN 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
                WHEN position = 2 THEN 'https://images.unsplash.com/photo-1464822759844-d150baec93d5?w=800&h=600&fit=crop'
                WHEN position = 3 THEN 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop'
                WHEN position = 4 THEN 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop'
                WHEN position = 5 THEN 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
            END
        WHEN te.trek_name LIKE '%Valley of Flowers%' THEN
            CASE
                WHEN position = 1 THEN 'https://images.unsplash.com/photo-1464822759844-d150baec93d5?w=800&h=600&fit=crop'
                WHEN position = 2 THEN 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
                WHEN position = 3 THEN 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop'
                WHEN position = 4 THEN 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
                WHEN position = 5 THEN 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop'
            END
        WHEN te.trek_name LIKE '%Rajasthan%' THEN
            CASE
                WHEN position = 1 THEN 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop'
                WHEN position = 2 THEN 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
                WHEN position = 3 THEN 'https://images.unsplash.com/photo-1464822759844-d150baec93d5?w=800&h=600&fit=crop'
                WHEN position = 4 THEN 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop'
            END
        WHEN te.trek_name LIKE '%Everest%' THEN
            CASE
                WHEN position = 1 THEN 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop'
                WHEN position = 2 THEN 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
                WHEN position = 3 THEN 'https://images.unsplash.com/photo-1464822759844-d150baec93d5?w=800&h=600&fit=crop'
                WHEN position = 4 THEN 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
                WHEN position = 5 THEN 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop'
            END
        ELSE
            CASE
                WHEN position = 1 THEN 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
                WHEN position = 2 THEN 'https://images.unsplash.com/photo-1464822759844-d150baec93d5?w=800&h=600&fit=crop'
                WHEN position = 3 THEN 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop'
            END
    END as image_url,
    position
FROM public.trek_events te
CROSS JOIN (SELECT generate_series(1, 5) as position) positions
WHERE te.trek_name IN (
    'Kudremukh Trek - Western Ghats Adventure',
    'Valley of Flowers - Himalayan Paradise',
    'Rajasthan Desert Safari Adventure',
    'Everest Base Camp - Ultimate Challenge',
    'Kerala Backwaters Kayaking Expedition'
)
AND (
    (te.trek_name LIKE '%Kudremukh%' AND position <= 5) OR
    (te.trek_name LIKE '%Valley of Flowers%' AND position <= 5) OR
    (te.trek_name LIKE '%Rajasthan%' AND position <= 4) OR
    (te.trek_name LIKE '%Everest%' AND position <= 5) OR
    (te.trek_name LIKE '%Kerala%' AND position <= 3)
)
ON CONFLICT DO NOTHING;

-- Add sample user-contributed images (approved status)
INSERT INTO public.user_trek_images (trek_id, uploaded_by, image_url, caption, status)
SELECT
    te.trek_id,
    '00000000-0000-0000-0000-000000000000'::uuid as uploaded_by, -- Placeholder UUID
    CASE
        WHEN te.trek_name LIKE '%Kudremukh%' THEN
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
        WHEN te.trek_name LIKE '%Valley of Flowers%' THEN
            'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop'
        WHEN te.trek_name LIKE '%Rajasthan%' THEN
            'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop'
        WHEN te.trek_name LIKE '%Everest%' THEN
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
        ELSE
            'https://images.unsplash.com/photo-1464822759844-d150baec93d5?w=800&h=600&fit=crop'
    END as image_url,
    CASE
        WHEN te.trek_name LIKE '%Kudremukh%' THEN 'Amazing view from the peak!'
        WHEN te.trek_name LIKE '%Valley of Flowers%' THEN 'Incredible biodiversity in the valley'
        WHEN te.trek_name LIKE '%Rajasthan%' THEN 'Beautiful sunset over the dunes'
        WHEN te.trek_name LIKE '%Everest%' THEN 'Standing at the foot of giants'
        ELSE 'Wonderful trekking experience!'
    END as caption,
    'approved' as status
FROM public.trek_events te
WHERE te.trek_name IN (
    'Kudremukh Trek - Western Ghats Adventure',
    'Valley of Flowers - Himalayan Paradise',
    'Rajasthan Desert Safari Adventure',
    'Everest Base Camp - Ultimate Challenge',
    'Kerala Backwaters Kayaking Expedition'
)
ON CONFLICT DO NOTHING;

-- Add sample tags for the treks
INSERT INTO public.image_tag_assignments (image_id, image_type, tag_id, assigned_by)
SELECT
    tei.id,
    'official_image',
    it.id,
    '00000000-0000-0000-0000-000000000000'::uuid as assigned_by
FROM public.trek_events te
JOIN public.trek_event_images tei ON te.trek_id = tei.trek_id
JOIN public.image_tags it ON (
    (te.trek_name LIKE '%Kudremukh%' AND it.name IN ('Landscape', 'Nature', 'Adventure')) OR
    (te.trek_name LIKE '%Valley of Flowers%' AND it.name IN ('Nature', 'Wildlife', 'Adventure')) OR
    (te.trek_name LIKE '%Rajasthan%' AND it.name IN ('Landscape', 'Cultural', 'Adventure')) OR
    (te.trek_name LIKE '%Everest%' AND it.name IN ('Summit', 'Adventure', 'Nature')) OR
    (te.trek_name LIKE '%Kerala%' AND it.name IN ('Nature', 'Water', 'Adventure'))
)
WHERE te.trek_name IN (
    'Kudremukh Trek - Western Ghats Adventure',
    'Valley of Flowers - Himalayan Paradise',
    'Rajasthan Desert Safari Adventure',
    'Everest Base Camp - Ultimate Challenge',
    'Kerala Backwaters Kayaking Expedition'
)
ON CONFLICT (image_id, image_type, tag_id) DO NOTHING;

-- Add sample video for one trek
INSERT INTO public.trek_event_videos (trek_id, video_url, thumbnail_url, duration_seconds, file_size_mb)
SELECT
    te.trek_id,
    'https://sample-videos.com/zip/10/mp4/720/SampleVideo_720x480_1mb.mp4',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    30,
    5.2
FROM public.trek_events te
WHERE te.trek_name = 'Kudremukh Trek - Western Ghats Adventure'
ON CONFLICT DO NOTHING;
