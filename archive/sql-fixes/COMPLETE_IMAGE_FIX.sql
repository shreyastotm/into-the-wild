-- COMPLETE IMAGE FIX
-- This will ensure images are visible in both /events page and trek details

-- Step 1: Sync the image columns
-- Copy from 'image' to 'image_url' (if image has data but image_url is null)
UPDATE public.trek_events 
SET image_url = image 
WHERE image IS NOT NULL AND image_url IS NULL;

-- Copy from 'image_url' to 'image' (if image_url has data but image is null)  
UPDATE public.trek_events 
SET image = image_url 
WHERE image_url IS NOT NULL AND image IS NULL;

-- Step 2: Create a trigger to keep both columns in sync for future updates
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_image_trigger ON public.trek_events;

-- Create trigger to keep columns in sync
CREATE TRIGGER sync_image_trigger
    BEFORE UPDATE ON public.trek_events
    FOR EACH ROW
    EXECUTE FUNCTION sync_image_columns();

-- Step 3: Verify the sync worked
SELECT 
    trek_id,
    name,
    CASE 
        WHEN image IS NOT NULL AND image_url IS NOT NULL AND image = image_url THEN 'Both columns synced'
        WHEN image IS NOT NULL AND image_url IS NOT NULL AND image != image_url THEN 'Both columns have different data'
        WHEN image IS NOT NULL AND image_url IS NULL THEN 'Only image column has data'
        WHEN image IS NULL AND image_url IS NOT NULL THEN 'Only image_url column has data'
        ELSE 'Neither column has data'
    END as image_status,
    LENGTH(COALESCE(image, '')) as image_length,
    LENGTH(COALESCE(image_url, '')) as image_url_length
FROM public.trek_events 
WHERE image IS NOT NULL OR image_url IS NOT NULL
ORDER BY trek_id;

-- Step 4: Check for any trek events that have images
SELECT 
    COUNT(*) as total_events,
    COUNT(image) as events_with_image,
    COUNT(image_url) as events_with_image_url,
    COUNT(CASE WHEN image IS NOT NULL AND image_url IS NOT NULL THEN 1 END) as events_with_both
FROM public.trek_events;
