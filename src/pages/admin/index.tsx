import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import AdminPanel from '../AdminPanel';
import TrekEventsAdmin from './TrekEventsAdmin';
import UserVerificationPanel from '@/components/admin/UserVerificationPanel';
import RegistrationAdmin from '@/components/admin/RegistrationAdmin';

export default function AdminHome() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminPanel />} />
        <Route path="/events" element={<TrekEventsAdmin />} />
        <Route path="/verification" element={<UserVerificationPanel />} />
        <Route path="/registrations" element={<RegistrationAdmin />} />
      </Routes>
    </AdminLayout>
  );
}
