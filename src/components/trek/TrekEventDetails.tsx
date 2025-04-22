import React from 'react';
import { MapPin } from "lucide-react";

interface TrekEventDetailsProps {
  trek_id?: number;
  description?: string;
  duration?: string;
  transportMode?: 'cars' | 'mini_van' | 'bus';
  maxParticipants?: number;
  currentParticipants?: number;
  pickupTimeWindow?: string;
  cancellationPolicy?: string;
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
  // --- Packing List State ---
  const [packingList, setPackingList] = React.useState<any[]>([]);
  const [packingLoading, setPackingLoading] = React.useState(false);

  React.useEffect(() => {
    if (!trek_id) return;
    setPackingLoading(true);
    // Replace with actual API call to fetch packing list
    const packingListData = [
      { id: 1, name: 'Item 1', category: 'Category 1', mandatory: true },
      { id: 2, name: 'Item 2', category: 'Category 1', mandatory: false },
      { id: 3, name: 'Item 3', category: 'Category 2', mandatory: true },
      { id: 4, name: 'Item 4', category: 'Category 2', mandatory: false },
    ];
    setPackingList(packingListData);
    setPackingLoading(false);
  }, [trek_id]);

  const groupedPackingList = packingList.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div>
      <h3 className="text-xl font-semibold flex items-center">
        <MapPin className="h-5 w-5 mr-2" />
        Packing Checklist
      </h3>
      {packingLoading ? (
        <div className="text-sm text-gray-500">Loading packing list...</div>
      ) : (
        Object.keys(groupedPackingList).map((category, idx) => (
          <div key={idx}>
            <h4 className="text-lg font-medium mt-4">{category}</h4>
            <ul>
              {groupedPackingList[category].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" />
                  <span>{item.name}</span>
                  {item.mandatory ? <span className="ml-2 text-xs text-red-600 font-semibold">(Mandatory)</span> : <span className="ml-2 text-xs text-gray-500">(Optional)</span>}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};
