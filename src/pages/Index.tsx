
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-4xl font-bold text-center mb-4">Into the Wild</h1>
        <h2 className="text-2xl font-semibold text-center mb-6">Trekking Community Platform</h2>
        <p className="text-xl text-gray-600 text-center max-w-2xl mb-8">
          Join our community of adventure seekers and explore the wilderness together.
          Discover new trails, share expenses, and make memories that last a lifetime.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="default" size="lg" onClick={handleGetStarted}>
            {!loading && user ? 'View Profile' : 'Get Started'}
          </Button>
          {!loading && !user && (
            <Button variant="outline" size="lg" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-16">
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
    </div>
  );
};

export default Index;
