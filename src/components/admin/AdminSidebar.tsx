import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AdminSidebar() {
  const navigate = useNavigate();
  return (
    <aside className="w-56 min-h-screen bg-gray-50 border-r p-4 flex flex-col gap-3">
      <h2 className="text-lg font-bold mb-4">Admin Menu</h2>
      <Button variant="ghost" className="justify-start" onClick={() => navigate('/admin')}>Dashboard</Button>
      <Button variant="ghost" className="justify-start" onClick={() => navigate('/admin#packing')}>Packing Items</Button>
      {/* Future: Add more navigation items here */}
    </aside>
  );
}
