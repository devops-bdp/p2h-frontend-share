"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Menu, Bell, Calendar } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative">
      {/* Dashboard Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col min-h-screen w-full min-w-0 transition-all duration-300">
        {/* Dashboard Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 md:h-20 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 focus:outline-none cursor-pointer shrink-0"
              aria-label="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Brand Name */}
            <div className="flex md:hidden items-center gap-2 min-w-0">
              <img
                src="/logo-navbar-transparant1.png"
                alt="Plant Maintenance Muara Pahu Site"
                className="h-8 w-auto object-contain shrink-0"
              />
              <div className="flex flex-col leading-none min-w-0">
                <span className="font-extrabold text-xs tracking-wide text-slate-200 uppercase truncate">
                  Plant Maintenance
                </span>
                <span className="font-bold text-[9px] tracking-wider text-teal-400 uppercase truncate">
                  Muara Pahu Site
                </span>
              </div>
            </div>

            {/* Date / Status Indicator (Desktop) */}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-medium">{currentDate}</span>
            </div>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Sistem P2H Aktif</span>
            </div>

            <button
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
              aria-label="Notifikasi"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0">{children}</main>
      </div>
    </div>
  );
}
