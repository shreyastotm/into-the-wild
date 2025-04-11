
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trek-events" element={<TrekEvents />} />
            <Route path="/trek-events/:id" element={<TrekEventDetails />} />
            <Route path="/trek-events/create" element={<CreateTrekEvent />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
