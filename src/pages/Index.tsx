import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { ArrowRight, MapPin, Users, Calendar } from 'lucide-react';
import { UpcomingTreks } from '@/components/trek/UpcomingTreks';
import { getHomeBackground } from '@/lib/siteSettings';
import FAQ from '@/components/FAQ';

const Index = () => {
  const { user, loading } = useAuth();
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate('/trek-events');
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const url = await getHomeBackground();
      if (mounted) setBgUrl(url);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50">
        {/* Background Layer (admin-selected or fallback watermark) */}
        {bgUrl ? (
          <div className="absolute inset-0">
            <img
              src={bgUrl}
              alt="Homepage background"
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-white/30" aria-hidden="true" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src="/itw_logo.jpg"
              alt=""
              aria-hidden="true"
              className="w-[600px] md:w-[800px] h-auto object-contain opacity-[0.03] blur-[0.5px]"
            />
          </div>
        )}
        
        {/* Content Layer */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16 md:py-24">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-6">
              Into the Wild
            </h1>
            <p className="text-lg md:text-xl text-center text-gray-600 max-w-2xl mb-8">
              Discover breathtaking treks and connect with a community of adventurers.
            </p>
            <Button variant="accent" size="lg" onClick={handleExploreClick}>
              Explore Treks
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Upcoming Adventures & Community Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Upcoming Adventures</h2>
            <p className="text-gray-600 mt-2">Plan your next journey with our curated list of treks.</p>
          </div>
          <UpcomingTreks />
          
          {/* Join Our Community */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold mb-4">Join Our Community</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join our community today and discover amazing trekking experiences with fellow adventurers.
            </p>
            <Button size="lg" onClick={handleExploreClick}>
              Explore Treks
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />
    </div>
  );
};

export default Index;
