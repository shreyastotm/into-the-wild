
import AuthForm from '@/components/auth/AuthForm';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import { MobileHamburger } from '@/components/navigation/MobileHamburger';

export default function Auth() {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialMode = params.get('mode') === 'signup' ? 'signup' : params.get('mode') === 'signin' ? 'signin' : undefined;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Mobile Hamburger */}
      <MobileHamburger />

      {/* Main Content */}
      <main className="flex-grow px-4 sm:px-6 lg:px-8 pb-[calc(env(safe-area-inset-bottom)+64px)] min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <AuthForm initialMode={initialMode} />
        </div>
      </main>
    </div>
  );
}
