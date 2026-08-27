"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowRight,
  Eye,
  Calendar,
  Truck,
  Droplets,
  Zap,
  Wind,
  ShieldAlert,
  Loader2,
  X,
  FileText,
  User,
  Check,
  Building2,
  Sparkles,
  Download,
  AlertOctagon,
  LifeBuoy,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  fetchDefects,
  fetchDefectStats,
  updateDefectStatus,
  createDirectBreakdown,
  DefectItem,
  DefectStats,
  DefectSeverity,
  DefectStatus,
} from "@/services/defect.service";
import {
  showAlertSuccess,
  showAlertError,
  showAlertWarning,
  showConfirmDialog,
  showToast,
} from "@/lib/swal";
import { fetchUnits, Unit } from "@/services/unit.service";
import { getAuthSession } from "@/services/auth.service";
import Pagination from "@/components/Pagination";

export default function DefectsPage() {
  // Data States
  const [defects, setDefects] = useState<DefectItem[]>([]);
  const [stats, setStats] = useState<DefectStats>({
    totalDefects: 0,
    criticalDefects: 0,
    majorDefects: 0,
    minorDefects: 0,
    openDefects: 0,
    inProgressDefects: 0,
    resolvedDefects: 0,
    byCategory: {
      LIGHT_VECHICLE: 0,
      TELEHENDLER: 0,
      STORING_TRUCK: 0,
      FUEL_TRUCK: 0,
      GENSET: 0,
      COMPRESSOR: 0,
    },
  });
  const [units, setUnits] = useState<Unit[]>([]);

  // Filter States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Modal: Update Status & Work Order
  const [selectedDefect, setSelectedDefect] = useState<DefectItem | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<DefectStatus>("IN_PROGRESS");
  const [mechanicName, setMechanicName] = useState<string>("");
  const [repairNotes, setRepairNotes] = useState<string>("");
  const [isSavingStatus, setIsSavingStatus] = useState<boolean>(false);

  // Modal: Detail Defect
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [detailDefect, setDetailDefect] = useState<DefectItem | null>(null);

  // Modal: Laporkan Breakdown Baru
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState<boolean>(false);
  const [bdUnitId, setBdUnitId] = useState<string>("");
  const [bdComponent, setBdComponent] = useState<string>("");
  const [bdDetails, setBdDetails] = useState<string>("");
  const [bdSeverity, setBdSeverity] = useState<DefectSeverity>("CRITICAL");
  const [bdDriverName, setBdDriverName] = useState<string>("");
  const [bdDriverNrp, setBdDriverNrp] = useState<string>("");
  const [bdShift, setBdShift] = useState<"PAGI" | "SIANG" | "MALAM">("PAGI");
  const [isSubmittingBreakdown, setIsSubmittingBreakdown] = useState<boolean>(false);

  // Alert Banner
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  // User session
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const session = getAuthSession();
    setCurrentUser(session.user);
    if (session.user) {
      setBdDriverName(`${session.user.firstName || ""} ${session.user.lastName || ""}`.trim());
      setBdDriverNrp(session.user.nrp ? String(session.user.nrp) : "");
    }
    loadData(1, limit);
    loadUnits();
  }, []);

  const loadData = async (pageToLoad = page, limitToLoad = limit) => {
    setIsLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        fetchDefects({
          category: categoryFilter !== "ALL" ? categoryFilter : undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          severity: severityFilter !== "ALL" ? severityFilter : undefined,
          search: search.trim() || undefined,
          page: pageToLoad,
          limit: limitToLoad,
        }),
        fetchDefectStats().catch(() => ({
          success: false,
          data: {
            totalDefects: 0,
            criticalDefects: 0,
            majorDefects: 0,
            minorDefects: 0,
            openDefects: 0,
            inProgressDefects: 0,
            resolvedDefects: 0,
            byCategory: {
              LIGHT_VECHICLE: 0,
              TELEHENDLER: 0,
              STORING_TRUCK: 0,
              FUEL_TRUCK: 0,
              GENSET: 0,
              COMPRESSOR: 0,
            },
          },
        })),
      ]);

      if (listRes.success) {
        setDefects(listRes.data || []);
        if (listRes.pagination) {
          setPagination(listRes.pagination);
        }
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Gagal Memuat Data",
        message: error.message || "Tidak dapat mengambil data defect & breakdown.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadData(newPage, limit);
  };

  const handlePageSizeChange = (newSize: number) => {
    setLimit(newSize);
    setPage(1);
    loadData(1, newSize);
  };

  const loadUnits = async () => {
    try {
      const res = await fetchUnits();
      if (res.success) {
        setUnits(res.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat unit:", err);
    }
  };

  // Trigger search / filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [categoryFilter, statusFilter, severityFilter, search]);

  // Open Update Modal
  const handleOpenUpdate = (defect: DefectItem) => {
    setSelectedDefect(defect);
    setNewStatus(defect.status === "OPEN" ? "IN_PROGRESS" : defect.status);
    setMechanicName(defect.mechanicName || (currentUser ? `${currentUser.firstName} ${currentUser.lastName || ""}`.trim() : ""));
    setRepairNotes(defect.repairNotes || "");
    setIsUpdateModalOpen(true);
  };

  // Submit Update Status
  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDefect) return;

    if (newStatus === "RESOLVED" || newStatus === "CLOSED") {
      const isConfirmed = await showConfirmDialog({
        title: "Konfirmasi Selesai Perbaikan",
        text: `Apakah perbaikan defect ${selectedDefect.component} pada unit ${selectedDefect.unitNo} telah selesai dan siap dioperasikan?`,
        confirmButtonText: "Ya, Selesaikan",
      });
      if (!isConfirmed) return;
    }

    setIsSavingStatus(true);
    try {
      const res = await updateDefectStatus(selectedDefect.id, {
        status: newStatus,
        mechanicName: mechanicName.trim() || undefined,
        repairNotes: repairNotes.trim() || undefined,
      });

      if (res.success) {
        setIsUpdateModalOpen(false);
        showAlertSuccess(
          "Status Berhasil Diperbarui",
          `Defect ${selectedDefect.component} pada unit ${selectedDefect.unitNo} kini berstatus ${newStatus}.`
        );
        loadData();
      }
    } catch (err: any) {
      showAlertError(
        "Gagal Memperbarui Status",
        err.message || "Terjadi kesalahan saat memperbarui status defect."
      );
    } finally {
      setIsSavingStatus(false);
    }
  };

  // Submit Direct Breakdown
  const handleCreateBreakdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bdUnitId || !bdComponent.trim() || !bdDetails.trim()) {
      showAlertWarning(
        "Form Belum Lengkap",
        "Silakan pilih unit, komponen rusak, dan deskripsi breakdown."
      );
      return;
    }

    const matchedUnit = units.find((u) => String(u.id) === String(bdUnitId));
    const unitLabel = matchedUnit?.unitNo || "Armada";

    const isConfirmed = await showConfirmDialog({
      title: "Laporkan Unit Breakdown?",
      text: `Unit ${unitLabel} akan dicatat mengalami breakdown (${bdSeverity}) dan status unit akan diset tidak aktif. Lanjutkan?`,
      confirmButtonText: "Ya, Laporkan Breakdown",
      isDanger: true,
    });
    if (!isConfirmed) return;

    setIsSubmittingBreakdown(true);
    try {
      const res = await createDirectBreakdown({
        unitId: Number(bdUnitId),
        component: bdComponent.trim(),
        details: bdDetails.trim(),
        severity: bdSeverity,
        driverName: bdDriverName.trim() || "Mekanik Lapangan",
        driverNrp: bdDriverNrp ? Number(bdDriverNrp) : undefined,
        shift: bdShift,
      });

      if (res.success) {
        setIsBreakdownModalOpen(false);
        setBdUnitId("");
        setBdComponent("");
        setBdDetails("");
        showAlertSuccess(
          "Breakdown Berhasil Dilaporkan",
          res.message || `Laporan breakdown untuk unit ${unitLabel} telah dicatat ke sistem.`
        );
        loadData();
      }
    } catch (err: any) {
      showAlertError(
        "Gagal Melaporkan Breakdown",
        err.message || "Terjadi kesalahan saat melaporkan breakdown."
      );
    } finally {
      setIsSubmittingBreakdown(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (defects.length === 0) {
      showToast("Tidak ada data defect untuk diekspor", "warning");
      return;
    }

    const headers = [
      "ID Defect",
      "No P2H",
      "Tanggal",
      "Shift",
      "No Unit",
      "Kategori",
      "Komponen Rusak",
      "Tipe Defect",
      "Detail Kerusakan",
      "Tingkat Keparahan",
      "Status Perbaikan",
      "Mekanik PIC",
      "Catatan Perbaikan",
      "Operator/Driver",
      "Section",
    ];

    const rows = defects.map((d) => [
      d.id,
      d.p2hNo,
      new Date(d.date).toLocaleDateString("id-ID"),
      d.shift,
      d.unitNo,
      d.category,
      `"${d.component.replace(/"/g, '""')}"`,
      d.defectType,
      `"${d.details.replace(/"/g, '""')}"`,
      d.severity,
      d.status,
      `"${(d.mechanicName || "-").replace(/"/g, '""')}"`,
      `"${(d.repairNotes || "-").replace(/"/g, '""')}"`,
      `"${d.driverName.replace(/"/g, '""')}"`,
      d.section,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Daftar_Defect_Batara_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Data defect berhasil diekspor ke CSV", "success");
  };

  // Helper Badge Renderers
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "TELEHENDLER":
        return {
          label: "TH",
          name: "Telehandler",
          badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          icon: <Wrench className="w-3.5 h-3.5" />,
        };
      case "STORING_TRUCK":
        return {
          label: "ST",
          name: "Storing Truck",
          badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
          icon: <Truck className="w-3.5 h-3.5" />,
        };
      case "FUEL_TRUCK":
        return {
          label: "FT",
          name: "Fuel Truck",
          badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
          icon: <Droplets className="w-3.5 h-3.5" />,
        };
      case "GENSET":
        return {
          label: "GS",
          name: "Genset",
          badge: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
          icon: <Zap className="w-3.5 h-3.5" />,
        };
      case "COMPRESSOR":
        return {
          label: "CP",
          name: "Kompresor",
          badge: "bg-teal-500/15 text-teal-300 border-teal-500/30",
          icon: <Wind className="w-3.5 h-3.5" />,
        };
      default:
        return {
          label: "LV",
          name: "Light Vehicle",
          badge: "bg-sky-500/15 text-sky-300 border-sky-500/30",
          icon: <Truck className="w-3.5 h-3.5" />,
        };
    }
  };

  const getSeverityBadge = (sev: DefectSeverity) => {
    switch (sev) {
      case "CRITICAL":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1 shadow-sm shadow-rose-500/20">
            <AlertOctagon className="w-3 h-3" />
            <span>KRITIS / BREAKDOWN</span>
          </span>
        );
      case "MAJOR":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>MAJOR</span>
          </span>
        );
      case "MINOR":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>MINOR</span>
          </span>
        );
    }
  };

  const getStatusBadge = (st: DefectStatus) => {
    switch (st) {
      case "OPEN":
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span>OPEN BACKLOG</span>
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1.5 shadow-sm">
            <Wrench className="w-3 h-3 text-sky-400 animate-spin" />
            <span>DALAM PERBAIKAN</span>
          </span>
        );
      case "RESOLVED":
      case "CLOSED":
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SELESAI / READY</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ================= TOP HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-md shadow-rose-500/10">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>MANAJEMEN DEFECT &amp; BREAKDOWN FLEET</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                  PLANT &amp; MAINTENANCE
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Pusat pemantauan temuan kerusakan P2H, unit breakdown, penugasan mekanik, dan status kesiapan operasi armada.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => loadData()}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={defects.length === 0}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsBreakdownModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-linear-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
            <span>Laporkan Breakdown Lapangan</span>
          </button>
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
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <div className="font-bold text-sm mb-0.5">{alert.title}</div>
            <p>{alert.message}</p>
          </div>
          <button onClick={() => setAlert(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= 4 KPI STAT METRICS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Critical Breakdown */}
        <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-b from-rose-500/10 via-slate-900/90 to-slate-950 border border-rose-500/30 space-y-2 shadow-lg shadow-rose-500/5">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-300">
            <span className="flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Unit Breakdown / Kritis</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 font-bold">
              STOP OPS
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
              {stats.criticalDefects}
            </span>
            <span className="text-xs text-slate-400 font-medium">Temuan Kritis</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Unit dinyatakan TIDAK LAYAK atau mengalami kerusakan komponen vital.
          </p>
        </div>

        {/* 2. Open Backlog */}
        <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-b from-amber-500/10 via-slate-900/90 to-slate-950 border border-amber-500/30 space-y-2 shadow-lg shadow-amber-500/5">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Open Backlog Temuan</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 font-bold">
              ANTRIAN
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {stats.openDefects}
            </span>
            <span className="text-xs text-slate-400 font-medium">Item Backlog</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Temuan kerusakan P2H yang belum dijadwalkan / belum dikerjakan mekanik.
          </p>
        </div>

        {/* 3. In Progress Maintenance */}
        <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-b from-sky-500/10 via-slate-900/90 to-slate-950 border border-sky-500/30 space-y-2 shadow-lg shadow-sky-500/5">
          <div className="flex items-center justify-between text-xs font-semibold text-sky-300">
            <span className="flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-sky-400" />
              <span>Dalam Perbaikan</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 font-bold">
              ONGOING
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">
              {stats.inProgressDefects}
            </span>
            <span className="text-xs text-slate-400 font-medium">Unit Sedang Diservis</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Sedang dalam penanganan teknisi / penggantian suku cadang workshop.
          </p>
        </div>

        {/* 4. Resolved / Ready */}
        <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-b from-emerald-500/10 via-slate-900/90 to-slate-950 border border-emerald-500/30 space-y-2 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Selesai / Ready</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 font-bold">
              RESOLVED
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {stats.resolvedDefects}
            </span>
            <span className="text-xs text-slate-400 font-medium">Tuntas Diperbaiki</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Perbaikan telah selesai dan unit diverifikasi siap beroperasi kembali.
          </p>
        </div>
      </div>

      {/* ================= FILTER & SEARCH TOOLBAR ================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Kategori:</span>
          </span>

          {[
            { id: "ALL", label: "Semua Kategori" },
            { id: "LIGHT_VECHICLE", label: "🚗 Light Vehicle", count: stats.byCategory?.LIGHT_VECHICLE },
            { id: "TELEHENDLER", label: "🚜 Telehandler", count: stats.byCategory?.TELEHENDLER },
            { id: "STORING_TRUCK", label: "🚛 Storing Truck", count: stats.byCategory?.STORING_TRUCK },
            { id: "FUEL_TRUCK", label: "⛽ Fuel Truck", count: stats.byCategory?.FUEL_TRUCK },
            { id: "GENSET", label: "⚡ Genset", count: stats.byCategory?.GENSET },
            { id: "COMPRESSOR", label: "💨 Kompresor", count: stats.byCategory?.COMPRESSOR },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                categoryFilter === cat.id
                  ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20"
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              <span>{cat.label}</span>
              {cat.count !== undefined && cat.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    categoryFilter === cat.id
                      ? "bg-slate-950 text-amber-400 font-bold"
                      : "bg-slate-900 text-slate-400"
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search, Status & Severity Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari No Unit, Komponen Rusak, No P2H, Operator, atau Mekanik..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="ALL">Semua Status Perbaikan</option>
              <option value="OPEN">🔴 Open Backlog</option>
              <option value="IN_PROGRESS">🟡 Dalam Perbaikan</option>
              <option value="RESOLVED">🟢 Selesai / Resolved</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="sm:col-span-3">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="ALL">Semua Tingkat Keparahan</option>
              <option value="CRITICAL">🚨 Kritis / Breakdown</option>
              <option value="MAJOR">⚠️ Major</option>
              <option value="MINOR">ℹ️ Minor</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= DEFECT LIST TABLE (DESKTOP) ================= */}
      <div className="hidden md:block rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">No. P2H / Tgl</th>
                <th className="py-3.5 px-4">Unit Fleet</th>
                <th className="py-3.5 px-4">Komponen &amp; Temuan Kerusakan</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Status Perbaikan</th>
                <th className="py-3.5 px-4">Mekanik PIC / Catatan</th>
                <th className="py-3.5 px-4 text-right">Tindakan</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
                    <span className="font-semibold">Memuat daftar defect &amp; breakdown fleet...</span>
                  </td>
                </tr>
              ) : defects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/60 mb-2" />
                    <p className="font-bold text-white text-sm">Tidak ada defect aktif ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Semua unit armada dalam kondisi prima dan siap beroperasi.
                    </p>
                  </td>
                </tr>
              ) : (
                defects.map((d) => {
                  const catInfo = getCategoryBadge(d.category);
                  const isResolved = d.status === "RESOLVED" || d.status === "CLOSED";

                  return (
                    <tr
                      key={d.id}
                      className={`hover:bg-slate-800/40 transition-colors group ${
                        d.severity === "CRITICAL" && !isResolved ? "bg-rose-950/10" : ""
                      }`}
                    >
                      {/* 1. P2H No & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-amber-300">
                          {d.p2hNo}
                        </div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>
                            {new Date(d.date).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span>&bull; SIFT {d.shift}</span>
                        </div>
                      </td>

                      {/* 2. Unit Fleet */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${catInfo.badge}`}
                          >
                            {catInfo.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white font-mono">{d.unitNo}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${catInfo.badge}`}
                              >
                                {catInfo.label}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">
                              {d.brand}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 3. Component & Defect Details */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-white line-clamp-1">
                          {d.component}
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                          {d.details}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Pelapor: <strong className="text-slate-400">{d.driverName}</strong> ({d.section})
                        </div>
                      </td>

                      {/* 4. Severity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getSeverityBadge(d.severity)}
                      </td>

                      {/* 5. Status Perbaikan */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(d.status)}
                      </td>

                      {/* 6. Mekanik / Catatan */}
                      <td className="py-3.5 px-4 max-w-xs text-[11px]">
                        {d.mechanicName ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-200 flex items-center gap-1">
                              <User className="w-3 h-3 text-amber-400" />
                              <span>{d.mechanicName}</span>
                            </span>
                            {d.repairNotes && (
                              <p className="text-slate-400 italic line-clamp-1">
                                &ldquo;{d.repairNotes}&rdquo;
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Belum ditugaskan</span>
                        )}
                      </td>

                      {/* 7. Action Button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setDetailDefect(d);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Lihat Detail Defect"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenUpdate(d)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-amber-400 font-bold text-xs flex items-center gap-1 transition-all border border-slate-700 hover:border-amber-400 cursor-pointer shadow-sm"
                          >
                            <Wrench className="w-3 h-3" />
                            <span>Tindak Lanjut</span>
                          </button>
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

      {/* ================= DEFECT LIST CARDS (MOBILE VIEW) ================= */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          <div className="p-8 text-center rounded-3xl bg-slate-900/80 border border-slate-800 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
            <span className="text-xs">Memuat daftar defect fleet...</span>
          </div>
        ) : defects.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-slate-900/80 border border-slate-800 text-slate-500">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/60 mb-2" />
            <p className="font-bold text-white text-sm">Tidak ada defect aktif</p>
            <p className="text-xs text-slate-400 mt-1">Armada dalam kondisi aman dan siap operasi.</p>
          </div>
        ) : (
          defects.map((d) => {
            const catInfo = getCategoryBadge(d.category);
            return (
              <div
                key={d.id}
                className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-amber-300">
                        {d.p2hNo}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${catInfo.badge}`}>
                        {catInfo.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(d.date).toLocaleDateString("id-ID")} &bull; Shift {d.shift}
                    </div>
                  </div>

                  <div>{getStatusBadge(d.status)}</div>
                </div>

                {/* Body */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">No Unit:</span>
                    <span className="font-bold text-white font-mono">
                      {d.unitNo} ({d.brand})
                    </span>
                  </div>

                  <div className="space-y-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{d.component}</span>
                      {getSeverityBadge(d.severity)}
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {d.details}
                    </p>
                  </div>

                  {d.mechanicName && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Mekanik PIC:</span>
                      <span className="font-semibold text-slate-200">{d.mechanicName}</span>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDetailDefect(d);
                      setIsDetailModalOpen(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white text-center"
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => handleOpenUpdate(d)}
                    className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Tindak Lanjut</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= PAGINATION ================= */}
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages || 1}
        totalItems={pagination.total || 0}
        pageSize={limit}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading}
      />

      {/* ================= MODAL: UPDATE STATUS & WORK ORDER ================= */}
      {isUpdateModalOpen && selectedDefect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-lg w-full p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Tindak Lanjut &amp; Work Order Defect
                  </h3>
                  <p className="text-xs text-slate-400">
                    Update status perbaikan &amp; penugasan mekanik workshop
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Defect Preview Info */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Unit Fleet:</span>
                <span className="font-bold text-white font-mono">
                  {selectedDefect.unitNo} ({selectedDefect.brand})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Komponen Rusak:</span>
                <span className="font-bold text-amber-400">{selectedDefect.component}</span>
              </div>
              <div className="flex justify-between items-start pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Detail Kerusakan:</span>
                <span className="text-slate-200 text-right max-w-xs">{selectedDefect.details}</span>
              </div>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-white">
                  STATUS PERBAIKAN <span className="text-amber-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus("OPEN")}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      newStatus === "OPEN"
                        ? "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    🔴 Open
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus("IN_PROGRESS")}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      newStatus === "IN_PROGRESS"
                        ? "bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    🟡 In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus("RESOLVED")}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      newStatus === "RESOLVED"
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    🟢 Selesai
                  </button>
                </div>
              </div>

              {/* Mekanik PIC */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Nama Mekanik / Teknisi PIC
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={mechanicName}
                    onChange={(e) => setMechanicName(e.target.value)}
                    placeholder="Contoh: Mekanik Workshop Plant (Pak Joko / Anto)"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Catatan Tindakan / Suku Cadang */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Catatan Tindakan Perbaikan &amp; Suku Cadang
                </label>
                <textarea
                  rows={3}
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  placeholder="Contoh: Telah dilakukan penggantian seal silinder hidrolik & penambahan oli. Tekanan normal 180 bar dan unit siap operasi."
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSavingStatus}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 disabled:opacity-60 cursor-pointer"
                >
                  {isSavingStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DETAIL DEFECT LENGKAP ================= */}
      {isDetailModalOpen && detailDefect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-lg w-full p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Detail Temuan Defect</h3>
                  <p className="text-xs text-slate-400 font-mono">{detailDefect.p2hNo}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Unit Info */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Unit:</span>
                  <span className="font-bold text-white font-mono">
                    {detailDefect.unitNo} &bull; {detailDefect.brand}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Kategori:</span>
                  <span className="font-semibold text-amber-400">{detailDefect.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Status Kelayakan Unit:</span>
                  <span className="font-bold text-rose-400">{detailDefect.unitStatus}</span>
                </div>
              </div>

              {/* Defect Description */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 text-sm">
                    {detailDefect.component}
                  </span>
                  {getSeverityBadge(detailDefect.severity)}
                </div>
                <p className="text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {detailDefect.details}
                </p>
              </div>

              {/* Inspector Info */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Operator / Pelapor:</span>
                  <span className="font-semibold text-white">{detailDefect.driverName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">NRP:</span>
                  <span className="font-mono text-slate-300">{detailDefect.driverNrp || "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Section / Shift:</span>
                  <span className="text-slate-300">
                    {detailDefect.section} &bull; Shift {detailDefect.shift}
                  </span>
                </div>
              </div>

              {/* Progress Perbaikan */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Status Perbaikan:</span>
                  {getStatusBadge(detailDefect.status)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Mekanik PIC:</span>
                  <span className="font-semibold text-white">
                    {detailDefect.mechanicName || "Belum Ditugaskan"}
                  </span>
                </div>
                {detailDefect.repairNotes && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-400 block mb-1">Catatan Tindakan:</span>
                    <p className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                      {detailDefect.repairNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenUpdate(detailDefect);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Wrench className="w-4 h-4" />
                <span>Update Status / Work Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: LAPORKAN BREAKDOWN LAPANGAN ================= */}
      {isBreakdownModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-lg w-full p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Laporkan Breakdown Unit Lapangan
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pencatatan insiden kerusakan mendadak di area tambang / hauling
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBreakdownModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBreakdown} className="space-y-4 text-xs">
              {/* Pilih Unit */}
              <div className="space-y-1.5">
                <label className="block font-bold text-white">
                  PILIH NOMOR UNIT BREAKDOWN <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={bdUnitId}
                  onChange={(e) => setBdUnitId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 text-white cursor-pointer"
                >
                  <option value="" disabled className="bg-slate-950">
                    -- Silakan Pilih Unit Armada --
                  </option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-950">
                      {u.unitNo} - {u.brand} ({u.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Komponen Rusak */}
              <div className="space-y-1.5">
                <label className="block font-bold text-white">
                  KOMPONEN / BAGIAN YANG RUSAK <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bdComponent}
                  onChange={(e) => setBdComponent(e.target.value)}
                  placeholder="Contoh: Radiator Bocor / Silinder Boom Patah / Transmisi Slip"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 text-white"
                />
              </div>

              {/* Severity */}
              <div className="space-y-1.5">
                <label className="block font-bold text-white">
                  TINGKAT KEPARAHAN <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBdSeverity("CRITICAL")}
                    className={`py-2 px-2 rounded-xl font-bold border transition-all text-center ${
                      bdSeverity === "CRITICAL"
                        ? "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    🚨 Kritis / Stop
                  </button>
                  <button
                    type="button"
                    onClick={() => setBdSeverity("MAJOR")}
                    className={`py-2 px-2 rounded-xl font-bold border transition-all text-center ${
                      bdSeverity === "MAJOR"
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    ⚠️ Major
                  </button>
                  <button
                    type="button"
                    onClick={() => setBdSeverity("MINOR")}
                    className={`py-2 px-2 rounded-xl font-bold border transition-all text-center ${
                      bdSeverity === "MINOR"
                        ? "bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/20"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    ℹ️ Minor
                  </button>
                </div>
              </div>

              {/* Deskripsi Kejadian */}
              <div className="space-y-1.5">
                <label className="block font-bold text-white">
                  DESKRIPSI KERUSAKAN &amp; KONDISI LAPANGAN <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={bdDetails}
                  onChange={(e) => setBdDetails(e.target.value)}
                  placeholder="Jelaskan detail kronologi, lokasi kejadian di pit/hauling, dan indikasi kerusakan..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs placeholder:text-slate-500 leading-relaxed"
                />
              </div>

              {/* Pelapor & Shift */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300">Nama Pelapor</label>
                  <input
                    type="text"
                    value={bdDriverName}
                    onChange={(e) => setBdDriverName(e.target.value)}
                    placeholder="Nama Operator / Mekanik"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300">Shift Kerja</label>
                  <select
                    value={bdShift}
                    onChange={(e) => setBdShift(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white cursor-pointer"
                  >
                    <option value="SIANG">☀️ Day Shift (Siang)</option>
                    <option value="MALAM">🌙 Night Shift (Malam)</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBreakdownModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingBreakdown}
                  className="px-6 py-2.5 rounded-xl bg-linear-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-rose-500/20 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmittingBreakdown ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Laporan...</span>
                    </>
                  ) : (
                    <>
                      <AlertOctagon className="w-4 h-4" />
                      <span>Kirim Laporan Breakdown</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
