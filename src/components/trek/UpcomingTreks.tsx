import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { supabase } from '@/integrations/supabase/client';

interface Trek {
  trek_id: number;
  name: string;
  image_url: string | null;
  start_datetime: string;
}

export const UpcomingTreks: React.FC<{ limit?: number }> = ({ limit = 3 }) => {
  const [treks, setTreks] = useState<Trek[]>([]);
  const navigate = useNavigate();

  const fetchUpcomingTreks = useCallback(async () => {
    const { data, error } = await supabase
      .from('trek_events')
      .select('trek_id, name, image_url, start_datetime')
      .gte('start_datetime', new Date().toISOString())
      .order('start_datetime', { ascending: true })
      .limit(limit);
    if (!error) {
      setTreks((data as Trek[]) || []);
    }
  }, [limit]);

  useEffect(() => {
    fetchUpcomingTreks();
  }, [limit, fetchUpcomingTreks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {treks.map((trek) => {
        const start = toZonedTime(new Date(trek.start_datetime), 'Asia/Kolkata');
        return (
          <Card key={trek.trek_id} className="overflow-hidden">
            {trek.image_url && (
              <img src={trek.image_url} alt={trek.name} className="w-full h-40 object-cover" />)
            }
            <div className="p-4">
              <h3 className="font-semibold mb-1">{trek.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{format(start, 'EEE, MMM d, yyyy')} at {format(start, 'h:mm a')} IST</p>
              <Button variant="outline" size="sm" onClick={() => navigate(`/trek-events/${trek.trek_id}`)}>
                View Adventure
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

