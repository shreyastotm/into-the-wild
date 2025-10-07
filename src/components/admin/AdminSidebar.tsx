import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, CalendarClock, ShieldCheck, Ticket, ImagePlus } from 'lucide-react';
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
    { name: 'Identification', path: '/admin/id', icon: <ShieldCheck className="mr-2 h-4 w-4" /> },
    { name: 'Event Registrations', path: '/admin/event-registrations', icon: <Ticket className="mr-2 h-4 w-4" /> },
  ];

  return (
    <aside className="w-64 min-h-screen bg-gray-50 border-r p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-bold mb-6 px-2">Admin Menu</h2>
        <nav className="flex flex-col gap-2">
            {navItems.map(item => (
                <Button 
                    key={item.name}
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate(item.path)}
                >
                    {item.icon}
                    {item.name}
                </Button>
            ))}
        </nav>
      </div>
      <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
    </aside>
  );
}
