"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  X,
  Loader2,
  Truck,
  Disc,
  LifeBuoy,
  HeartPulse,
  Award,
  Calendar,
  Gauge,
  Clock,
  User,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  FileText,
  Wrench,
  CheckCheck,
  Droplets,
  Zap,
  Wind,
} from "lucide-react";
import {
  fetchP2HInspections,
  fetchP2HStats,
  deleteP2HInspection,
  P2HInspection,
  TELEHANDLER_CATEGORIES,
  TelehandlerCheckItem,
  STORING_TRUCK_CATEGORIES,
  FUEL_TRUCK_CATEGORIES,
  GENSET_CATEGORIES,
  GensetCheckItem,
  COMPRESSOR_CATEGORIES,
  CompressorCheckItem,
} from "@/services/p2h.service";
import {
  showAlertSuccess,
  showAlertError,
  showAlertWarning,
  showConfirmDialog,
  showToast,
} from "@/lib/swal";
import { getAuthSession } from "@/services/auth.service";

export default function P2HListPage() {
  const [inspections, setInspections] = useState<P2HInspection[]>([]);
  const [stats, setStats] = useState<{
    totalAll: number;
    totalToday: number;
    readyCount: number;
    notReadyCount: number;
  }>({ totalAll: 0, totalToday: 0, readyCount: 0, notReadyCount: 0 });

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [shiftFilter, setShiftFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [unitStatusFilter, setUnitStatusFilter] = useState("");
  const [driverStatusFilter, setDriverStatusFilter] = useState("");

  // Detail Modal State
  const [selectedInspection, setSelectedInspection] = useState<P2HInspection | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [inspectionToDelete, setInspectionToDelete] = useState<P2HInspection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Alert State
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  // Auth User
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const session = getAuthSession();
    setUser(session.user);
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        fetchP2HInspections({
          search: search.trim() || undefined,
          shift: shiftFilter || undefined,
          section: sectionFilter || undefined,
          unitStatus: unitStatusFilter || undefined,
          driverStatus: driverStatusFilter || undefined,
        }),
        fetchP2HStats().catch(() => ({
          success: false,
          data: { totalAll: 0, totalToday: 0, readyCount: 0, notReadyCount: 0 },
        })),
      ]);

      setInspections(listRes.data || []);
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Gagal Memuat Data",
        message: error.message || "Tidak dapat mengambil riwayat pemeriksaan P2H.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenDetail = (item: P2HInspection) => {
    setSelectedInspection(item);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = async (item: P2HInspection) => {
    const isConfirmed = await showConfirmDialog({
      title: "Hapus Riwayat P2H?",
      text: `Apakah Anda yakin ingin menghapus data inspeksi ${item.p2hNo} (${item.unit?.unitNo || "Armada"})? Tindakan ini tidak dapat dibatalkan.`,
      confirmButtonText: "Ya, Hapus Data",
      isDanger: true,
    });

    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      await deleteP2HInspection(item.id);
      showAlertSuccess(
        "P2H Berhasil Dihapus",
        `Inspeksi ${item.p2hNo} telah dihapus dari sistem.`
      );
      loadData();
    } catch (error: any) {
      showAlertError(
        "Gagal Menghapus",
        error.message || "Terjadi kesalahan saat menghapus data."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!inspectionToDelete) return;
    setIsDeleting(true);
    try {
      await deleteP2HInspection(inspectionToDelete.id);
      showAlertSuccess(
        "P2H Berhasil Dihapus",
        `Inspeksi ${inspectionToDelete.p2hNo} telah dihapus dari sistem.`
      );
      setIsDeleteOpen(false);
      setInspectionToDelete(null);
      loadData();
    } catch (error: any) {
      showAlertError(
        "Gagal Menghapus",
        error.message || "Terjadi kesalahan saat menghapus data."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const isPrivileged = useMemo(() => {
    return user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  }, [user]);

  return (
    <div className="space-y-6">
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Form &amp; Checklist P2H Armada
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
              {inspections.length} Riwayat
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Portal digitalisasi inspeksi harian armada Light Vehicle (LV) dan unit site PT Batara Mining.
          </p>
        </div>

        <Link
          href="/dashboard/p2h/create"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Buat Form P2H Baru</span>
        </Link>
      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Inspections */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total P2H Dilakukan</div>
            <div className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              {stats.totalAll || inspections.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
            <ClipboardCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Inspeksi Hari Ini */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-amber-400 font-medium">Inspeksi Hari Ini</div>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-400 mt-1">
              {stats.totalToday}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Layak & Siap */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-400 font-medium">Armada Layak / Siap</div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1">
              {stats.readyCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Tidak Layak / Defect */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-rose-400 font-medium">Tidak Layak / Defect</div>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-400 mt-1">
              {stats.notReadyCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ================= ALERTS BANNER ================= */}
      {alert && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-200 ${
            alert.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/80 border-rose-500/40 text-rose-200"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <div className="font-bold text-sm mb-0.5">{alert.title}</div>
            <p>{alert.message}</p>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= FILTERS & SEARCH BAR ================= */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between"
        >
          {/* Search Input */}
          <div className="relative flex-1 md:max-w-xs">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari No P2H, Lambung, Driver, Nopol..."
              className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
            {/* Shift Filter */}
            <div className="flex-1 sm:flex-initial bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 sm:py-1.5 min-w-30">
              <select
                value={shiftFilter}
                onChange={(e) => {
                  setShiftFilter(e.target.value);
                  setTimeout(loadData, 50);
                }}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-950">Semua Shift</option>
                <option value="SIANG" className="bg-slate-950">☀️ Day Shift (Siang)</option>
                <option value="MALAM" className="bg-slate-950">🌙 Night Shift (Malam)</option>
              </select>
            </div>

            {/* Section Filter */}
            <div className="flex-1 sm:flex-initial bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 sm:py-1.5 min-w-30">
              <select
                value={sectionFilter}
                onChange={(e) => {
                  setSectionFilter(e.target.value);
                  setTimeout(loadData, 50);
                }}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-950">Semua Section</option>
                <option value="MANAGEMENT" className="bg-slate-950">MANAGEMENT</option>
                <option value="PLANT" className="bg-slate-950">PLANT</option>
                <option value="PRODUKSI" className="bg-slate-950">PRODUKSI</option>
                <option value="HSE" className="bg-slate-950">HSE</option>
                <option value="HRGA" className="bg-slate-950">HRGA</option>
                <option value="ERT" className="bg-slate-950">ERT</option>
                <option value="MEDIC" className="bg-slate-950">MEDIC</option>
              </select>
            </div>

            {/* Status Unit Filter */}
            <div className="flex-1 sm:flex-initial bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 sm:py-1.5 min-w-30">
              <select
                value={unitStatusFilter}
                onChange={(e) => {
                  setUnitStatusFilter(e.target.value);
                  setTimeout(loadData, 50);
                }}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-950">Status Unit: Semua</option>
                <option value="LAYAK" className="bg-slate-950">LAYAK</option>
                <option value="SIAP" className="bg-slate-950">SIAP</option>
                <option value="TIDAK_LAYAK" className="bg-slate-950">TIDAK LAYAK</option>
                <option value="TIDAK_SIAP" className="bg-slate-950">TIDAK SIAP</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="p-2.5 sm:p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
            </button>
          </div>
        </form>
      </div>

      {/* ================= DESKTOP TABLE VIEW (hidden md:block) ================= */}
      <div className="hidden md:block rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">No. P2H / Tgl</th>
                <th className="py-3.5 px-4">Unit &amp; Nopol</th>
                <th className="py-3.5 px-4">Operator/Driver / Sec</th>
                <th className="py-3.5 px-4">Shift &amp; KM</th>
                <th className="py-3.5 px-4">Status Unit</th>
                <th className="py-3.5 px-4">Status Driver</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                    <span>Memuat data pemeriksaan P2H...</span>
                  </td>
                </tr>
              ) : inspections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <ClipboardCheck className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-400">Belum ada data pemeriksaan P2H</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Klik tombol "+ Buat Form P2H Baru" untuk memulai inspeksi armada
                    </p>
                  </td>
                </tr>
              ) : (
                inspections.map((item) => {
                  const isUnitReady = item.unitStatus === "LAYAK" || item.unitStatus === "SIAP";
                  const isDriverReady = item.driverStatus === "LAYAK" || item.driverStatus === "SIAP";
                  const inspectionDate = new Date(item.date).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* P2H No & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-amber-300 font-mono text-xs">
                          {item.p2hNo}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{inspectionDate}</span>
                        </div>
                      </td>

                      {/* Unit & Nopol */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                            item.unit?.category === "TELEHENDLER"
                              ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                              : item.unit?.category === "STORING_TRUCK"
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                              : item.unit?.category === "FUEL_TRUCK"
                              ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                              : item.unit?.category === "GENSET"
                              ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-400"
                              : item.unit?.category === "COMPRESSOR"
                              ? "bg-teal-500/15 border-teal-500/30 text-teal-400"
                              : "bg-sky-500/15 border-sky-500/30 text-sky-400"
                          }`}>
                            {item.unit?.category === "TELEHENDLER" ? (
                              <Wrench className="w-3.5 h-3.5" />
                            ) : item.unit?.category === "STORING_TRUCK" ? (
                              <Truck className="w-3.5 h-3.5" />
                            ) : item.unit?.category === "FUEL_TRUCK" ? (
                              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                            ) : item.unit?.category === "GENSET" ? (
                              <Zap className="w-3.5 h-3.5 text-yellow-400" />
                            ) : item.unit?.category === "COMPRESSOR" ? (
                              <Wind className="w-3.5 h-3.5 text-teal-400" />
                            ) : (
                              <Truck className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white font-mono">{item.unit?.unitNo || "-"}</span>
                              {item.unit?.category === "TELEHENDLER" ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                  TH
                                </span>
                              ) : item.unit?.category === "STORING_TRUCK" ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                  ST
                                </span>
                              ) : item.unit?.category === "FUEL_TRUCK" ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                                  FT
                                </span>
                              ) : item.unit?.category === "GENSET" ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30">
                                  GS
                                </span>
                              ) : item.unit?.category === "COMPRESSOR" ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                                  CP
                                </span>
                              ) : null}
                            </div>
                            <div className="text-xs text-slate-400">
                              {item.nopol && item.unit?.category !== "TELEHENDLER" && item.unit?.category !== "STORING_TRUCK" && item.unit?.category !== "FUEL_TRUCK" && item.unit?.category !== "GENSET" && item.unit?.category !== "COMPRESSOR" ? (
                                <span className="text-amber-400/80 font-mono">{item.nopol} &bull; </span>
                              ) : ""}
                              {item.unit?.brand}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Driver & Section */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.driverName || (item.user ? `${item.user.firstName} ${item.user.lastName || ""}` : "Operator/Driver")}</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          NRP: <span className="text-slate-300">{item.driverNrp || item.user?.nrp || "-"}</span> &bull; Sec: <span className="text-amber-400/90 font-medium">{item.section || item.user?.department || "-"}</span>
                        </div>
                      </td>

                      {/* Shift, KM & HM */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1 text-xs">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span className="font-medium">SIFT {item.shift}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Gauge className="w-3 h-3 text-slate-500" />
                            {item.km.toLocaleString()} KM
                          </span>
                          {item.hourMeter != null && (
                            <span className="flex items-center gap-1 text-amber-400 font-mono font-medium">
                              <Clock className="w-3 h-3" />
                              {item.hourMeter} HM
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Unit */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                            isUnitReady
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isUnitReady ? "bg-emerald-400" : "bg-rose-400"}`} />
                          {item.unitStatus.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Status Driver */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                            isDriverReady
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isDriverReady ? "bg-emerald-400" : "bg-rose-400"}`} />
                          {item.driverStatus.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Lihat Detail Checklist"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {isPrivileged && (
                            <button
                              onClick={() => handleOpenDelete(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Hapus Data P2H"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MOBILE CARD LIST VIEW ================= */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
            <span className="text-xs">Memuat data pemeriksaan P2H...</span>
          </div>
        ) : inspections.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500">
            <ClipboardCheck className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-400 text-sm">Belum ada pemeriksaan P2H</p>
            <p className="text-xs text-slate-500 mt-1">
              Klik tombol Buat Form P2H Baru untuk memulai inspeksi
            </p>
          </div>
        ) : (
          inspections.map((item) => {
            const isUnitReady = item.unitStatus === "LAYAK" || item.unitStatus === "SIAP";
            const isDriverReady = item.driverStatus === "LAYAK" || item.driverStatus === "SIAP";
            const isTH = item.unit?.category === "TELEHENDLER";
            const isST = item.unit?.category === "STORING_TRUCK";
            const isFT = item.unit?.category === "FUEL_TRUCK";
            const isGS = item.unit?.category === "GENSET";
            const isCP = item.unit?.category === "COMPRESSOR";
            const inspectionDate = new Date(item.date).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-md"
              >
                {/* Header: P2H No & Status */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-amber-300 font-mono">
                        {item.p2hNo}
                      </span>
                      {isTH ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          TH
                        </span>
                      ) : isST ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          ST
                        </span>
                      ) : isFT ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                          FT
                        </span>
                      ) : isGS ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30">
                          GS
                        </span>
                      ) : isCP ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                          CP
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{inspectionDate}</span> &bull; SIFT {item.shift}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      isUnitReady
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isUnitReady ? "bg-emerald-400" : "bg-rose-400"}`} />
                    {item.unitStatus.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Body: Unit & Inspector */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">No Unit:</span>
                    <span className="font-bold text-white font-mono">
                      {item.unit?.unitNo} {item.nopol && !isTH && !isST && !isFT && !isGS && !isCP ? `(${item.nopol})` : ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Operator/Driver:</span>
                    <span className="text-slate-200">
                      {item.driverName || (item.user ? `${item.user.firstName} ${item.user.lastName || ""}` : "Operator/Driver")} (Sec: {item.section || "-"})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status Driver:</span>
                    <span className={`font-semibold ${isDriverReady ? "text-emerald-400" : "text-rose-400"}`}>
                      {item.driverStatus.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
                    <div className="flex items-center gap-2 text-slate-300">
                      <div className="flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.km.toLocaleString()} KM</span>
                      </div>
                      {item.hourMeter != null && (
                        <div className="flex items-center gap-1 text-amber-400 font-mono font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{item.hourMeter} HM</span>
                        </div>
                      )}
                    </div>
                    {item.warningDetails && (
                      <span className="text-rose-400 text-xs flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Ada Warning
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDetail(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-400 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Detail Lengkap</span>
                  </button>
                  {isPrivileged && (
                    <button
                      onClick={() => handleOpenDelete(item)}
                      className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/20 text-rose-400 transition-colors"
                      title="Hapus Data"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= DETAIL CHECKLIST MODAL ================= */}
      {isDetailOpen && selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  {selectedInspection.unit?.category === "TELEHENDLER" ? <Wrench className="w-5 h-5" /> : <ClipboardCheck className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>Detail Formulir P2H:</span>
                    <span className="text-amber-400 font-mono">{selectedInspection.p2hNo}</span>
                    {selectedInspection.unit?.category === "TELEHENDLER" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                        🚜 TELEHANDLER
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Unit: <strong>{selectedInspection.unit?.unitNo}</strong> ({selectedInspection.unit?.brand} - {selectedInspection.unit?.description}) &bull; SIFT: {selectedInspection.shift}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Sections */}
            <div className="space-y-4 text-xs">
              {/* 1. IDENTITAS UNIT & OPERATOR */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400 pb-1 border-b border-slate-800">
                  <Truck className="w-4 h-4" />
                  <span>1. IDENTITAS UNIT &amp; OPERATOR / DRIVER</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div>
                    <span className="text-slate-500 block">NAMA OPERATOR:</span>
                    <span className="font-semibold text-white">{selectedInspection.driverName || selectedInspection.user?.firstName || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">NRP:</span>
                    <span className="font-semibold text-white">{selectedInspection.driverNrp || selectedInspection.user?.nrp || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">No Unit:</span>
                    <span className="font-semibold text-amber-300 font-mono">{selectedInspection.unit?.unitNo}</span>
                  </div>
                  {selectedInspection.unit?.category !== "TELEHENDLER" && selectedInspection.unit?.category !== "STORING_TRUCK" ? (
                    <div>
                      <span className="text-slate-500 block">Nopol:</span>
                      <span className="font-semibold text-white">{selectedInspection.nopol || "-"}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-slate-500 block">TIPE / MODEL:</span>
                      <span className="font-semibold text-slate-200">{selectedInspection.unit?.brand || selectedInspection.unit?.description || "-"}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500 block">KM UNIT:</span>
                    <span className="font-semibold text-white">{selectedInspection.km.toLocaleString()} KM</span>
                  </div>
                  {selectedInspection.hourMeter != null && (
                    <div>
                      <span className="text-slate-500 block">HOUR METER (HM):</span>
                      <span className="font-semibold text-amber-400 font-mono">{selectedInspection.hourMeter} HM</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500 block">SIFT:</span>
                    <span className="font-semibold text-white">SIFT {selectedInspection.shift}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Section:</span>
                    <span className="font-semibold text-white">{selectedInspection.section || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Sistem Kerja:</span>
                    <span className="font-semibold text-white">
                      {Array.isArray(selectedInspection.workSystem)
                        ? selectedInspection.workSystem.join(", ")
                        : selectedInspection.workSystem || "Tambang"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ================= COMPRESSOR INSPECTION DETAILS ================= */}
              {selectedInspection.unit?.category === "COMPRESSOR" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-teal-500/10 border border-teal-500/30">
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-teal-400" />
                      <span className="font-bold text-white uppercase">
                        2. CHECKLIST P2H KOMPRESOR ({selectedInspection.damageChecks?.length || 10} ITEM)
                      </span>
                    </div>
                    <span className="text-[11px] text-teal-300 font-medium">
                      Status: {selectedInspection.damageChecks?.filter((c: any) => c.condition === "BAIK" || c.condition === "NORMAL").length || 0}/{selectedInspection.damageChecks?.length || 0} Baik
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                      <div className="flex items-center gap-2 font-bold text-teal-400">
                        <span className="w-5 h-5 rounded bg-teal-500/20 text-teal-300 text-[10px] flex items-center justify-center">
                          ✓
                        </span>
                        <span className="uppercase text-white">DAFTAR PEMERIKSAAN KOMPRESOR</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {selectedInspection.damageChecks?.length || 0} Item
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {((selectedInspection.damageChecks as any[]) || []).map((chk: any, idx: number) => {
                        const isGood = chk.condition === "BAIK" || chk.condition === "NORMAL";
                        return (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border flex flex-col gap-1.5 ${
                              !isGood
                                ? "bg-rose-950/20 border-rose-500/30"
                                : "bg-slate-900/80 border-slate-800/80"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-300 font-medium">
                                {chk.id ? `${chk.id}. ` : ""}{chk.item}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold shrink-0 ${
                                  isGood
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                }`}
                              >
                                {chk.condition}
                              </span>
                            </div>
                            {chk.note && (
                              <div className="text-[11px] text-amber-300/90 pl-2 border-l-2 border-amber-500/50">
                                Catatan: {chk.note}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : selectedInspection.unit?.category === "GENSET" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="font-bold text-white uppercase">
                        2. CHECKLIST P2H GENSET ({selectedInspection.damageChecks?.length || 30} ITEM)
                      </span>
                    </div>
                    <span className="text-[11px] text-yellow-300 font-medium">
                      Status: {selectedInspection.damageChecks?.filter((c: any) => c.condition === "BAIK" || c.condition === "NORMAL").length || 0}/{selectedInspection.damageChecks?.length || 0} Baik
                    </span>
                  </div>

                  {GENSET_CATEGORIES.map((cat, cIdx) => {
                    const catItems = (selectedInspection.damageChecks as any[] || []).filter(
                      (item) => item.category === cat.name
                    );

                    if (catItems.length === 0) return null;

                    return (
                      <div key={cat.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                          <div className="flex items-center gap-2 font-bold text-yellow-400">
                            <span className="w-5 h-5 rounded bg-yellow-500/20 text-yellow-300 text-[10px] flex items-center justify-center">
                              {cIdx + 1}
                            </span>
                            <span className="uppercase text-white">{cat.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {catItems.length} Item
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {catItems.map((chk: any, idx: number) => {
                            const isGood = chk.condition === "BAIK" || chk.condition === "NORMAL";
                            return (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-xl border flex flex-col gap-1.5 ${
                                  !isGood
                                    ? "bg-rose-950/20 border-rose-500/30"
                                    : "bg-slate-900/80 border-slate-800/80"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-slate-300 font-medium">
                                    {chk.id ? `${chk.id}. ` : ""}{chk.item}
                                  </span>
                                  <span
                                    className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold shrink-0 ${
                                      isGood
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                    }`}
                                  >
                                    {chk.condition}
                                  </span>
                                </div>
                                {chk.note && (
                                  <div className="text-[11px] text-amber-300/90 pl-2 border-l-2 border-amber-500/50">
                                    Catatan: {chk.note}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : selectedInspection.unit?.category === "FUEL_TRUCK" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white uppercase">
                        2. CHECKLIST P2H FUEL TRUCK ({selectedInspection.damageChecks?.length || 26} ITEM)
                      </span>
                    </div>
                    <span className="text-[11px] text-cyan-300 font-medium">
                      Status: {selectedInspection.damageChecks?.filter((c: any) => c.condition === "BAIK" || c.condition === "NORMAL").length || 0}/{selectedInspection.damageChecks?.length || 0} Baik
                    </span>
                  </div>

                  {FUEL_TRUCK_CATEGORIES.map((cat, cIdx) => {
                    const catItems = (selectedInspection.damageChecks as any[] || []).filter(
                      (item) => item.category === cat.name
                    );

                    if (catItems.length === 0) return null;

                    return (
                      <div key={cat.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                          <div className="flex items-center gap-2 font-bold text-cyan-400">
                            <span className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center">
                              {cIdx + 1}
                            </span>
                            <span className="uppercase text-white">{cat.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {catItems.length} Item
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {catItems.map((chk: any, idx: number) => {
                            const isGood = chk.condition === "BAIK" || chk.condition === "NORMAL";
                            return (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-xl border flex flex-col gap-1.5 ${
                                  !isGood
                                    ? "bg-rose-950/20 border-rose-500/30"
                                    : "bg-slate-900/80 border-slate-800/80"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-slate-300 font-medium">
                                    {chk.id ? `${chk.id}. ` : ""}{chk.item}
                                  </span>
                                  <span
                                    className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold shrink-0 ${
                                      isGood
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                    }`}
                                  >
                                    {chk.condition}
                                  </span>
                                </div>
                                {chk.note && (
                                  <div className="text-[11px] text-amber-300/90 pl-2 border-l-2 border-amber-500/50">
                                    Catatan: {chk.note}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : selectedInspection.unit?.category === "STORING_TRUCK" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white uppercase">
                        2. CHECKLIST P2H STORING TRUCK ({selectedInspection.damageChecks?.length || 37} ITEM)
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-300 font-medium">
                      Status: {selectedInspection.damageChecks?.filter((c: any) => c.condition === "NORMAL" || c.condition === "BAIK").length || 0}/{selectedInspection.damageChecks?.length || 0} Normal
                    </span>
                  </div>

                  {STORING_TRUCK_CATEGORIES.map((cat, cIdx) => {
                    const catItems = (selectedInspection.damageChecks as any[] || []).filter(
                      (item) => item.category === cat.name
                    );

                    if (catItems.length === 0) return null;

                    return (
                      <div key={cat.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                          <div className="flex items-center gap-2 font-bold text-emerald-400">
                            <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] flex items-center justify-center">
                              {cIdx + 1}
                            </span>
                            <span className="uppercase text-white">{cat.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {catItems.length} Item
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {catItems.map((chk: any, idx: number) => {
                            const isNormal = chk.condition === "NORMAL" || chk.condition === "BAIK";
                            return (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-xl border flex flex-col gap-1.5 ${
                                  !isNormal
                                    ? "bg-rose-950/20 border-rose-500/30"
                                    : "bg-slate-900/80 border-slate-800/80"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-slate-300 font-medium">
                                    {chk.id ? `${chk.id}. ` : ""}{chk.item}
                                  </span>
                                  <span
                                    className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold shrink-0 ${
                                      isNormal
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                    }`}
                                  >
                                    {chk.condition}
                                  </span>
                                </div>
                                {chk.note && (
                                  <div className="text-[11px] text-amber-300/90 pl-2 border-l-2 border-amber-500/50">
                                    Catatan: {chk.note}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* FIT TO WORK OPERATOR (5 ITEMS) */}
                  {selectedInspection.fitToWork && selectedInspection.fitToWork.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-purple-400 pb-1 border-b border-slate-800">
                        <HeartPulse className="w-4 h-4" />
                        <span>3. KELAYAKAN OPERATOR / FIT TO WORK ({selectedInspection.fitToWork.length} PERTANYAAN)</span>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        {selectedInspection.fitToWork.map((ftw, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                            <span className="text-slate-300 pr-2">{idx + 1}. {ftw.question}</span>
                            <span
                              className={`px-2.5 py-0.5 rounded text-xs font-bold shrink-0 ${
                                ftw.answer === "YA"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-amber-400/20 text-amber-300"
                              }`}
                            >
                              {ftw.answer}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedInspection.unit?.category === "TELEHENDLER" || (selectedInspection.damageChecks && (selectedInspection.damageChecks as any)[0]?.category) ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-white uppercase">
                        2. CHECKLIST P2H TELEHANDLER ({selectedInspection.damageChecks?.length || 35} ITEM)
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-300 font-medium">
                      Status: {selectedInspection.damageChecks?.filter((c: any) => c.condition === "BAIK").length || 0}/{selectedInspection.damageChecks?.length || 0} Baik
                    </span>
                  </div>

                  {TELEHANDLER_CATEGORIES.map((cat, cIdx) => {
                    const catItems = (selectedInspection.damageChecks as any[] || []).filter(
                      (item) => item.category === cat.name
                    );

                    if (catItems.length === 0) return null;

                    return (
                      <div key={cat.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                          <div className="flex items-center gap-2 font-bold text-amber-400">
                            <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-300 text-[10px] flex items-center justify-center">
                              {cIdx + 1}
                            </span>
                            <span className="uppercase text-white">{cat.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {catItems.length} Item
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {catItems.map((chk: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-xl border flex flex-col gap-1.5 ${
                                chk.condition === "TIDAK BAIK"
                                  ? "bg-rose-950/20 border-rose-500/30"
                                  : chk.condition === "PERLU TINDAKAN"
                                  ? "bg-amber-950/20 border-amber-500/30"
                                  : "bg-slate-900/80 border-slate-800/80"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-300 font-medium">
                                  {chk.id ? `${chk.id}. ` : ""}{chk.item}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold shrink-0 ${
                                    chk.condition === "BAIK"
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                      : chk.condition === "TIDAK BAIK"
                                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                      : "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                  }`}
                                >
                                  {chk.condition}
                                </span>
                              </div>
                              {chk.note && (
                                <div className="text-[11px] text-amber-300/90 pl-2 border-l-2 border-amber-500/50">
                                  Catatan: {chk.note}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ================= STANDARD LV INSPECTION DETAILS ================= */
                <div className="space-y-4">
                  {/* 2. GENERAL CHECK */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-blue-400 pb-1 border-b border-slate-800">
                      <Disc className="w-4 h-4" />
                      <span>2. GENERAL CHECK / KETERANGAN KERUSAKAN ({selectedInspection.damageChecks?.length || 0} Item)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {selectedInspection.damageChecks?.map((chk, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                          <span className="text-slate-300 truncate pr-2">{chk.item}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold shrink-0 ${
                              chk.condition === "BAIK"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : chk.condition === "MINOR"
                                ? "bg-amber-400/20 text-amber-300"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {chk.condition}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. TYRE CHECK */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-400 pb-1 border-b border-slate-800">
                      <Disc className="w-4 h-4" />
                      <span>3. TYRE CHECK</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-slate-500 block">Kondisi Ban:</span>
                        <span className="font-semibold text-white">{selectedInspection.tyreCheck?.condition || "Baik"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Tekanan Ban:</span>
                        <span className="font-semibold text-white">{selectedInspection.tyreCheck?.pressure || "Baik"}</span>
                      </div>
                    </div>
                    {selectedInspection.tyreCheck?.problemPositions?.length > 0 && (
                      <div className="pt-1">
                        <span className="text-slate-500 block mb-1">Posisi Ban Bermasalah:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedInspection.tyreCheck.problemPositions.map((pos) => (
                            <span key={pos} className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                              {pos}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedInspection.tyreCheck?.notes && (
                      <div className="pt-1 text-slate-400">
                        <span className="text-slate-500 block">Keterangan Kerusakan Ban:</span>
                        <p className="italic text-slate-300">{selectedInspection.tyreCheck.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* 4. SAFETY TOOL */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-400 pb-1 border-b border-slate-800">
                      <LifeBuoy className="w-4 h-4" />
                      <span>4. SAFETY TOOL (6 Item)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {selectedInspection.safetyTools?.map((tool, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                          <span className="text-slate-300 truncate pr-2">{tool.item}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold shrink-0 ${
                              tool.status === "ADA"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {tool.status === "ADA" ? "Ada" : "Tidak Ada"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5. FIT TO WORK + PSM */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-purple-400 pb-1 border-b border-slate-800">
                      <HeartPulse className="w-4 h-4" />
                      <span>5. FIT TO WORK + PSM (10 Pertanyaan)</span>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {selectedInspection.fitToWork?.map((ftw, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                          <span className="text-slate-300 pr-2">{ftw.question}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-xs font-bold shrink-0 ${
                              ftw.answer === "YA"
                                ? "bg-amber-400/20 text-amber-300"
                                : "bg-slate-700 text-slate-200"
                            }`}
                          >
                            {ftw.answer}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 6. WARNING / TIDAK LAYAK (If Exists) */}
                  {selectedInspection.warningDetails && (
                    <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-rose-400 pb-1 border-rose-500/30">
                        <AlertTriangle className="w-4 h-4" />
                        <span>6. WARNING / TIDAK LAYAK</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-slate-500 block">Jenis Masalah:</span>
                          <span className="font-semibold text-rose-300">{selectedInspection.warningDetails.problemType || "-"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Tindakan yang diambil:</span>
                          <span className="font-semibold text-amber-300">{selectedInspection.warningDetails.actionTaken || "-"}</span>
                        </div>
                      </div>
                      {selectedInspection.warningDetails.additionalNotes && (
                        <div className="pt-1">
                          <span className="text-slate-500 block">Keterangan tambahan:</span>
                          <p className="text-slate-200">{selectedInspection.warningDetails.additionalNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ================= DATA OPERASI & FINAL / KESIMPULAN ================= */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-400 pb-1 border-b border-slate-800">
                  <Award className="w-4 h-4" />
                  <span>
                    {selectedInspection.unit?.category === "STORING_TRUCK"
                      ? "4. VALIDASI & KESIMPULAN KELAYAKAN"
                      : selectedInspection.unit?.category === "TELEHENDLER" || selectedInspection.unit?.category === "FUEL_TRUCK" || selectedInspection.unit?.category === "GENSET"
                      ? "3. VALIDASI & KESIMPULAN KELAYAKAN"
                      : "7. DATA OPERASI & FINAL / KESIMPULAN"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <span>✔ Validasi Operator / Driver:</span>
                  <span className="text-slate-200">Saya menyatakan data pemeriksaan adalah benar</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Status Unit:</span>
                    <span className={`font-extrabold text-sm ${selectedInspection.unitStatus === "LAYAK" || selectedInspection.unitStatus === "SIAP" ? "text-emerald-400" : "text-rose-400"}`}>
                      {selectedInspection.unitStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Status Operator / Driver:</span>
                    <span className={`font-extrabold text-sm ${selectedInspection.driverStatus === "LAYAK" || selectedInspection.driverStatus === "SIAP" ? "text-emerald-400" : "text-rose-400"}`}>
                      {selectedInspection.driverStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                {selectedInspection.supervisorNotes && (
                  <div className="pt-1 text-slate-400">
                    <span className="text-slate-500 block">Temuan &amp; Catatan Tambahan:</span>
                    <p className="text-slate-200 leading-relaxed">{selectedInspection.supervisorNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {isDeleteOpen && inspectionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Hapus Data P2H?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Apakah Anda yakin ingin menghapus arsip P2H{" "}
                <strong className="text-white font-mono">{inspectionToDelete.p2hNo}</strong>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
