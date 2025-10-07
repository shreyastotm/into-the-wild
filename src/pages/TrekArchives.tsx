import React, { useState, useEffect } from 'react';
import { TrekEventsList } from '@/components/trek/TrekEventsList';
import { NoTreksFound } from '@/components/trek/NoTreksFound';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { TrekEvent } from '@/components/trek/TrekEventsList';

const TrekArchives = () => {
  const [treks, setTreks] = useState<TrekEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  // Removed filters state as they might not be needed for archives initially

  useEffect(() => {
    fetchArchivedTreks();
  }, []); // Fetch only once on mount

  const fetchArchivedTreks = async () => {
    try {
      setLoading(true);

      // Select specific columns and rename/map them
      // Provide defaults for fields not in the trek_events table
      const query = supabase
        .from('trek_events')
        .select(`
          trek_id,
          name, 
          description,
          start_datetime,
          base_price, 
          max_participants,
          location,
          status,
          difficulty, 
          partner_id
        `)
        .lt('start_datetime', new Date().toISOString()) // Filter for past events
        .order('start_datetime', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Map the fetched data to the imported TrekEvent interface structure
      const formattedTreks = (data || []).map(trek => ({
        trek_id: trek.trek_id,
        trek_name: trek.name, // Map name to trek_name
        description: trek.description,
        category: trek.location || 'General',
        start_datetime: trek.start_datetime,
        duration: trek.difficulty || 'N/A',
        cost: Number(trek.base_price ?? 0),
        max_participants: Number(trek.max_participants ?? 0),
        participant_count: 0,
        location: trek.location,
        transport_mode: null,
        cancellation_policy: null,
        image_url: null,
        event_creator_type: trek.partner_id ? 'Partner' : 'Admin',
      }));

      setTreks(formattedTreks);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load trek archives";
      toast({
        title: "Error fetching archived treks",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error fetching archived treks:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Trek Archives</h1>
        {/* Optional: Add back button or other controls if needed */}
      </div>

      {/* Removed TrekFilters component - add back if filtering archives is desired */}

      {!loading && treks.length > 0 ? (
        // Reuse TrekEventsList, disable links if navigating to details isn't desired for archives
        <TrekEventsList treks={treks} useLinks={false} /> 
      ) : !loading ? (
        // Use a specific message for no archives, or reuse NoTreksFound
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold mb-2">No Archived Treks Found</h2>
          <p className="text-muted-foreground">Completed treks will appear here.</p>
        </div>
      ) : null}
    </div>
  );
};

export default TrekArchives; 