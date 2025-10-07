import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const location = useLocation();
  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Adventures' },
    { to: '/profile', label: 'Profile' },
  ];

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">Into The Wild</Link>
        <nav className="flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'text-sm hover:text-foreground/80 transition-colors',
                location.pathname === item.to ? 'text-foreground font-medium' : 'text-foreground/60'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
