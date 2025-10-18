import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, CalendarClock, ShieldCheck, Ticket, ImagePlus, MessageSquare, Image } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="mr-2 h-4 w-4" /> },
    { name: 'Events', path: '/admin/events', icon: <CalendarClock className="mr-2 h-4 w-4" /> },
    { name: 'Create Past Event', path: '/admin/past-events/create', icon: <ImagePlus className="mr-2 h-4 w-4" /> },
    { name: 'Carousel Images', path: '/admin/carousel-images', icon: <Image className="mr-2 h-4 w-4" /> },
    { name: 'Identification', path: '/admin/id', icon: <ShieldCheck className="mr-2 h-4 w-4" /> },
    { name: 'Event Registrations', path: '/admin/event-registrations', icon: <Ticket className="mr-2 h-4 w-4" /> },
    { name: 'Forum', path: '/admin/forum', icon: <MessageSquare className="mr-2 h-4 w-4" /> },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white/80 dark:bg-background/80 backdrop-blur-xl border-r border-white/20 dark:border-background/20 p-4 flex flex-col justify-between shadow-xl">
      <div>
        <h2 className="text-lg font-bold mb-6 px-2 text-gray-900 dark:text-foreground">Admin Menu</h2>
        <nav className="flex flex-col gap-2">
            {navItems.map(item => (
                <Button
                    key={item.name}
                    variant="ghost"
                    className="w-full justify-start text-gray-700 dark:text-secondary-foreground hover:bg-white/50 dark:hover:bg-secondary/50 hover:text-gray-900 dark:hover:text-secondary transition-all duration-200"
                    onClick={() => navigate(item.path)}
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
        className="bg-white/50 dark:bg-secondary/50 border-white/30 dark:border-secondary/30 text-gray-700 dark:text-secondary-foreground hover:bg-white/70 dark:hover:bg-secondary-hover/70 hover:text-gray-900 dark:hover:text-secondary transition-all duration-200"
      >
        Sign Out
      </Button>
    </aside>
  );
}
