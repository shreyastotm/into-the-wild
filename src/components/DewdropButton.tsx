import { useEffect, useRef, useState } from "react";

import { useHaptic } from "@/hooks/use-haptic";
import { cn } from "@/lib/utils";

interface DewdropButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  draggable?: boolean;
  static?: boolean;
}

/**
 * Dewdrop Triangle Button - DEPRECATED
 * This component is deprecated and replaced by StaticBottomButton
 * Features:
 * - Water droplet/dewdrop glass effect
 * - Draggable on mobile (when draggable=true)
 * - Ripple animations
 * - Golden hour shimmer
 * - Organic feel
 * - Static positioning option (when static=true)
 *
 * @deprecated Use StaticBottomButton instead
 */
export const DewdropButton = ({
  onClick,
  children,
  className,
  draggable = true,
  static: isStatic = false,
}: DewdropButtonProps) => {
  const haptic = useHaptic();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<
    { id: number; x: number; y: number }[]
  >([]);

  // Load saved position
  useEffect(() => {
    if (isStatic || !draggable) return;

    const saved = localStorage.getItem("dewdrop-button-position");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosition(parsed);
      } catch (e) {
        // Invalid saved position, use default
      }
    }
  }, [draggable, isStatic]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isStatic) {
      setIsPressed(true);
      haptic.light();
      return;
    }

    if (!draggable) return;

    e.preventDefault();
    setIsDragging(true);
    setIsPressed(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    haptic.light();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isStatic || !isDragging || !draggable) return;

    e.preventDefault();
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Constrain to viewport with padding
    const padding = 20;
    const maxX =
      window.innerWidth - (buttonRef.current?.offsetWidth || 0) - padding;
    const maxY =
      window.innerHeight - (buttonRef.current?.offsetHeight || 0) - padding;

    setPosition({
      x: Math.max(padding, Math.min(newX, maxX)),
      y: Math.max(padding, Math.min(newY, maxY)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isStatic) {
      setIsPressed(false);
      handleClick(e);
      return;
    }

    if (!draggable) {
      handleClick(e);
      return;
    }

    setIsDragging(false);
    setIsPressed(false);

    // If barely moved, treat as click
    const moved =
      Math.abs(e.clientX - (dragStart.x + position.x)) +
      Math.abs(e.clientY - (dragStart.y + position.y));

    if (moved < 10) {
      handleClick(e);
    } else {
      // Save position
      localStorage.setItem("dewdrop-button-position", JSON.stringify(position));
      haptic.medium();

      // Add ripple effect on release
      addRipple(e);
    }
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
    setRipples((prev) => [...prev, { id, x, y }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1000);
  };

  return (
    <div
      ref={buttonRef}
      className={cn(
        "relative group cursor-pointer select-none",
        !isStatic && draggable && "touch-none",
        className,
      )}
      style={
        isStatic
          ? {
              transform: isPressed ? "scale(0.95)" : "scale(1)",
              transition: "transform 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            }
          : draggable
          ? {
              position: "fixed",
              left: position.x,
              top: position.y,
              transform: isPressed ? "scale(0.95)" : "scale(1)",
              transition: isDragging
                ? "none"
                : "transform 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
              zIndex: 1000,
            }
          : {}
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        setIsDragging(false);
        setIsPressed(false);
      }}
    >
      {/* Dewdrop Container */}
      <div
        className={cn(
          "relative overflow-hidden",
          "backdrop-blur-2xl bg-gradient-to-br from-white/40 via-white/30 to-white/20",
          "dark:from-white/20 dark:via-white/10 dark:to-white/5",
          "border border-white/40 dark:border-white/20",
          "transition-all duration-300",
          isPressed ? "shadow-lg" : "shadow-2xl",
          !isStatic && !isPressed && "group-hover:shadow-golden group-hover:scale-105",
        )}
        style={{
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%", // Organic shape
        }}
      >
        {/* Rainbow Refraction Edge */}
        <div
          className={cn(
            "absolute inset-0 opacity-40",
            "bg-gradient-to-br from-pink-200 via-blue-200 to-yellow-200",
            "dark:from-pink-400/30 dark:via-blue-400/30 dark:to-yellow-400/30",
            "mix-blend-overlay",
          )}
        />

        {/* Golden Hour Shimmer */}
        <div
          className={cn(
            "absolute inset-0 opacity-50",
            "bg-gradient-to-r from-transparent via-golden-300/50 to-transparent",
            "animate-[shimmer_3s_ease-in-out_infinite]",
            "bg-[length:200%_100%]",
          )}
          style={{
            backgroundPosition: "-200% center",
            animation: "shimmer 3s ease-in-out infinite",
          }}
        />

        {/* Inner Glow */}
        <div
          className={cn(
            "absolute inset-0",
            "bg-radial-gradient from-white/40 to-transparent",
            "opacity-60 group-hover:opacity-80 transition-opacity",
            isStatic && "transition-none"
          )}
        />

        {/* Content */}
        <div className="relative z-10 p-6">{children}</div>

        {/* Ripple Effects */}
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
              background:
                "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)",
              animation: "ripple-expand 1s ease-out forwards",
            }}
          />
        ))}
      </div>

      {/* Floating Animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes ripple-expand {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
            transform: translate(-50%, -50%);
          }
          100% {
            width: 200px;
            height: 200px;
            opacity: 0;
            transform: translate(-50%, -50%);
          }
        }
        
        ${
          !isDragging
            ? `
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          ${
            buttonRef.current
              ? `
            [data-dewdrop] {
              animation: float 4s ease-in-out infinite;
            }
          `
              : ""
          }
        `
            : ""
        }
      `}</style>

      {/* Drag Indicator */}
      {!isStatic && draggable && isDragging && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
          Release to place
        </div>
      )}
    </div>
  );
};

/**
 * Shimmer CSS for keyframes
 */
const shimmerKeyframes = `
  @keyframes goldenShimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
`;

// Inject keyframes
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = shimmerKeyframes;
  document.head.appendChild(style);
}
