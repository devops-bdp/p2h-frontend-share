"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit3,
  Trash2,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  HardHat,
  Eye,
  EyeOff,
  Copy,
  Check,
  User as UserIcon,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";
import {
  User,
  UserInput,
  UserUpdateInput,
  UserRole,
  UserDepartment,
  UserPosition,
  USER_ROLES,
  USER_DEPARTMENTS,
  USER_POSITIONS,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  bulkCreateUsers,
  downloadUserCsvTemplate,
  parseUsersCsv,
  BulkUserResponse,
} from "@/services/user.service";
import {
  showAlertSuccess,
  showAlertError,
  showAlertWarning,
  showConfirmDialog,
  showToast,
} from "@/lib/swal";
import { getAuthSession } from "@/services/auth.service";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [posFilter, setPosFilter] = useState("");

  // Alert State
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset Password Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("Batara@123");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetUser, setDeleteTargetUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk Create Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkStep, setBulkStep] = useState<"input" | "preview" | "result">("input");
  const [bulkInputMode, setBulkInputMode] = useState<"file" | "paste">("file");
  const [csvText, setCsvText] = useState("");
  const [parsedBulkUsers, setParsedBulkUsers] = useState<Partial<UserInput>[]>([]);
  const [bulkParseErrors, setBulkParseErrors] = useState<string[]>([]);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkUserResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Form State
  const [formData, setFormData] = useState<UserInput>({
    firstName: "",
    lastName: "",
    nrp: "" as any,
    password: "",
    department: "OPERATIONS",
    posision: "OPERATOR",
    phoneNumber: "",
    email: "",
    role: "USER",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    setCurrentUser(session.user);
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetchUsers({
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        department: deptFilter || undefined,
        posision: posFilter || undefined,
      });
      setUsers(res.data || []);
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Gagal Memuat Data Pengguna",
        message: error.message || "Tidak dapat mengambil data pengguna dari server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("");
    setDeptFilter("");
    setPosFilter("");
    setTimeout(() => {
      loadUsers();
    }, 0);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = users.length;
    const operatorsAndDrivers = users.filter(
      (u) => u.posision === "OPERATOR" || u.posision === "DRIVER"
    ).length;
    const supervisors = users.filter(
      (u) =>
        u.posision === "SITE_SUPERVISOR" ||
        u.posision === "SITE_SUPERINTENDENT" ||
        u.posision === "SITE_MANAGER"
    ).length;
    const admins = users.filter(
      (u) => u.role === "ADMIN" || u.role === "SUPERADMIN"
    ).length;

    return { total, operatorsAndDrivers, supervisors, admins };
  }, [users]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedUser(null);
    setFormData({
      firstName: "",
      lastName: "",
      nrp: "" as any,
      password: "",
      department: "OPERATIONS",
      posision: "OPERATOR",
      phoneNumber: "",
      email: "",
      role: "USER",
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: User) => {
    setModalMode("edit");
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      nrp: user.nrp,
      password: "",
      department: user.department,
      posision: user.posision,
      phoneNumber: user.phoneNumber || "",
      email: user.email || "",
      role: user.role,
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Open Reset Password Modal
  const handleOpenReset = (user: User) => {
    setResetTargetUser(user);
    setNewPassword("Batara@123");
    setShowNewPassword(false);
    setIsCopied(false);
    setIsResetModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = async (user: User) => {
    const isConfirmed = await showConfirmDialog({
      title: "Hapus Akun Pengguna?",
      text: `Apakah Anda yakin ingin menghapus akun ${user.firstName} ${user.lastName} (NRP: ${user.nrp}, Role: ${user.role})? Tindakan ini tidak dapat dibatalkan.`,
      confirmButtonText: "Ya, Hapus Akun",
      isDanger: true,
    });

    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      const res = await deleteUser(user.id);
      showAlertSuccess(
        "User Berhasil Dihapus",
        res.message || `Akun ${user.firstName} telah dihapus dari sistem.`
      );
      loadUsers();
    } catch (error: any) {
      showAlertError(
        "Gagal Menghapus User",
        error.message || "Terjadi kesalahan saat menghapus user."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Bulk Create Modal
  const handleOpenBulk = () => {
    setBulkStep("input");
    setBulkInputMode("file");
    setCsvText("");
    setParsedBulkUsers([]);
    setBulkParseErrors([]);
    setBulkResult(null);
    setIsBulkModalOpen(true);
  };

  // Handle File Upload for Bulk
  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      processCsvText(text);
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

  const processCsvText = (text: string) => {
    const { data, errors } = parseUsersCsv(text);
    setParsedBulkUsers(data);
    setBulkParseErrors(errors);
    if (data.length > 0) {
      setBulkStep("preview");
    }
  };

  // Submit Bulk Create
  const handleBulkSubmit = async () => {
    if (parsedBulkUsers.length === 0) return;

    setIsBulkSubmitting(true);
    try {
      const res = await bulkCreateUsers(parsedBulkUsers);
      setBulkResult(res);
      setBulkStep("result");
      showAlertSuccess(
        "Impor Massal Berhasil",
        `Berhasil mendaftarkan ${res.summary?.successCount ?? res.createdUsers?.length ?? 0} user baru ke database.`
      );
      loadUsers();
    } catch (error: any) {
      showAlertError(
        "Gagal Memproses Impor Massal",
        error.message || "Terjadi kesalahan saat memproses bulk create user."
      );
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  // Handle Form Submit (Create / Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showAlertWarning("Validasi Gagal", "Nama depan dan nama belakang wajib diisi.");
      return;
    }

    if (!formData.nrp) {
      showAlertWarning("Validasi Gagal", "NRP (Nomor Registrasi Pokok) wajib diisi.");
      return;
    }

    if (modalMode === "create" && !formData.password) {
      showAlertWarning("Validasi Gagal", "Password wajib diisi untuk pendaftaran user baru.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === "create") {
        const res = await createUser({
          ...formData,
          nrp: Number(formData.nrp),
        });
        showAlertSuccess(
          "User Berhasil Ditambahkan",
          `Akun untuk ${res.data.firstName} ${res.data.lastName} (NRP: ${res.data.nrp}) berhasil didaftarkan.`
        );
      } else if (modalMode === "edit" && selectedUser) {
        const updatePayload: UserUpdateInput = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          nrp: Number(formData.nrp),
          department: formData.department,
          posision: formData.posision,
          phoneNumber: formData.phoneNumber || undefined,
          email: formData.email || undefined,
          role: formData.role,
        };

        if (formData.password && formData.password.trim() !== "") {
          updatePayload.password = formData.password.trim();
        }

        const res = await updateUser(selectedUser.id, updatePayload);
        showAlertSuccess(
          "User Berhasil Diperbarui",
          `Data akun ${res.data.firstName} ${res.data.lastName} telah diperbarui.`
        );
      }

      setIsModalOpen(false);
      loadUsers();
    } catch (error: any) {
      showAlertError(
        modalMode === "create" ? "Gagal Menambahkan User" : "Gagal Memperbarui User",
        error.message || "Terjadi kesalahan saat memproses data user."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;

    setIsResetting(true);
    try {
      const res = await resetUserPassword(resetTargetUser.id, newPassword);
      showAlertSuccess(
        "Reset Password Berhasil",
        res.message || `Password untuk ${resetTargetUser.firstName} telah direset.`
      );
      setIsResetModalOpen(false);
    } catch (error: any) {
      showAlertError(
        "Gagal Mereset Password",
        error.message || "Terjadi kesalahan saat mereset password."
      );
    } finally {
      setIsResetting(false);
    }
  };

  // Handle Delete Submit (Modal fallback)
  const handleDeleteSubmit = async () => {
    if (!deleteTargetUser) return;

    setIsDeleting(true);
    try {
      const res = await deleteUser(deleteTargetUser.id);
      showAlertSuccess(
        "User Berhasil Dihapus",
        res.message || `Akun ${deleteTargetUser.firstName} telah dihapus dari sistem.`
      );
      setIsDeleteModalOpen(false);
      loadUsers();
    } catch (error: any) {
      showAlertError(
        "Gagal Menghapus User",
        error.message || "Terjadi kesalahan saat menghapus user."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(newPassword);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Role Badge Helper
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "SUPERADMIN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Superadmin
          </span>
        );
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Administrator
          </span>
        );
      case "USER":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <UserIcon className="w-3.5 h-3.5 text-sky-400" />
            User / Operator
          </span>
        );
    }
  };

  // Department Badge Helper
  const getDepartmentLabel = (dept: UserDepartment) => {
    const found = USER_DEPARTMENTS.find((d) => d.value === dept);
    return found ? found.label : dept;
  };

  // Position Badge Helper
  const getPositionLabel = (pos: UserPosition) => {
    const found = USER_POSITIONS.find((p) => p.value === pos);
    return found ? found.label : pos;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Alert Notification */}
      {alert && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
            alert.type === "success"
              ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-200"
              : "bg-rose-950/40 border-rose-800/80 text-rose-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {alert.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-semibold text-sm">{alert.title}</h4>
              <p className="text-xs opacity-90 mt-0.5">{alert.message}</p>
            </div>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Manajemen Pengguna & Akun
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Kelola data akun personel operasional, hak akses role, departemen, serta impor massal data user
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadUsers}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-500" : ""}`} />
          </button>

          {/* Download Template Quick Action */}
          <button
            onClick={downloadUserCsvTemplate}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition-all cursor-pointer shadow-sm"
            title="Unduh Template Format CSV"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Template CSV</span>
          </button>

          {/* Bulk Create Button */}
          <button
            onClick={handleOpenBulk}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 hover:text-amber-300 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Impor Bulk User</span>
          </button>

          {/* Single Create User Button */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah User Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Users */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Pengguna</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {isLoading ? "-" : stats.total}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Akun terdaftar di sistem</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all" />
        </div>

        {/* Operator & Drivers */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Driver & Operator</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {isLoading ? "-" : stats.operatorsAndDrivers}
            </div>
            <span className="text-[11px] text-emerald-400/90 mt-1 block">Personel operasional unit</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
        </div>

        {/* Supervisors & Management */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pengawas / Supervisor</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {isLoading ? "-" : stats.supervisors}
            </div>
            <span className="text-[11px] text-sky-400/90 mt-1 block">Supervisor, Supt & PM</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/10 transition-all" />
        </div>

        {/* Administrators */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Admin & Superadmin</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {isLoading ? "-" : stats.admins}
            </div>
            <span className="text-[11px] text-purple-400/90 mt-1 block">Pengelola data & sistem</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all" />
        </div>
      </div>

      {/* Search & Multi-Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Nama, NRP, Email, No HP..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="" className="bg-slate-950">Semua Hak Akses (Role)</option>
              {USER_ROLES.map((r) => (
                <option key={r.value} value={r.value} className="bg-slate-950">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer truncate"
            >
              <option value="" className="bg-slate-950">Semua Departemen</option>
              {USER_DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value} className="bg-slate-950">
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions: Submit & Reset */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/10"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>

            {(search || roleFilter || deptFilter || posFilter) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                title="Reset Filter"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Users Data Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Pengguna / Karyawan</th>
                <th className="py-3.5 px-4">Hak Akses (Role)</th>
                <th className="py-3.5 px-4">Departemen & Posisi</th>
                <th className="py-3.5 px-4">Kontak Person</th>
                <th className="py-3.5 px-4 text-center">Pemeriksaan P2H</th>
                <th className="py-3.5 px-4">Terdaftar</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
                      <span className="font-medium">Memuat data pengguna...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="p-3 rounded-2xl bg-slate-800/80 text-slate-400">
                        <Users className="w-8 h-8 opacity-60" />
                      </div>
                      <h3 className="text-white font-bold text-sm mt-2">Tidak Ada Data Pengguna</h3>
                      <p className="text-xs text-slate-400">
                        Tidak ditemukan pengguna yang sesuai dengan filter atau kata kunci pencarian.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-3 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-850/40 transition-colors group"
                  >
                    {/* User Identity */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-amber-500/20 to-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0 shadow-inner">
                          {user.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                            <span>{user.firstName} {user.lastName}</span>
                            {currentUser?.id === user.id && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-medium border border-amber-500/30">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <span>NRP:</span>
                            <span className="font-mono font-semibold text-slate-300">{user.nrp}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      {getRoleBadge(user.role)}
                    </td>

                    {/* Department & Position */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-45">{getDepartmentLabel(user.department)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Briefcase className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
                          <span className="truncate max-w-45">{getPositionLabel(user.posision)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1 text-slate-300">
                        {user.phoneNumber ? (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{user.phoneNumber}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 block">-</span>
                        )}
                        {user.email ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Mail className="w-3 h-3 text-sky-400 shrink-0" />
                            <span className="truncate max-w-40">{user.email}</span>
                          </div>
                        ) : null}
                      </div>
                    </td>

                    {/* P2H Inspections Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                        {user._count?.p2hInspections || 0} form
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(user.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Reset Password Button */}
                        <button
                          onClick={() => handleOpenReset(user)}
                          className="p-2 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-300 text-slate-400 transition-colors border border-slate-700/60 cursor-pointer"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-2 rounded-xl bg-slate-800/80 hover:bg-sky-500/20 hover:text-sky-300 text-slate-400 transition-colors border border-slate-700/60 cursor-pointer"
                          title="Edit Data User"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleOpenDelete(user)}
                          disabled={currentUser?.id === user.id}
                          className={`p-2 rounded-xl transition-colors border cursor-pointer ${
                            currentUser?.id === user.id
                              ? "bg-slate-900 border-slate-800 text-slate-400 cursor-not-allowed opacity-40"
                              : "bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 border-slate-700/60"
                          }`}
                          title={currentUser?.id === user.id ? "Tidak dapat menghapus akun sendiri" : "Hapus User"}
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

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>Menampilkan <strong className="text-white">{users.length}</strong> pengguna</span>
          <span>Sistem Otorisasi Multi-Role Batara P2H</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: BULK CREATE / IMPOR MASSAL USER */}
      {/* ========================================================================= */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Impor Massal Pengguna (Bulk Create)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Daftarkan banyak akun operator, driver, atau staf sekaligus menggunakan file CSV
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  bulkStep === "input" ? "bg-amber-500 text-slate-950 font-extrabold" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}>
                  1
                </div>
                <span className={bulkStep === "input" ? "text-amber-400 font-semibold" : "text-slate-400"}>
                  Pilih / Unggah File
                </span>
              </div>

              <div className="w-8 h-px bg-slate-800" />

              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  bulkStep === "preview" ? "bg-amber-500 text-slate-950 font-extrabold" : bulkStep === "result" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
                }`}>
                  2
                </div>
                <span className={bulkStep === "preview" ? "text-amber-400 font-semibold" : "text-slate-400"}>
                  Pratinjau Data ({parsedBulkUsers.length})
                </span>
              </div>

              <div className="w-8 h-px bg-slate-800" />

              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  bulkStep === "result" ? "bg-emerald-500 text-slate-950 font-extrabold" : "bg-slate-800 text-slate-400"
                }`}>
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
                            <span>Template Resmi Impor Pengguna</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                              Format .CSV
                            </span>
                          </h4>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Gunakan template ini untuk mengisi data akun karyawan, driver, operator, atau admin.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const sampleText = `firstName,lastName,nrp,password,department,position,role,phoneNumber,email\nAhmad,Subagyo,8021001,Batara@123,OPERATIONS,OPERATOR,USER,081234567890,ahmad.subagyo@batara.co.id\nBambang,Kurniawan,8021002,Batara@123,OPERATIONS,DRIVER,USER,081298765432,bambang.kurniawan@batara.co.id\nDedi,Pratama,8021003,Batara@123,PLANT,MECHANIC,USER,081377889900,dedi.pratama@batara.co.id\nEko,Sulistyo,8021004,Batara@123,OPERATIONS,SITE_SUPERVISOR,ADMIN,081155667788,eko.sulistyo@batara.co.id`;
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
                          onClick={downloadUserCsvTemplate}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/10 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh File Template (.csv)</span>
                        </button>
                      </div>
                    </div>

                    {/* Collapsible/Structured Table of Columns */}
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/80">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                          <tr>
                            <th className="py-2 px-3">Kolom (Header)</th>
                            <th className="py-2 px-2.5 text-center">Status</th>
                            <th className="py-2 px-3">Penjelasan & Nilai yang Valid</th>
                            <th className="py-2 px-3">Contoh</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-[11px]">
                          <tr>
                            <td className="py-2 px-3 font-mono font-bold text-amber-400">firstName</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold text-[10px]">Wajib</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">Nama depan karyawan / personel</td>
                            <td className="py-2 px-3 font-mono text-slate-400">Ahmad</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono font-bold text-amber-400">lastName</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold text-[10px]">Wajib</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">Nama belakang karyawan / marga</td>
                            <td className="py-2 px-3 font-mono text-slate-400">Subagyo</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono font-bold text-amber-400">nrp</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold text-[10px]">Wajib</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">Nomor Registrasi Pokok unik (hanya angka)</td>
                            <td className="py-2 px-3 font-mono text-slate-400">8021001</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono text-slate-300">password</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium text-[10px]">Opsional</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">Kata sandi login (Otomatis default <code className="text-amber-400 font-mono">Batara@123</code> jika kosong)</td>
                            <td className="py-2 px-3 font-mono text-slate-400">Batara@123</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono text-slate-300">department</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium text-[10px]">Opsional</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              <span className="text-slate-400">Pilihan:</span> <code className="text-sky-300 font-mono">OPERATIONS</code>, <code className="text-sky-300 font-mono">PLANT</code>, <code className="text-sky-300 font-mono">LOGISTIC</code>, <code className="text-sky-300 font-mono">HSE</code>, <code className="text-sky-300 font-mono">HRGA</code>, <code className="text-sky-300 font-mono">PRODUCTION_AND_ENGINEERING</code>
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-400">OPERATIONS</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono text-slate-300">position</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium text-[10px]">Opsional</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              <span className="text-slate-400">Pilihan:</span> <code className="text-amber-300 font-mono">OPERATOR</code>, <code className="text-amber-300 font-mono">DRIVER</code>, <code className="text-amber-300 font-mono">MECHANIC</code>, <code className="text-amber-300 font-mono">ELECTRICIAN</code>, <code className="text-amber-300 font-mono">TYREMAN</code>, <code className="text-amber-300 font-mono">ADMIN</code>, <code className="text-amber-300 font-mono">SITE_SUPERVISOR</code>, <code className="text-amber-300 font-mono">SITE_SUPERINTENDENT</code>, <code className="text-amber-300 font-mono">SITE_MANAGER</code>
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-400">OPERATOR</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono text-slate-300">role</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium text-[10px]">Opsional</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">
                              <span className="text-slate-400">Pilihan:</span> <code className="text-emerald-300 font-mono">USER</code> (operator/driver), <code className="text-amber-300 font-mono">ADMIN</code>, <code className="text-rose-300 font-mono">SUPERADMIN</code>
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-400">USER</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono text-slate-300">phoneNumber</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium text-[10px]">Opsional</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">Nomor WhatsApp / handphone aktif</td>
                            <td className="py-2 px-3 font-mono text-slate-400">081234567890</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-mono text-slate-300">email</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium text-[10px]">Opsional</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">Alamat email karyawan</td>
                            <td className="py-2 px-3 font-mono text-slate-400">ahmad@batara.co.id</td>
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
                          setCsvText(`firstName,lastName,nrp,password,department,position,role,phoneNumber,email\nAhmad,Subagyo,8021001,Batara@123,OPERATIONS,OPERATOR,USER,081234567890,ahmad.subagyo@batara.co.id\nBambang,Kurniawan,8021002,Batara@123,OPERATIONS,DRIVER,USER,081298765432,bambang.kurniawan@batara.co.id\nDedi,Pratama,8021003,Batara@123,PLANT,MECHANIC,USER,081377889900,dedi.pratama@batara.co.id\nEko,Sulistyo,8021004,Batara@123,OPERATIONS,SITE_SUPERVISOR,ADMIN,081155667788,eko.sulistyo@batara.co.id`);
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
                      <h4 className="text-sm font-bold text-white">Tarik & Lepas File CSV di sini</h4>
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
                          Editor Teks CSV (Dapat diedit langsung)
                        </label>
                        <button
                          type="button"
                          onClick={() => setCsvText(`firstName,lastName,nrp,password,department,position,role,phoneNumber,email\nAhmad,Subagyo,8021001,Batara@123,OPERATIONS,OPERATOR,USER,081234567890,ahmad.subagyo@batara.co.id\nBambang,Kurniawan,8021002,Batara@123,OPERATIONS,DRIVER,USER,081298765432,bambang.kurniawan@batara.co.id\nDedi,Pratama,8021003,Batara@123,PLANT,MECHANIC,USER,081377889900,dedi.pratama@batara.co.id\nEko,Sulistyo,8021004,Batara@123,OPERATIONS,SITE_SUPERVISOR,ADMIN,081155667788,eko.sulistyo@batara.co.id`)}
                          className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                        >
                          Muat Ulang Contoh Data
                        </button>
                      </div>
                      <textarea
                        rows={8}
                        value={csvText}
                        onChange={(e) => setCsvText(e.target.value)}
                        placeholder={`firstName,lastName,nrp,password,department,position,role,phoneNumber,email\nAhmad,Subagyo,8021001,Batara@123,OPERATIONS,OPERATOR,USER,081234567890,ahmad@batara.co.id`}
                        className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
                      />
                      <button
                        type="button"
                        onClick={() => processCsvText(csvText)}
                        disabled={!csvText.trim()}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-amber-500/10"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Validasi & Lanjut ke Pratinjau Data</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: PREVIEW DATA */}
              {bulkStep === "preview" && (
                <div className="space-y-4">
                  {/* Summary Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Total Baris Siap Diimpor:</span>
                      <span className="font-mono font-bold text-amber-400 text-sm">{parsedBulkUsers.length} User</span>
                    </div>

                    {bulkParseErrors.length > 0 && (
                      <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{bulkParseErrors.length} baris tidak valid dilewati</span>
                      </div>
                    )}
                  </div>

                  {/* Errors Notice if any */}
                  {bulkParseErrors.length > 0 && (
                    <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/60 text-xs text-rose-300 space-y-1 max-h-24 overflow-y-auto">
                      <strong className="block font-bold">Catatan Baris Dilewati:</strong>
                      {bulkParseErrors.map((err, idx) => (
                        <div key={idx} className="text-[11px] opacity-90">&bull; {err}</div>
                      ))}
                    </div>
                  )}

                  {/* Preview Table */}
                  <div className="border border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                        <tr>
                          <th className="py-2.5 px-3">No</th>
                          <th className="py-2.5 px-3">Nama Lengkap</th>
                          <th className="py-2.5 px-3">NRP</th>
                          <th className="py-2.5 px-3">Departemen</th>
                          <th className="py-2.5 px-3">Posisi</th>
                          <th className="py-2.5 px-3">Role</th>
                          <th className="py-2.5 px-3">Kontak / Email</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {parsedBulkUsers.map((user, idx) => (
                          <tr key={idx} className="hover:bg-slate-850/40">
                            <td className="py-2 px-3 text-slate-500 font-mono">{idx + 1}</td>
                            <td className="py-2 px-3 font-semibold text-white">
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="py-2 px-3 font-mono text-amber-400 font-semibold">{user.nrp}</td>
                            <td className="py-2 px-3 text-slate-300">{user.department}</td>
                            <td className="py-2 px-3 text-slate-300">{user.posision}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                {user.role || "USER"}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-400 text-[11px]">
                              {user.phoneNumber || user.email || "-"}
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
                  {/* Results Banner */}
                  <div className={`p-5 rounded-3xl border text-center space-y-2 ${
                    bulkResult.summary.failedCount === 0
                      ? "bg-emerald-950/30 border-emerald-800/80 text-emerald-200"
                      : "bg-amber-950/30 border-amber-800/80 text-amber-200"
                  }`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                      bulkResult.summary.failedCount === 0
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}>
                      {bulkResult.summary.failedCount === 0 ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                    </div>

                    <h4 className="text-base font-bold text-white">
                      {bulkResult.summary.failedCount === 0
                        ? "Seluruh User Berhasil Didaftarkan!"
                        : "Proses Impor Selesai dengan Beberapa Catatan"}
                    </h4>
                    <p className="text-xs opacity-90 max-w-md mx-auto">{bulkResult.message}</p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 pt-3 max-w-sm mx-auto">
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Total Diproses</span>
                        <strong className="text-sm text-white font-mono">{bulkResult.summary.totalProcessed}</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-emerald-400 block">Berhasil</span>
                        <strong className="text-sm text-emerald-400 font-mono">{bulkResult.summary.successCount}</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-rose-400 block">Gagal/Skip</span>
                        <strong className="text-sm text-rose-400 font-mono">{bulkResult.summary.failedCount}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Failed Rows Detail if any */}
                  {bulkResult.errors && bulkResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        Rincian Baris yang Gagal / Dilewati ({bulkResult.errors.length}):
                      </h4>
                      <div className="border border-rose-900/40 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-rose-950/40 text-[11px] font-bold uppercase text-rose-300">
                            <tr>
                              <th className="py-2 px-3">Baris</th>
                              <th className="py-2 px-3">NRP</th>
                              <th className="py-2 px-3">Nama</th>
                              <th className="py-2 px-3">Alasan Gagal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-rose-900/20 text-rose-200">
                            {bulkResult.errors.map((err, idx) => (
                              <tr key={idx} className="hover:bg-rose-950/20">
                                <td className="py-2 px-3 font-mono font-bold">{err.row}</td>
                                <td className="py-2 px-3 font-mono">{err.nrp || "-"}</td>
                                <td className="py-2 px-3 font-semibold">{err.name || "-"}</td>
                                <td className="py-2 px-3 text-rose-300">{err.reason}</td>
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

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-slate-950/50">
              {bulkStep === "preview" ? (
                <button
                  type="button"
                  onClick={() => setBulkStep("input")}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {bulkStep === "result" ? "Selesai & Tutup" : "Batal"}
                </button>

                {bulkStep === "preview" && (
                  <button
                    type="button"
                    onClick={handleBulkSubmit}
                    disabled={isBulkSubmitting || parsedBulkUsers.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isBulkSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mendaftarkan {parsedBulkUsers.length} User...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Daftarkan Semua ({parsedBulkUsers.length} User)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT USER */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  {modalMode === "create" ? <UserPlus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {modalMode === "create" ? "Pendaftaran User Baru" : "Edit Data Pengguna"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {modalMode === "create"
                      ? "Isi informasi akun karyawan untuk memberikan akses ke portal P2H"
                      : `Perbarui profil atau hak akses untuk ${selectedUser?.firstName} ${selectedUser?.lastName}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Section 1: Identitas Nama & NRP */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" />
                  Identitas Karyawan
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nama Depan <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Contoh: Budi"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nama Belakang <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Contoh: Santoso"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    NRP (Nomor Registrasi Pokok) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.nrp || ""}
                    onChange={(e) => setFormData({ ...formData, nrp: e.target.value ? Number(e.target.value) : ("" as any) })}
                    placeholder="Contoh: 8021004"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Section 2: Departemen & Posisi */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Penempatan Kerja
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Departemen <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value as UserDepartment })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      {USER_DEPARTMENTS.map((d) => (
                        <option key={d.value} value={d.value} className="bg-slate-950">
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Posisi / Jabatan <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={formData.posision}
                      onChange={(e) => setFormData({ ...formData, posision: e.target.value as UserPosition })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      {USER_POSITIONS.map((p) => (
                        <option key={p.value} value={p.value} className="bg-slate-950">
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Hak Akses Role */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Hak Akses (Role)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {USER_ROLES.map((r) => {
                    const isSelected = formData.role === r.value;
                    return (
                      <button
                        type="button"
                        key={r.value}
                        onClick={() => setFormData({ ...formData, role: r.value })}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500/50 text-white shadow-md shadow-amber-500/10"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${isSelected ? "text-amber-400" : ""}`}>
                            {r.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                          {r.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Kontak Person */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Kontak Person
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formData.phoneNumber || ""}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="Contoh: 08123456789"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Akun
                    </label>
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Contoh: budi.santoso@batara.co.id"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Password */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    Kata Sandi (Password)
                  </h4>
                  {modalMode === "edit" && (
                    <span className="text-[11px] text-slate-400">Opsional jika tidak diganti</span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={modalMode === "create"}
                    value={formData.password || ""}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={modalMode === "create" ? "Masukkan kata sandi akun" : "Biarkan kosong jika tidak diubah"}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{modalMode === "create" ? "Daftarkan User" : "Simpan Perubahan"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESET PASSWORD */}
      {/* ========================================================================= */}
      {isResetModalOpen && resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reset Password Pengguna</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Atur kata sandi baru untuk akses akun</p>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-5 space-y-4">
              {/* Target User Info */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 font-bold text-sm flex items-center justify-center shrink-0">
                  {resetTargetUser.firstName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {resetTargetUser.firstName} {resetTargetUser.lastName}
                  </h4>
                  <div className="text-[11px] text-slate-400">
                    NRP: <span className="font-mono text-slate-300">{resetTargetUser.nrp}</span> &bull; {resetTargetUser.role}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Kata Sandi Baru <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Contoh: Batara@123"
                    className="w-full pl-3.5 pr-20 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Salin Password"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title={showNewPassword ? "Sembunyikan" : "Tampilkan"}
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Password default: <strong className="text-amber-400 font-mono">Batara@123</strong>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-amber-500/10"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mereset...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: HAPUS USER */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && deleteTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Hapus Akun Pengguna?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Apakah Anda yakin ingin menghapus akun{" "}
                <strong className="text-white">
                  {deleteTargetUser.firstName} {deleteTargetUser.lastName}
                </strong>{" "}
                (NRP: <span className="font-mono text-amber-400">{deleteTargetUser.nrp}</span>)?
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Departemen:</span>
                <span className="font-semibold text-slate-200">{getDepartmentLabel(deleteTargetUser.department)}</span>
              </div>
              <div className="flex justify-between">
                <span>Posisi:</span>
                <span className="font-semibold text-slate-200">{getPositionLabel(deleteTargetUser.posision)}</span>
              </div>
              <div className="flex justify-between">
                <span>Hak Akses:</span>
                <span className="font-semibold text-amber-400">{deleteTargetUser.role}</span>
              </div>
            </div>

            <p className="text-[11px] text-rose-400/90 font-medium">
              Tindakan ini permanen dan akan menghapus akses login pengguna ke seluruh sistem Batara P2H.
            </p>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Akun</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
