import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import AdminPanel from '../AdminPanel';
import TrekEventsAdmin from './TrekEventsAdmin';
import CreatePastEvent from './CreatePastEvent';
import UserVerificationPanel from '@/components/admin/UserVerificationPanel';
import EventRegistrations from './EventRegistrations';

export default function AdminHome() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminPanel />} />
        <Route path="/events" element={<TrekEventsAdmin />} />
        <Route path="/past-events/create" element={<CreatePastEvent />} />
        <Route path="/id" element={<UserVerificationPanel />} />
        <Route path="/event-registrations" element={<EventRegistrations />} />
      </Routes>
    </AdminLayout>
  );
}
