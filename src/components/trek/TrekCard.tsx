import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, Clock, Star, Compass, Mountain, Zap, TreePine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/use-haptic';

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
  onClick?: () => void;
}

const TrekCard: React.FC<TrekCardProps> = ({ trek, className, onClick }) => {
  const haptic = useHaptic();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-700';
      case 'moderate':
        return 'bg-golden-100 dark:bg-golden-900/30 text-golden-800 dark:text-golden-300 border-golden-200 dark:border-golden-700';
      case 'hard':
        return 'bg-coral-100 dark:bg-coral-900/30 text-coral-800 dark:text-coral-300 border-coral-200 dark:border-coral-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const handleCardClick = () => {
    haptic.light();
    onClick?.();
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return <TreePine className="h-3 w-3 text-green-600" />;
      case 'moderate':
        return <Mountain className="h-3 w-3 text-yellow-600" />;
      case 'hard':
        return <Zap className="h-3 w-3 text-red-600" />;
      default:
        return <Mountain className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <Card
      className={cn(
        "group overflow-hidden border-0 shadow-lg hover:shadow-2xl card-interactive touch-ripple cursor-pointer relative",
        "bg-gradient-to-br from-amber-50 to-yellow-50/80 dark:from-amber-950/40 dark:to-yellow-950/20",
        "border-2 border-amber-200/50 dark:border-amber-800/50",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Compact Image - 16:9 ratio with organic enhancements */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {/* Paper texture overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='4' /%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
          }}
        />

        <img
          src={trek.image}
          alt={trek.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Organic vignette - not circular */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id={`vignette-${trek.id}`} cx="50%" cy="50%">
                <stop offset="0%" stopColor="black" stopOpacity="0" />
                <stop offset="60%" stopColor="black" stopOpacity="0" />
                <stop offset="100%" stopColor="black" stopOpacity="0.3" />
              </radialGradient>
            </defs>
            <ellipse
              cx="50%"
              cy="50%"
              rx="70%"
              ry="60%"
              fill={`url(#vignette-${trek.id})`}
            />
          </svg>
        </div>
        
        {/* Top Row - Nature-Inspired Difficulty & Featured Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
          {/* Difficulty Badge - Leaf Shape */}
          <div className={cn(
            "relative",
            getDifficultyColor(trek.difficulty)
          )}>
            {/* Leaf shadow */}
            <div className="absolute -inset-0.5 bg-current opacity-20 blur-sm rounded-full" />
            <span className="relative inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full border backdrop-blur-sm shadow-lg bg-white/90 dark:bg-gray-900/90">
              {getDifficultyIcon(trek.difficulty)}
              <span className="ml-1">
                {trek.difficulty.charAt(0).toUpperCase() + trek.difficulty.slice(1)}
              </span>
            </span>
          </div>

          {trek.featured && (
            <div className="relative">
              {/* Compass rose glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-golden-400 to-golden-600 rounded-full blur-sm opacity-50" />
              <span className="relative inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-golden-400 to-golden-600 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm animate-pulse-subtle">
                <Compass className="h-3 w-3 fill-current animate-[spin_3s_linear_infinite]" />
                Featured
              </span>
            </div>
          )}
        </div>
        
        {/* Bottom Row - Title & Price */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-lg md:text-xl mb-1 line-clamp-2 drop-shadow-md">
                {trek.title}
              </h3>
              <div className="flex items-center gap-2 text-white/90 text-xs">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{trek.location}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-golden-300 text-xs font-medium">from</div>
              <div className="text-white font-bold text-xl drop-shadow-md">₹{trek.price.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Logo Watermark (appears on hover) */}
        <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
          <img 
            src="/itw_logo.png" 
            alt="" 
            className="h-24 w-auto translate-x-3 translate-y-3 rotate-12"
          />
        </div>
      </div>
      
      {/* Compact Meta Info with organic styling */}
      <CardContent className="p-4 bg-gradient-to-br from-amber-50/80 to-yellow-50/60 dark:from-amber-950/40 dark:to-yellow-950/20 relative">
        {/* Torn edge effect */}
        <div className="absolute -top-2 left-0 right-0 h-2 bg-amber-100/50 dark:bg-amber-900/30"
          style={{
            clipPath: 'polygon(0 100%, 3% 0%, 8% 40%, 12% 10%, 18% 60%, 22% 20%, 28% 80%, 32% 30%, 38% 70%, 42% 15%, 48% 85%, 52% 25%, 58% 75%, 62% 35%, 68% 90%, 72% 20%, 78% 65%, 82% 40%, 88% 80%, 92% 25%, 98% 60%, 100% 15%, 100% 100%)',
          }}
        />

        <div className="grid grid-cols-3 gap-2 text-center relative z-10">
          <MetaItem
            icon={<Calendar className="h-4 w-4 text-amber-700 dark:text-amber-400" />}
            value={new Date(trek.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            label="Date"
          />
          <MetaItem
            icon={<Users className="h-4 w-4 text-amber-700 dark:text-amber-400" />}
            value={`${trek.participants}/${trek.maxParticipants}`}
            label="Spots"
          />
          <MetaItem
            icon={<Clock className="h-4 w-4 text-amber-700 dark:text-amber-400" />}
            value={trek.duration}
            label="Duration"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Compact Meta Item Component - Organic styling
const MetaItem = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
  <div className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg bg-white/60 dark:bg-amber-900/20 backdrop-blur-sm border border-amber-200/30 dark:border-amber-800/30">
    <div className="text-amber-700 dark:text-amber-400">
      {icon}
    </div>
    <div className="text-sm font-bold text-amber-900 dark:text-amber-100">
      {value}
    </div>
    <div className="text-xs text-amber-700 dark:text-amber-400 font-medium uppercase tracking-wider">
      {label}
    </div>
  </div>
);

export default TrekCard;
