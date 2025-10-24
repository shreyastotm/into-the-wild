import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background dark:bg-background">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 bg-background dark:bg-background">
        {children}
      </main>
    </div>
  );
}
