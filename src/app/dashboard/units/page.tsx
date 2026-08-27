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
} from "lucide-react";
import {
  Unit,
  UnitInput,
  fetchUnits,
  createUnit,
  updateUnit,
  deleteUnit,
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

const CATEGORIES = [
  { value: "EXCAVATOR", label: "Excavator" },
  { value: "DOZER", label: "Dozer" },
  { value: "COMPACTOR", label: "Compactor" },
  { value: "COMPRESSOR", label: "Compressor" },
  { value: "FUEL_TRUCK", label: "Fuel Truck" },
  { value: "LIGHT_VECHICLE", label: "Light Vehicle (LV)" },
  { value: "CRANE_TRUCK", label: "Crane Truck" },
  { value: "MOBILE_CRANE", label: "Mobile Crane" },
  { value: "AMBULANCE", label: "Ambulance" },
  { value: "STORING_TRUCK", label: "Storing Truck" },
  { value: "TELEHENDLER", label: "Telehandler" },
];

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
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
    category: "EXCAVATOR",
    brand: "",
    description: "",
    ownerName: "",
    km: 0,
    hourMeter: null,
    status: "ACTIVE",
  });

  useEffect(() => {
    const session = getAuthSession();
    setCurrentUser(session.user);
    loadUnits();
  }, []);

  const loadUnits = async () => {
    setIsLoading(true);
    try {
      const res = await fetchUnits({
        search: search.trim() || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
      });
      setUnits(res.data || []);
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUnits();
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

        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Tambah Unit Baru</span>
        </button>
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
            className="text-slate-400 hover:text-white p-1"
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
            {/* Category Filter */}
            <div className="flex-1 sm:flex-initial flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 sm:py-1.5 min-w-35">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setTimeout(loadUnits, 50);
                }}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-950">Semua Kategori</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-slate-950">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex-1 sm:flex-initial bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 sm:py-1.5 min-w-30">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setTimeout(loadUnits, 50);
                }}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-950">Semua Status</option>
                <option value="ACTIVE" className="bg-slate-950">ACTIVE</option>
                <option value="INACTIVE" className="bg-slate-950">INACTIVE</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={loadUnits}
              disabled={isLoading}
              className="p-2.5 sm:p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
            </button>
          </div>
        </form>
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
    </div>
  );
}
