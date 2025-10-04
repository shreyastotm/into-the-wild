import { Link } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import { User, MapPin, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { user, userProfile, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    // Auth state monitoring
  }, [loading, user]);
  
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
  ];

  const authLinks = user ? [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profile', label: 'Profile' },
  ] : [];

  if (userProfile?.user_type === 'admin') {
    authLinks.push({ to: '/admin', label: 'Admin' });
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-800 flex items-center">
            <MapPin className="mr-2 h-6 w-6 text-blue-600" />
            Into the Wild
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-gray-600 hover:text-gray-900">
                {link.label}
              </Link>
            ))}
            
            {!loading && (
              user ? (
                <>
                  {authLinks.map((link) => (
                    <Link key={link.to} to={link.to} className="text-gray-600 hover:text-gray-900">
                      {link.label}
                    </Link>
                  ))}
                  <Button
                    variant="ghost"
                    onClick={() => signOut()}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Sign In
                </Link>
              )
            )}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="mt-4 pb-2 md:hidden">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className="text-gray-600 hover:text-gray-900 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {!loading && (
                user ? (
                  <>
                    {authLinks.map((link) => (
                      <Link 
                        key={link.to} 
                        to={link.to} 
                        className="text-gray-600 hover:text-gray-900 py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="text-gray-600 hover:text-gray-900 text-left py-2"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link 
                    to="/login" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
