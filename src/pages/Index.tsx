
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { ArrowRight, MapPin, Users, Calendar } from 'lucide-react';
import { UpcomingTreks } from '@/components/trek/UpcomingTreks';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/trek-events');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Into the Wild</h1>
        <h2 className="text-2xl font-semibold text-center mb-6">Trekking Community Platform</h2>
        <p className="text-xl text-gray-600 text-center max-w-2xl mb-8">
          Join our community of adventure seekers and explore the wilderness together.
          Discover new trails, share expenses, and make memories that last a lifetime.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="default" size="lg" onClick={handleGetStarted}>
            {!loading && user ? 'Explore Treks' : 'Get Started'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          {!loading && !user && (
            <Button variant="outline" size="lg" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Featured Treks Section */}
      <div className="my-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Upcoming Trek Events</h2>
          <Button variant="outline" onClick={() => navigate('/trek-events')}>
            View All Treks
          </Button>
        </div>
        
        <UpcomingTreks limit={3} />
      </div>

      {/* What We Offer Section */}
      <div className="max-w-5xl mx-auto my-16">
        <h2 className="text-2xl font-bold text-center mb-8">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-2">Trek Events</h3>
            <p className="text-gray-600">
              Join various categories of treks from family-friendly outings to challenging long-distance adventures.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-2">Community Benefits</h3>
            <p className="text-gray-600">
              Share expenses, coordinate transportation, and connect with like-minded trekkers.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-2">Subscription Options</h3>
            <p className="text-gray-600">
              Choose between community membership (₹499/year) or self-service access (₹99/month).
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-50 rounded-lg p-8 my-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready for Your Next Adventure?</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Join our community today and discover amazing trekking experiences with fellow adventurers.
        </p>
        <Button size="lg" onClick={handleGetStarted}>
          {!loading && user ? 'Explore Treks' : 'Join Now'}
        </Button>
      </div>
    </div>
  );
};

export default Index;
