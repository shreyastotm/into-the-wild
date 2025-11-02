import {
  Camera,
  ChevronDown,
  Compass,
  Mountain,
  Users,
  Wind,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { useHaptic } from "@/hooks/use-haptic";
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
    className="absolute w-1 h-1 bg-white/30 rounded-full"
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
        className="relative h-screen w-full overflow-hidden"
      >
        {/* Multi-layer Parallax Background */}
        <div className="absolute inset-0 -z-10">
          {/* Base Image Layer with parallax */}
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02 + scrollY * 0.5}px) scale(1.1)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            <img
              src="/itw_new_BG.jpg"
              alt="Mountain landscape at golden hour"
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          </div>

          {/* Floating Particles Layer (dust motes, pollen) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <FloatingParticle key={p.id} {...p} />
            ))}
          </div>

          {/* Dynamic Golden Hour Gradient - shifts with time */}
          <div
            className="absolute inset-0 transition-all duration-1000"
            style={{
              background: `linear-gradient(to bottom,
                rgba(244, 164, 96, ${0.15 + Math.sin(Date.now() / 10000) * 0.05}) 0%,
                transparent 40%,
                transparent 60%,
                rgba(0, 139, 139, ${0.3 + Math.sin(Date.now() / 8000) * 0.1}) 100%
              )`,
            }}
          />

          {/* Organic Vignette - not circular */}
          <div className="absolute inset-0">
            <svg className="w-full h-full" preserveAspectRatio="xMidYMid slice">
              <defs>
                <radialGradient id="organic-vignette" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="black" stopOpacity="0" />
                  <stop offset="70%" stopColor="black" stopOpacity="0" />
                  <stop offset="100%" stopColor="black" stopOpacity="0.4" />
                </radialGradient>
              </defs>
              <ellipse
                cx="50%"
                cy="50%"
                rx="60%"
                ry="50%"
                fill="url(#organic-vignette)"
              />
            </svg>
          </div>

          {/* Light Rays (subtle) */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
            <div
              className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-white/60 via-white/20 to-transparent"
              style={{
                transform: `rotate(15deg) translateX(${mousePosition.x * 0.5}px)`,
                transformOrigin: "top",
              }}
            />
            <div
              className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-white/40 via-white/10 to-transparent"
              style={{
                transform: `rotate(-10deg) translateX(${mousePosition.x * -0.3}px)`,
                transformOrigin: "top",
              }}
            />
          </div>
        </div>

        {/* Floating Logo - Organic placement */}
        <div
          className={cn(
            "absolute top-8 left-6 z-20 transition-all duration-700",
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-8",
          )}
          style={{
            transform: `translateY(${Math.sin(Date.now() / 2000) * 5}px)`,
            filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))",
          }}
        >
          <img
            src="/itw_logo.png"
            alt="Into the Wild"
            className="h-16 md:h-20 w-auto"
          />
        </div>

        {/* Hero Content - Centered with parallax */}
        <div
          className="relative h-full flex flex-col items-center justify-center px-6 text-center"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
          }}
        >
          {/* Compass Rose Background (decorative) */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center opacity-5 transition-opacity duration-1000",
              isVisible && "opacity-10",
            )}
          >
            <Compass className="w-96 h-96 text-white animate-[spin_60s_linear_infinite]" />
          </div>

          {/* Main Heading with Text Shadow */}
          <h1
            className={cn(
              "relative text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight transition-all duration-1000 delay-100",
              "font-['Poppins']",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12",
            )}
            style={{
              textShadow: `
              0 2px 10px rgba(0,0,0,0.3),
              0 0 60px rgba(244,164,96,0.3),
              0 0 100px rgba(244,164,96,0.2)
            `,
            }}
          >
            Into the Wild
          </h1>

          {/* Tagline with organic feel */}
          <p
            className={cn(
              "text-xl sm:text-2xl md:text-3xl text-white/95 mb-12 max-w-3xl leading-relaxed transition-all duration-1000 delay-200",
              "font-['Inter'] font-light tracking-wide",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12",
            )}
            style={{
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            Where every trail tells a story
            <span className="block text-lg md:text-xl mt-2 text-golden-200">
              <Wind className="inline-block w-5 h-5 mr-2" />
              Begin your adventure
            </span>
          </p>

          {/* Secondary CTAs - Organic layout */}
          {!loading && (
            <div
              className={cn(
                "mt-8 flex flex-wrap gap-4 justify-center transition-all duration-1000 delay-400",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12",
              )}
            >
              {user ? (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    className="glass border-white/50 text-white hover:bg-white/30 shadow-2xl backdrop-blur-xl"
                    onClick={() => {
                      haptic.light();
                      navigate("/gallery");
                    }}
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Gallery
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="glass border-white/50 text-white hover:bg-white/30 shadow-2xl backdrop-blur-xl"
                    onClick={() => {
                      haptic.light();
                      navigate("/dashboard");
                    }}
                  >
                    <Compass className="mr-2 h-5 w-5" />
                    Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    className="glass border-white/50 text-white hover:bg-white/30 shadow-2xl backdrop-blur-xl"
                    onClick={() => {
                      haptic.light();
                      navigate("/auth?mode=signin");
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-golden-500 to-coral-500 text-white hover:scale-105 shadow-2xl"
                    onClick={() => {
                      haptic.light();
                      navigate("/auth?mode=signup");
                    }}
                  >
                    Join the Adventure
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Scroll Indicator with organic animation */}
          <div
            className={cn(
              "absolute bottom-12 flex flex-col items-center gap-2 transition-all duration-1000 delay-600",
              isVisible ? "opacity-100" : "opacity-0",
            )}
            style={{
              animation: "bounce-gentle 3s ease-in-out infinite",
            }}
          >
            <span className="text-white/70 text-sm tracking-widest uppercase">
              Discover More
            </span>
            <ChevronDown className="h-8 w-8 text-white/70" />
          </div>
        </div>
      </section>

      {/* Quick Stats - Floating Natural Cards */}
      <section className="relative -mt-24 px-4 pb-16 z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <StatCard
            icon={<Mountain className="h-8 w-8 text-teal-600" />}
            value="50+"
            label="Treks"
            delay={0}
          />
          <StatCard
            icon={<Users className="h-8 w-8 text-golden-600" />}
            value="1200+"
            label="Trekkers"
            delay={100}
          />
          <StatCard
            icon={<Camera className="h-8 w-8 text-coral-600" />}
            value="5000+"
            label="Memories"
            delay={200}
          />
        </div>
      </section>

      {/* Floating Animation Keyframes */}
      <style>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.3;
          }
          25% {
            transform: translate(10px, -30px);
            opacity: 0.6;
          }
          50% {
            transform: translate(-5px, -60px);
            opacity: 0.4;
          }
          75% {
            transform: translate(15px, -90px);
            opacity: 0.2;
          }
        }

        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </div>
  );
};

// Organic Stat Card with nature-inspired design
const StatCard = ({
  icon,
  value,
  label,
  delay = 0,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay?: number;
}) => (
  <div
    className="group relative overflow-hidden"
    style={{
      animation: `fade-in-up 0.8s ease-out ${delay}ms both`,
    }}
  >
    {/* Paper texture background */}
    <div className="relative glass-card p-6 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-2 border-white/50 dark:border-gray-700/50 rounded-3xl shadow-2xl hover:shadow-golden transition-all duration-500 hover:scale-105">
      {/* Watercolor stain effect */}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-golden-300 via-transparent to-teal-300 rounded-3xl" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-3 text-center">
        <div className="p-3 rounded-full bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 shadow-lg group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className="text-4xl font-bold bg-gradient-to-br from-golden-600 via-coral-500 to-teal-600 bg-clip-text text-transparent">
          {value}
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {label}
        </div>
      </div>

      {/* Subtle shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </div>
  </div>
);

export default Index;
