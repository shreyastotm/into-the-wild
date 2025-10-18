import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown, Mountain, Users, Camera, Wind } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useHaptic } from '@/hooks/use-haptic';
import { usePageStyle } from '@/hooks/usePageStyle';
import { cn } from '@/lib/utils';

// Floating Triangle Button Component - Draggable
const FloatingTriangleButton = ({ onClick, isVisible }: { onClick: () => void; isVisible: boolean }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  // Load saved position or set default to bottom-right
  useEffect(() => {
    const saved = localStorage.getItem('floating-triangle-position');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosition(parsed);
      } catch (e) {
        // Invalid saved position, use default bottom-right
        setDefaultPosition();
      }
    } else {
      // No saved position, use default bottom-right
      setDefaultPosition();
    }
  }, []);

  const setDefaultPosition = () => {
    const padding = 20;
    const buttonSize = 86;
    const defaultX = window.innerWidth - buttonSize - padding;
    const defaultY = window.innerHeight - buttonSize - padding;
    setPosition({ x: defaultX, y: defaultY });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    e.preventDefault();
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Constrain to viewport with padding
    const padding = 20;
    const maxX = window.innerWidth - 86 - padding; // 86px is button width (10% smaller)
    const maxY = window.innerHeight - 86 - padding;

    setPosition({
      x: Math.max(padding, Math.min(newX, maxX)),
      y: Math.max(padding, Math.min(newY, maxY)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) {
      onClick();
      return;
    }

    setIsDragging(false);

    // If barely moved, treat as click
    const moved = Math.abs(e.clientX - (dragStart.x + position.x)) +
                  Math.abs(e.clientY - (dragStart.y + position.y));

    if (moved < 10) {
      onClick();
    } else {
      // Save position
      localStorage.setItem('floating-triangle-position', JSON.stringify(position));
    }
  };

  return (
    <div
      ref={buttonRef}
      className={cn(
        "fixed z-50 transition-all duration-1000 delay-300",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      style={{
        left: position.x,
        top: position.y,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setIsDragging(false)}
    >
      {/* Dewdrop effect - realistic water drop appearance (25% enhanced impact) */}
      <div className="absolute -inset-4 rounded-full overflow-hidden">
        {/* Water droplet shape with refraction - enhanced */}
        <div className="absolute inset-0 bg-gradient-radial from-white/85 via-blue-300/40 to-transparent rounded-full" />
        {/* Primary highlight for water droplet effect - enhanced */}
        <div className="absolute top-1 left-2 w-4 h-3 bg-white/90 rounded-full blur-[1px]" />
        {/* Secondary highlight for more depth */}
        <div className="absolute top-0.5 left-1.5 w-2 h-1.5 bg-white/95 rounded-full blur-[0.5px]" />
        {/* Shadow for depth - enhanced */}
        <div className="absolute -bottom-1 -right-1 w-5 h-3 bg-black/25 rounded-full blur-[2.5px]" />
        {/* Additional depth shadow */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-2 bg-black/15 rounded-full blur-[1.5px]" />
      </div>

      {/* Enhanced outer glow - 25% more impactful */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-white/25 via-golden-300/25 to-white/25 rounded-full blur-xl opacity-75" />
      {/* Additional subtle glow layer */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white/15 via-blue-200/15 to-white/15 rounded-full blur-lg opacity-50" />

      {/* Triangle Button - 10% smaller than before (was 96px, now 86px) */}
      <button
        className="relative block w-[86px] h-[86px] transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/50 rounded-full"
        aria-label="Explore Treks"
      >
        <img
          src="/IconTrekButtonMainTrnsp.png"
          alt="Explore Treks"
          className="w-full h-full object-contain drop-shadow-2xl"
        />
      </button>

      {/* Drag Indicator */}
      {isDragging && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
          Release to place
        </div>
      )}
    </div>
  );
};

// Floating particle component
const FloatingParticle = ({ delay, duration, x, y }: {delay: number; duration: number; x: number; y: number}) => (
  <div
    className="absolute w-1 h-1 bg-white/40 rounded-full blur-[0.5px]"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      animation: `float-particle ${duration}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
    }}
  />
);

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const haptic = useHaptic();
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  // Apply page-specific styles (no scroll on home page for full-screen experience)
  usePageStyle({
    overflow: 'hidden',
    height: '100vh',
  });

  const handleExploreTreks = () => {
    haptic.medium();
    navigate('/events');
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Parallax mouse effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
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

  // Generate random particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 4,
  }));

  return (
    <div className="min-h-screen relative">
      {/* Full-Screen Hero Section */}
      <section ref={heroRef} className="relative h-screen w-full overflow-hidden z-10">
        {/* Panoramic Background */}
        <div className="fixed inset-0 z-0">
          {/* Base Panoramic Image - Full visibility */}
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015 + scrollY * 0.3}px) scale(1.05)`,
              transition: 'transform 0.3s ease-out',
              backgroundColor: 'transparent',
            }}
          >
            <img
              src="/itw_new_BG.jpg"
              alt="Panoramic mountain landscape at golden hour"
              className="w-full h-full object-cover object-center"
              loading="eager"
              style={{
                objectPosition: '50% 45%', // Show more of the scenery
                backgroundColor: 'transparent',
              }}
              onError={(e) => {
                console.error('Background image failed to load:', e);
                console.log('Image src:', e.currentTarget.src);
                console.log('Natural width:', e.currentTarget.naturalWidth);
                console.log('Natural height:', e.currentTarget.naturalHeight);
              }}
              onLoad={(e) => {
                console.log('Background image loaded successfully');
                console.log('Image dimensions:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight);
              }}
            />
          </div>

          {/* Floating Particles Layer (very subtle) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
            {particles.map(p => (
              <FloatingParticle key={p.id} {...p} />
            ))}
          </div>

          {/* Minimal overlay - let background show through */}
          <div className="absolute inset-0 bg-gradient-to-b from-golden-500/2 via-transparent to-black/15" />
        </div>


        {/* Hero Content - Centered */}
        <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
          {/* Main Heading - High Contrast */}
          <h1 className={cn(
            "relative text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 leading-tight transition-all duration-1000 delay-100",
            "font-['Poppins']",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          )}
          style={{
            textShadow: `
              0 4px 12px rgba(0,0,0,0.8),
              0 2px 4px rgba(0,0,0,0.9),
              0 0 40px rgba(244,164,96,0.3)
            `,
          }}>
            Into the Wild
          </h1>
          
          {/* Tagline - High Contrast */}
          <p className={cn(
            "text-xl sm:text-2xl md:text-3xl text-white mb-3 max-w-3xl leading-relaxed transition-all duration-1000 delay-200",
            "font-['Inter'] font-light tracking-wide",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          )}
          style={{
            textShadow: '0 3px 8px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,1)',
          }}>
            Where every trail tells a story
          </p>

          <p className={cn(
            "text-base md:text-lg text-golden-200 mb-10 transition-all duration-1000 delay-250",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          )}
          style={{
            textShadow: '0 2px 6px rgba(0,0,0,0.8)',
          }}>
            <Wind className="inline-block w-4 h-4 mr-2" />
            Begin your adventure
          </p>

          {/* Floating Triangle Button with Dewdrop Border - Draggable */}
          <FloatingTriangleButton onClick={handleExploreTreks} isVisible={isVisible} />

          {/* Secondary CTAs - High Contrast */}
          {!loading && (
            <div className={cn(
              "flex flex-wrap gap-4 justify-center transition-all duration-1000 delay-400",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            )}>
              {user ? (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white/95 dark:bg-primary/95 border-2 border-white dark:border-primary text-gray-900 dark:text-primary-foreground hover:bg-white dark:hover:bg-primary-hover hover:scale-105 shadow-2xl backdrop-blur-xl font-semibold"
                    onClick={() => {
                      haptic.light();
                      navigate('/gallery');
                    }}
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Gallery
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white/95 dark:bg-primary/95 border-2 border-white dark:border-primary text-gray-900 dark:text-primary-foreground hover:bg-white dark:hover:bg-primary-hover hover:scale-105 shadow-2xl backdrop-blur-xl font-semibold"
                    onClick={() => {
                      haptic.light();
                      navigate('/dashboard');
                    }}
                  >
                    Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white/95 dark:bg-primary/95 border-2 border-white dark:border-primary text-gray-900 dark:text-primary-foreground hover:bg-white dark:hover:bg-primary-hover hover:scale-105 shadow-2xl backdrop-blur-xl font-semibold"
                    onClick={() => {
                      haptic.light();
                      navigate('/auth?mode=signin');
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-golden-600 to-coral-600 text-white hover:scale-105 shadow-2xl font-bold border-2 border-white/30"
                    onClick={() => {
                      haptic.light();
                      navigate('/auth?mode=signup');
                    }}
                  >
                    Join the Adventure
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Background override to ensure transparent background (no default white/color) */}
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background: none !important; /* Override global background */
        }

        /* Ensure body background is transparent on home page */
        body {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
};


export default Index;

