import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { ArrowRight, MapPin, Users, Calendar } from 'lucide-react';
import { UpcomingTreks } from '@/components/trek/UpcomingTreks';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate('/trek-events');
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-[url('/hero-image.jpg')] bg-cover bg-center">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16 md:py-24">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Into the Wild</h1>
            <p className="text-lg md:text-xl text-center text-gray-700 max-w-2xl mb-8">
              Discover breathtaking treks and connect with a community of adventurers.
            </p>
            <Button size="lg" onClick={handleExploreClick}>
              Explore Treks
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Treks Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Upcoming Adventures</h2>
            <p className="text-gray-600 mt-2">Plan your next journey with our curated list of treks.</p>
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
               Explore Treks
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
