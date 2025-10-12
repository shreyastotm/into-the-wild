import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { setHomeBackground, getHomeBackground } from '@/lib/siteSettings';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

type PastTrek = {
  trek_id: number;
  name: string;
  description: string | null;
  location: string | null;
  start_datetime: string;
  images: string[];
};

export default function Gallery() {
  const [items, setItems] = useState<PastTrek[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentBg, setCurrentBg] = useState<string | null>(null);
  const { userProfile } = useAuth();

  const isAdmin = useMemo(() => userProfile?.user_type === 'admin', [userProfile]);

  useEffect(() => {
    (async () => {
      const timeoutId = setTimeout(() => {
        console.error('Gallery query timed out');
        setLoading(false);
        setItems([]);
      }, 10000); // 10 second timeout

      setLoading(true);
      try {
        // Past treks from trek_events
        const { data: treks, error } = await supabase
          .from('trek_events')
          .select('trek_id, name, description, location, start_datetime')
          .lt('start_datetime', new Date().toISOString())
          .order('start_datetime', { ascending: false });
        if (error) throw error;

        const trekIds = (treks ?? []).map(t => t.trek_id);
        let imagesByTrek: Record<number, string[]> = {};
        if (trekIds.length) {
          const { data: imgs, error: imgErr } = await supabase
            .from('trek_event_images')
            .select('trek_id, image_url, position')
            .in('trek_id', trekIds)
            .order('position', { ascending: true });
          if (imgErr) throw imgErr;
          imagesByTrek = (imgs ?? []).reduce((acc, it) => {
            if (!acc[it.trek_id]) acc[it.trek_id] = [];
            acc[it.trek_id].push(it.image_url);
            return acc;
          }, {} as Record<number, string[]>);
        }

        const merged = (treks ?? []).map(t => ({
          trek_id: t.trek_id,
          name: t.name,
          description: t.description ?? null,
          location: t.location ?? null,
          start_datetime: t.start_datetime,
          images: imagesByTrek[t.trek_id] ?? [],
        }));
        clearTimeout(timeoutId);
        setItems(merged);
      } catch (e) {
        clearTimeout(timeoutId);
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const url = await getHomeBackground();
      setCurrentBg(url);
    })();
  }, []);

  const onToggleBackground = async (url: string, checked: boolean) => {
    if (!isAdmin) return;
    try {
      setSaving(true);
      await setHomeBackground(checked ? url : '');
      setCurrentBg(checked ? url : null);
    } catch (err) {
      console.error('Failed to set background', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Our Past Adventures</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="border rounded-lg overflow-hidden shadow-sm bg-white animate-pulse">
              <div className="w-full h-40 sm:h-48 bg-gray-200"></div>
              <div className="p-3 sm:p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No past treks yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {items.map(trek => (
            <div key={trek.trek_id} className="border rounded-lg overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow">
              {trek.images[0] ? (
                <img src={trek.images[0]} alt={trek.name} className="w-full h-40 sm:h-48 object-cover" />
              ) : null}
              <div className="p-3 sm:p-4">
                <h2 className="text-lg sm:text-xl font-semibold line-clamp-2">{trek.name}</h2>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {trek.location ? `${trek.location} • ` : ''}
                  {new Date(trek.start_datetime).toLocaleDateString('en-IN')}
                </div>
                {trek.description ? (
                  <p className="mt-2 line-clamp-3 text-xs sm:text-sm text-muted-foreground">{trek.description}</p>
                ) : null}
                {trek.images.length > 1 ? (
                  <div className="mt-3 flex gap-1 sm:gap-2 overflow-x-auto">
                    {trek.images.slice(1).map((url, idx) => (
                      <img key={idx} src={url} alt="" className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded flex-shrink-0" />
                    ))}
                  </div>
                ) : null}
                {isAdmin && trek.images[0] ? (
                  <div className="mt-3 sm:mt-4 flex items-center gap-2">
                    <Checkbox
                      id={`bg-${trek.trek_id}`}
                      checked={currentBg === trek.images[0]}
                      onCheckedChange={(val) => onToggleBackground(trek.images[0], Boolean(val))}
                      disabled={saving}
                    />
                    <label htmlFor={`bg-${trek.trek_id}`} className="text-xs sm:text-sm select-none cursor-pointer">
                      Set as page background
                    </label>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


