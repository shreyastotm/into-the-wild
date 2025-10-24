import { Link } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import {
  User,
  MapPin,
  Home,
  Calendar,
  UserCircle,
  LogOut,
  LogIn,
  MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";

const Header = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // TODO: Implement actual notification fetching logic
  const handleNotificationClick = () => {
    // TODO: Open notifications panel or navigate to notifications page
    console.log("Notifications clicked");
  };
  useEffect(() => {
    // Auth state monitoring
  }, [loading, user]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/events", label: "Events" },
    { to: "/forum", label: "Forum" },
    { to: "/gallery", label: "Past Adventures" },
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
    <TooltipProvider>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/itw_logo.png"
                alt="Into the Wild"
                className="h-10 sm:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-lg sm:text-xl font-bold text-gray-800 hidden sm:inline">
                Into the Wild
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {!loading &&
                (user ? (
                  <>
                    {authLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}

                    {/* Notification Bell */}
                    <NotificationBell
                      unreadCount={unreadNotifications}
                      onClick={handleNotificationClick}
                    />

                    <ThemeToggle />

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          onClick={() => signOut()}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Sign Out</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <ThemeToggle />
                    <Link
                      to="/auth"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 font-medium"
                    >
                      Sign In
                    </Link>
                  </>
                ))}
            </nav>

          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default Header;
