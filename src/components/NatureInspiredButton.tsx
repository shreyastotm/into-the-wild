import React, { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useHaptic } from "@/hooks/use-haptic";
import { cn } from "@/lib/utils";

interface NatureInspiredButtonProps {
  children: React.ReactNode;
  variant?: "nature" | "mountain" | "parallax" | "landscape";
  size?: "sm" | "default" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

/**
 * NatureInspiredButton - Enhanced button component for landing page
 * Features:
 * - Dynamic lighting effects that respond to mouse position
 * - Floating particle animations
 * - Background integration with parallax effects
 * - Enhanced glassmorphism with golden hour shimmer
 * - Mobile-optimized touch interactions
 */
export const NatureInspiredButton = ({
  children,
  variant = "nature",
  size = "lg",
  className,
  onClick,
  onMouseMove,
  disabled = false,
  type = "button",
  ...props
}: NatureInspiredButtonProps) => {
  const haptic = useHaptic();
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
    onMouseMove?.(e);
  };

  const handleClick = (e: React.MouseEvent) => {
    haptic.light(); // Use light instead of medium for less intrusive feedback
    addRipple(e);
    onClick?.();
  };

  const addRipple = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 1200);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Remove haptic feedback on hover to avoid browser blocking
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Button
      ref={buttonRef}
      variant={variant}
      size={size}
      className={cn(
        "btn-floating-particles group relative overflow-hidden",
        "transition-all duration-500 ease-out",
        "focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
        isHovered && "animate-pulse",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      type={type}
        style={{
          background: isHovered
            ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%,
                rgba(255,255,255,0.15) 0%,
                rgba(244,164,96,0.3) 30%,
                transparent 70%)`
            : undefined,
        }}
      {...props}
    >
      {/* Dynamic Light Overlay - More subtle */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%,
            rgba(255,255,255,0.2) 0%,
            rgba(244,164,96,0.3) 40%,
            transparent 70%)`,
        }}
      />

      {/* Golden Wave Effect */}
      <div className="golden-wave absolute inset-0 pointer-events-none" />

      {/* Floating Particles - Reduced and more subtle */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse"
              style={{
                left: `${30 + i * 20}%`,
                top: `${40 + (i % 2) * 20}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + i * 0.5}s`,
                opacity: 0.3 + (i % 2) * 0.2,
              }}
            />
          ))}
        </div>
      )}

      {/* Enhanced Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>

        {/* Enhanced Ripple Effects - More subtle */}
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
                rgba(255,255,255,0.4) 0%,
                rgba(244,164,96,0.2) 30%,
                transparent 60%)`,
              animation: 'ripple-expand 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            }}
          />
        ))}

      {/* Inner Glow Effect - Much more subtle */}
      <div
        className={cn(
          "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none",
          "bg-gradient-to-br from-white/10 via-golden-200/10 to-teal-200/10"
        )}
      />

      {/* Border Glow - Remove animation */}
      <div
        className={cn(
          "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none",
          "bg-gradient-to-r from-golden-400/20 via-transparent to-teal-400/20"
        )}
      />
    </Button>
  );
};

export default NatureInspiredButton;
