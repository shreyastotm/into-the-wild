import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  User,
  MapPin,
  Home,
  Calendar,
  UserCircle,
  LogOut,
  LogIn,
  MessageSquare,
  Menu,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggleCompact } from "@/components/ThemeToggle";

export function MobileHamburger() {
  const { user, userProfile, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/events", label: "Events" },
    { to: "/forum", label: "Forum" },
    { to: "/gallery", label: "Past Adventures" },
    { to: "/faq", label: "FAQ" },
  ];

  const authLinks = user
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/profile", label: "Profile" },
      ]
    : [];

  if (userProfile?.user_type === "admin") {
    authLinks.push({ to: "/admin", label: "Admin" });
  }

  return (
    <div className="md:hidden">
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-900 dark:text-primary-foreground hover:text-gray-900 dark:hover:text-primary-foreground fixed top-4 right-4 z-50 bg-white/95 dark:bg-primary/95 backdrop-blur border-2 border-gray-300 dark:border-primary rounded-full w-12 h-12 p-0 shadow-lg"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 sm:w-96">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/itw_logo.png"
                  alt="Into the Wild"
                  className="h-8 w-auto"
                />
                <span>Into the Wild</span>
              </div>
              <ThemeToggleCompact />
            </SheetTitle>
          </SheetHeader>

          <nav className="mt-6 space-y-4">
            {/* Main Navigation Links */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Navigation
              </h3>
              {navLinks.map((link) => {
                const icon =
                  link.to === "/"
                    ? Home
                    : link.to === "/forum"
                      ? MessageSquare
                      : link.to === "/faq"
                        ? HelpCircle
                        : Calendar;
                const IconComponent = icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-3 text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <IconComponent className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* User Section */}
            {!loading && (
              <div className="space-y-2 border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Account
                </h3>
                {user ? (
                  <>
                    {authLinks.map((link) => {
                      const icon = link.to === "/dashboard" ? UserCircle : User;
                      const IconComponent = icon;
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          className="flex items-center gap-3 text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <IconComponent className="h-5 w-5" />
                          {link.label}
                        </Link>
                      );
                    })}
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </Link>
                )}
              </div>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
