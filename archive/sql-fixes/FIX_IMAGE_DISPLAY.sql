-- Fix image display issue
-- The application uses 'image_url' but we added 'image' column
-- We need to sync the data between these columns

-- Option 1: Copy from 'image' to 'image_url' (if image has data but image_url is null)
UPDATE public.trek_events 
SET image_url = image 
WHERE image IS NOT NULL AND image_url IS NULL;

-- Option 2: Copy from 'image_url' to 'image' (if image_url has data but image is null)
UPDATE public.trek_events 
SET image = image_url 
WHERE image_url IS NOT NULL AND image IS NULL;

-- Option 3: Create a trigger to keep both columns in sync
CREATE OR REPLACE FUNCTION sync_image_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- When image_url is updated, also update image
    IF NEW.image_url IS DISTINCT FROM OLD.image_url THEN
        NEW.image = NEW.image_url;
    END IF;
    
    -- When image is updated, also update image_url
    IF NEW.image IS DISTINCT FROM OLD.image THEN
        NEW.image_url = NEW.image;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to keep columns in sync
DROP TRIGGER IF EXISTS sync_image_trigger ON public.trek_events;
CREATE TRIGGER sync_image_trigger
    BEFORE UPDATE ON public.trek_events
    FOR EACH ROW
    EXECUTE FUNCTION sync_image_columns();

-- Verify the data
SELECT 
    trek_id,
    name,
    CASE 
        WHEN image IS NOT NULL AND image_url IS NOT NULL THEN 'Both columns have data'
        WHEN image IS NOT NULL AND image_url IS NULL THEN 'Only image column has data'
        WHEN image IS NULL AND image_url IS NOT NULL THEN 'Only image_url column has data'
        ELSE 'Neither column has data'
    END as image_status,
    LENGTH(image) as image_length,
    LENGTH(image_url) as image_url_length
FROM public.trek_events 
WHERE image IS NOT NULL OR image_url IS NOT NULL
ORDER BY trek_id;
