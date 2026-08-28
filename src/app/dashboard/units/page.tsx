"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Truck,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Gauge,
  Clock,
  ShieldAlert,
  Building2,
  Download,
  FileSpreadsheet,
  Upload,
  Copy,
  Check,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  FileText,
} from "lucide-react";
import {
  Unit,
  UnitInput,
  fetchUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  bulkCreateUnits,
  downloadUnitCsvTemplate,
  parseUnitsCsv,
  BulkUnitResponse,
} from "@/services/unit.service";
import {
  showAlertSuccess,
  showAlertError,
  showAlertWarning,
  showConfirmDialog,
  showToast,
} from "@/lib/swal";
import { getAuthSession } from "@/services/auth.service";
import Pagination from "@/components/Pagination";
import { exportUnitsToExcel } from "@/lib/excel-export";

const CATEGORIES = [
  { value: "LIGHT_VECHICLE", label: "Light Vehicle (LV)" },
  { value: "TELEHENDLER", label: "Telehandler" },
  { value: "STORING_TRUCK", label: "Storing Truck" },
  { value: "FUEL_TRUCK", label: "Fuel Truck" },
  { value: "GENSET", label: "Genset" },
  { value: "COMPRESSOR", label: "Compressor" },
  { value: "EXCAVATOR", label: "Excavator" },
  { value: "DOZER", label: "Dozer" },
  { value: "COMPACTOR", label: "Compactor" },
  { value: "CRANE_TRUCK", label: "Crane Truck" },
  { value: "MOBILE_CRANE", label: "Mobile Crane" },
  { value: "AMBULANCE", label: "Ambulance" },
];

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Alert State
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  // User auth state
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<UnitInput>({
    unitNo: "",
    category: "LIGHT_VECHICLE",
    brand: "",
    description: "",
    ownerName: "PT Batara Dharma Persada",
    km: 0,
    hourMeter: null,
    status: "ACTIVE",
  });

  // Bulk Import State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkStep, setBulkStep] = useState<"input" | "preview" | "result">("input");
  const [bulkInputMode, setBulkInputMode] = useState<"file" | "paste">("file");
  const [csvText, setCsvText] = useState("");
  const [parsedBulkUnits, setParsedBulkUnits] = useState<Partial<UnitInput>[]>([]);
  const [bulkParseErrors, setBulkParseErrors] = useState<string[]>([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkUnitResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    setCurrentUser(session.user);
    loadUnits("", "", "");
  }, []);

  const loadUnits = async (
    targetCategory = categoryFilter,
    targetStatus = statusFilter,
    targetSearch = search
  ) => {
    setIsLoading(true);
    try {
      const res = await fetchUnits({
        search: targetSearch.trim() || undefined,
        category: targetCategory || undefined,
        status: targetStatus || undefined,
      });
      setUnits(res.data || []);

      // Simpan semua unit saat query awal tanpa filter untuk statistik pill counts
      if (!targetCategory && !targetStatus && !targetSearch.trim()) {
        setAllUnits(res.data || []);
      }
      setPage(1);
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Gagal Memuat Data",
        message: error.message || "Tidak dapat mengambil data unit dari server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategoryFilter(newCategory);
    loadUnits(newCategory, statusFilter, search);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    loadUnits(categoryFilter, newStatus, search);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUnits(categoryFilter, statusFilter, search);
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setStatusFilter("");
    loadUnits("", "", "");
  };

  // Category counts based on all registered units
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const dataset = allUnits.length > 0 ? allUnits : units;
    dataset.forEach((u) => {
      counts[u.category] = (counts[u.category] || 0) + 1;
    });
    return counts;
  }, [allUnits, units]);

  // Export to Excel (.xlsx) function
  const handleExportExcel = async () => {
    if (units.length === 0) {
      showAlertWarning("Data Kosong", "Tidak ada data armada unit yang dapat diekspor.");
      return;
    }

    try {
      await exportUnitsToExcel(units, {
        category: categoryFilter,
        status: statusFilter,
      });
      showToast(`Berhasil mengunduh ${units.length} data unit ke Excel (.xlsx)`, "success");
    } catch (error: any) {
      showAlertError("Gagal Mengunduh Excel", error.message || "Terjadi kesalahan saat mengunduh file.");
    }
  };

  // Paginated data slice
  const paginatedUnits = useMemo(() => {
    const start = (page - 1) * limit;
    return units.slice(start, start + limit);
  }, [units, page, limit]);

  const totalPages = Math.ceil(units.length / limit) || 1;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setLimit(newSize);
    setPage(1);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedUnit(null);
    setFormData({
      unitNo: "",
      category: "EXCAVATOR",
      brand: "",
      description: "",
      ownerName: "PT Batara Dharma Persada",
      km: 0,
      hourMeter: null,
      status: "ACTIVE",
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (unit: Unit) => {
    setModalMode("edit");
    setSelectedUnit(unit);
    setFormData({
      unitNo: unit.unitNo,
      category: unit.category,
      brand: unit.brand,
      description: unit.description,
      ownerName: unit.ownerName,
      km: unit.km,
      hourMeter: unit.hourMeter,
      status: unit.status,
    });
    setIsModalOpen(true);
  };

  // Open Delete Confirmation
  const handleOpenDelete = async (unit: Unit) => {
    const isConfirmed = await showConfirmDialog({
      title: "Hapus Unit Armada?",
      text: `Apakah Anda yakin ingin menghapus unit ${unit.unitNo} (${unit.brand})? Seluruh data riwayat P2H terkait unit ini akan ikut terhapus.`,
      confirmButtonText: "Ya, Hapus Unit",
      isDanger: true,
    });

    if (!isConfirmed) return;

    setIsSubmitting(true);
    try {
      await deleteUnit(unit.id);
      showAlertSuccess(
        "Unit Berhasil Dihapus",
        `Unit ${unit.unitNo} telah dihapus dari sistem armada.`
      );
      loadUnits();
    } catch (error: any) {
      showAlertError(
        "Gagal Menghapus Unit",
        error.message || "Terjadi kesalahan saat menghapus data unit."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!formData.unitNo.trim()) {
      showAlertWarning("Validasi Gagal", "Nomor Lambung / Unit No wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === "create") {
        const res = await createUnit({
          ...formData,
          km: Number(formData.km),
          hourMeter: formData.hourMeter ? Number(formData.hourMeter) : null,
        });
        showAlertSuccess(
          "Unit Berhasil Ditambahkan",
          `Unit ${res.data.unitNo} berhasil didaftarkan ke sistem armada.`
        );
      } else if (modalMode === "edit" && selectedUnit) {
        const res = await updateUnit(selectedUnit.id, {
          ...formData,
          km: Number(formData.km),
          hourMeter: formData.hourMeter ? Number(formData.hourMeter) : null,
        });
        showAlertSuccess(
          "Unit Berhasil Diperbarui",
          `Data Unit ${res.data.unitNo} telah berhasil diperbarui.`
        );
      }

      setIsModalOpen(false);
      loadUnits();
    } catch (error: any) {
      showAlertError(
        "Operasi Gagal",
        error.message || "Terjadi kesalahan saat menyimpan data unit."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete Modal Fallback
  const handleConfirmDelete = async () => {
    if (!selectedUnit) return;
    setIsSubmitting(true);
    try {
      await deleteUnit(selectedUnit.id);
      showAlertSuccess(
        "Unit Dihapus",
        `Unit ${selectedUnit.unitNo} berhasil dihapus dari sistem.`
      );
      setIsDeleteModalOpen(false);
      setSelectedUnit(null);
      loadUnits();
    } catch (error: any) {
      showAlertError(
        "Gagal Menghapus Unit",
        error.message || "Terjadi kesalahan saat menghapus data unit."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk Import Handlers
  const handleOpenBulkModal = () => {
    setBulkStep("input");
    setBulkInputMode("file");
    setCsvText("");
    setParsedBulkUnits([]);
    setBulkParseErrors([]);
    setBulkResult(null);
    setIsBulkModalOpen(true);
  };

  const handleCloseBulkModal = () => {
    setIsBulkModalOpen(false);
    if (bulkStep === "result") {
      loadUnits();
    }
  };

  const processCsvText = (text: string) => {
    const { data, errors } = parseUnitsCsv(text);
    setParsedBulkUnits(data);
    setBulkParseErrors(errors);
    if (data.length > 0) {
      setBulkStep("preview");
    } else {
      showAlertWarning("Gagal Membaca CSV", errors.join("\n") || "Data tidak ditemukan dalam teks CSV.");
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith(".csv") && !file.type.includes("csv") && !file.type.includes("text")) {
      showAlertWarning("Format File Salah", "Harap unggah file dengan format .CSV");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvText(content);
      processCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleExecuteBulkImport = async () => {
    if (parsedBulkUnits.length === 0) {
      showAlertWarning("Data Kosong", "Tidak ada data unit yang valid untuk diimpor.");
      return;
    }

    setIsProcessingBulk(true);
    try {
      const res = await bulkCreateUnits(parsedBulkUnits);
      setBulkResult(res);
      setBulkStep("result");
      loadUnits();
    } catch (error: any) {
      showAlertError(
        "Gagal Impor Bulk",
        error.message || "Terjadi kesalahan saat memproses bulk create unit."
      );
    } finally {
      setIsProcessingBulk(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = units.length;
    const active = units.filter((u) => u.status === "ACTIVE").length;
    const inactive = units.filter((u) => u.status === "INACTIVE").length;
    return { total, active, inactive };
  }, [units]);

  // Authorization check (PLANT / OPERATIONS with ADMIN / SUPERADMIN)
  const canManageUnits = useMemo(() => {
    if (!currentUser) return true;
    const isPrivilegedRole =
      currentUser.role === "ADMIN" || currentUser.role === "SUPERADMIN";
    const isAllowedDept =
      currentUser.department === "PLANT" ||
      currentUser.department === "OPERATIONS";
    return isPrivilegedRole && isAllowedDept;
  }, [currentUser]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Kelola Unit &amp; Armada Fleet
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg shrink-0">
              {units.length} Unit
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Data nomor lambung, spesifikasi unit, brand, KM, hour meter, dan status kelaikan.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
          {/* Download Excel Button */}
          <button
            onClick={handleExportExcel}
            disabled={isLoading || units.length === 0}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download Data Armada Unit ke File Excel (.xlsx)"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download Excel</span>
          </button>

          {/* Bulk Import Button */}
          <button
            onClick={handleOpenBulkModal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            title="Impor Banyak Unit Sekaligus via File CSV"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Impor Bulk Unit</span>
          </button>

          {/* Create Unit Button */}
          <button
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Tambah Unit Baru</span>
          </button>
        </div>
      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Armada Terdaftar</div>
            <div className="text-xl sm:text-2xl font-extrabold text-white mt-1">{stats.total}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-400 font-medium">Unit Siap Operasi (Active)</div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1">{stats.active}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-rose-400 font-medium">Breakdown / Inactive</div>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-400 mt-1">{stats.inactive}</div>
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
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Department Permission Note */}
      {!canManageUnits && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>Perhatian Otorisasi:</strong> Akun Anda berada pada Departemen{" "}
            <strong>{currentUser?.department || "-"}</strong>. Hanya Role Admin dari Departemen{" "}
            <strong>PLANT</strong> &amp; <strong>OPERATIONS</strong> yang diizinkan memodifikasi data unit.
          </span>
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
              placeholder="Cari No Lambung, Brand..."
              className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
            {/* Category Dropdown Filter */}
            <div className="flex-1 sm:flex-initial flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 sm:py-1.5 min-w-40">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-950">Semua Kategori ({allUnits.length || units.length})</option>
                {CATEGORIES.map((cat) => {
                  const count = categoryCounts[cat.value];
                  return (
                    <option key={cat.value} value={cat.value} className="bg-slate-950">
                      {cat.label} {count ? `(${count})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex-1 sm:flex-initial bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 sm:py-1.5 min-w-30">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-950">Semua Status</option>
                <option value="ACTIVE" className="bg-slate-950">ACTIVE</option>
                <option value="INACTIVE" className="bg-slate-950">INACTIVE</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {(categoryFilter || statusFilter || search) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 sm:py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset Filter"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => loadUnits(categoryFilter, statusFilter, search)}
              disabled={isLoading}
              className="p-2.5 sm:p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
            </button>
          </div>
        </form>

        {/* Quick Category Chips / Pills */}
        <div className="pt-2.5 border-t border-slate-800/70 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 shrink-0">
            Kategori:
          </span>
          <button
            type="button"
            onClick={() => handleCategoryChange("")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === ""
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
                : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
            }`}
          >
            Semua ({allUnits.length || units.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.value] || 0;
            const isActive = categoryFilter === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
                    : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
              >
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-slate-950/20 text-slate-950"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= DESKTOP TABLE VIEW (md:block) ================= */}
      <div className="hidden md:block rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">No. Lambung</th>
                <th className="py-3.5 px-4">Kategori Unit</th>
                <th className="py-3.5 px-4">Merk &amp; Tipe</th>
                <th className="py-3.5 px-4">Kepemilikan</th>
                <th className="py-3.5 px-4">KM / HM</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                    <span>Memuat data armada unit...</span>
                  </td>
                </tr>
              ) : units.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Truck className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-400">Tidak ada data unit yang ditemukan</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Silakan sesuaikan pencarian atau klik "+ Tambah Unit Baru"
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedUnits.map((unit) => (
                  <tr
                    key={unit.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Unit No */}
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                          <Truck className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm text-amber-300 font-mono">
                          {unit.unitNo}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60">
                        {unit.category.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Brand & Description */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{unit.brand}</div>
                      <div className="text-xs text-slate-400 line-clamp-1">
                        {unit.description}
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{unit.ownerName}</span>
                      </div>
                    </td>

                    {/* KM & HM */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1 text-xs">
                        <Gauge className="w-3 h-3 text-slate-400" />
                        <span>{unit.km.toLocaleString()} KM</span>
                      </div>
                      {unit.hourMeter !== null && (
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{unit.hourMeter.toLocaleString()} HM</span>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {unit.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          INACTIVE
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(unit)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Unit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(unit)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Hapus Unit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MOBILE CARD LIST VIEW (block md:hidden) ================= */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
            <span className="text-xs">Memuat data armada unit...</span>
          </div>
        ) : units.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500">
            <Truck className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-400 text-sm">Tidak ada data unit</p>
            <p className="text-xs text-slate-500 mt-1">
              Silakan sesuaikan pencarian atau klik tombol Tambah Unit
            </p>
          </div>
        ) : (
          paginatedUnits.map((unit) => (
            <div
              key={unit.id}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-md"
            >
              {/* Card Header: Unit No & Status */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-amber-300 font-mono">
                      {unit.unitNo}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      {unit.category.replace(/_/g, " ")}
                    </div>
                  </div>
                </div>

                {unit.status === "ACTIVE" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ACTIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    INACTIVE
                  </span>
                )}
              </div>

              {/* Card Body: Spec, Brand, Owner, KM */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-start justify-between">
                  <span className="text-slate-400">Merk &amp; Tipe:</span>
                  <span className="font-semibold text-slate-200 text-right">
                    {unit.brand} &bull; {unit.description}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Pemilik / Owner:</span>
                  <span className="text-slate-300">{unit.ownerName}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/50 text-xs">
                  <div className="flex items-center gap-1 text-slate-300">
                    <Gauge className="w-3.5 h-3.5 text-amber-400" />
                    <span>{unit.km.toLocaleString()} KM</span>
                  </div>
                  {unit.hourMeter !== null && (
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{unit.hourMeter.toLocaleString()} HM</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(unit)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-400 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleOpenDelete(unit)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/20 text-xs font-semibold text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= PAGINATION ================= */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={units.length}
        pageSize={limit}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading}
      />

      {/* ================= MODAL TAMBAH / EDIT UNIT ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {modalMode === "create" ? "Tambah Unit Armada Baru" : `Edit Data Unit ${selectedUnit?.unitNo}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Otorisasi: Departemen Plant &amp; Operations
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Unit No */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Nomor Lambung / Unit No <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unitNo}
                    onChange={(e) => setFormData({ ...formData, unitNo: e.target.value.toUpperCase() })}
                    placeholder="Contoh: EX-2001, LV-101"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Kategori Unit <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Brand */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Brand / Merk <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Contoh: Komatsu, Toyota, CAT"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Owner Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Nama Pemilik / Owner <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Contoh: PT Batara Dharma Persada"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Deskripsi / Tipe Unit <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contoh: PC200-8M0 Excavator 20 Ton, Hilux 4x4 D-Cab"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* KM */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Kilometer (KM) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.km}
                    onChange={(e) => setFormData({ ...formData, km: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Hour Meter */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Hour Meter (HM)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.hourMeter ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hourMeter: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="Opsional"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Status Unit
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE (Ready)</option>
                    <option value="INACTIVE">INACTIVE (Breakdown)</option>
                  </select>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{modalMode === "create" ? "Simpan Unit" : "Perbarui Data"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL KONFIRMASI HAPUS ================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Hapus Unit Armada?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Apakah Anda yakin ingin menghapus unit{" "}
                <strong className="text-white font-mono">{selectedUnit?.unitNo}</strong>?
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="flex-1 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus Unit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL BULK IMPORT UNIT ================= */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                    Impor Massal Master Unit (.CSV)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Daftarkan banyak armada sekaligus dari file Excel / CSV ke dalam sistem P2H.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseBulkModal}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Wizard Bar */}
            <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    bulkStep === "input"
                      ? "bg-amber-500 text-slate-950 font-extrabold"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  1
                </div>
                <span className={bulkStep === "input" ? "text-amber-400 font-semibold" : "text-slate-400"}>
                  Pilih / Unggah File
                </span>
              </div>

              <div className="w-8 h-px bg-slate-800" />

              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    bulkStep === "preview"
                      ? "bg-amber-500 text-slate-950 font-extrabold"
                      : bulkStep === "result"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  2
                </div>
                <span className={bulkStep === "preview" ? "text-amber-400 font-semibold" : "text-slate-400"}>
                  Pratinjau Data ({parsedBulkUnits.length})
                </span>
              </div>

              <div className="w-8 h-px bg-slate-800" />

              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    bulkStep === "result"
                      ? "bg-emerald-500 text-slate-950 font-extrabold"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  3
                </div>
                <span className={bulkStep === "result" ? "text-emerald-400 font-semibold" : "text-slate-400"}>
                  Laporan Hasil
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* STEP 1: INPUT FILE / PASTE */}
              {bulkStep === "input" && (
                <div className="space-y-4">
                  {/* Template Card Info */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>Template Resmi Impor Master Unit</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                              Format .CSV
                            </span>
                          </h4>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Unduh template CSV resmi untuk mendaftarkan armada kendaraan &amp; alat berat tambang.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const sampleText = `unitNo;category;brand;description;ownerName;km;hourMeter;status\nLV-01;LIGHT_VECHICLE;Toyota;Hilux Double Cabin 4x4;PT Batara Dharma Persada;0;;ACTIVE\nTH-01;TELEHENDLER;JCB;JCB 535-95 Telehandler;PT Batara Dharma Persada;0;0;ACTIVE\nST-01;STORING_TRUCK;Hino;Dutro 130 HD Workshop;PT Batara Dharma Persada;0;;ACTIVE\nFT-01;FUEL_TRUCK;Hino;Ranger FM 260 JD (16.000L);PT Batara Dharma Persada;0;0;ACTIVE\nGS-01;GENSET;Denyo;DCA-80ESK (80 kVA);PT Batara Dharma Persada;0;0;ACTIVE\nCP-01;COMPRESSOR;Airman;PDS185S Diesel Compressor;PT Batara Dharma Persada;0;0;ACTIVE\nEX-01;EXCAVATOR;Komatsu;PC200-8M0 Excavator;PT Batara Dharma Persada;0;0;ACTIVE\nDZ-01;DOZER;Caterpillar;D6R Bulldozer;PT Batara Dharma Persada;0;0;ACTIVE`;
                            navigator.clipboard.writeText(sampleText);
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                          title="Salin contoh baris CSV ke clipboard"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                          <span>{isCopied ? "Tersalin!" : "Salin Contoh"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={downloadUnitCsvTemplate}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/10 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh File Template (.csv)</span>
                        </button>
                      </div>
                    </div>

                    {/* Table of Columns */}
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/80">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                          <tr>
                            <th className="py-2 px-3">Kolom (Header)</th>
                            <th className="py-2 px-2.5 text-center">Status</th>
                            <th className="py-2 px-3">Penjelasan &amp; Nilai yang Valid</th>
                            <th className="py-2 px-3">Contoh</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-[11px]">
                          <tr>
                            <td className="py-2 px-3 font-mono font-bold text-amber-400">unitNo</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold text-[10px]">Wajib</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">Nomor lambung unik armada</td>
                            <td className="py-2 px-3 font-mono text-slate-400">LV-01 / EX-101</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono font-bold text-amber-400">category</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold text-[10px]">Wajib</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              <span className="text-slate-400">Pilihan:</span> <code className="text-sky-300 font-mono">LIGHT_VECHICLE</code> (LV), <code className="text-sky-300 font-mono">TELEHENDLER</code> (TH), <code className="text-sky-300 font-mono">STORING_TRUCK</code> (ST), <code className="text-sky-300 font-mono">FUEL_TRUCK</code> (FT), <code className="text-sky-300 font-mono">GENSET</code>, <code className="text-sky-300 font-mono">COMPRESSOR</code>, <code className="text-sky-300 font-mono">EXCAVATOR</code>, <code className="text-sky-300 font-mono">DOZER</code>, <code className="text-sky-300 font-mono">COMPACTOR</code>, <code className="text-sky-300 font-mono">CRANE_TRUCK</code>, <code className="text-sky-300 font-mono">MOBILE_CRANE</code>, <code className="text-sky-300 font-mono">AMBULANCE</code>
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-400">LIGHT_VECHICLE</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono font-bold text-amber-400">brand</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold text-[10px]">Wajib</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">Merk / Pabrikan armada</td>
                            <td className="py-2 px-3 font-mono text-slate-400">Toyota / Caterpillar</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono text-slate-300">description</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium text-[10px]">Opsional</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">Model / Tipe armada</td>
                            <td className="py-2 px-3 font-mono text-slate-400">Hilux 4x4 Double Cabin</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono text-slate-300">ownerName</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium text-[10px]">Opsional</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">Pemilik / Kontraktor (Default: PT Batara Dharma Persada)</td>
                            <td className="py-2 px-3 font-mono text-slate-400">PT Batara Dharma Persada</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono text-slate-300">km</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium text-[10px]">Opsional</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">Kilometer (KM) Odometer Awal (Default: 0)</td>
                            <td className="py-2 px-3 font-mono text-slate-400">0</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono text-slate-300">hourMeter</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium text-[10px]">Opsional</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">Hour Meter (HM) Awal (Untuk alat berat)</td>
                            <td className="py-2 px-3 font-mono text-slate-400">0</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono text-slate-300">status</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium text-[10px]">Opsional</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              <span className="text-slate-400">Pilihan:</span> <code className="text-emerald-300 font-mono">ACTIVE</code> (Ready), <code className="text-rose-300 font-mono">INACTIVE</code> (Breakdown)
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-400">ACTIVE</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Input Method Switcher */}
                  <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setBulkInputMode("file")}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                        bulkInputMode === "file" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Metode 1: Unggah File CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBulkInputMode("paste");
                        if (!csvText) {
                          setCsvText(`unitNo;category;brand;description;ownerName;km;hourMeter;status\nLV-01;LIGHT_VECHICLE;Toyota;Hilux Double Cabin 4x4;PT Batara Dharma Persada;0;;ACTIVE\nTH-01;TELEHENDLER;JCB;JCB 535-95 Telehandler;PT Batara Dharma Persada;0;0;ACTIVE\nST-01;STORING_TRUCK;Hino;Dutro 130 HD Workshop;PT Batara Dharma Persada;0;;ACTIVE\nFT-01;FUEL_TRUCK;Hino;Ranger FM 260 JD (16.000L);PT Batara Dharma Persada;0;0;ACTIVE\nGS-01;GENSET;Denyo;DCA-80ESK (80 kVA);PT Batara Dharma Persada;0;0;ACTIVE\nCP-01;COMPRESSOR;Airman;PDS185S Diesel Compressor;PT Batara Dharma Persada;0;0;ACTIVE\nEX-01;EXCAVATOR;Komatsu;PC200-8M0 Excavator;PT Batara Dharma Persada;0;0;ACTIVE\nDZ-01;DOZER;Caterpillar;D6R Bulldozer;PT Batara Dharma Persada;0;0;ACTIVE`);
                        }
                      }}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                        bulkInputMode === "paste" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Metode 2: Salin / Tempel Teks CSV</span>
                    </button>
                  </div>

                  {/* Mode 1: Drag & Drop Zone */}
                  {bulkInputMode === "file" && (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`p-8 border-2 border-dashed rounded-3xl text-center transition-all ${
                        dragActive
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-slate-800 hover:border-slate-700 bg-slate-950/60"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Tarik &amp; Lepas File CSV di sini</h4>
                      <p className="text-xs text-slate-400 mt-1">atau klik tombol di bawah untuk memilih file dari komputer</p>

                      <label className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors border border-slate-700">
                        <span>Pilih File CSV</span>
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {/* Mode 2: Paste Raw CSV Text */}
                  {bulkInputMode === "paste" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-300">
                          Editor Teks CSV Unit
                        </label>
                        <button
                          type="button"
                          onClick={() => setCsvText(`unitNo;category;brand;description;ownerName;km;hourMeter;status\nLV-01;LIGHT_VECHICLE;Toyota;Hilux Double Cabin 4x4;PT Batara Dharma Persada;0;;ACTIVE\nTH-01;TELEHENDLER;JCB;JCB 535-95 Telehandler;PT Batara Dharma Persada;0;0;ACTIVE\nST-01;STORING_TRUCK;Hino;Dutro 130 HD Workshop;PT Batara Dharma Persada;0;;ACTIVE\nFT-01;FUEL_TRUCK;Hino;Ranger FM 260 JD (16.000L);PT Batara Dharma Persada;0;0;ACTIVE\nGS-01;GENSET;Denyo;DCA-80ESK (80 kVA);PT Batara Dharma Persada;0;0;ACTIVE\nCP-01;COMPRESSOR;Airman;PDS185S Diesel Compressor;PT Batara Dharma Persada;0;0;ACTIVE\nEX-01;EXCAVATOR;Komatsu;PC200-8M0 Excavator;PT Batara Dharma Persada;0;0;ACTIVE\nDZ-01;DOZER;Caterpillar;D6R Bulldozer;PT Batara Dharma Persada;0;0;ACTIVE`)}
                          className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                        >
                          Muat Ulang Contoh Data
                        </button>
                      </div>
                      <textarea
                        rows={8}
                        value={csvText}
                        onChange={(e) => setCsvText(e.target.value)}
                        placeholder="unitNo;category;brand;description;ownerName;km;hourMeter;status"
                        className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
                      />
                      <button
                        type="button"
                        onClick={() => processCsvText(csvText)}
                        disabled={!csvText.trim()}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-amber-500/10"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Validasi &amp; Lanjut ke Pratinjau Data</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: PREVIEW DATA */}
              {bulkStep === "preview" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
                        {parsedBulkUnits.length} Unit Siap Diimpor
                      </span>
                      {bulkParseErrors.length > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold font-mono">
                          {bulkParseErrors.length} Baris Dilewati
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Periksa data di bawah sebelum menyimpan ke database.
                    </p>
                  </div>

                  {/* Parse Errors List */}
                  {bulkParseErrors.length > 0 && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1 text-xs text-rose-300">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Catatan Baris Bermasalah:</span>
                      </div>
                      <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-rose-200/90">
                        {bulkParseErrors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Preview Table */}
                  <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-900 text-slate-400 font-semibold sticky top-0 uppercase tracking-wider text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">No</th>
                          <th className="py-2.5 px-3">No. Lambung</th>
                          <th className="py-2.5 px-3">Kategori</th>
                          <th className="py-2.5 px-3">Merk / Brand</th>
                          <th className="py-2.5 px-3">Model / Tipe</th>
                          <th className="py-2.5 px-3">Owner</th>
                          <th className="py-2.5 px-3 text-right">KM</th>
                          <th className="py-2.5 px-3 text-right">HM</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-[11px]">
                        {parsedBulkUnits.map((u, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40">
                            <td className="py-2 px-3 text-slate-500 font-mono">{idx + 1}</td>
                            <td className="py-2 px-3 font-bold font-mono text-amber-400">{u.unitNo}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold">
                                {(u.category || "").replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-white font-medium">{u.brand}</td>
                            <td className="py-2 px-3 text-slate-400">{u.description || "-"}</td>
                            <td className="py-2 px-3 text-slate-400">{u.ownerName || "PT Batara"}</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-300">{u.km ?? 0}</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-300">{u.hourMeter ?? "-"}</td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  u.status === "ACTIVE"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-rose-500/20 text-rose-400"
                                }`}
                              >
                                {u.status || "ACTIVE"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STEP 3: RESULT REPORT */}
              {bulkStep === "result" && bulkResult && (
                <div className="space-y-4">
                  <div
                    className={`p-5 rounded-3xl border text-center space-y-2 ${
                      bulkResult.summary.failedCount === 0
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center mx-auto">
                      {bulkResult.summary.failedCount === 0 ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-amber-400" />
                      )}
                    </div>
                    <h4 className="text-base font-extrabold text-white">
                      {bulkResult.summary.failedCount === 0
                        ? "Impor Bulk Berhasil Sempurna!"
                        : "Impor Bulk Selesai dengan Sebagian Catatan"}
                    </h4>
                    <p className="text-xs opacity-90 max-w-md mx-auto">{bulkResult.message}</p>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Diproses</span>
                      <strong className="text-base text-white font-mono">{bulkResult.summary.totalProcessed}</strong>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block">Berhasil Dibuat</span>
                      <strong className="text-base text-emerald-400 font-mono">{bulkResult.summary.successCount}</strong>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                      <span className="text-[10px] uppercase font-bold text-rose-400 block">Gagal / Dilewati</span>
                      <strong className="text-base text-rose-400 font-mono">{bulkResult.summary.failedCount}</strong>
                    </div>
                  </div>

                  {/* Failed Rows Detail */}
                  {bulkResult.errors && bulkResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-rose-400">
                        Rincian Baris yang Gagal / Dilewati ({bulkResult.errors.length}):
                      </h5>
                      <div className="border border-rose-500/20 rounded-xl overflow-hidden bg-slate-950 max-h-48 overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-rose-500/10 text-rose-300 text-[10px] uppercase font-bold border-b border-rose-500/20">
                            <tr>
                              <th className="py-2 px-3">Baris</th>
                              <th className="py-2 px-3">No. Lambung</th>
                              <th className="py-2 px-3">Penyebab Gagal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-[11px]">
                            {bulkResult.errors.map((err, idx) => (
                              <tr key={idx} className="hover:bg-rose-500/5">
                                <td className="py-1.5 px-3 font-mono text-slate-400">{err.row}</td>
                                <td className="py-1.5 px-3 font-mono font-bold text-white">{err.unitNo || "-"}</td>
                                <td className="py-1.5 px-3 text-rose-300">{err.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Buttons */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              {bulkStep === "preview" ? (
                <button
                  type="button"
                  onClick={() => setBulkStep("input")}
                  disabled={isProcessingBulk}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Kembali ke Input
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseBulkModal}
                  disabled={isProcessingBulk}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {bulkStep === "result" ? "Selesai & Tutup" : "Batal"}
                </button>

                {bulkStep === "preview" && (
                  <button
                    type="button"
                    onClick={handleExecuteBulkImport}
                    disabled={isProcessingBulk || parsedBulkUnits.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingBulk ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengimpor {parsedBulkUnits.length} Unit...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Mulai Impor ({parsedBulkUnits.length} Unit)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
