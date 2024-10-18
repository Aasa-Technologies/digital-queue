'use client'
import { useRouter } from 'next/navigation';
import Sidebar from "@/components/superadmin/Sidebar";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [superAdminName, setSuperAdminName] = useState('');

  useEffect(() => {
    const superAdminData = JSON.parse(localStorage.getItem('superAdminData') || '{}');
    setSuperAdminName(superAdminData.name || '');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('superAdminData');
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <header className="p-4 flex justify-between items-center border-b border-gray-200">
          <div>
            <span className="text-lg font-bold">Hello, {superAdminName}</span>
            <span className="ml-4">{new Date().toLocaleDateString()}</span>
          </div>
          <Button onClick={handleLogout}>Logout</Button>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
