import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { formatDistanceToNow, isPast, isToday, isTomorrow, format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

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
  image_url?: string | null;
}

interface TrekEventsListProps {
  treks: TrekEvent[];
  useLinks?: boolean;
}

export const TrekEventsList: React.FC<TrekEventsListProps> = ({ treks, useLinks = true }) => {
  const navigate = useNavigate();
  
  const getCategoryColor = (category: string | null) => {
    if (!category) return "bg-gray-100 text-gray-800";
    
    const categoryMap: Record<string, string> = {
      'Beginner': 'bg-green-100 text-green-800', 
      'Intermediate': 'bg-blue-100 text-blue-800',
      'Advanced': 'bg-red-100 text-red-800',
      'Family': 'bg-purple-100 text-purple-800',
      'Weekend': 'bg-amber-100 text-amber-800',
      'Overnight': 'bg-indigo-100 text-indigo-800',
      'Day Trek': 'bg-sky-100 text-sky-800',
    };
    
    return categoryMap[category] || "bg-gray-100 text-gray-800";
  };
  
  const getTimeStatus = (dateStr: string) => {
    const date = new Date(dateStr);
    
    if (isPast(date)) return null;
    if (isToday(date)) return { label: 'Today', class: 'bg-green-500 text-white' };
    if (isTomorrow(date)) return { label: 'Tomorrow', class: 'bg-blue-500 text-white' };
    
    const daysUntil = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 3) return { label: `In ${daysUntil} days`, class: 'bg-amber-500 text-white' };
    
    return null;
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const getSpacesLeftText = (current: number | null, max: number) => {
    const filled = current || 0;
    const remaining = max - filled;
    
    if (remaining === 0) return "Fully Booked";
    if (remaining <= 3) return `Only ${remaining} spots left`;
    return `${remaining} spots available`;
  };
  
  const getSpacesLeftColor = (current: number | null, max: number) => {
    const filled = current || 0;
    const remaining = max - filled;
    const fillPercentage = (filled / max) * 100;
    
    if (remaining === 0) return "text-red-600 font-semibold";
    if (fillPercentage >= 75) return "text-amber-600 font-semibold";
    return "text-green-600";
  };

  const handleTrekClick = (trekId: number) => {
    navigate(`/trek-events/${trekId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {treks.map((trek) => {
        const timeStatus = getTimeStatus(trek.start_datetime);
        
        const cardContent = (
          <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20 relative">
            {/* Trek Image Display */}
            {trek.image_url && (
              <img
                src={trek.image_url}
                alt="Trek Event"
                className="w-full h-40 object-cover border-b border-gray-200"
              />
            )}
            {timeStatus && (
              <Badge className={`absolute top-3 right-3 z-10 ${timeStatus.class}`}>
                {timeStatus.label}
              </Badge>
            )}
            
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start gap-2 mb-1">
                <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {trek.trek_name}
                </h3>
                {trek.category && (
                  <Badge variant="outline" className={`${getCategoryColor(trek.category)}`}>
                    {trek.category}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {trek.description || "No description available"}
              </p>
            </CardHeader>
            
            <CardContent className="pb-3">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {format(new Date(trek.start_datetime), 'EEE, MMM d, yyyy')}
                  </span>
                </div>
                
                {trek.duration && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Duration: {trek.duration}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className={getSpacesLeftColor(trek.current_participants, trek.max_participants)}>
                    {getSpacesLeftText(trek.current_participants, trek.max_participants)}
                  </span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-0 flex justify-between items-center border-t">
              <div>
                <p className="text-sm text-muted-foreground">Starts {formatDistanceToNow(new Date(trek.start_datetime), { addSuffix: true })}</p>
              </div>
              <div>
                <p className="font-bold text-lg">{formatCurrency(trek.cost)}</p>
              </div>
            </CardFooter>
          </Card>
        );
        
        if (useLinks) {
          return (
            <div 
              key={trek.trek_id} 
              className="group cursor-pointer" 
              onClick={() => handleTrekClick(trek.trek_id)}
            >
              {cardContent}
            </div>
          );
        } else {
          return (
            <div key={trek.trek_id} className="group">
              {cardContent}
            </div>
          );
        }
      })}
    </div>
  );
};
