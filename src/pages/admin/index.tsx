import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import AdminPanel from '../AdminPanel';
import TrekEventsAdmin from './TrekEventsAdmin';
import UserVerificationPanel from '@/components/admin/UserVerificationPanel';

export default function AdminHome() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminPanel />} />
        <Route path="/events" element={<TrekEventsAdmin />} />
        <Route path="/id" element={<UserVerificationPanel />} />
      </Routes>
    </AdminLayout>
  );
}
