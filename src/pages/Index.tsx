import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { UpcomingTreks } from '@/components/trek/UpcomingTreks';


const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate('/trek-events');
  };

  return (
    <div>
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-8xl sm:text-9xl font-black text-gray-100 select-none">ITW</div>
          </div>
          <div className="text-center relative">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Discover Your Next Adventure</h1>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Join exciting outdoor adventures with Into The Wild. Discover, register, and experience the best.
            </p>
            <Button size="lg" onClick={handleExploreClick} className="mt-6">
               Explore Adventures
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Adventures Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Upcoming Adventures</h2>
            <p className="text-gray-600 mt-2">Plan your next journey with our curated list of adventures.</p>
          </div>
          <UpcomingTreks />
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Join Our Community</h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Join our community today and discover amazing trekking experiences with fellow adventurers.
            </p>
            <Button size="lg" onClick={handleExploreClick} className="mt-6">
               Explore Adventures
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
