import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserTreks } from '@/components/dashboard/UserTreks';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/LoadingCard';
import { Mountain, Camera, MapPin, Tent, Compass, Award, TrendingUp } from 'lucide-react';
import { useHaptic } from '@/hooks/use-haptic';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const haptic = useHaptic();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Panning background effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      setMousePosition({ x, y });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  // Pre-sign-in view
  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Panning Background Image */}
        <div className="fixed inset-0 -z-10">
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02 + scrollY * 0.3}px) scale(1.1)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            <img 
              src="/itw_new_BG.jpg" 
              alt="Mountain landscape" 
              className="w-full h-full object-cover object-center"
              style={{ objectPosition: '50% 40%' }}
            />
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>

        {/* Content */}
        <div className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
          {/* Tent Icon */}
          <div className={cn(
            "mb-6 transition-all duration-1000",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          )}>
            <div className="relative">
              <div className="absolute -inset-4 bg-golden-500/20 rounded-full blur-xl" />
              <Tent className="relative h-24 w-24 text-white drop-shadow-2xl" />
            </div>
          </div>

          <h1 className={cn(
            "text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 transition-all duration-1000 delay-100",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          )}
          style={{
            textShadow: '0 4px 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)',
          }}>
            Your Base Camp Awaits
          </h1>
          
          <p className={cn(
            "text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl transition-all duration-1000 delay-200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          )}
          style={{
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          }}>
            Sign in to access your personal base camp, track your adventures, and plan your next trek
          </p>

          <div className={cn(
            "flex flex-wrap gap-4 justify-center transition-all duration-1000 delay-300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          )}>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-golden-600 to-coral-600 text-white hover:scale-105 shadow-2xl font-bold border-2 border-white/30"
              onClick={() => {
                haptic.medium();
                navigate('/auth?mode=signin');
              }}
            >
              Sign In
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="bg-white/95 border-2 border-white text-gray-900 hover:bg-white hover:scale-105 shadow-2xl backdrop-blur-xl font-semibold"
              onClick={() => {
                haptic.light();
                navigate('/auth?mode=signup');
              }}
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Signed-in view - Base Camp Dashboard
  return (
    <div className="min-h-screen relative">
      {/* Panning Background Image */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015 + scrollY * 0.2}px) scale(1.08)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          <img 
            src="/itw_new_BG.jpg" 
            alt="Mountain landscape" 
            className="w-full h-full object-cover object-center"
            style={{ objectPosition: '50% 35%' }}
          />
        </div>
        
        {/* Lighter overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/70 dark:from-black/70 dark:via-black/50 dark:to-black/70" />
      </div>

      {/* Hide default header on mobile - handled in Layout component */}
      
      {/* Content - Mobile optimized */}
      <div className="relative py-6 px-4 pb-24 md:pb-12">
        {/* Welcome Section - Tent */}
        <section className={cn(
          "text-center mb-8 transition-all duration-1000",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-golden-100 to-coral-100 dark:from-golden-900/30 dark:to-coral-900/30 shadow-xl">
            <Tent className="h-10 w-10 text-golden-600 dark:text-golden-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
            Welcome Back, {user.user_metadata?.full_name || 'Trekker'}!
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            Your base camp • Ready for adventure
          </p>
        </section>

        {/* Quick Stats - Campsite Stations */}
        <section className={cn(
          "mb-8 transition-all duration-1000 delay-100",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <StatStation 
              icon={<Mountain className="h-6 w-6" />}
              value="5"
              label="Treks"
              color="teal"
            />
            <StatStation 
              icon={<Camera className="h-6 w-6" />}
              value="127"
              label="Photos"
              color="golden"
            />
            <StatStation 
              icon={<Award className="h-6 w-6" />}
              value="3"
              label="Badges"
              color="coral"
            />
            <StatStation 
              icon={<TrendingUp className="h-6 w-6" />}
              value="15km"
              label="Distance"
              color="teal"
            />
          </div>
        </section>

        {/* Trail Map - Your Treks */}
        <section className={cn(
          "mb-8 transition-all duration-1000 delay-200",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30">
                  <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trail Map</h2>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  haptic.light();
                  navigate('/events');
                }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
              >
                Browse Treks
              </Button>
            </div>
            
            {/* Trek Cards Container */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border-2 border-white/50 dark:border-gray-700/50">
              <UserTreks />
            </div>
          </div>
        </section>

        {/* Next Adventure CTA */}
        <section className={cn(
          "transition-all duration-1000 delay-300",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-golden-500 via-coral-500 to-teal-500 p-8 text-center shadow-2xl">
              {/* Compass decoration */}
              <div className="absolute top-4 right-4 opacity-10">
                <Compass className="h-32 w-32 animate-[spin_20s_linear_infinite]" />
              </div>
              
              <div className="relative">
                <Compass className="h-12 w-12 text-white mx-auto mb-4" />
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Ready for Your Next Adventure?
                </h3>
                <p className="text-white/90 mb-6 max-w-md mx-auto">
                  Explore new trails, discover hidden gems, and create unforgettable memories
                </p>
                <Button
                  size="lg"
                  className="bg-white text-coral-600 hover:bg-white/90 hover:scale-105 shadow-xl font-bold"
                  onClick={() => {
                    haptic.medium();
                    navigate('/events');
                  }}
                >
                  Explore Treks
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// Stat Station Component (like campsite stations)
const StatStation = ({ 
  icon, 
  value, 
  label,
  color 
}: { 
  icon: React.ReactNode; 
  value: string; 
  label: string;
  color: 'golden' | 'teal' | 'coral';
}) => {
  const colorClasses = {
    golden: 'from-golden-400 to-golden-600 text-golden-600 dark:text-golden-400',
    teal: 'from-teal-400 to-teal-600 text-teal-600 dark:text-teal-400',
    coral: 'from-coral-400 to-coral-600 text-coral-600 dark:text-coral-400',
  };

  const bgClasses = {
    golden: 'from-golden-100 to-golden-200 dark:from-golden-900/30 dark:to-golden-800/30',
    teal: 'from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30',
    coral: 'from-coral-100 to-coral-200 dark:from-coral-900/30 dark:to-coral-800/30',
  };

  return (
    <div className="group relative">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/50 dark:border-gray-700/50">
        <div className={cn(
          "inline-flex p-3 rounded-xl mb-3 bg-gradient-to-br shadow-md",
          bgClasses[color]
        )}>
          <div className={colorClasses[color]}>
            {icon}
          </div>
        </div>
        <div className={cn(
          "text-3xl font-bold mb-1 bg-gradient-to-br bg-clip-text text-transparent",
          colorClasses[color]
        )}>
          {value}
        </div>
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

