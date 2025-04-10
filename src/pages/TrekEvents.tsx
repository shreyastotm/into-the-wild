
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Define type for Trek Events
interface TrekEvent {
  trek_id: number;
  trek_name: string;
  description: string | null;
  category: string | null;
  start_datetime: string;
  duration: string | null;
  cost: number;
  max_participants: number;
  current_participants: number | null;
  location: any | null; // Using any for geography type
  transport_mode: 'cars' | 'mini_van' | 'bus' | null;
  cancellation_policy: string | null;
}

export default function TrekEvents() {
  const { user } = useAuth();
  const [trekEvents, setTrekEvents] = useState<TrekEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrekEvents();
  }, []);

  async function fetchTrekEvents() {
    try {
      setLoading(true);
      
      // Fetch all trek events
      const { data, error } = await supabase
        .from('trek_events')
        .select('*')
        .order('start_datetime', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setTrekEvents(data);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching trek events",
        description: error.message || "Failed to load trek events",
        variant: "destructive",
      });
      console.error("Error fetching trek events:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Trek Events</h1>
        {user && (
          <Link to="/trek-events/create">
            <Button>Create New Event</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center">
          <p>Loading events...</p>
        </div>
      ) : trekEvents.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">No trek events available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trekEvents.map((trek) => (
            <Link to={`/trek-events/${trek.trek_id}`} key={trek.trek_id}>
              <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{trek.trek_name}</h2>
                  <p className="text-gray-700 mb-3">{trek.description?.substring(0, 150)}...</p>
                  <div className="flex justify-between text-sm text-gray-600">
                    <div>
                      <p>
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(trek.start_datetime).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Category:</span> {trek.category || "General"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{trek.cost}</p>
                      <p>
                        {trek.current_participants || 0}/{trek.max_participants} participants
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
