'use client'

import { useState, useEffect } from 'react';
import Sidebar from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { name } = JSON.parse(userData);
      setUserName(name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    router.push('/auth');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm p-4 flex justify-between items-center z-10">
        <h1 className="text-xl font-semibold">Digital Queue</h1>
        <div className="flex items-center space-x-4">
          <span>Welcome, {userName}</span>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </header>
      <div className="flex flex-1 mt-16">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">{children}</main>
      </div>
    </div>
  );
}
