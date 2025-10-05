
import AuthForm from '@/components/auth/AuthForm';

export default function Auth() {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden md:flex relative bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-600 overflow-hidden">
        {/* Logo Pattern Background */}
        <div className="absolute inset-0">
          <img 
            src="/itw_logo.jpg" 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay scale-110 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-teal-600/60 via-transparent to-teal-900/60"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
          <img 
            src="/itw_logo.jpg" 
            alt="Into the Wild" 
            className="h-40 w-auto mb-8 drop-shadow-2xl"
          />
          <h1 className="text-5xl font-bold mb-4 text-center">Into the Wild</h1>
          <p className="text-2xl text-teal-50 text-center max-w-md mb-8">
            Your next adventure awaits
          </p>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold">500+</div>
              <div className="text-teal-200 text-sm">Treks</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">10K+</div>
              <div className="text-teal-200 text-sm">Hikers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">50+</div>
              <div className="text-teal-200 text-sm">Locations</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <img 
            src="/itw_logo.jpg" 
            alt="Into the Wild" 
            className="h-20 w-auto mx-auto mb-8 md:hidden"
          />
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
