
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { MapPin, Calendar, Users } from 'lucide-react';

interface Trek {
  trek_id: number;
  trek_name: string;
  category: string | null;
  start_datetime: string;
  cost: number;
  max_participants: number;
  current_participants: number | null;
}

export const UpcomingTreks: React.FC<{ limit?: number }> = ({ limit = 3 }) => {
  const [treks, setTreks] = useState<Trek[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcomingTreks();
  }, [limit]);

  const fetchUpcomingTreks = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('trek_events')
        .select('trek_id, trek_name, category, start_datetime, cost, max_participants, current_participants')
        .gt('start_datetime', now)
        .order('start_datetime', { ascending: true })
        .limit(limit);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setTreks(data);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching treks",
        description: error.message || "Failed to load upcoming treks",
        variant: "destructive",
      });
      console.error("Error fetching upcoming treks:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-4 text-center">Loading upcoming treks...</div>;
  }

  if (treks.length === 0) {
    return <div className="py-4 text-center">No upcoming treks found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {treks.map((trek) => (
        <div 
          key={trek.trek_id} 
          className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate(`/trek-events/${trek.trek_id}`)}
        >
          <div className="h-40 bg-gray-200 relative">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Trek Image
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{trek.trek_name}</h3>
            {trek.category && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                {trek.category}
              </span>
            )}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date(trek.start_datetime).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                <span>{trek.current_participants || 0}/{trek.max_participants} participants</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>See details</span>
              </div>
            </div>
            <div className="mt-3 font-bold text-lg">₹{trek.cost}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
