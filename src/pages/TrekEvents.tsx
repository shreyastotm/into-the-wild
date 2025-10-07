import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrekEventsList } from '@/components/trek/TrekEventsList';

interface DisplayTrekEvent {
  trek_id: number;
  name: string;
  image_url: string | null;
  cost: number | null;
  start_datetime: string;
  duration: string | null;
  location: string | null;
  cancellation_policy: string | null;
  event_creator_type: string;
  transport_mode: string | null;
  participant_count: number;
}

const TrekEvents = () => {
  const [events, setEvents] = useState<DisplayTrekEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Adventures - Into the Wild';
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trek_events')
        .select('*')
        .not('status', 'in', '(DRAFT,CANCELLED)');
      if (error) throw error;

      const fetchedData = (data as any[]) || [];
      const displayEvents: DisplayTrekEvent[] = fetchedData.map((eventFromDb: any) => ({
        trek_id: eventFromDb.trek_id,
        name: eventFromDb.name,
        image_url: eventFromDb.image_url,
        cost: eventFromDb.base_price,
        start_datetime: eventFromDb.start_datetime,
        duration: eventFromDb.duration || null,
        location: eventFromDb.location || null,
        cancellation_policy: eventFromDb.cancellation_policy || null,
        event_creator_type: eventFromDb.event_creator_type || '',
        transport_mode: eventFromDb.transport_mode || null,
        participant_count: 0,
      }));

      setEvents(displayEvents);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load adventures";
      console.error('Error fetching adventures:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Upcoming Adventures</h1>
        <Button onClick={() => navigate('/trek-events/create')}>Create Adventure</Button>
      </div>

      {!loading && events.length > 0 ? (
        <TrekEventsList treks={events} />
      ) : !loading && events.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No adventures available right now.</Card>
      ) : null}
    </div>
  );
};

export default TrekEvents;
