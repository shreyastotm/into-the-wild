import { supabase } from '@/integrations/supabase/client';

type HomeBackgroundSetting = {
  image_url: string;
};

const TABLE_NAME = 'site_settings';
const HOME_BG_KEY = 'home_background';

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


