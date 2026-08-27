"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Settings,
  User,
  ShieldCheck,
  KeyRound,
  Lock,
  Globe,
  QrCode,
  Copy,
  Check,
  Save,
  Building2,
  Phone,
  Mail,
  Clock,
  Wrench,
  AlertTriangle,
  Database,
  RefreshCw,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Sparkles,
  Layers,
  FileCheck,
  ShieldAlert,
  Loader2,
  X,
  Truck,
  Eye,
  EyeOff,
  Cpu,
  Droplets,
  Zap,
  Wind,
} from "lucide-react";
import { getAuthSession } from "@/services/auth.service";
import {
  fetchCurrentProfile,
  updateCurrentProfile,
  changeUserPassword,
  getLocalSystemConfig,
  saveLocalSystemConfig,
  SystemConfig,
  DEFAULT_SYSTEM_CONFIG,
} from "@/services/settings.service";
import {
  showAlertSuccess,
  showAlertError,
  showAlertWarning,
  showConfirmDialog,
  showToast,
} from "@/lib/swal";
import { fetchP2HStats } from "@/services/p2h.service";
import { fetchDefectStats } from "@/services/defect.service";
import { fetchUnits } from "@/services/unit.service";

type SettingsTab = "profile" | "p2h_access" | "operational" | "company" | "system";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  // Profile Form States
  const [userProfile, setUserProfile] = useState<any>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [nrp, setNrp] = useState<string>("");
  const [department, setDepartment] = useState<string>("PLANT");
  const [position, setPosition] = useState<string>("ADMIN");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // Password Form States
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  // System Config States
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);
  const [showToken, setShowToken] = useState<boolean>(false);

  // System Health Metrics
  const [serverStatus, setServerStatus] = useState<"CONNECTED" | "ERROR" | "CHECKING">("CHECKING");
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [totalP2H, setTotalP2H] = useState<number>(0);
  const [totalDefects, setTotalDefects] = useState<number>(0);

  // Alert Banner
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    setIsLoading(true);
    const loadedConfig = getLocalSystemConfig();
    setConfig(loadedConfig);

    try {
      // 1. Load User Profile
      const session = getAuthSession();
      if (session.user) {
        setUserProfile(session.user);
        setFirstName(session.user.firstName || "");
        setLastName(session.user.lastName || "");
        setNrp(String(session.user.nrp || ""));
        setDepartment(session.user.department || "PLANT");
        setPosition(session.user.posision || "ADMIN");
        setPhoneNumber(session.user.phoneNumber || "");
        setEmail(session.user.email || "");
      }

      // Try fetching fresh profile from API
      try {
        const profileRes = await fetchCurrentProfile();
        if (profileRes.success && profileRes.user) {
          const u = profileRes.user;
          setUserProfile(u);
          setFirstName(u.firstName || "");
          setLastName(u.lastName || "");
          setNrp(String(u.nrp || ""));
          setDepartment(u.department || "PLANT");
          setPosition(u.posision || "ADMIN");
          setPhoneNumber(u.phoneNumber || "");
          setEmail(u.email || "");
        }
      } catch (err) {
        console.warn("Using session profile fallback");
      }

      // 2. Load System Health Metrics
      const [unitsRes, p2hStatsRes, defectStatsRes] = await Promise.all([
        fetchUnits().catch(() => ({ success: false, data: [] })),
        fetchP2HStats().catch(() => ({ success: false, data: { totalAll: 0 } })),
        fetchDefectStats().catch(() => ({ success: false, data: { totalDefects: 0 } })),
      ]);

      if (unitsRes.data) setTotalUnits(unitsRes.data.length);
      if (p2hStatsRes.data) setTotalP2H(p2hStatsRes.data.totalAll || 0);
      if (defectStatsRes.data) setTotalDefects(defectStatsRes.data.totalDefects || 0);

      setServerStatus("CONNECTED");
    } catch (err: any) {
      setServerStatus("ERROR");
      console.error("Gagal memuat pengaturan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy Helpers
  const handleCopyToken = () => {
    navigator.clipboard.writeText(config.p2hToken);
    setCopiedToken(true);
    showToast("Master Token P2H berhasil disalin", "success");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyUrl = () => {
    const portalUrl = typeof window !== "undefined" ? `${window.location.origin}/p2h` : "http://localhost:3000/p2h";
    navigator.clipboard.writeText(portalUrl);
    setCopiedUrl(true);
    showToast("Link Portal P2H berhasil disalin", "success");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Submit Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setIsSaving(true);
    setAlert(null);

    try {
      const res = await updateCurrentProfile(userProfile.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        department,
        posision: position,
        phoneNumber: phoneNumber.trim() || undefined,
        email: email.trim() || undefined,
      });

      if (res.success) {
        showAlertSuccess(
          "Profil Berhasil Disimpan",
          "Perubahan informasi akun Anda telah berhasil diperbarui."
        );
        loadSettingsData();
      }
    } catch (err: any) {
      showAlertError(
        "Gagal Menyimpan Profil",
        err.message || "Terjadi kesalahan saat memperbarui profil."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    if (!newPassword || newPassword.length < 6) {
      showAlertWarning(
        "Password Kurang Panjang",
        "Kata sandi baru minimal harus terdiri dari 6 karakter."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlertWarning(
        "Konfirmasi Password Tidak Cocok",
        "Konfirmasi kata sandi tidak cocok dengan kata sandi baru."
      );
      return;
    }

    const isConfirmed = await showConfirmDialog({
      title: "Ganti Kata Sandi?",
      text: "Anda akan diminta menggunakan kata sandi baru untuk login sesi berikutnya.",
      confirmButtonText: "Ya, Ganti Password",
    });
    if (!isConfirmed) return;

    setIsChangingPassword(true);
    setAlert(null);

    try {
      const res = await changeUserPassword(userProfile.id, {
        password: newPassword,
      });

      if (res.success) {
        showAlertSuccess(
          "Kata Sandi Berhasil Diubah",
          "Kata sandi akun Anda telah berhasil diganti. Gunakan password baru saat login berikutnya."
        );
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      showAlertError(
        "Gagal Mengubah Kata Sandi",
        err.message || "Terjadi kesalahan saat mengubah password."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Save Operational & Company Config
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveLocalSystemConfig(config);
    showToast("Parameter operasional berhasil disimpan", "success");
    showAlertSuccess(
      "Konfigurasi Disimpan",
      "Parameter operasional dan kebijakan armada tambang telah diperbarui."
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ================= TOP HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>PENGATURAN SISTEM &amp; PREFERENSI</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  CONFIG
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Kelola profil pengguna, parameter operasional P2H, token akses publik, dan diagnostik sistem.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSettingsData}
            disabled={isLoading}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
            <span>Segarkan</span>
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

      {/* ================= TABS NAVIGATION ================= */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        {[
          { id: "profile", label: "Profil Akun & Keamanan", icon: User },
          { id: "p2h_access", label: "Portal P2H & Token Publik", icon: KeyRound },
          { id: "operational", label: "Parameter Operasional & K3", icon: Sliders },
          { id: "company", label: "Info Perusahaan & Site", icon: Building2 },
          { id: "system", label: "Diagnostik & Status Server", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as SettingsTab);
                setAlert(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: PROFIL AKUN & KEAMANAN ================= */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Identity Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 text-center shadow-xl">
              <div className="relative mx-auto w-20 h-20 rounded-3xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 text-2xl font-black shadow-lg shadow-amber-500/20">
                {firstName ? firstName[0].toUpperCase() : "U"}
                {lastName ? lastName[0].toUpperCase() : ""}
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  {firstName} {lastName}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  NRP: <strong className="text-amber-400">{nrp}</strong>
                </p>
                <div className="pt-1 flex items-center justify-center gap-2">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {userProfile?.role || "USER"}
                  </span>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Dept. {department}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-left text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Posisi Jabatan:</span>
                  <span className="font-semibold text-white">{position}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Kontak HP:</span>
                  <span className="font-semibold text-slate-200">{phoneNumber || "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-semibold text-slate-200">{email || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Forms */}
          <div className="lg:col-span-8 space-y-6">
            {/* Form Edit Data Diri */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Informasi Data Pengguna</h3>
                  <p className="text-xs text-slate-400">Perbarui informasi nama, departemen, dan kontak Anda</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300">Nama Depan *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300">Nama Belakang *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300">Departemen</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="PLANT">PLANT</option>
                      <option value="OPERATIONS">OPERATIONS</option>
                      <option value="PRODUCTION_AND_ENGINEERING">PRODUKSI &amp; ENGINEERING</option>
                      <option value="HSE">HSE</option>
                      <option value="HRGA">HRGA</option>
                      <option value="LOGISTIC">LOGISTIC</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300">Posisi Jabatan</label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Contoh: ADMIN, OPERATOR, MECHANIC"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300">Nomor HP / WhatsApp</label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300">Alamat Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Contoh: user@bataramining.com"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 disabled:opacity-60 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan Profil</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Form Ubah Password */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Ganti Kata Sandi (Password)</h3>
                  <p className="text-xs text-slate-400">Pastikan menggunakan kombinasi kata sandi yang aman</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300">Kata Sandi Baru *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter..."
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300">Konfirmasi Kata Sandi Baru *</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi baru..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isChangingPassword || !newPassword}
                    className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 disabled:opacity-60 cursor-pointer"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengubah Password...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Update Kata Sandi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PORTAL P2H & TOKEN PUBLIK ================= */}
      {activeTab === "p2h_access" && (
        <div className="space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Konfigurasi Akses Portal P2H Publik</h3>
                <p className="text-xs text-slate-400">
                  Pengaturan token rahasia &amp; tautan cepat pengisian P2H oleh operator/driver di site tanpa akun login
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Token Display Box */}
              <div className="p-5 rounded-3xl bg-slate-950 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>TOKEN OTORISASI PUBLIK (HEADER)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    AKTIF
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <span className="font-mono font-black text-sm text-white tracking-wider">
                    {showToken ? config.p2hToken : "•••••••••••••••••"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowToken(!showToken)}
                      className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
                      title={showToken ? "Sembunyikan Token" : "Tampilkan Token"}
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleCopyToken}
                      className="px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {copiedToken ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Token</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Token ini digunakan oleh sistem formulir publik untuk memvalidasi setiap pengiriman P2H ke backend secara aman tanpa mengharuskan pengemudi login ke dashboard.
                </p>
              </div>

              {/* Portal URL Box */}
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                    <Globe className="w-4 h-4" />
                    <span>TAUTAN PORTAL PEMILIHAN UNIT P2H</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">
                    6 KATEGORI
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-sky-300 truncate">
                    {typeof window !== "undefined" ? `${window.location.origin}/p2h` : "http://localhost:3000/p2h"}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleCopyUrl}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Link</span>
                        </>
                      )}
                    </button>

                    <Link
                      href="/p2h"
                      target="_blank"
                      className="p-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 cursor-pointer"
                      title="Buka Portal P2H di Tab Baru"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Bagikan tautan ini kepada seluruh operator &amp; driver tambang atau cetak dalam bentuk QR Code untuk dipasang pada stiker kabin kendaraan.
                </p>
              </div>
            </div>

            {/* Category-Specific Access Tokens & Direct QR Links */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 text-xs">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Daftar Token Akses Publik Khusus Tiap Kategori Armada (6 Kategori)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Setiap kategori kendaraan memiliki token autentikasi tersendiri untuk keamanan dan isolasi pengisian form.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[
                  {
                    category: "LIGHT_VECHICLE",
                    code: "P2H-LV",
                    name: "Light Vehicle (LV)",
                    token: "#BATARALV2026",
                    icon: Truck,
                    theme: "border-sky-500/30 text-sky-400 bg-sky-500/10",
                    badge: "bg-sky-500/20 text-sky-300",
                    link: "/p2h/form?category=LIGHT_VECHICLE",
                  },
                  {
                    category: "TELEHENDLER",
                    code: "P2H-TH",
                    name: "Telehandler",
                    token: "#BATARATH2026",
                    icon: Wrench,
                    theme: "border-amber-500/30 text-amber-400 bg-amber-500/10",
                    badge: "bg-amber-500/20 text-amber-300",
                    link: "/p2h/form?category=TELEHENDLER",
                  },
                  {
                    category: "STORING_TRUCK",
                    code: "P2H-ST",
                    name: "Storing Truck",
                    token: "#BATARAST2026",
                    icon: Truck,
                    theme: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
                    badge: "bg-emerald-500/20 text-emerald-300",
                    link: "/p2h/form?category=STORING_TRUCK",
                  },
                  {
                    category: "FUEL_TRUCK",
                    code: "P2H-FT",
                    name: "Fuel Truck",
                    token: "#BATARAFT2026",
                    icon: Droplets,
                    theme: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
                    badge: "bg-cyan-500/20 text-cyan-300",
                    link: "/p2h/form?category=FUEL_TRUCK",
                  },
                  {
                    category: "GENSET",
                    code: "P2H-GS",
                    name: "Genset (Generator Set)",
                    token: "#BATARAGS2026",
                    icon: Zap,
                    theme: "border-yellow-500/30 text-yellow-400 bg-yellow-500/10",
                    badge: "bg-yellow-500/20 text-yellow-300",
                    link: "/p2h/form?category=GENSET",
                  },
                  {
                    category: "COMPRESSOR",
                    code: "P2H-CP",
                    name: "Kompresor (Compressor)",
                    token: "#BATARACP2026",
                    icon: Wind,
                    theme: "border-teal-500/30 text-teal-400 bg-teal-500/10",
                    badge: "bg-teal-500/20 text-teal-300",
                    link: "/p2h/form?category=COMPRESSOR",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const [isCopied, setIsCopied] = [
                    copiedToken && (item as any)._justCopied,
                    () => {},
                  ];

                  return (
                    <div
                      key={item.category}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-md hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${item.theme}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-white text-xs block">
                              {item.code}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium line-clamp-1">
                              {item.name}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badge}`}>
                          AKTIF
                        </span>
                      </div>

                      {/* Token Box */}
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">
                            Token Khusus
                          </span>
                          <span className="font-mono font-black text-xs text-amber-300">
                            {item.token}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(item.token);
                            setAlert({
                              type: "success",
                              title: "Token Disalin",
                              message: `Token ${item.token} untuk ${item.name} berhasil disalin ke clipboard.`,
                            });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </button>
                      </div>

                      {/* Direct Action */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const fullUrl = `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}${item.link}`;
                            navigator.clipboard.writeText(fullUrl);
                            setAlert({
                              type: "success",
                              title: "Tautan Langsung Disalin",
                              message: `Tautan formulir ${item.name} berhasil disalin.`,
                            });
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold text-center flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Salin Link Form</span>
                        </button>

                        <Link
                          href={item.link}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-300 transition-colors"
                          title="Buka Formulir di Tab Baru"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PARAMETER OPERASIONAL & K3 ================= */}
      {activeTab === "operational" && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Parameter Operasional &amp; Kebijakan K3</h3>
                <p className="text-slate-400">Aturan jam shift kerja, ambang batas servis berkala, dan otomatisasi armada</p>
              </div>
            </div>

            {/* Shift Configurations (2 Shifts Standard: Day Shift & Night Shift) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Jadwal Standar Shift Operasional Tambang (2 Shift)</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  DAY &amp; NIGHT SHIFT
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Day Shift */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-amber-400 flex items-center gap-1.5 text-xs">
                      <span>☀️ DAY SHIFT (SIANG / PAGI)</span>
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono font-bold">
                      12 JAM
                    </span>
                  </div>
                  <input
                    type="text"
                    value={config.shifts?.dayShift || "06:00 - 18:00 WITA (Day Shift)"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        shifts: { ...config.shifts, dayShift: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="Contoh: 06:00 - 18:00 WITA"
                  />
                  <p className="text-[10px] text-slate-400">
                    Shift operasional siang hari untuk seluruh operator &amp; driver tambang.
                  </p>
                </div>

                {/* 2. Night Shift */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-sky-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-sky-400 flex items-center gap-1.5 text-xs">
                      <span>🌙 NIGHT SHIFT (MALAM)</span>
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 font-mono font-bold">
                      12 JAM
                    </span>
                  </div>
                  <input
                    type="text"
                    value={config.shifts?.nightShift || "18:00 - 06:00 WITA (Night Shift)"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        shifts: { ...config.shifts, nightShift: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Contoh: 18:00 - 06:00 WITA"
                  />
                  <p className="text-[10px] text-slate-400">
                    Shift operasional malam hari dengan pengawasan ekstra penerangan &amp; rotary lamp.
                  </p>
                </div>
              </div>
            </div>

            {/* Automation Rules */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Otomatisasi Keamanan &amp; Integritas Fleet</span>
              </h4>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-white block">
                      Auto-Deaktivasi Status Unit pada Temuan Kritis
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Otomatis ubah status unit jadi INACTIVE jika hasil P2H dinyatakan TIDAK LAYAK / TIDAK SIAP.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.autoDeactivateOnDefect}
                    onChange={(e) =>
                      setConfig({ ...config, autoDeactivateOnDefect: e.target.checked })
                    }
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer shrink-0"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-white block">
                      Wajib Hour Meter (HM) untuk Telehandler, Genset &amp; Kompresor
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Memvalidasi input HM tidak boleh kosong saat operator mengisi formulir P2H peralatan plant.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.mandatoryHourMeterForPlant}
                    onChange={(e) =>
                      setConfig({ ...config, mandatoryHourMeterForPlant: e.target.checked })
                    }
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer shrink-0"
                  />
                </div>
              </div>
            </div>

            {/* Service Intervals */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-400" />
                <span>Ambang Batas Servis Berkala (Periodic Maintenance)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <label className="font-semibold text-slate-300">Interval Servis Hour Meter (HM)</label>
                  <input
                    type="number"
                    value={config.serviceIntervalHM}
                    onChange={(e) =>
                      setConfig({ ...config, serviceIntervalHM: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Standar: Setiap 250 Jam Operasi</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <label className="font-semibold text-slate-300">Interval Servis Odometer (KM)</label>
                  <input
                    type="number"
                    value={config.serviceIntervalKM}
                    onChange={(e) =>
                      setConfig({ ...config, serviceIntervalKM: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Standar: Setiap 5.000 Kilometer</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Parameter</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ================= TAB 4: INFO PERUSAHAAN & SITE ================= */}
      {activeTab === "company" && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Informasi Perusahaan &amp; Site Proyek</h3>
                <p className="text-slate-400">Identitas konsesi pertambangan dan kontak darurat lapangan</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Nama Perusahaan / Kontraktor</label>
                <input
                  type="text"
                  value={config.companyName}
                  onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Lokasi Workshop / Pit Proyek</label>
                <input
                  type="text"
                  value={config.siteLocation}
                  onChange={(e) => setConfig({ ...config, siteLocation: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Kontak Emergency HSE (24/7)</label>
                <input
                  type="text"
                  value={config.emergencyHseContact}
                  onChange={(e) => setConfig({ ...config, emergencyHseContact: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Kontak Dispatcher Plant &amp; Maintenance</label>
                <input
                  type="text"
                  value={config.plantWorkshopContact}
                  onChange={(e) => setConfig({ ...config, plantWorkshopContact: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Info Site</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ================= TAB 5: DIAGNOSTIK & STATUS SERVER ================= */}
      {activeTab === "system" && (
        <div className="space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Diagnostik Sistem &amp; Status Database</h3>
                <p className="text-slate-400">Status koneksi backend Express, PostgreSQL Prisma, dan ringkasan data</p>
              </div>
            </div>

            {/* Server Status Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status Backend API:</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="font-bold text-white font-mono text-sm">
                  {serverStatus === "CONNECTED" ? "ONLINE (PORT 8000)" : "MEMERIKSA..."}
                </div>
                <span className="text-[10px] text-slate-500">Express.js &bull; TypeScript Server</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Database Engine:</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="font-bold text-white font-mono text-sm">
                  PostgreSQL (Prisma ORM)
                </div>
                <span className="text-[10px] text-slate-500">Supabase Cloud Database</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Versi Aplikasi:</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    v2.4.0
                  </span>
                </div>
                <div className="font-bold text-white font-mono text-sm">
                  Batara P2H Fleet System
                </div>
                <span className="text-[10px] text-slate-500">Next.js 16 &bull; Tailwind CSS</span>
              </div>
            </div>

            {/* System Metrics */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>Statistik Penyimpanan Data</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-2xl font-black text-amber-400 font-mono block">
                    {totalUnits}
                  </span>
                  <span className="text-[11px] text-slate-400">Total Unit Armada</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-2xl font-black text-sky-400 font-mono block">
                    {totalP2H}
                  </span>
                  <span className="text-[11px] text-slate-400">Total Formulir P2H</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-2xl font-black text-rose-400 font-mono block">
                    {totalDefects}
                  </span>
                  <span className="text-[11px] text-slate-400">Total Defect Tercatat</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-2xl font-black text-emerald-400 font-mono block">
                    6
                  </span>
                  <span className="text-[11px] text-slate-400">Kategori Didukung</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
