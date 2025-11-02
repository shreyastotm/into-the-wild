import React from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background dark:bg-background">
      <AdminSidebar />
      <main className="flex-1 p-2 md:p-4 lg:p-6 bg-background dark:bg-background overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
