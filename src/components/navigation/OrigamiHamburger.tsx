import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Camera,
  Compass,
  Home,
  Leaf,
  LogIn,
  LogOut,
  MapPin,
  MessageSquare,
  Mountain,
  TreePine,
  User,
  UserCircle,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";
import { ThemeToggleCompact } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface OrigamiHamburgerProps {
  className?: string;
}

// Origami Mountain Peaks Hamburger Icon
const OrigamiIcon: React.FC<{ isOpen: boolean; theme?: string }> = ({
  isOpen,
  theme = "default",
}) => {
  const getThemeColors = () => {
    switch (theme) {
      case "gallery":
        return { primary: "bg-primary", secondary: "bg-primary" };
      case "events":
        return { primary: "bg-primary", secondary: "bg-primary" };
      case "details":
        return { primary: "bg-primary", secondary: "bg-primary" };
      default:
        return { primary: "bg-primary", secondary: "bg-primary" };
    }
  };

  const colors = getThemeColors();

  return (
    <div className="relative w-6 h-6 flex flex-col justify-center items-center">
      {/* Top Peak/Line */}
      <motion.div
        className="absolute w-6 h-0.5 rounded-full origin-center"
        style={{ backgroundColor: colors.primary }}
        animate={
          isOpen
            ? {
                rotate: 45,
                y: 0,
                scaleX: 0.8,
              }
            : {
                rotate: 0,
                y: -6,
                scaleX: 1,
              }
        }
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />

      {/* Middle Peak/Line - Transforms into compass needle */}
      <motion.div
        className="absolute w-6 h-0.5 rounded-full origin-center"
        style={{ backgroundColor: colors.secondary }}
        animate={
          isOpen
            ? {
                opacity: 0,
                scaleX: 0,
                rotate: 90,
              }
            : {
                opacity: 1,
                scaleX: 1,
                rotate: 0,
              }
        }
        transition={{ duration: 0.2, ease: "easeInOut" }}
      />

      {/* Bottom Peak/Line */}
      <motion.div
        className="absolute w-6 h-0.5 rounded-full origin-center"
        style={{ backgroundColor: colors.primary }}
        animate={
          isOpen
            ? {
                rotate: -45,
                y: 0,
                scaleX: 0.8,
              }
            : {
                rotate: 0,
                y: 6,
                scaleX: 1,
              }
        }
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />

      {/* Origami fold lines - appear when closed */}
      <AnimatePresence>
        {!isOpen && (
          <>
            <motion.div
              className="absolute w-3 h-px bg-white/30 rotate-12"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.1 }}
              style={{ top: "25%", left: "10%" }}
            />
            <motion.div
              className="absolute w-3 h-px bg-white/30 -rotate-12"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.15 }}
              style={{ bottom: "25%", right: "10%" }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Adventure compass center dot - appears when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: colors.secondary }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 0.2 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export const OrigamiHamburger: React.FC<OrigamiHamburgerProps> = ({
  className,
}) => {
  const { user, userProfile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Determine current theme - check if we're on any glass-themed page
  const getCurrentTheme = () => {
    const path = location.pathname;
    if (path === "/gallery" || path.startsWith("/glass-gallery"))
      return "gallery";
    if (path === "/glass-events" || path.startsWith("/glass-events"))
      return "events";
    if (path.startsWith("/glass-event-details/")) return "details";
    if (path === "/") return "landing";
    if (path === "/profile") return "profile";
    if (path === "/community") return "community";
    if (path === "/dashboard") return "dashboard";
    return "default";
  };

  const currentTheme = getCurrentTheme();
  const isGlassPage = [
    "gallery",
    "events",
    "details",
    "landing",
    "profile",
    "community",
    "dashboard",
  ].includes(currentTheme);

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/glass-events", label: "Events", icon: Calendar },
    { to: "/forum", label: "Forum", icon: MessageSquare },
    { to: "/gallery", label: "Past Adventures", icon: Camera },
  ];

  const authLinks = user
    ? [
        { to: "/dashboard", label: "Dashboard", icon: Compass },
        { to: "/profile", label: "Profile", icon: User },
      ]
    : [];

  if (userProfile?.user_type === "admin") {
    authLinks.push({ to: "/admin", label: "Admin", icon: UserCircle });
  }

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "fixed top-4 left-4 z-50 p-2 rounded-xl backdrop-blur-xl border transition-all duration-300",
            isGlassPage
              ? "bg-white/10 border-white/20 hover:bg-white/20 text-white"
              : "bg-background/80 border-border hover:bg-accent",
            className,
          )}
        >
          <OrigamiIcon isOpen={isOpen} theme={currentTheme} />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className={cn(
          "w-80 backdrop-blur-xl border-r",
          isGlassPage
            ? "bg-black/20 border-white/10 text-white"
            : "bg-background/95",
        )}
      >
        <SheetHeader className="pb-6">
          <SheetTitle
            className={cn(
              "flex items-center gap-3 text-lg",
              isGlassPage ? "text-white" : "",
            )}
          >
            <motion.div
              className="p-2 rounded-lg backdrop-blur-sm border"
              style={{
                backgroundColor: isGlassPage
                  ? "rgba(255, 255, 255, 0.1)"
                  : undefined,
                borderColor: isGlassPage
                  ? "rgba(255, 255, 255, 0.2)"
                  : undefined,
              }}
              whileHover={{ scale: 1.05 }}
            >
              <Mountain className="w-5 h-5" />
            </motion.div>
            Adventure Menu
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6">
          {/* Main Navigation */}
          <div className="space-y-2">
            <h3
              className={cn(
                "text-sm font-semibold mb-3 flex items-center gap-2",
                isGlassPage ? "text-white/80" : "text-muted-foreground",
              )}
            >
              <Compass className="w-4 h-4" />
              Explore
            </h3>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                  location.pathname === to
                    ? isGlassPage
                      ? "bg-white/20 text-white border border-white/30"
                      : "bg-primary text-primary-foreground"
                    : isGlassPage
                      ? "hover:bg-white/10 text-white/90 hover:text-white"
                      : "hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{label}</span>
                {location.pathname === to && (
                  <motion.div
                    className="ml-auto w-2 h-2 rounded-full bg-current"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* User Section */}
          {user && (
            <div className="space-y-2 pt-4 border-t border-current/20">
              <h3
                className={cn(
                  "text-sm font-semibold mb-3 flex items-center gap-2",
                  isGlassPage ? "text-white/80" : "text-muted-foreground",
                )}
              >
                <User className="w-4 h-4" />
                Account
              </h3>
              {authLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                    location.pathname === to
                      ? isGlassPage
                        ? "bg-white/20 text-white border border-white/30"
                        : "bg-primary text-primary-foreground"
                      : isGlassPage
                        ? "hover:bg-white/10 text-white/90 hover:text-white"
                        : "hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Theme Toggle and Auth */}
          <div className="mt-auto pt-6 border-t border-current/20 space-y-3">
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-sm font-medium",
                  isGlassPage ? "text-white/80" : "text-muted-foreground",
                )}
              >
                Theme
              </span>
              <ThemeToggleCompact />
            </div>

            {user ? (
              <Button
                onClick={() => {
                  signOut();
                  handleLinkClick();
                }}
                variant={isGlassPage ? "ghost" : "outline"}
                className={cn(
                  "w-full justify-start gap-3",
                  isGlassPage && "text-white border-white/20 hover:bg-white/10",
                )}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <Link to="/auth" onClick={handleLinkClick}>
                <Button
                  variant={isGlassPage ? "ghost" : "outline"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isGlassPage &&
                      "text-white border-white/20 hover:bg-white/10",
                  )}
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Decorative elements for glass pages */}
        {isGlassPage && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-px h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent"
                style={{
                  left: `${10 + i * 10}%`,
                  top: `${Math.random() * 80}%`,
                }}
                animate={{
                  opacity: [0, 0.5, 0],
                  scaleY: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default OrigamiHamburger;
