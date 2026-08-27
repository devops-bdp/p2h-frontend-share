"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAuthSession } from "@/services/auth.service";
import {
  Shield,
  Sparkles,
  LayoutDashboard,
  Truck,
  ClipboardCheck,
  Users,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    role?: string;
    department?: string;
    nrp?: number;
  } | null>(null);

  useEffect(() => {
    const session = getAuthSession();
    if (session.user) {
      setUser(session.user);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal {user?.role || "ADMIN"}</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Selamat Datang,{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-yellow-200">
                {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Administrator"}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400">
              NRP: <strong className="text-slate-300 font-mono">{user?.nrp || "-"}</strong> &bull; Departemen:{" "}
              <strong className="text-slate-300">{user?.department || "-"}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 tracking-wider">
                {user?.role || "SUPERADMIN"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards on Mobile & Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Link
          href="/dashboard/units"
          className="group p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                Kelola Unit Fleet
              </h2>
              <p className="text-xs text-slate-400">Daftar armada &amp; nomor lambung</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/dashboard/p2h"
          className="group p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Checklist P2H
              </h2>
              <p className="text-xs text-slate-400">Inspeksi fisik &amp; kelaikan harian</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/dashboard/users"
          className="group p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                Manajemen User
              </h2>
              <p className="text-xs text-slate-400">Otorisasi akun operator &amp; admin</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Main Content Area (Empty Placeholder Container) */}
      <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-8 sm:p-14 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <LayoutDashboard className="w-6 sm:w-7 h-6 sm:h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-300">
              Dashboard Operasional
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Silakan gunakan tombol navigasi cepat di atas atau menu sidebar untuk mulai mengelola sistem P2H.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
