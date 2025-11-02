import { useLocation } from "react-router-dom";

import Footer from "./Footer";
import Header from "./Header";

import { AnalyticsConsent } from "@/components/AnalyticsConsent";
import { useAuth } from "@/components/auth/AuthProvider";
import { NudgeSystem } from "@/components/interactions/NudgeSystem";
import { ProfileCompletionFunnel } from "@/components/interactions/ProfileCompletionFunnel";
import { MobileHamburger } from "@/components/navigation/MobileHamburger";
import { useGA4Analytics } from "@/hooks/useGA4Analytics";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { cn } from "@/lib/utils";

// Phase 5 Interaction System Components

// GA4 Analytics

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = (props) => {
  const { children } = props || {};
  const location = useLocation();
  const { user } = useAuth();

  // Initialize GA4 Analytics (automatically tracks page views)
  const { isEnabled: ga4Enabled } = useGA4Analytics();

  // Always call hooks - never conditionally (React Rules of Hooks requirement)
  // Pass empty string if no user - the hook handles this gracefully
  const profileCompletion = useProfileCompletion(user?.id || "");
  const { overallPercentage: completionPercentage = 0, currentStage } =
    profileCompletion;

  // Page type checks for conditional rendering
  const isHomePage = location.pathname === "/";
  const isDashboard = location.pathname === "/dashboard";
  const isProfile = location.pathname === "/profile";
  const isCommunity = location.pathname === "/community";
  // Glass pages now include main routes (/, /events, /gallery, /events/:id) as they all use glass theme
  const isGlassPage =
    location.pathname === "/" ||
    location.pathname === "/gallery" ||
    location.pathname === "/events" ||
    location.pathname.startsWith("/events/") ||
    location.pathname === "/glass-landing" ||
    location.pathname === "/glass-gallery" ||
    location.pathname === "/glass-events" ||
    location.pathname.startsWith("/glass-event-details/") ||
    isProfile ||
    isCommunity ||
    isDashboard ||
    location.pathname === "/forum" ||
    location.pathname.startsWith("/forum/");
  const isFullScreenPage = isHomePage || isDashboard || isGlassPage;

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-x-hidden">
      {/* Fixed Background Pattern - Subtle texture (hide on full-screen pages) */}
      {!isFullScreenPage && (
        <div className="fixed inset-0 -z-10 opacity-[0.015] pointer-events-none dark:opacity-[0.03]">
          <div
            className="absolute inset-0 bg-repeat bg-center"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23000000' fill-opacity='0.05'/%3E%3C/svg%3E")`,
              backgroundSize: "30px 30px",
            }}
          />
        </div>
      )}

      {/* Header - Desktop navigation (hidden on glass pages) */}
      {!isGlassPage && <Header />}

      {/* Mobile Floating Hamburger - Only on mobile, or Origami for glass pages */}
      <div className="md:hidden">
        {isGlassPage ? (
          <div /> /* OrigamiHamburger is rendered within glass pages */
        ) : (
          <MobileHamburger />
        )}
      </div>

      {/* Main Content - Pages handle their own padding for mobile native feel */}
      <main
        className={cn(
          "flex-grow",
          // Desktop padding
          "md:pb-8",
          // Desktop container
          !isFullScreenPage && "md:px-6 lg:px-8",
        )}
      >
        <div
          className={cn(
            "w-full h-full",
            !isFullScreenPage && "md:max-w-7xl md:mx-auto",
          )}
        >
          {children}
        </div>
      </main>

      {/* Footer - Hidden on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Phase 5 Interaction System Components */}
      {user && profileCompletion && (
        <>
          {/* Nudge System - Behavioral psychology-driven prompts */}
          <NudgeSystem
            userId={user.id}
            currentPage={location.pathname}
            profileCompletion={completionPercentage}
            className="fixed bottom-20 right-4 z-50"
          />

          {/* Profile Completion Funnel - Only show as compact widget outside profile page */}
          {location.pathname !== "/profile" &&
            !isFullScreenPage &&
            completionPercentage < 100 && (
              <div className="fixed top-4 right-4 z-40 max-w-xs">
                {/* Compact widget will be rendered by Profile page, not here */}
              </div>
            )}
        </>
      )}

      {/* Analytics Consent Banner - Shows if analytics enabled and consent not given */}
      <AnalyticsConsent />

      {/* GA4 Analytics Status Indicator (Development Only) */}
      {import.meta.env.DEV && ga4Enabled && (
        <div className="fixed bottom-4 right-4 z-50 text-xs bg-muted/80 backdrop-blur-sm px-2 py-1 rounded border text-muted-foreground">
          GA4: ✅ Active
        </div>
      )}
    </div>
  );
};

export default Layout;
