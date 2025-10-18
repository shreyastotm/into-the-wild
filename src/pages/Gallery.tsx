import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { setHomeBackground, getHomeBackground } from '@/lib/siteSettings';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { MobilePage, MobileSection, MobileCard, MobileGrid } from '@/components/mobile/MobilePage';

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
    <MobilePage>
      <MobileSection title="Our Past Adventures">
        {loading ? (
          <MobileGrid>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="mobile-skeleton h-64 rounded-2xl" />
            ))}
          </MobileGrid>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="mobile-body text-gray-500 dark:text-gray-400">
              No past treks yet.
            </p>
          </div>
        ) : (
          <MobileGrid>
            {items.map(trek => (
              <MobileCard key={trek.trek_id} hoverable className="overflow-hidden p-0">
                {trek.images[0] && (
                  <div className="mobile-aspect-card overflow-hidden">
                    <img 
                      src={trek.images[0]} 
                      alt={trek.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="mobile-heading-3 line-clamp-2">{trek.name}</h2>
                  <div className="mobile-caption mt-2">
                    {trek.location && `${trek.location} • `}
                    {new Date(trek.start_datetime).toLocaleDateString('en-IN')}
                  </div>
                  {trek.description && (
                    <p className="mobile-body-small mt-3 line-clamp-3">
                      {trek.description}
                    </p>
                  )}
                  {trek.images.length > 1 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto mobile-scroll-container">
                      {trek.images.slice(1).map((url, idx) => (
                        <img 
                          key={idx} 
                          src={url} 
                          alt="" 
                          className="w-16 h-16 object-cover rounded-xl flex-shrink-0 mobile-scroll-item"
                        />
                      ))}
                    </div>
                  )}
                  {isAdmin && trek.images[0] && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
                      <Checkbox
                        id={`bg-${trek.trek_id}`}
                        checked={currentBg === trek.images[0]}
                        onCheckedChange={(val) => onToggleBackground(trek.images[0], Boolean(val))}
                        disabled={saving}
                      />
                      <label 
                        htmlFor={`bg-${trek.trek_id}`} 
                        className="mobile-body-small select-none cursor-pointer"
                      >
                        Set as page background
                      </label>
                    </div>
                  )}
                </div>
              </MobileCard>
            ))}
          </MobileGrid>
        )}
      </MobileSection>
    </MobilePage>
  );
}


