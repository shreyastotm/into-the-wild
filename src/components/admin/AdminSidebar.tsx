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
        <h2 className="text-lg font-bold mb-6 px-2 text-foreground dark:text-foreground">
          Admin Menu
        </h2>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className="w-full justify-start text-muted-foreground dark:text-muted-foreground hover:bg-muted/50 dark:hover:bg-muted/30 hover:text-foreground dark:hover:text-foreground transition-all duration-200"
              onClick={() => {
                navigate(item.path);
                setIsMobileOpen(false);
              }}
            >
              {item.icon}
              {item.name}
            </Button>
          ))}
        </nav>
      </div>
      <Button
        variant="outline"
        onClick={handleSignOut}
        className="bg-muted/50 dark:bg-muted/30 border-muted-foreground/30 dark:border-muted-foreground/30 text-muted-foreground dark:text-muted-foreground hover:bg-muted/70 dark:hover:bg-muted/50 hover:text-foreground dark:hover:text-foreground transition-all duration-200"
      >
        Sign Out
      </Button>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen bg-card/80 dark:bg-card/60 backdrop-blur-xl border-r border-border/20 dark:border-border/20 p-4 flex-col justify-between shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Trigger */}
      <div className="md:hidden" data-testid="adminsidebar">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="fixed top-4 left-4 z-50 bg-card/95 dark:bg-card/80 backdrop-blur border-2 border-border/30 dark:border-border/30 rounded-full w-12 h-12 p-0 shadow-lg"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open admin menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 sm:w-96">
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
