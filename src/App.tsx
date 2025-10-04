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
import TrekArchives from './pages/TrekArchives';
import { Toaster } from './components/ui/toaster';
import AdminHome from './pages/admin';
import ResetPassword from './pages/ResetPassword';
import { ProtectedRoute } from './components/ProtectedRoute';

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
            
            {/* Backwards compatibility redirects */}
            <Route path="/trek-events" element={<Navigate to="/events" replace />} />
            <Route path="/trek-events/:id" element={<TrekEventRedirect />} />
            
            <Route path="/trek-archives" element={<TrekArchives />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
