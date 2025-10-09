
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { MobileHamburger } from '@/components/navigation/MobileHamburger';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Mobile Hamburger */}
      <MobileHamburger />

      <main className="flex-grow px-4 sm:px-6 lg:px-8 pb-[calc(env(safe-area-inset-bottom)+64px)]">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
      <Footer />
      <BottomTabBar />
    </div>
  );
};

export default Layout;
