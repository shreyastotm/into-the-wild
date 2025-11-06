import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import {
  Navigate,
  Outlet,
  Route,
  BrowserRouter as Router,
  Routes,
  useParams,
} from "react-router-dom";

import { AuthProvider } from "./components/auth/AuthProvider";
import Layout from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import { Toaster } from "./components/ui/toaster";

import { TooltipProvider } from "@/components/ui/tooltip";

// Global state management with TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/GlassMorphismLandingTrial"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const TestRoute = lazy(() => import("./pages/TestRoute"));
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TrekEvents = lazy(() => import("./pages/GlassMorphismEvents"));
const TrekEventDetails = lazy(
  () => import("./pages/GlassMorphismEventDetails"),
);
const CreateTrekEvent = lazy(() => import("./pages/CreateTrekEvent"));
const PublicGallery = lazy(() => import("./pages/GlassMorphismGallery"));
const TrekkingGuide = lazy(() => import("./pages/TrekkingGuide"));
const SafetyTips = lazy(() => import("./pages/SafetyTips"));
const PackingList = lazy(() => import("./pages/PackingList"));
const FAQPage = lazy(() => import("./pages/FAQ"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const DataDeletion = lazy(() => import("./pages/DataDeletion"));
const DataCallback = lazy(() => import("./pages/DataCallback"));
const ForumHome = lazy(() => import("./pages/forum"));
const ForumCategory = lazy(() => import("./pages/forum/Category"));
const ForumThread = lazy(() => import("./pages/forum/Thread"));
const Community = lazy(() => import("./pages/Community"));
const AdminHome = lazy(() => import("./pages/admin"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const GlassMorphismGallery = lazy(() => import("./pages/GlassMorphismGallery"));
const GlassMorphismEvents = lazy(() => import("./pages/GlassMorphismEvents"));
const GlassMorphismEventDetails = lazy(
  () => import("./pages/GlassMorphismEventDetails"),
);
const GlassMorphismLanding = lazy(() => import("./pages/GlassMorphismLanding"));
const GlassMorphismLandingTrial = lazy(() => import("./pages/GlassMorphismLandingTrial"));

const AppLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

// Redirect component for old trek-events URLs
const TrekEventRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/glass-event-details/${id}`} replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router>
            <Routes>
              {/* Loading component for lazy-loaded routes */}
              <Route
                path="/"
                element={
                  <Suspense fallback={<LoadingSpinner fullScreen />}>
                    <Index />
                  </Suspense>
                }
              />

              {/* Alternative route to main landing page (backward compatibility) */}
              <Route
                path="/landing-trial"
                element={
                  <Suspense fallback={<LoadingSpinner fullScreen />}>
                    <GlassMorphismLandingTrial />
                  </Suspense>
                }
              />

              {/* Auth routes without Layout (no header) */}
              <Route
                path="/login"
                element={
                  <Suspense fallback={<LoadingSpinner fullScreen />}>
                    <Auth />
                  </Suspense>
                }
              />
              <Route
                path="/auth"
                element={
                  <Suspense fallback={<LoadingSpinner fullScreen />}>
                    <Auth />
                  </Suspense>
                }
              />
              <Route
                path="/auth/callback"
                element={
                  <Suspense fallback={<LoadingSpinner fullScreen />}>
                    <AuthCallback />
                  </Suspense>
                }
              />

              <Route element={<AppLayout />}>
                <Route
                  path="/test-route"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <TestRoute />
                    </Suspense>
                  }
                />

                <Route element={<ProtectedRoute />}>
                  <Route
                    path="/profile"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Profile />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Dashboard />
                      </Suspense>
                    }
                  />
                  <Route element={<ProtectedRoute isAdminRoute />}>
                    <Route
                      path="/admin/*"
                      element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <AdminHome />
                        </Suspense>
                      }
                    />
                  </Route>
                </Route>

                {/* Trek event creation - must be before backwards compatibility redirects */}
                <Route element={<ProtectedRoute isAdminRoute />}>
                  <Route
                    path="/trek-events/create"
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <CreateTrekEvent />
                      </Suspense>
                    }
                  />
                </Route>

                {/* Backwards compatibility redirects */}
                <Route
                  path="/trek-events"
                  element={<Navigate to="/glass-events" replace />}
                />
                <Route
                  path="/trek-events/:id"
                  element={<TrekEventRedirect />}
                />

                <Route
                  path="/gallery"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <PublicGallery />
                    </Suspense>
                  }
                />
                <Route
                  path="/glass-landing"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <GlassMorphismLanding />
                    </Suspense>
                  }
                />
                <Route
                  path="/glass-events"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <GlassMorphismEvents />
                    </Suspense>
                  }
                />
                <Route
                  path="/glass-event-details/:id"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <GlassMorphismEventDetails />
                    </Suspense>
                  }
                />
                <Route
                  path="/trekking-guide"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <TrekkingGuide />
                    </Suspense>
                  }
                />
                <Route
                  path="/safety-tips"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <SafetyTips />
                    </Suspense>
                  }
                />
                <Route
                  path="/packing-list"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <PackingList />
                    </Suspense>
                  }
                />
                <Route
                  path="/faq"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <FAQPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/privacy-policy"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <PrivacyPolicy />
                    </Suspense>
                  }
                />
                <Route
                  path="/data-deletion"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <DataDeletion />
                    </Suspense>
                  }
                />
                <Route
                  path="/data-callback"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <DataCallback />
                    </Suspense>
                  }
                />
                <Route
                  path="/terms-of-service"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <TermsOfService />
                    </Suspense>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ResetPassword />
                    </Suspense>
                  }
                />

                {/* Forum routes */}
                <Route
                  path="/forum"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ForumHome />
                    </Suspense>
                  }
                />
                <Route
                  path="/forum/c/:slug"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ForumCategory />
                    </Suspense>
                  }
                />
                <Route
                  path="/forum/t/:id"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ForumThread />
                    </Suspense>
                  }
                />

                {/* Community route */}
                <Route
                  path="/community"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Community />
                    </Suspense>
                  }
                />

                <Route
                  path="*"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <NotFound />
                    </Suspense>
                  }
                />
              </Route>
            </Routes>
            <Toaster />
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
