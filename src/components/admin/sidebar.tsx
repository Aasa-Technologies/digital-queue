'use client'
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = ( ) => {
  const pathname = usePathname();

  // Array of options with labels and paths
  const options = [
    { label: "Dashboard", path: "/admin" },
    { label: "Session", path: "/admin/session" },
    { label: "Lots", path: "/admin/lots" },
    { label: "Queues", path: "/admin/queues" },
    { label: "Queue Owners", path: "/admin/queue-owners" },
    { label: "Queue Members", path: "/admin/queue-member" },
    { label: "Reports", path: "/admin/reports" },
  ];

  return (
    <>
      <div className="fixed h-screen w-64 flex z-10">
        <div className="flex-1 bg-white dark:bg-slate-900 shadow-lg">
          <aside id="sidebar" className="flex flex-col h-full" aria-label="Sidebar">
            <div className="flex flex-col flex-1 border-r border-slate-200 bg-white px-3 py-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-10 flex items-center rounded-lg px-3 py-2 text-slate-900 dark:text-white">
                <span className="ml-3 text-base font-semibold">Digital Queue</span>
              </div>
              <ul className="flex-1 space-y-2 text-sm font-medium overflow-y-auto">
                {options.map((option, index) => (
                  <li key={index}>
                    <Link
                      href={option.path}
                      className={`flex items-center rounded-lg px-3 py-2 ${
                        pathname === option.path
                          ? "bg-slate-100 text-primary dark:bg-slate-700"
                          : "text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-700"
                      }`}
                    >
                      {option.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
  
    </>
  );
};

export default Sidebar;
