import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useAuth } from '@/components/auth/AuthProvider';
import { getHomeBackground, getHomeHeroImages } from '@/lib/siteSettings';

const Index = () => {
  const { user, loading } = useAuth();
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const navigate = useNavigate();

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
      {/* Hero Section with Mobile Carousel and CTAs */}
      <section className="relative w-full h-screen md:h-auto md:py-16 overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50">
        {/* Mobile Floating Logo */}
        <div className="absolute top-4 left-4 z-50 md:hidden">
          <img
            src="/itw_logo.jpg"
            alt="Into the Wild"
            className="h-10 w-auto opacity-90"
          />
        </div>

        <div className="container mx-auto px-4 h-full flex flex-col pt-16 md:pt-0">
          {/* Carousel Section - More compact for mobile */}
          <div className="flex-shrink-0 mb-6 md:mb-8">
            <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
              <Carousel className="w-full h-full" orientation="horizontal">
                <CarouselContent>
                  {heroImages.map((src, i) => (
                    <CarouselItem key={i}>
                      <div className="relative h-full overflow-hidden rounded-lg">
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
          </div>

          {/* CTAs Section - Fit within viewport */}
          <div className="flex-shrink-0 flex flex-col items-center text-center gap-4 md:gap-6">
            <h1 className="text-2xl md:text-4xl font-bold">Into the Wild</h1>
            <p className="text-gray-600 max-w-2xl text-sm md:text-base">
              Discover breathtaking treks and connect with a community of adventurers.
            </p>
            <div className="w-full max-w-sm space-y-3">
              <Button variant="accent" size="lg" className="w-full" onClick={handleSignup}>
                Start my Journey
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={handleSignin}>
                Sign in
              </Button>
            </div>
          </div>

          {/* Page break */}
          <div className="flex-shrink-0 mt-8 md:mt-12">
            <div className="h-px bg-gray-200 w-full"></div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Index;
