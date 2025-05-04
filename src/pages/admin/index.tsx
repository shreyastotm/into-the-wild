import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../AdminLayout';
import AdminPanel from '../AdminPanel';
import AdminTrekDetails from '../AdminTrekDetails';

export default function AdminHome() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminPanel />} />
        <Route path="/trek/:trekId" element={<AdminTrekDetails />} />
      </Routes>
    </AdminLayout>
  );
}
