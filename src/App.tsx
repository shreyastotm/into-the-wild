import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet, Navigate, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import Index from './pages/Index';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import TestRoute from './pages/TestRoute';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { AuthProvider } from './components/auth/AuthProvider';
import TrekEvents from './pages/TrekEvents';
import TrekEventDetails from './pages/TrekEventDetails';
import CreateTrekEvent from './pages/CreateTrekEvent';
import Gallery from './pages/Gallery';
import TrekkingGuide from './pages/TrekkingGuide';
import SafetyTips from './pages/SafetyTips';
import PackingList from './pages/PackingList';
import FAQPage from './pages/FAQ';
import ForumHome from './pages/forum';
import ForumCategory from './pages/forum/Category';
import ForumThread from './pages/forum/Thread';
import { Toaster } from './components/ui/toaster';
import AdminHome from './pages/admin';
import ResetPassword from './pages/ResetPassword';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TooltipProvider } from '@/components/ui/tooltip';

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
            <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/test-route" element={<TestRoute />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route element={<ProtectedRoute isAdminRoute />}>
                 <Route path="/admin/*" element={<AdminHome />} />
              </Route>
            </Route>
            
            <Route path="/events" element={<TrekEvents />} />
            <Route path="/events/:id" element={<TrekEventDetails />} />
            
            {/* Trek event creation - must be before backwards compatibility redirects */}
            <Route element={<ProtectedRoute isAdminRoute />}>
              <Route path="/trek-events/create" element={<CreateTrekEvent />} />
            </Route>
            
            {/* Backwards compatibility redirects */}
            <Route path="/trek-events" element={<Navigate to="/events" replace />} />
            <Route path="/trek-events/:id" element={<TrekEventRedirect />} />
            
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/trekking-guide" element={<TrekkingGuide />} />
            <Route path="/safety-tips" element={<SafetyTips />} />
            <Route path="/packing-list" element={<PackingList />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Forum routes */}
            <Route path="/forum" element={<ForumHome />} />
            <Route path="/forum/c/:slug" element={<ForumCategory />} />
            <Route path="/forum/t/:id" element={<ForumThread />} />

            <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
