import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrekEventStatus } from '@/types/trek';
import TrekCardBase from './TrekCardBase';

// Define type for Trek Events
export interface TrekEvent {
  trek_id: number;
  trek_name: string;
  description: string | null;
  category: string | null;
  start_datetime: string;
  duration?: string | null;
  cost: number;
  max_participants: number;
  participant_count: number | null;
  location: { name?: string } | null;
  transport_mode: 'cars' | 'mini_van' | 'bus' | null;
  cancellation_policy: string | null;
  image_url?: string | null;
  event_creator_type: string;
  status?: TrekEventStatus | string | null;
}

interface TrekEventsListProps {
  treks: TrekEvent[];
  useLinks?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  showProgress?: boolean;
  showStatus?: boolean;
  showTimeStatus?: boolean;
  showTransport?: boolean;
  showCategory?: boolean;
  showLocation?: boolean;
  showDuration?: boolean;
  showDescription?: boolean;
  showCreator?: boolean;
  onRegister?: (trekId: number) => void;
  onBookmark?: (trekId: number) => void;
  onShare?: (trekId: number) => void;
  isBookmarked?: (trekId: number) => boolean;
  isRegistered?: (trekId: number) => boolean;
  className?: string;
}

export const TrekEventsList: React.FC<TrekEventsListProps> = ({ 
  treks, 
  useLinks = true,
  variant = 'default',
  showActions = true,
  showProgress = true,
  showStatus = true,
  showTimeStatus = true,
  showTransport = true,
  showCategory = true,
  showLocation = true,
  showDuration = true,
  showDescription = true,
  showCreator = false,
  onRegister,
  onBookmark,
  onShare,
  isBookmarked,
  isRegistered,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleTrekClick = (trekId: number) => {
    navigate(`/trek-events/${trekId}`);
  };

  const handleRegister = (trekId: number) => {
    if (onRegister) {
      onRegister(trekId);
    } else {
      navigate(`/trek-events/${trekId}#register`);
    }
  };

  const handleBookmark = (trekId: number) => {
    if (onBookmark) {
      onBookmark(trekId);
    }
  };

  const handleShare = (trekId: number) => {
    if (onShare) {
      onShare(trekId);
    }
  };

  const getGridClasses = () => {
    switch (variant) {
      case 'compact':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3';
      case 'detailed':
        return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6';
    }
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {treks.map((trek) => (
        <TrekCardBase
          key={trek.trek_id}
          trek={trek}
          variant={variant}
          showImage={true}
          showActions={showActions}
          showProgress={showProgress}
          showStatus={showStatus}
          showTimeStatus={showTimeStatus}
          showTransport={showTransport}
          showCategory={showCategory}
          showLocation={showLocation}
          showDuration={showDuration}
          showDescription={showDescription}
          showCreator={showCreator}
          onCardClick={useLinks ? handleTrekClick : undefined}
          onRegister={handleRegister}
          onBookmark={onBookmark ? handleBookmark : undefined}
          onShare={onShare ? handleShare : undefined}
          isBookmarked={isBookmarked?.(trek.trek_id) || false}
          isRegistered={isRegistered?.(trek.trek_id) || false}
          className="hover:shadow-lg transition-shadow duration-200"
        />
      ))}
    </div>
  );
};

export default TrekEventsList;
