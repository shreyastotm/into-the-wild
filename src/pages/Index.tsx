import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useAuth } from '@/components/auth/AuthProvider';
import { UpcomingTreks } from '@/components/trek/UpcomingTreks';
import { getHomeBackground, getHomeHeroImages } from '@/lib/siteSettings';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Index = () => {
  const { user, loading } = useAuth();
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [faqOpen, setFaqOpen] = useState(false);
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
      <section className="relative w-full min-h-screen md:h-auto md:py-16 overflow-hidden bg-gradient-to-br from-teal-50 via-white to-amber-50">
        {/* Mobile Floating Logo and Hamburger */}
        <div className="absolute top-4 left-4 z-50 md:hidden">
          <img
            src="/itw_logo.jpg"
            alt="Into the Wild"
            className="h-10 w-auto opacity-90"
          />
        </div>

        <div className="absolute top-4 right-4 z-50 md:hidden">
          <Sheet open={faqOpen} onOpenChange={setFaqOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="bg-white/90 backdrop-blur border rounded-full w-10 h-10 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">FAQ</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <div className="mt-6">
                <FAQ />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="container mx-auto px-4 h-full flex flex-col">
          {/* Carousel Section - Reduced height to avoid overlap */}
          <div className="flex-shrink-0 mb-8 md:mb-12">
            <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden">
              <Carousel className="w-full h-full" orientation="horizontal">
                <CarouselContent>
                  {heroImages.map((src, i) => (
                    <CarouselItem key={i}>
                      <div className="relative h-full overflow-hidden rounded-xl">
                        <img src={src} alt={`Adventure ${i + 1}`} className="w-full h-full object-cover" loading="eager" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:inline-flex" />
                <CarouselNext className="hidden sm:inline-flex" />
              </Carousel>
            </div>
          </div>

          {/* CTAs Section */}
          <div className="flex-shrink-0 flex flex-col items-center text-center gap-4 md:gap-6 mb-8">
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

    </div>
  );
};

export default Index;
