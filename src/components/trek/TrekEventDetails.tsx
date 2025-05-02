import React from 'react';
import { MapPin } from "lucide-react";

interface TrekEventDetailsProps {
  trek_id?: number;
  description?: string;
  duration?: string;
  transportMode?: 'cars' | 'mini_van' | 'bus' | null; // Added null
  maxParticipants?: number;
  currentParticipants?: number;
  pickupTimeWindow?: string | null; // Added null
  cancellationPolicy?: string | null; // Added null
}

export const TrekEventDetailsComponent: React.FC<TrekEventDetailsProps> = ({
  trek_id,
  description,
  duration,
  transportMode,
  maxParticipants,
  currentParticipants,
  pickupTimeWindow,
  cancellationPolicy,
}) => {
  // --- Packing List State --- Placeholder
  const [packingList, setPackingList] = React.useState<any[]>([]);
  const [packingLoading, setPackingLoading] = React.useState(false);

  React.useEffect(() => {
    if (!trek_id) return;
    setPackingLoading(true);
    // Replace with actual API call to fetch packing list for the trek_id
    // Example placeholder data:
    const packingListData = [
      { id: 1, name: 'Water Bottle (2L)', category: 'Essentials', mandatory: true },
      { id: 2, name: 'Snacks (Energy bars, nuts)', category: 'Essentials', mandatory: true },
      { id: 3, name: 'Sunscreen & Hat', category: 'Protection', mandatory: true },
      { id: 4, name: 'Rain Jacket/Poncho', category: 'Protection', mandatory: false },
      { id: 5, name: 'Trekking Poles', category: 'Gear', mandatory: false },
      { id: 6, name: 'First-Aid Kit', category: 'Safety', mandatory: true },
    ];
    // Simulate API delay
    setTimeout(() => {
        setPackingList(packingListData);
        setPackingLoading(false);
    }, 500); 
  }, [trek_id]);

  const groupedPackingList = packingList.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      {/* Description Section */}
      {description && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Event Description</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{description}</p>
        </div>
      )}
      
      {/* Key Details Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {duration && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs font-medium text-muted-foreground">Duration</p>
            <p className="font-medium">{duration}</p>
          </div>
        )}
        {transportMode && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs font-medium text-muted-foreground">Transport Mode</p>
            <p className="font-medium capitalize">{transportMode.replace('_', ' ')}</p>
          </div>
        )}
        {maxParticipants !== undefined && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs font-medium text-muted-foreground">Group Size</p>
            <p className="font-medium">
              {currentParticipants ?? '0'} / {maxParticipants} Participants
            </p>
          </div>
        )}
        {pickupTimeWindow && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs font-medium text-muted-foreground">Pickup Window</p>
            <p className="font-medium">{pickupTimeWindow}</p>
          </div>
        )}
      </div>

      {/* Packing Checklist Section */}
      <div>
        <h3 className="text-xl font-semibold mb-2 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          Packing Checklist (Example)
        </h3>
        {packingLoading ? (
          <div className="text-sm text-muted-foreground">Loading packing list...</div>
        ) : Object.keys(groupedPackingList).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(groupedPackingList).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-md font-medium mt-2 mb-1 text-primary/90">{category}</h4>
                <ul className="list-none pl-2 space-y-1">
                  {items.map((item, idx) => (
                    <li key={item.id || idx} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" id={`item-${item.id || idx}`} className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary/50" />
                      <label htmlFor={`item-${item.id || idx}`} className="cursor-pointer">
                        {item.name}
                        {item.mandatory ? 
                          <span className="ml-2 text-xs text-destructive font-semibold">(Mandatory)</span> : 
                          <span className="ml-2 text-xs text-muted-foreground font-medium">(Optional)</span>
                        }
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No packing list available for this trek yet.</p>
        )}
      </div>
      
       {/* Cancellation Policy Section */}
      {cancellationPolicy && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Cancellation Policy</h3>
          <p className="text-muted-foreground text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">
            {cancellationPolicy}
          </p>
        </div>
      )}
    </div>
  );
};
