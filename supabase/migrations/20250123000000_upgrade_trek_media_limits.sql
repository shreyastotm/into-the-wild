-- Migration: Upgrade trek media limits to 5 images + 1 video per trek
-- Context: India deployment; increases media capacity for better content

-- 0) Create trek_event_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.trek_event_images (
    id BIGSERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    "position" INTEGER NOT NULL CHECK ("position" >= 1 AND "position" <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_trek_event_images_trek_id ON public.trek_event_images(trek_id);
CREATE INDEX IF NOT EXISTS idx_trek_event_images_position ON public.trek_event_images(trek_id, "position");

-- Enable RLS
ALTER TABLE public.trek_event_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trek_event_images
DROP POLICY IF EXISTS "Users can view trek images" ON public.trek_event_images;
CREATE POLICY "Users can view trek images" ON public.trek_event_images
FOR SELECT USING (true); -- Public read access

DROP POLICY IF EXISTS "Admins can manage trek images" ON public.trek_event_images;
CREATE POLICY "Admins can manage trek images" ON public.trek_event_images
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid()
        AND users.user_type = 'admin'
    )
);

-- Grant permissions
GRANT ALL ON TABLE public.trek_event_images TO anon, authenticated, service_role;
GRANT USAGE ON SEQUENCE public.trek_event_images_id_seq TO anon, authenticated, service_role;

-- 1) Update trek_event_images constraint from 3 to 5 images
DROP TRIGGER IF EXISTS trg_enforce_max_three_images ON public.trek_event_images;
DROP FUNCTION IF EXISTS public.enforce_max_three_images();

-- Update position constraint to allow 1-5 (already set in CREATE TABLE above)
-- Skip if constraint already exists from table creation
DO $$
BEGIN
    -- Try to drop the constraint if it exists
    BEGIN
        ALTER TABLE public.trek_event_images DROP CONSTRAINT IF EXISTS trek_event_images_position_check;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;
    
    -- Add the constraint (will fail silently if already exists from CREATE TABLE)
    BEGIN
ALTER TABLE public.trek_event_images
ADD CONSTRAINT trek_event_images_position_check
        CHECK ("position" >= 1 AND "position" <= 5);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- Update function for 5 images
CREATE OR REPLACE FUNCTION public.enforce_max_five_images()
RETURNS TRIGGER AS $$
DECLARE
    cnt INTEGER;
BEGIN
    SELECT COUNT(*) INTO cnt FROM public.trek_event_images WHERE trek_id = NEW.trek_id;
    IF TG_OP = 'INSERT' THEN
        IF cnt >= 5 THEN
            RAISE EXCEPTION 'At most 5 images allowed per trek_id=%', NEW.trek_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_max_five_images
BEFORE INSERT ON public.trek_event_images
FOR EACH ROW EXECUTE FUNCTION public.enforce_max_five_images();

-- 2) Add video support table
CREATE TABLE IF NOT EXISTS public.trek_event_videos (
    id BIGSERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    file_size_mb DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow only 1 video per trek
CREATE UNIQUE INDEX IF NOT EXISTS ux_trek_event_videos_unique_trek
ON public.trek_event_videos(trek_id);

-- Function to enforce max 1 video per trek
CREATE OR REPLACE FUNCTION public.enforce_max_one_video()
RETURNS TRIGGER AS $$
DECLARE
    cnt INTEGER;
BEGIN
    SELECT COUNT(*) INTO cnt FROM public.trek_event_videos WHERE trek_id = NEW.trek_id;
    IF TG_OP = 'INSERT' THEN
        IF cnt >= 1 THEN
            RAISE EXCEPTION 'At most 1 video allowed per trek_id=%', NEW.trek_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_max_one_video
BEFORE INSERT ON public.trek_event_videos
FOR EACH ROW EXECUTE FUNCTION public.enforce_max_one_video();

-- 3) RLS Policies for videos (same as images)
CREATE POLICY "Users can view trek videos" ON public.trek_event_videos
FOR SELECT USING (true); -- Public read access

CREATE POLICY "Admins can manage trek videos" ON public.trek_event_videos
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid()
        AND users.user_type = 'admin'
    )
);

ALTER TABLE public.trek_event_videos ENABLE ROW LEVEL SECURITY;

-- 4) Grant permissions
GRANT ALL ON TABLE public.trek_event_videos TO anon, authenticated, service_role;
GRANT USAGE ON SEQUENCE public.trek_event_videos_id_seq TO anon, authenticated, service_role;

-- 5) Function to get all media for a trek (images + video)
CREATE OR REPLACE FUNCTION public.get_trek_media(p_trek_id INTEGER)
RETURNS TABLE(
    type TEXT,
    id BIGINT,
    url TEXT,
    "position" INTEGER,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Return images first
    RETURN QUERY
    SELECT
        'image'::TEXT as type,
        tei.id,
        tei.image_url as url,
        tei."position",
        tei.created_at
    FROM public.trek_event_images tei
    WHERE tei.trek_id = p_trek_id
    ORDER BY tei."position";

    -- Then return video if exists
    RETURN QUERY
    SELECT
        'video'::TEXT as type,
        tev.id,
        tev.video_url as url,
        0 as "position", -- Videos don't have position
        tev.created_at
    FROM public.trek_event_videos tev
    WHERE tev.trek_id = p_trek_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6) Update existing trek_event_images to use new constraint name in comments
COMMENT ON TABLE public.trek_event_images IS 'Official images for treks (up to 5 per trek)';
COMMENT ON TABLE public.trek_event_videos IS 'Official videos for treks (up to 1 per trek, max 10MB)';
