import { useState, useRef } from 'react';
import { useHaptic } from '@/hooks/use-haptic';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";

interface StaticBottomButtonProps {
  onClick?: () => void;
  className?: string;
}

/**
 * Static Bottom-Center Triangle Button - Natural Effects
 * Features:
 * - Fixed position at bottom center of screen
 * - Two-state button: dull (dark) when idle, lit (bright) when pressed or hovered
 * - 30% larger size (128px) for better visibility
 * - Natural hover effects: golden hour glow, breathing animation, floating particles
 * - Wind shimmer effect like sunlight through leaves
 * - 6 floating nature particles with varied colors and movement
 * - Organic scale animations with easing
 * - Press/unpress animations with haptic feedback
 * - Simple ripple effects
 * - No drag functionality or white borders
 * - Clean, minimal design with natural wilderness feel
 */
export const StaticBottomButton = ({
  onClick,
  className,
}: StaticBottomButtonProps) => {
  const haptic = useHaptic();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPressed(true);
    haptic.light();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPressed(false);
    handleClick(e);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = (e: React.PointerEvent) => {
    haptic.medium();
    addRipple(e);
    onClick?.();
  };

  const addRipple = (e: React.PointerEvent) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 1000);
  };

  // Show lit state when pressed or hovered, dark state when neither
  const shouldShowLit = isPressed || isHovered;

  return (
    <div
      ref={buttonRef}
      className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 cursor-pointer select-none",
        className
      )}
      style={{
        transform: `translateX(-50%) ${shouldShowLit ? 'scale(0.95)' : 'scale(1)'}`,
        transition: 'transform 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        width: '128px',
        height: '128px',
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerCancel={() => setIsPressed(false)}
    >
      {/* Natural Button Container with Organic Effects */}
      <div
        className={cn(
          "static-bottom-button relative overflow-hidden",
          "transition-all duration-700 ease-out",
          shouldShowLit ? "scale-105" : "scale-100",
          "focus:outline-none focus:ring-0 focus:border-none"
        )}
        style={{
          borderRadius: '50%',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          background: 'transparent',
          backgroundColor: 'transparent',
          backgroundImage: 'none',
          filter: shouldShowLit ? 'drop-shadow(0 0 25px rgba(244, 164, 96, 0.5))' : 'none',
          transition: 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          overflow: 'hidden',
          minWidth: '128px',
          minHeight: '128px',
        }}
      >
        {/* Golden Hour Glow Effect */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-700",
          shouldShowLit ? "opacity-80" : "opacity-0"
        )}
        style={{
          background: `radial-gradient(circle,
            rgba(244, 164, 96, 0.25) 0%,
            rgba(244, 164, 96, 0.15) 50%,
            rgba(244, 164, 96, 0.08) 75%,
            transparent 95%)`,
          filter: 'blur(4px)',
        }} />

        {/* Gentle Breathing Animation Ring */}
        <div className={cn(
          "absolute inset-0 transition-all duration-1000",
          shouldShowLit ? "opacity-50 scale-110" : "opacity-0 scale-100"
        )}
        style={{
          background: `radial-gradient(circle,
            transparent 55%,
            rgba(244, 164, 96, 0.12) 75%,
            rgba(244, 164, 96, 0.06) 90%,
            transparent 100%)`,
          animation: shouldShowLit ? 'gentle-breathe 4s ease-in-out infinite' : 'none',
        }} />

        {/* Content - Two State Images */}
        <div className="relative z-10 flex items-center justify-center w-32 h-32">
          {/* Dull State (dark image) - shows when not pressed/hovered */}
          <img
            src="/itw_butt_dark.png"
            alt="Explore Treks"
            className={cn(
              "w-32 h-32 object-contain transition-all duration-500 absolute inset-0",
              shouldShowLit ? "opacity-0 scale-95" : "opacity-100 scale-100"
            )}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              display: 'block',
              visibility: 'visible',
            }}
            onError={(e) => {
              console.error('Dark image failed to load:', e.currentTarget.src);
            }}
            onLoad={(e) => {
              console.log('Dark image loaded successfully');
            }}
          />

          {/* Lit State (bright image) - shows when pressed or hovered */}
          <img
            src="/itw_butt_lit.png"
            alt="Explore Treks"
            className={cn(
              "w-32 h-32 object-contain transition-all duration-500 absolute inset-0",
              shouldShowLit ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              display: 'block',
              visibility: 'visible',
            }}
            onError={(e) => {
              console.error('Lit image failed to load:', e.currentTarget.src);
            }}
            onLoad={(e) => {
              console.log('Lit image loaded successfully');
            }}
          />
        </div>

        {/* Floating Nature Particles */}
        {shouldShowLit && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`absolute rounded-full opacity-60 ${
                  i % 3 === 0 ? 'w-0.6 h-0.6 bg-golden-200/70' :
                  i % 3 === 1 ? 'w-0.4 h-0.4 bg-amber-300/50' :
                  'w-0.5 h-0.5 bg-yellow-100/60'
                }`}
                style={{
                  left: `${20 + i * 13}%`,
                  top: `${15 + (i % 3) * 28}%`,
                  animation: `float-particle ${3.5 + i * 0.8}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Wind Shimmer Effect */}
        <div className={cn(
          "absolute inset-0 overflow-hidden transition-opacity duration-700",
          shouldShowLit ? "opacity-40" : "opacity-0"
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-golden-200/30 to-transparent"
             style={{
               backgroundSize: '200% 200%',
               animation: 'wind-shimmer 3.5s ease-in-out infinite',
               backgroundPosition: '0% 0%',
             }} />
        </div>

        {/* Simple Ripple Effects */}
        {ripples.map(ripple => (
          <div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
              background: `radial-gradient(circle,
                rgba(255,255,255,0.3) 0%,
                transparent 50%)`,
              animation: 'ripple-expand 0.8s ease-out forwards',
            }}
          />
        ))}
      </div>

      {/* Natural Animation Effects */}
      <style>{`
        /* Override any button styling that creates white circles */
        .static-bottom-button::before,
        .static-bottom-button::after {
          display: none !important;
          content: none !important;
          background: none !important;
        }

        .static-bottom-button {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          background: transparent !important;
        }

        @keyframes gentle-breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.7;
          }
        }

        @keyframes wind-shimmer {
          0% {
            background-position: -200% -200%;
            opacity: 0;
          }
          30% {
            opacity: 0.6;
          }
          70% {
            opacity: 0.8;
          }
          100% {
            background-position: 200% 200%;
            opacity: 0;
          }
        }

        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.4;
          }
          25% {
            transform: translateY(-12px) translateX(6px);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-18px) translateX(-3px);
            opacity: 0.6;
          }
          75% {
            transform: translateY(-9px) translateX(9px);
            opacity: 0.5;
          }
        }

        @keyframes ripple-expand {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
            transform: translate(-50%, -50%);
          }
          100% {
            width: 160px;
            height: 160px;
            opacity: 0;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </div>
  );
};

