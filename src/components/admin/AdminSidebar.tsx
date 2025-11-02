import {
  CalendarClock,
  Image,
  ImagePlus,
  LayoutDashboard,
  Menu,
  MessageSquare,
  ShieldCheck,
  Ticket,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    },
    {
      name: "Events",
      path: "/admin/events",
      icon: <CalendarClock className="mr-2 h-4 w-4" />,
    },
    {
      name: "Create Past Event",
      path: "/admin/past-events/create",
      icon: <ImagePlus className="mr-2 h-4 w-4" />,
    },
    {
      name: "Carousel Images",
      path: "/admin/carousel-images",
      icon: <Image className="mr-2 h-4 w-4" />,
    },
    {
      name: "Identification",
      path: "/admin/id",
      icon: <ShieldCheck className="mr-2 h-4 w-4" />,
    },
    {
      name: "Event Registrations",
      path: "/admin/event-registrations",
      icon: <Ticket className="mr-2 h-4 w-4" />,
    },
    {
      name: "Forum",
      path: "/admin/forum",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
    },
  ];

  const SidebarContent = () => (
    <>
      <div data-testid="adminsidebar">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6 px-2">
            <img
              src="/itw_logo.png"
              alt="Into the Wild"
              className="h-8 lg:h-10 w-auto"
            />
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                Admin Panel
              </h2>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                Management Dashboard
              </p>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-3">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className="w-full justify-start h-12 lg:h-14 px-4 lg:px-6 text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/30 hover:text-gray-900 dark:hover:text-white transition-all duration-300 rounded-xl backdrop-blur-sm border border-transparent hover:border-white/30 dark:hover:border-gray-600/30"
              onClick={() => {
                navigate(item.path);
                setIsMobileOpen(false);
              }}
            >
              <span className="mr-3 lg:mr-4">
                {React.cloneElement(item.icon, {
                  className: "h-5 w-5 lg:h-6 lg:w-6",
                })}
              </span>
              {item.name}
            </Button>
          ))}
        </nav>
      </div>
      <Button
        variant="outline"
        onClick={handleSignOut}
        className="h-12 lg:h-14 px-4 lg:px-6 text-sm lg:text-base font-medium bg-red-50/80 dark:bg-red-900/20 border-red-200/50 dark:border-red-800/30 text-red-700 dark:text-red-300 hover:bg-red-100/80 dark:hover:bg-red-900/40 hover:text-red-800 dark:hover:text-red-200 transition-all duration-300 rounded-xl backdrop-blur-sm"
      >
        Sign Out
      </Button>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Enhanced for Phase 5B */}
      <aside className="hidden lg:flex w-72 min-h-screen bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border-r border-white/20 dark:border-gray-700/30 p-4 flex-col justify-between shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Tablet Sidebar - Smaller width for medium screens */}
      <aside className="hidden md:flex lg:hidden w-64 min-h-screen bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border-r border-white/20 dark:border-gray-700/30 p-3 flex-col justify-between shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Trigger */}
      <div className="md:hidden" data-testid="adminsidebar">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="fixed top-4 right-4 z-50 bg-card/95 dark:bg-card/80 backdrop-blur border-2 border-border/30 dark:border-border/30 rounded-full w-12 h-12 p-0 shadow-lg"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open admin menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 sm:w-96">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-3">
                <img
                  src="/itw_logo.png"
                  alt="Into the Wild"
                  className="h-8 w-auto"
                />
                <span>Admin Panel</span>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6" data-testid="adminsidebar">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
