"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAuthSession } from "@/services/auth.service";
import { fetchP2HStats, fetchP2HInspections, P2HInspection } from "@/services/p2h.service";
import { fetchUnits } from "@/services/unit.service";
import { fetchDefectStats, DefectStats } from "@/services/defect.service";
import {
  Shield,
  ShieldCheck,
  Sparkles,
  Truck,
  ClipboardCheck,
  ArrowRight,
  CalendarCheck,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building2,
  ExternalLink,
  ChevronRight,
  Activity,
  Layers,
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    role?: string;
    department?: string;
    nrp?: number;
  } | null>(null);

  const [p2hStats, setP2HStats] = useState({
    totalAll: 0,
    totalToday: 0,
    readyCount: 0,
    notReadyCount: 0,
  });

  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [defectStats, setDefectStats] = useState<DefectStats | null>(null);
  const [recentInspections, setRecentInspections] = useState<P2HInspection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadDashboardData = async () => {
    try {
      const [p2hRes, unitsRes, defectRes, recentRes] = await Promise.allSettled([
        fetchP2HStats(),
        fetchUnits(),
        fetchDefectStats(),
        fetchP2HInspections({ limit: 5, page: 1 }),
      ]);

      if (p2hRes.status === "fulfilled" && p2hRes.value.success) {
        setP2HStats(p2hRes.value.data);
      }

      if (unitsRes.status === "fulfilled" && unitsRes.value.success) {
        setTotalUnits(unitsRes.value.data.length || unitsRes.value.count || 19);
      }

      if (defectRes.status === "fulfilled" && defectRes.value.success) {
        setDefectStats(defectRes.value.data);
      }

      if (recentRes.status === "fulfilled" && recentRes.value.success) {
        setRecentInspections(recentRes.value.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat ringkasan dashboard:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const session = getAuthSession();
    if (session.user) {
      setUser(session.user);
    }
    loadDashboardData();
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  // Calculate fleet readiness percentage
  const totalInspected = p2hStats.readyCount + p2hStats.notReadyCount;
  const readinessRate =
    totalInspected > 0
      ? Math.round((p2hStats.readyCount / totalInspected) * 100)
      : p2hStats.totalAll > 0
      ? 100
      : 100;

  // Active defects needing attention (Open + In Progress)
  const activeDefectsCount = defectStats
    ? (defectStats.openDefects || 0) + (defectStats.inProgressDefects || 0)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ================= 1. WELCOME & ACTION BANNER ================= */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-7 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plant Maintenance &bull; Muara Pahu Site</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              Selamat Datang,{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-yellow-200">
                {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Administrator"}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 flex-wrap">
              <span>
                NRP: <strong className="text-slate-300 font-mono">{user?.nrp || "-"}</strong>
              </span>
              <span>&bull;</span>
              <span>
                Departemen: <strong className="text-slate-300">{user?.department || "PLANT"}</strong>
              </span>
              <span>&bull;</span>
              <span className="text-slate-500">PT Batara Dharma Persada</span>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/dashboard/p2h/create"
              className="px-4 py-2.5 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 stroke-3" />
              <span>Buat P2H Baru</span>
            </Link>

            <Link
              href="/dashboard/defects"
              className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Defect Tracker</span>
            </Link>

            <Link
              href="/p2h"
              target="_blank"
              className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/40 text-slate-400 hover:text-sky-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Buka Portal Form Publik P2H"
            >
              <span>Portal Publik</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ================= 2. 4 METRIC KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Armada */}
        <Link
          href="/dashboard/units"
          className="group relative p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-all shadow-lg flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 group-hover:text-amber-400 flex items-center gap-0.5 transition-colors">
              <span>Master Unit</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 block">Total Unit Armada</span>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isLoading ? "--" : `${totalUnits || 19}`} <span className="text-sm font-bold text-slate-400">Unit</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Terdaftar dalam 6 Kategori Armada
            </p>
          </div>
        </Link>

        {/* Card 2: P2H Hari Ini */}
        <Link
          href="/dashboard/p2h"
          className="group relative p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-all shadow-lg flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-400 flex items-center gap-0.5 transition-colors">
              <span>Riwayat</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 block">P2H Masuk Hari Ini</span>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isLoading ? "--" : `${p2hStats.totalToday}`} <span className="text-sm font-bold text-slate-400">Inspeksi</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Total {p2hStats.totalAll} Form P2H Tercatat
            </p>
          </div>
        </Link>

        {/* Card 3: Fleet Readiness Rate */}
        <Link
          href="/dashboard/p2h"
          className="group relative p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-900 transition-all shadow-lg flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 group-hover:text-sky-400 flex items-center gap-0.5 transition-colors">
              <span>Kesiapan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 block">Kesiapan Armada (Ready)</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
              {isLoading ? "--" : `${readinessRate}%`}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {p2hStats.readyCount} Siap &bull; {p2hStats.notReadyCount} Perlu Perbaikan
            </p>
          </div>
        </Link>

        {/* Card 4: Active Defects Tracker */}
        <Link
          href="/dashboard/defects"
          className="group relative p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 hover:bg-slate-900 transition-all shadow-lg flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 group-hover:text-rose-400 flex items-center gap-0.5 transition-colors">
              <span>Defect</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 block">Temuan Defect Aktif</span>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
              {isLoading ? "--" : `${activeDefectsCount}`} <span className="text-sm font-bold text-slate-400">Temuan</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {defectStats?.criticalDefects || 0} Kritis &bull; {defectStats?.majorDefects || 0} Mayor
            </p>
          </div>
        </Link>
      </div>

      {/* ================= 3. TABEL RINGKAS: 5 AKTIVITAS INSPEKSI P2H TERAKHIR ================= */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
        {/* Table Header Section */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  5 Aktivitas Inspeksi P2H Terakhir
                </h2>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pemeriksaan harian terkini yang masuk dari operator dan inspektor site
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
            </button>

            <Link
              href="/dashboard/p2h"
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <span>Lihat Semua Riwayat P2H</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">No. P2H / Waktu</th>
                <th className="py-3.5 px-4">Unit &amp; Kategori</th>
                <th className="py-3.5 px-4">Operator / Inspektor</th>
                <th className="py-3.5 px-4">Shift &amp; Section</th>
                <th className="py-3.5 px-4">Status Kelayakan</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Detail</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
                    <span>Memuat 5 inspeksi P2H terbaru...</span>
                  </td>
                </tr>
              ) : recentInspections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <ClipboardCheck className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-400">Belum ada inspeksi P2H yang tercatat</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Gunakan tombol "+ Buat P2H Baru" untuk menambahkan inspeksi pertama.
                    </p>
                  </td>
                </tr>
              ) : (
                recentInspections.map((item) => {
                  const isUnitReady = item.unitStatus === "LAYAK" || item.unitStatus === "SIAP";
                  const dateFormatted = new Date(item.date).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const timeFormatted = new Date(item.date).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* No P2H & Waktu */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-bold text-amber-400 font-mono text-xs">
                          {item.p2hNo}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{dateFormatted} &bull; {timeFormatted}</span>
                        </div>
                      </td>

                      {/* Unit & Kategori */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{item.unit?.unitNo || `Unit #${item.unitId}`}</span>
                          {item.nopol && (
                            <span className="text-[10px] font-mono text-slate-400">
                              [{item.nopol}]
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                            {item.unit?.category || "ARMADA"}
                          </span>
                          {item.hourMeter != null && (
                            <span className="text-amber-400 font-mono text-[10px]">
                              HM: {item.hourMeter}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Operator / Driver */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">
                          {item.driverName || "Driver"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          NRP: {item.driverNrp || "-"}
                        </div>
                      </td>

                      {/* Shift & Section */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            item.shift === "SIANG" || item.shift === "PAGI"
                              ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                              : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                          }`}
                        >
                          <span>{item.shift === "SIANG" || item.shift === "PAGI" ? "☀️ SIANG" : "🌙 MALAM"}</span>
                        </span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Dept: <span className="text-slate-300 font-medium">{item.section}</span>
                        </div>
                      </td>

                      {/* Status Kelayakan Unit */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold ${
                            isUnitReady
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {isUnitReady ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          <span>{item.unitStatus}</span>
                        </span>
                      </td>

                      {/* Action Link */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <Link
                          href="/dashboard/p2h"
                          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 text-xs font-bold transition-all inline-flex items-center gap-1 group-hover:bg-slate-900"
                        >
                          <span>Buka</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
