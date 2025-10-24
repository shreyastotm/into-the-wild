import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, Mountain, Users, Camera, Compass } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useHaptic } from "@/hooks/use-haptic";
import { StaticBottomButton } from "@/components/StaticBottomButton";
import { cn } from "@/lib/utils";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const haptic = useHaptic();
  const [isVisible, setIsVisible] = useState(false);

  const handleSignup = () => {
    haptic.light();
    navigate("/auth?mode=signup");
  };

  const handleSignin = () => {
    haptic.light();
    navigate("/auth?mode=signin");
  };

  const handleExploreTreks = () => {
    haptic.medium();
    navigate("/events");
  };

  useEffect(() => {
    // Trigger animations on mount
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Full-Screen Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background Image with Golden Hour Overlays */}
        <div className="absolute inset-0 -z-10">
          <img
            src="/itw_new_BG.jpg"
            alt="Mountain landscape at golden hour"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          {/* Golden Hour Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-golden-500/20 via-transparent to-teal-900/40" />
          {/* Vignette Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
        </div>

        {/* Floating Logo - Mobile Only */}
        <div
          className={cn(
            "absolute top-8 left-4 z-20 md:hidden transition-all duration-700",
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4",
          )}
        >
          <img
            src="/itw_logo.png"
            alt="Into the Wild"
            className="h-14 w-auto drop-shadow-2xl"
          />
        </div>

        {/* Hero Content - Centered */}
        <div className="relative h-full flex flex-col items-center justify-center px-6 text-center pt-20 md:pt-0">
          {/* Main Heading */}
          <h1
            className={cn(
              "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl leading-tight transition-all duration-700 delay-100",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8",
            )}
          >
            Into the Wild
          </h1>

          {/* Tagline */}
          <p
            className={cn(
              "text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-2xl drop-shadow-lg leading-relaxed transition-all duration-700 delay-200",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8",
            )}
          >
            Where every trail tells a story
          </p>

          {/* Primary CTA Section */}
          <div
            className={cn(
              "space-y-4 w-full max-w-sm transition-all duration-700 delay-300",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8",
            )}
          >
            {/* Triangle Button - Primary Action */}
            <button
              onClick={handleExploreTreks}
              className="relative group w-full h-20 touch-ripple"
              aria-label="Explore Treks"
            >
              <img
                src="/Icon Trek Button Main trnsp.png"
                alt=""
                className="w-full h-full object-contain drop-shadow-2xl transition-all duration-300 group-hover:scale-110 group-active:scale-95"
              />
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg drop-shadow-md">
                Explore Treks
              </span>
            </button>

            {/* Secondary CTAs */}
            {!loading && (
              <div className="grid grid-cols-2 gap-3">
                {user ? (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      className="glass border-white/40 text-white hover:bg-white/30 shadow-xl"
                      onClick={() => {
                        haptic.light();
                        navigate("/gallery");
                      }}
                    >
                      Gallery
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="glass border-white/40 text-white hover:bg-white/30 shadow-xl"
                      onClick={() => {
                        haptic.light();
                        navigate("/dashboard");
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
                      className="glass border-white/40 text-white hover:bg-white/30 shadow-xl"
                      onClick={handleSignin}
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="glass border-white/40 text-white hover:bg-white/30 shadow-xl"
                      onClick={handleSignup}
                    >
                      Join Us
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Scroll Indicator */}
          <div
            className={cn(
              "absolute bottom-8 animate-bounce transition-all duration-700 delay-500",
              isVisible ? "opacity-70" : "opacity-0",
            )}
          >
            <ChevronDown className="h-8 w-8 text-white/70" />
          </div>
        </div>
      </section>

      {/* Quick Stats - Floating Cards */}
      <section className="relative -mt-20 px-4 pb-12 z-10">
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
          <StatCard
            icon={<Mountain className="h-6 w-6 text-teal-600" />}
            value="50+"
            label="Treks"
          />
          <StatCard
            icon={<Users className="h-6 w-6 text-golden-600" />}
            value="1200+"
            label="Trekkers"
          />
          <StatCard
            icon={<Camera className="h-6 w-6 text-coral-600" />}
            value="5000+"
            label="Memories"
          />
        </div>
      </section>
    </div>
  );
};

// Quick Stat Card Component
const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) => (
  <div className="glass-card p-4 rounded-xl text-center hover:shadow-2xl transition-all duration-300 hover:scale-105">
    <div className="flex justify-center mb-2">{icon}</div>
    <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
      {value}
    </div>
    <div className="text-xs sm:text-sm text-muted-foreground">{label}</div>
  </div>
);

export default Index;
