import { Link } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import { User, MapPin, Menu, X, Home, Calendar, UserCircle, LogOut, LogIn, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';

const Header = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // TODO: Implement actual notification fetching logic
  const handleNotificationClick = () => {
    // TODO: Open notifications panel or navigate to notifications page
    console.log('Notifications clicked');
  };
  useEffect(() => {
    // Auth state monitoring
  }, [loading, user]);
  
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
    { to: '/forum', label: 'Forum' },
    { to: '/gallery', label: 'Past Adventures' },
  ];

  const authLinks = user ? [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profile', label: 'Profile' },
  ] : [];

  if (userProfile?.user_type === 'admin') {
    authLinks.push({ to: '/admin', label: 'Admin' });
  }


  return (
    <TooltipProvider>
      <header className="bg-white shadow-sm sticky top-0 z-50">
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
                <Link key={link.to} to={link.to} className="text-gray-600 hover:text-gray-900 transition-colors">
                  {link.label}
                </Link>
              ))}
              
              {!loading && (
                user ? (
                  <>
                    {authLinks.map((link) => (
                      <Link key={link.to} to={link.to} className="text-gray-600 hover:text-gray-900 transition-colors">
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
                      className="bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
                    >
                      Sign In
                    </Link>
                  </>
                )
              )}
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
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
                      Into the Wild
                    </SheetTitle>
                  </SheetHeader>
                  
                  <nav className="mt-6 space-y-4">
                    {/* Main Navigation Links */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Navigation</h3>
                      {navLinks.map((link) => {
                        const icon = link.to === '/' ? Home : 
                                     link.to === '/forum' ? MessageSquare :
                                     Calendar;
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
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Account</h3>
                        {user ? (
                          <>
                            {authLinks.map((link) => {
                              const icon = link.to === '/dashboard' ? UserCircle : User;
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
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default Header;
