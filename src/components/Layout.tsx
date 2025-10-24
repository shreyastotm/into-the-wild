import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { BottomTabBar } from "@/components/navigation/BottomTabBar";
import { MobileHamburger } from "@/components/navigation/MobileHamburger";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  // Page type checks for conditional rendering
  const isHomePage = location.pathname === "/";
  const isDashboard = location.pathname === "/dashboard";
  const isFullScreenPage = isHomePage || isDashboard; // Hide BottomTabBar on these pages

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

      {/* Floating Hamburger - Always visible on mobile (no header bar) */}
      <MobileHamburger />

      {/* Desktop Header - Show on all pages */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Main Content - Pages handle their own padding for mobile native feel */}
      <main
        className={cn(
          "flex-grow",
          // Only add bottom padding for bottom nav bar (hidden on full-screen pages)
          !isFullScreenPage && "pb-[calc(env(safe-area-inset-bottom)+80px)]",
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

      {/* Bottom Navigation - Hidden on full-screen pages (home & dashboard) */}
      {!isFullScreenPage && <BottomTabBar />}
    </div>
  );
};

export default Layout;
