import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useAuth } from '@/components/auth/AuthProvider';
import { ArrowRight, MapPin, Users, Calendar } from 'lucide-react';
import { UpcomingTreks } from '@/components/trek/UpcomingTreks';
import { getHomeBackground, getHomeHeroImages } from '@/lib/siteSettings';
import FAQ from '@/components/FAQ';

const Index = () => {
  const { user, loading } = useAuth();
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate('/events');
  };
  const handleSignup = () => navigate('/auth?mode=signup');
  const handleSignin = () => navigate('/auth?mode=signin');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [backgroundUrl, heroImagesList] = await Promise.all([
        getHomeBackground(),
        getHomeHeroImages()
      ]);

      if (mounted) {
        setBgUrl(backgroundUrl);
        // Use hero images if available, otherwise fallback to single background or logo
        setHeroImages(heroImagesList.length > 0 ? heroImagesList :
                     backgroundUrl ? [backgroundUrl] : ['/itw_logo.jpg']);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      {/* Hero Section with Full-Screen Carousel (Mobile) and CTAs */}
      <section className="relative w-full h-screen md:h-auto md:py-16 overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50">
        <div className="container mx-auto px-4 h-full flex flex-col justify-center md:justify-start">
          <div className="mb-4 md:mb-8">
            <Carousel className="w-full h-full md:h-auto">
              <CarouselContent>
                {heroImages.map((src, i) => (
                  <CarouselItem key={i}>
                    <div className="relative aspect-[16/9] w-full h-full md:h-auto overflow-hidden rounded-xl md:rounded-lg">
                      <img src={src} alt={`Adventure ${i + 1}`} className="w-full h-full object-cover" loading="eager" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:inline-flex" />
              <CarouselNext className="hidden sm:inline-flex" />
            </Carousel>
          </div>

          <div className="flex flex-col items-center text-center gap-3 md:gap-4">
            <h1 className="text-3xl md:text-5xl font-bold">Into the Wild</h1>
            <p className="text-gray-600 max-w-2xl">
              Discover breathtaking treks and connect with a community of adventurers.
            </p>
            <Button variant="accent" size="lg" className="w-full max-w-sm" onClick={handleSignup}>
              Start my Journey
            </Button>
            <Button variant="outline" size="lg" className="w-full max-w-sm" onClick={handleSignin}>
              Sign in
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
