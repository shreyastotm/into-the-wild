import React from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface Participant {
  id: string;
  name: string | null;
  avatar?: string | null;
  joinedAt: string;
  isEventCreator?: boolean;
}

interface TrekParticipantsProps {
  participants: Participant[];
  maxParticipants: number;
  currentUser?: string | null;
}

export const TrekParticipants: React.FC<TrekParticipantsProps> = ({ 
  participants, 
  maxParticipants,
  currentUser 
}) => {
  // Sort participants so that the event creator is first, followed by the current user, then others
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.isEventCreator) return -1;
    if (b.isEventCreator) return 1;
    if (a.id === currentUser) return -1;
    if (b.id === currentUser) return 1;
    return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
  });

  // Only count unique user_ids for spots/participants logic
  const uniqueUserIds = Array.from(new Set(participants.map(p => p.id)));
  const remainingSpots = maxParticipants - uniqueUserIds.length;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold flex items-center">
        <User className="h-5 w-5 mr-2" />
        Participants ({uniqueUserIds.length}/{maxParticipants})
      </h3>

      <div className="flex flex-wrap gap-3 mb-4">
        <TooltipProvider>
          {sortedParticipants.map(participant => (
            <Tooltip key={participant.id}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center">
                  <Avatar className={`h-12 w-12 ${participant.isEventCreator ? 'ring-2 ring-primary ring-offset-2' : ''} ${participant.id === currentUser ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}>
                    <AvatarImage src={participant.avatar || undefined} alt={participant.name || 'User'} />
                    <AvatarFallback className="bg-primary/10 text-primary-foreground">
                      {participant.name ? participant.name.substring(0, 2).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {participant.isEventCreator && (
                    <span className="text-xs font-medium mt-1 text-primary">Organizer</span>
                  )}
                  {participant.id === currentUser && !participant.isEventCreator && (
                    <span className="text-xs font-medium mt-1 text-blue-500">You</span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{participant.name || 'Anonymous User'}</p>
                <p className="text-xs text-gray-500">Joined: {new Date(participant.joinedAt).toLocaleDateString()}</p>
                {participant.isEventCreator && <p className="text-xs font-medium text-primary">Event Organizer</p>}
              </TooltipContent>
            </Tooltip>
          ))}
          
          {remainingSpots > 0 && Array.from({ length: Math.min(remainingSpots, 5) }).map((_, index) => (
            <div key={`empty-${index}`} className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-300" />
              </div>
              <span className="text-xs text-gray-400 mt-1">Open</span>
            </div>
          ))}
          
          {remainingSpots > 5 && (
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-400">+{remainingSpots - 5}</span>
              </div>
              <span className="text-xs text-gray-400 mt-1">More</span>
            </div>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
};
