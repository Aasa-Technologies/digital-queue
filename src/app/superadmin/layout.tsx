'use client'
import { useRouter } from 'next/navigation';
import Sidebar from "@/components/superadmin/Sidebar";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

export default function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('superAdminData');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <header className="p-4 flex justify-end">
          <Button onClick={handleLogout}>Logout</Button>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
