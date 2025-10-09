import { supabase } from '@/integrations/supabase/client';

type HomeBackgroundSetting = {
  image_url: string;
};

type HomeHeroImagesSetting = {
  images: Array<{
    url: string;
    order: number;
  }>;
};

const TABLE_NAME = 'site_settings';
const HOME_BG_KEY = 'home_background';
const HOME_HERO_IMAGES_KEY = 'home_hero_images';

export async function getHomeBackground(): Promise<string | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('value')
    .eq('key', HOME_BG_KEY)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch home background setting', error);
    return null;
  }

  const value = (data?.value as HomeBackgroundSetting | null) ?? null;
  return value?.image_url ?? null;
}

export async function setHomeBackground(imageUrl: string): Promise<void> {
  const payload = { key: HOME_BG_KEY, value: { image_url: imageUrl } as HomeBackgroundSetting };
  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert(payload, { onConflict: 'key' });

  if (error) {
    throw error;
  }
}

export async function getHomeHeroImages(): Promise<string[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('value')
    .eq('key', HOME_HERO_IMAGES_KEY)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch home hero images setting', error);
    return [];
  }

  const value = (data?.value as HomeHeroImagesSetting | null) ?? null;
  return value?.images?.sort((a, b) => a.order - b.order).map(img => img.url) ?? [];
}

export async function setHomeHeroImages(images: string[]): Promise<void> {
  const imageObjects = images.map((url, index) => ({ url, order: index }));
  const payload = { key: HOME_HERO_IMAGES_KEY, value: { images: imageObjects } as HomeHeroImagesSetting };
  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert(payload, { onConflict: 'key' });

  if (error) {
    throw error;
  }
}


