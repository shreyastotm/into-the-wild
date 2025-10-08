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
        setItems(merged);
      } catch (e) {
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Past Adventures</h1>
      {loading ? (
        <div>Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-muted-foreground">No past treks yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(trek => (
            <div key={trek.trek_id} className="border rounded-lg overflow-hidden shadow-sm bg-white">
              {trek.images[0] ? (
                <img src={trek.images[0]} alt={trek.name} className="w-full h-48 object-cover" />
              ) : null}
              <div className="p-4">
                <h2 className="text-xl font-semibold">{trek.name}</h2>
                <div className="text-sm text-muted-foreground">
                  {trek.location ? `${trek.location} • ` : ''}
                  {new Date(trek.start_datetime).toLocaleDateString('en-IN')}
                </div>
                {trek.description ? (
                  <p className="mt-2 line-clamp-3 text-sm">{trek.description}</p>
                ) : null}
                {trek.images.length > 1 ? (
                  <div className="mt-3 flex gap-2">
                    {trek.images.slice(1).map((url, idx) => (
                      <img key={idx} src={url} alt="" className="w-14 h-14 object-cover rounded" />
                    ))}
                  </div>
                ) : null}
                {isAdmin && trek.images[0] ? (
                  <div className="mt-4 flex items-center gap-2">
                    <Checkbox
                      id={`bg-${trek.trek_id}`}
                      checked={currentBg === trek.images[0]}
                      onCheckedChange={(val) => onToggleBackground(trek.images[0], Boolean(val))}
                      disabled={saving}
                    />
                    <label htmlFor={`bg-${trek.trek_id}`} className="text-sm select-none">
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


