
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

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
  location: any | null;
  transport_mode: 'cars' | 'mini_van' | 'bus' | null;
  cancellation_policy: string | null;
}

interface TrekEventsListProps {
  treks: TrekEvent[];
}

export const TrekEventsList: React.FC<TrekEventsListProps> = ({ treks }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {treks.map((trek) => (
        <Link to={`/trek-events/${trek.trek_id}`} key={trek.trek_id}>
          <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div className="p-4">
              <div className="flex justify-between mb-2">
                <h2 className="text-xl font-semibold">{trek.trek_name}</h2>
                {trek.category && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {trek.category}
                  </span>
                )}
              </div>
              <p className="text-gray-700 mb-3">{trek.description?.substring(0, 150)}{trek.description && trek.description.length > 150 ? '...' : ''}</p>
              <div className="flex justify-between text-sm text-gray-600">
                <div>
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(trek.start_datetime).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span> {trek.duration || "Not specified"}
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
  );
};
