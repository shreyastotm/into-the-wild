import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Camera,
  Mountain,
  Sparkles,
  TreePine,
  Users,
  Waves,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { cn } from "@/lib/utils";

interface GlassThemeHeaderProps {
  className?: string;
}

type GlassTheme = "gallery" | "events" | "details" | null;

const themeConfig = {
  gallery: {
    icon: Camera,
    title: "Adventure Gallery",
    subtitle: "Captured Memories",
    colors: {
      primary: "hsl(35, 85%, 65%)",
      secondary: "hsl(14, 82%, 62%)",
      accent: "hsl(180, 100%, 27%)",
    },
    gradient: "from-orange-400/20 via-coral-400/10 to-teal-400/20",
  },
  events: {
    icon: TreePine,
    title: "Upcoming Adventures",
    subtitle: "Join the Journey",
    colors: {
      primary: "hsl(142, 71%, 45%)",
      secondary: "hsl(188, 94%, 43%)",
      accent: "hsl(35, 85%, 65%)",
    },
    gradient: "from-green-400/20 via-teal-400/10 to-orange-400/20",
  },
  details: {
    icon: Mountain,
    title: "Adventure Details",
    subtitle: "Plan Your Journey",
    colors: {
      primary: "hsl(217, 91%, 60%)",
      secondary: "hsl(262, 83%, 58%)",
      accent: "hsl(142, 71%, 45%)",
    },
    gradient: "from-blue-400/20 via-purple-400/10 to-green-400/20",
  },
};

export const GlassThemeHeader: React.FC<GlassThemeHeaderProps> = ({
  className,
}) => {
  const location = useLocation();
  const { user, userProfile } = useAuth();
  const [currentTheme, setCurrentTheme] = useState<GlassTheme>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Determine current theme based on route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/glass-gallery") {
      setCurrentTheme("gallery");
    } else if (path === "/glass-events") {
      setCurrentTheme("events");
    } else if (path.startsWith("/glass-event-details/")) {
      setCurrentTheme("details");
    } else {
      setCurrentTheme(null);
    }
  }, [location.pathname]);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (!currentTheme) return null;

  const theme = themeConfig[currentTheme];
  const IconComponent = theme.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/10",
            className,
          )}
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))`,
          }}
        >
          {/* Animated background gradient */}
          <motion.div
            className={cn("absolute inset-0 bg-gradient-to-r", theme.gradient)}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ backgroundSize: "200% 200%" }}
          />

          <div className="relative container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Theme Icon and Title */}
              <motion.div
                className="flex items-center gap-3"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <motion.div
                  className="p-2 rounded-xl backdrop-blur-sm border border-white/20"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconComponent
                    className="w-6 h-6 text-white"
                    style={{ color: theme.colors.primary }}
                  />
                </motion.div>

                <div className="hidden sm:block">
                  <motion.h1
                    className="text-lg font-bold text-white"
                    animate={{
                      color: [
                        theme.colors.primary,
                        theme.colors.secondary,
                        theme.colors.primary,
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {theme.title}
                  </motion.h1>
                  <p className="text-xs text-white/70">{theme.subtitle}</p>
                </div>
              </motion.div>

              {/* Center: Navigation Dots */}
              <motion.div
                className="hidden md:flex items-center gap-2"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {Object.entries(themeConfig).map(([key, config], index) => {
                  const isActive = key === currentTheme;
                  return (
                    <Link
                      key={key}
                      to={
                        key === "gallery"
                          ? "/glass-gallery"
                          : key === "events"
                            ? "/glass-events"
                            : "/glass-event-details/1"
                      }
                      className="relative"
                    >
                      <motion.div
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          isActive
                            ? "bg-white"
                            : "bg-white/40 hover:bg-white/60",
                        )}
                        whileHover={{ scale: 1.2 }}
                        style={{
                          backgroundColor: isActive
                            ? config.colors.primary
                            : undefined,
                        }}
                      />
                      {isActive && (
                        <motion.div
                          className="absolute -inset-1 rounded-full border border-white/30"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </motion.div>

              {/* Right: User Actions */}
              <motion.div
                className="flex items-center gap-3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <ThemeToggle />

                {user && (
                  <NotificationBell className="text-white hover:text-white/80" />
                )}

                {user && (
                  <motion.div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
                      <Users className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-white font-medium hidden sm:inline">
                      {userProfile?.full_name?.split(" ")[0] || "Explorer"}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, -40, -20],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
};

export default GlassThemeHeader;
