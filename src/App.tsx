import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
  Navigate,
  useParams,
} from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider } from "./components/auth/AuthProvider";
import { Toaster } from "./components/ui/toaster";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const TestRoute = lazy(() => import("./pages/TestRoute"));
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TrekEvents = lazy(() => import("./pages/TrekEvents"));
const TrekEventDetails = lazy(() => import("./pages/TrekEventDetails"));
const CreateTrekEvent = lazy(() => import("./pages/CreateTrekEvent"));
const PublicGallery = lazy(() => import("./pages/PublicGallery"));
const TrekkingGuide = lazy(() => import("./pages/TrekkingGuide"));
const SafetyTips = lazy(() => import("./pages/SafetyTips"));
const PackingList = lazy(() => import("./pages/PackingList"));
const FAQPage = lazy(() => import("./pages/FAQ"));
const ForumHome = lazy(() => import("./pages/forum"));
const ForumCategory = lazy(() => import("./pages/forum/Category"));
const ForumThread = lazy(() => import("./pages/forum/Thread"));
const AdminHome = lazy(() => import("./pages/admin"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const AppLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

// Redirect component for old trek-events URLs
const TrekEventRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/events/${id}`} replace />;
};

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Router>
          <Routes>
            {/* Loading component for lazy-loaded routes */}
            <Route path="/" element={
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <Index />
              </Suspense>
            } />

            {/* Auth routes without Layout (no header) */}
            <Route path="/login" element={
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <Auth />
              </Suspense>
            } />
            <Route path="/auth" element={
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <Auth />
              </Suspense>
            } />
            <Route path="/auth/callback" element={
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <AuthCallback />
              </Suspense>
            } />

            <Route element={<AppLayout />}>
              <Route path="/test-route" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TestRoute />
                </Suspense>
              } />

              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Profile />
                  </Suspense>
                } />
                <Route path="/dashboard" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Dashboard />
                  </Suspense>
                } />
                <Route element={<ProtectedRoute isAdminRoute />}>
                  <Route path="/admin/*" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminHome />
                    </Suspense>
                  } />
                </Route>
              </Route>

              <Route path="/events" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TrekEvents />
                </Suspense>
              } />
              <Route path="/events/:id" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TrekEventDetails />
                </Suspense>
              } />

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
                element={<Navigate to="/events" replace />}
              />
              <Route path="/trek-events/:id" element={<TrekEventRedirect />} />

              <Route path="/gallery" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <PublicGallery />
                </Suspense>
              } />
              <Route path="/trekking-guide" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TrekkingGuide />
                </Suspense>
              } />
              <Route path="/safety-tips" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <SafetyTips />
                </Suspense>
              } />
              <Route path="/packing-list" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <PackingList />
                </Suspense>
              } />
              <Route path="/faq" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <FAQPage />
                </Suspense>
              } />
              <Route path="/reset-password" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ResetPassword />
                </Suspense>
              } />

              {/* Forum routes */}
              <Route path="/forum" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ForumHome />
                </Suspense>
              } />
              <Route path="/forum/c/:slug" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ForumCategory />
                </Suspense>
              } />
              <Route path="/forum/t/:id" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ForumThread />
                </Suspense>
              } />

              <Route path="*" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <NotFound />
                </Suspense>
              } />
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
