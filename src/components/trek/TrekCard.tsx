import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrekCardProps {
  trek: {
    id: string;
    title: string;
    description: string;
    image: string;
    location: string;
    date: string;
    price: number;
    difficulty: 'easy' | 'moderate' | 'hard';
    participants: number;
    maxParticipants: number;
    duration: string;
    featured?: boolean;
  };
  className?: string;
}

const TrekCard: React.FC<TrekCardProps> = ({ trek, className }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className={cn("group cursor-pointer overflow-hidden", className)}>
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden rounded-t-xl">
        <img 
          src={trek.image} 
          alt={trek.title}
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Featured Badge */}
        {trek.featured && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold rounded-full shadow-lg animate-pulse-subtle">
              Featured
            </span>
          </div>
        )}
        
        {/* Difficulty Badge */}
        <div className="absolute bottom-4 left-4">
          <span className={cn(
            "inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border",
            getDifficultyColor(trek.difficulty)
          )}>
            {trek.difficulty.charAt(0).toUpperCase() + trek.difficulty.slice(1)}
          </span>
        </div>
        
        {/* Logo Watermark (appears on hover) */}
        <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
          <img 
            src="/itw_logo.png" 
            alt="" 
            className="h-32 w-auto translate-x-4 translate-y-4 rotate-12"
          />
        </div>
      </div>
      
      {/* Content */}
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {trek.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {trek.description}
        </p>
        
        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {trek.location}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {trek.date}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {trek.participants}/{trek.maxParticipants}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {trek.duration}
          </span>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">
            ₹{trek.price}
          </div>
          <Button size="sm" className="btn-primary">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrekCard;
