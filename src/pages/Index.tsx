import { Camera, ChevronDown, Mountain, Users, Wind } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";
import { StaticBottomButton } from "@/components/StaticBottomButton";
import { Button } from "@/components/ui/button";
import { useHaptic } from "@/hooks/use-haptic";
import { usePageStyle } from "@/hooks/usePageStyle";
import { cn } from "@/lib/utils";

// Floating particle component
const FloatingParticle = ({
  delay,
  duration,
  x,
  y,
}: {
  delay: number;
  duration: number;
  x: number;
  y: number;
}) => (
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
    overflow: "hidden",
    height: "100vh",
  });

  const handleExploreTreks = () => {
    haptic.medium();
    navigate("/events");
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

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
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
      <section
        ref={heroRef}
        className="relative h-screen w-full overflow-hidden z-10"
      >
        {/* Panoramic Background */}
        <div className="fixed inset-0 z-0">
          {/* Base Panoramic Image - Full visibility */}
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015 + scrollY * 0.3}px) scale(1.05)`,
              transition: "transform 0.3s ease-out",
              backgroundColor: "transparent",
            }}
          >
            <img
              src="/itw_new_BG.jpg"
              alt="Panoramic mountain landscape at golden hour"
              className="w-full h-full object-cover object-center"
              loading="eager"
              style={{
                objectPosition: "50% 45%", // Show more of the scenery
                backgroundColor: "transparent",
              }}
              onError={(e) => {
                console.error("Background image failed to load:", e);
                console.log("Image src:", e.currentTarget.src);
                console.log("Natural width:", e.currentTarget.naturalWidth);
                console.log("Natural height:", e.currentTarget.naturalHeight);
              }}
              onLoad={(e) => {
                console.log("Background image loaded successfully");
                console.log(
                  "Image dimensions:",
                  e.currentTarget.naturalWidth,
                  "x",
                  e.currentTarget.naturalHeight,
                );
              }}
            />
          </div>

          {/* Floating Particles Layer (very subtle) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
            {particles.map((p) => (
              <FloatingParticle key={p.id} {...p} />
            ))}
          </div>

          {/* Minimal overlay - let background show through */}
          <div className="absolute inset-0 bg-gradient-to-b from-golden-500/2 via-transparent to-black/15" />
        </div>

        {/* Hero Content - Centered */}
        <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
          {/* Main Heading - High Contrast */}
          <h1
            className={cn(
              "relative text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 leading-tight transition-all duration-1000 delay-100",
              "font-['Poppins']",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12",
            )}
            style={{
              textShadow: `
              0 4px 12px rgba(0,0,0,0.8),
              0 2px 4px rgba(0,0,0,0.9),
              0 0 40px rgba(244,164,96,0.3)
            `,
            }}
          >
            Into the Wild
          </h1>

          {/* Tagline - High Contrast */}
          <p
            className={cn(
              "text-xl sm:text-2xl md:text-3xl text-white mb-3 max-w-3xl leading-relaxed transition-all duration-1000 delay-200",
              "font-['Inter'] font-light tracking-wide",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12",
            )}
            style={{
              textShadow: "0 3px 8px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,1)",
            }}
          >
            Where every trail tells a story
          </p>

          <p
            className={cn(
              "text-base md:text-lg text-golden-200 mb-10 transition-all duration-1000 delay-250",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12",
            )}
            style={{
              textShadow: "0 2px 6px rgba(0,0,0,0.8)",
            }}
          >
            <Wind className="inline-block w-4 h-4 mr-2" />
            Begin your adventure
          </p>

          {/* Static Bottom-Center Triangle Button */}
          <StaticBottomButton onClick={handleExploreTreks} />

          {/* Secondary CTAs - High Contrast */}
          {!loading && (
            <div
              className={cn(
                "flex flex-wrap gap-4 justify-center transition-all duration-1000 delay-400",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12",
              )}
            >
              {user ? (
                <>
                  <div className="relative">
                  <Button
                    variant="outline"
                    size="lg"
                      className="btn-rock-glossy bg-white/60 dark:bg-primary/50 border-2 border-white/80 dark:border-primary/70 text-gray-900 dark:text-primary-foreground hover:bg-white/45 dark:hover:bg-primary-hover/40 hover:scale-[1.02] active:bg-white/30 dark:active:bg-primary-hover/25 shadow-xl backdrop-blur-xl font-semibold transition-all duration-300 relative"
                    onClick={() => {
                      haptic.light();
                      navigate("/gallery");
                    }}
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Gallery
                  </Button>
                    <div className="rock-surface-texture absolute inset-0 rounded-lg" />
                    <div className="water-droplet absolute" />
                    <div className="water-droplet absolute" />
                  </div>
                  <div className="relative">
                  <Button
                    variant="outline"
                    size="lg"
                      className="btn-rock-glossy bg-white/60 dark:bg-primary/50 border-2 border-white/80 dark:border-primary/70 text-gray-900 dark:text-primary-foreground hover:bg-white/45 dark:hover:bg-primary-hover/40 hover:scale-[1.02] active:bg-white/30 dark:active:bg-primary-hover/25 shadow-xl backdrop-blur-xl font-semibold transition-all duration-300 relative"
                    onClick={() => {
                      haptic.light();
                      navigate("/dashboard");
                    }}
                  >
                    Dashboard
                  </Button>
                    <div className="rock-surface-texture absolute inset-0 rounded-lg" />
                    <div className="water-droplet absolute" />
                    <div className="water-droplet absolute" />
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                  <Button
                    variant="outline"
                    size="lg"
                      className="btn-rock-glossy bg-white/60 dark:bg-primary/50 border-2 border-white/80 dark:border-primary/70 text-gray-900 dark:text-primary-foreground hover:bg-white/45 dark:hover:bg-primary-hover/40 hover:scale-[1.02] active:bg-white/30 dark:active:bg-primary-hover/25 shadow-xl backdrop-blur-xl font-semibold transition-all duration-300 relative"
                    onClick={() => {
                      haptic.light();
                      navigate("/auth?mode=signin");
                    }}
                  >
                    Sign In
                  </Button>
                    <div className="rock-surface-texture absolute inset-0 rounded-lg" />
                    <div className="water-droplet absolute" />
                    <div className="water-droplet absolute" />
                  </div>
                  <div className="relative">
                  <Button
                    size="lg"
                      className="btn-rock-glossy bg-gradient-to-r from-golden-500/70 to-golden-600/70 text-white hover:from-golden-600/60 hover:to-golden-700/60 hover:scale-[1.02] active:from-golden-400/50 active:to-golden-500/50 shadow-xl font-bold border-2 border-white/30 transition-all duration-300 relative"
                    onClick={() => {
                      haptic.light();
                      navigate("/auth?mode=signup");
                    }}
                  >
                    Join the Adventure
                  </Button>
                    <div className="rock-surface-texture absolute inset-0 rounded-lg" />
                    <div className="water-droplet absolute" />
                    <div className="water-droplet absolute" />
                  </div>
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
