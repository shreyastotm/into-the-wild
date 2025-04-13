
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { AuthProvider } from './components/auth/AuthProvider';
import TrekEvents from './pages/TrekEvents';
import TrekEventDetails from './pages/TrekEventDetails';
import CreateTrekEvent from './pages/CreateTrekEvent';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/auth" element={<Layout><Auth /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/trek-events" element={<Layout><TrekEvents /></Layout>} />
          <Route path="/trek-events/:id" element={<Layout><TrekEventDetails /></Layout>} />
          <Route path="/trek-events/create" element={<Layout><CreateTrekEvent /></Layout>} />
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
