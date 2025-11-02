import { Camera, ChevronDown, Mountain, Users, Wind } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";
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
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Full-Screen Hero Section */}
      <section
        ref={heroRef}
        className={cn(
          "relative h-screen w-full overflow-hidden transition-all duration-1000",
          isVisible ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Multi-layer Parallax Background */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-golden-500/20 via-transparent to-coral-500/20 backdrop-blur-sm"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />

        {/* Background Image with Blur Effect - Enhanced */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500"
          style={{
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><radialGradient id="g1"><stop offset="0%" style="stop-color:%23f4a460;stop-opacity:0.1"/><stop offset="100%" style="stop-color:%23008b8b;stop-opacity:0.05"/></radialGradient></defs><rect fill="url(%23g1)" width="1200" height="800"/></svg>')`,
            filter: "blur(1px)",
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />

        {/* Glass Morphism Overlay - Enhanced */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 backdrop-blur-[1px]" />

        {/* Animated Particles - Desktop Only */}
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          {particles.map((particle) => (
            <FloatingParticle
              key={particle.id}
              delay={particle.delay}
              duration={particle.duration}
              x={particle.x}
              y={particle.y}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 py-8">
          <div
            className="space-y-8 max-w-4xl mx-auto"
            style={{
              transform: `translateY(${-scrollY * 0.3}px)`,
              opacity: Math.max(0, 1 - scrollY / 500),
            }}
          >
            {/* Main Heading with Gradient */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white drop-shadow-2xl leading-tight">
                Into The
                <span className="block bg-gradient-to-r from-golden-400 via-amber-300 to-coral-400 bg-clip-text text-transparent">
                  Wild
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
                Discover epic trekking adventures with friends who share your
                passion for nature
              </p>
            </div>

            {/* Glass Morphism CTA Buttons - Enhanced */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              {/* Primary CTA */}
              <Button
                onClick={handleExploreTreks}
                className={cn(
                  "group relative overflow-hidden",
                  "bg-white/10 hover:bg-white/20",
                  "backdrop-blur-md border border-white/20 hover:border-white/40",
                  "text-white px-8 py-4 text-lg font-semibold rounded-2xl",
                  "transition-all duration-300 hover:scale-105 hover:shadow-2xl",
                  "shadow-lg",
                )}
              >
                <span className="relative z-10">Explore Adventures</span>
                <div className="absolute inset-0 bg-gradient-to-r from-golden-500/20 to-coral-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>

              {/* Secondary CTA */}
              <Button
                onClick={() => navigate("/gallery")}
                variant="outline"
                className={cn(
                  "bg-white/5 hover:bg-white/10",
                  "backdrop-blur-md border-white/30 hover:border-white/50",
                  "text-white hover:text-white px-8 py-4 text-lg rounded-2xl",
                  "transition-all duration-300 hover:scale-105",
                  "shadow-lg",
                )}
              >
                View Gallery
              </Button>
            </div>

            {/* Scroll Indicator - Mobile Only */}
            <div className="sm:hidden pt-8">
              <div className="flex flex-col items-center gap-2 text-white/70 animate-bounce">
                <span className="text-sm">Scroll to explore</span>
                <ChevronDown className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Desktop */}
        <div className="hidden sm:block absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center gap-2 text-white/70 animate-bounce">
            <span className="text-sm">Scroll to explore</span>
            <ChevronDown className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Continuous Scroll Content Section - Features */}
      <section className="relative bg-gradient-to-b from-background via-background/95 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-16">
          {/* Section Title */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Why Join Into The Wild?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience adventure like never before with our community of
              passionate trekkers
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Mountain,
                title: "Curated Treks",
                description:
                  "Handpicked trails across India for every skill level",
              },
              {
                icon: Users,
                title: "Community",
                description:
                  "Connect with adventure enthusiasts and make lifelong friends",
              },
              {
                icon: Camera,
                title: "Memories",
                description:
                  "Capture and share your adventures with beautiful gallery features",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl p-6 md:p-8",
                    "bg-white/5 dark:bg-gray-800/5",
                    "backdrop-blur-md border border-white/10 dark:border-gray-700/20",
                    "hover:shadow-2xl hover:border-primary/50",
                    "transition-all duration-300 hover:scale-105",
                    "bg-gradient-to-br from-white/10 to-white/5",
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 space-y-4">
                    <Icon className="w-12 h-12 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative bg-gradient-to-b from-background to-background py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of trekkers exploring the beauty of nature
          </p>
          <Button
            onClick={handleExploreTreks}
            className={cn(
              "group relative overflow-hidden",
              "bg-gradient-to-r from-golden-500 to-coral-500",
              "hover:from-golden-600 hover:to-coral-600",
              "text-white px-12 py-4 text-lg font-semibold rounded-2xl",
              "transition-all duration-300 hover:scale-105 hover:shadow-2xl",
              "shadow-lg",
            )}
          >
            Start Exploring
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
