-- Migration: Create trek_archive and trek_event_images (max 3 per trek via constraint)
-- Context: India deployment; do not alter existing treks schema beyond FK usage

-- 1) Archive table structure mirrors key public fields from trek_events
CREATE TABLE IF NOT EXISTS public.trek_archive (
    archive_id BIGSERIAL PRIMARY KEY,
    trek_id INTEGER, -- original id reference (not FK to allow historical deletes)
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location TEXT,
    difficulty VARCHAR(50),
    start_datetime TIMESTAMPTZ NOT NULL,
    route_data JSONB,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.trek_archive IS 'Copy of completed/archived treks from trek_events for long-term gallery.';

-- 2) Images table to support up to 3 images per trek
CREATE TABLE IF NOT EXISTS public.trek_event_images (
    id BIGSERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    position SMALLINT NOT NULL DEFAULT 1, -- 1..3
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enforce at most 3 images per trek using a partial uniqueness across 1..3 positions
CREATE UNIQUE INDEX IF NOT EXISTS ux_trek_event_images_unique_slot
ON public.trek_event_images(trek_id, position);

-- Optional: helper to check count <= 3 (defensive)
CREATE OR REPLACE FUNCTION public.enforce_max_three_images()
RETURNS TRIGGER AS $$
DECLARE
    cnt INTEGER;
BEGIN
    SELECT COUNT(*) INTO cnt FROM public.trek_event_images WHERE trek_id = NEW.trek_id;
    IF TG_OP = 'INSERT' THEN
        IF cnt >= 3 THEN
            RAISE EXCEPTION 'At most 3 images allowed per trek_id=%', NEW.trek_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_max_three_images ON public.trek_event_images;
CREATE TRIGGER trg_enforce_max_three_images
BEFORE INSERT ON public.trek_event_images
FOR EACH ROW EXECUTE FUNCTION public.enforce_max_three_images();

-- 3) Archive function: copies a trek to trek_archive and optionally deletes it
CREATE OR REPLACE FUNCTION public.archive_trek(p_trek_id INTEGER, p_delete_original BOOLEAN DEFAULT FALSE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.trek_archive (trek_id, name, description, location, difficulty, start_datetime, route_data, image_url)
    SELECT t.trek_id, t.name, t.description, t.location, t.difficulty, t.start_datetime, t.route_data, COALESCE(t.image_url, t.image)
    FROM public.trek_events t
    WHERE t.trek_id = p_trek_id;

    IF p_delete_original THEN
        DELETE FROM public.trek_events WHERE trek_id = p_trek_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4) Storage bucket note: images use existing public bucket 'trek-images'
-- Ensure FIX_STORAGE_BUCKETS.sql has been applied in target environment


