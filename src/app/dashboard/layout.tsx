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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Dashboard Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Dashboard Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 md:h-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 focus:outline-none cursor-pointer"
              aria-label="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Brand Name */}
            <div className="flex md:hidden items-center gap-2">
              <span className="font-bold text-sm text-white">
                BATARA MP <span className="text-amber-500">P2H PORTAL</span>
              </span>
            </div>

            {/* Date / Status Indicator (Desktop) */}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>{currentDate}</span>
            </div>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Sistem P2H Aktif</span>
            </div>

            <button
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
              aria-label="Notifikasi"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
