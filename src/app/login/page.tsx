"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  HardHat,
} from "lucide-react";
import { loginUser, saveAuthSession } from "@/services/auth.service";
import {
  showAlertSuccess,
  showAlertError,
  showAlertWarning,
  showToast,
} from "@/lib/swal";

export default function LoginPage() {
  const router = useRouter();

  const [nrp, setNrp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Alert State
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    // Form validation
    if (!nrp.trim()) {
      showAlertWarning("NRP Wajib Diisi", "Silakan masukkan Nomor Registrasi Pokok (NRP) akun Anda.");
      return;
    }

    if (isNaN(Number(nrp))) {
      showAlertWarning("Format NRP Tidak Valid", "NRP harus berupa angka (contoh: 12345).");
      return;
    }

    if (!password) {
      showAlertWarning("Password Wajib Diisi", "Silakan masukkan kata sandi akun Anda.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser(Number(nrp), password);

      if (response.success && response.token && response.user) {
        saveAuthSession(response.token, response.user);

        showToast(`Selamat Datang, ${response.user.firstName}!`, "success");
        showAlertSuccess(
          "Login Berhasil!",
          `Selamat datang kembali, ${response.user.firstName} ${response.user.lastName || ""} (${response.user.role}). Mengalihkan ke Dashboard...`
        );

        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      } else {
        throw new Error(response.message || "Gagal masuk ke sistem.");
      }
    } catch (error: any) {
      showAlertError(
        "Login Gagal",
        error.message ||
          "Gagal masuk. Periksa kembali NRP dan password Anda, atau pastikan server backend menyala."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row selection:bg-amber-500 selection:text-slate-950">
      {/* ================= LEFT HALF: HERO IMAGE & BRANDING (50%) ================= */}
      <div className="relative w-full lg:w-1/2 min-h-80 lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
        {/* Background Photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: "url('/login-screeen.jpeg')" }}
        />

        {/* Multi-layer Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />
        <div className="absolute inset-0 bg-linear-to-r from-slate-950/80 via-slate-950/40 to-transparent hidden lg:block" />
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />

        {/* Top Header: Back Button & Site Logo */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700/60 backdrop-blur-md transition-all group shadow-lg shadow-black/40"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200 text-amber-400" />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-slate-850 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-slate-300">Site Muara Pahu</span>
          </div>
        </div>

        {/* Bottom Card: Plant Maintenance Quote & Badges */}
        <div className="relative z-10 mt-auto pt-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide backdrop-blur-md">
            <HardHat className="w-3.5 h-3.5 text-amber-400" />
            <span>PLANT MAINTENANCE &amp; FLEET SAFETY</span>
          </div>

          <div className="space-y-2 max-w-lg">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              Keandalan Armada,{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-amber-300 to-yellow-200">
                Keselamatan Kerja Utama.
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed drop-shadow">
              Digitalisasi Pelaksanaan Pemeriksaan Harian (P2H) armada kendaraan support dan alat berat PT Batara Dharma Persada sebelum beroperasi di site tambang.
            </p>
          </div>

          {/* Feature Badges Pill */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-300">
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-700/60 backdrop-blur-md">
              ⚡ Paperless Checklist
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-700/60 backdrop-blur-md">
              🛡️ K3 Safety Compliance
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-700/60 backdrop-blur-md">
              📊 Real-Time Defect Tracking
            </span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT HALF: LOGIN FORM (50%) ================= */}
      <div className="relative w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 min-h-screen bg-slate-950 overflow-y-auto">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-500/5 blur-3xl rounded-full pointer-events-none" />

        {/* Top Header Placeholder (Alignment) */}
        <div className="hidden lg:flex justify-end items-center text-xs text-slate-500">
          <span>Portal Versi 1.0</span>
        </div>

        {/* Centered Form Wrapper */}
        <div className="w-full max-w-md mx-auto my-auto py-6 relative z-10 space-y-6">
          {/* Logo & Heading */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <img
                src="/logo-navbar-transparant1.png"
                alt="Plant Maintenance Muara Pahu Site"
                className="h-12 sm:h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-extrabold text-sm sm:text-base tracking-wide text-slate-200 uppercase">
                  Plant Maintenance
                </span>
                <span className="font-bold text-xs tracking-widest text-teal-400 uppercase">
                  Muara Pahu Site
                </span>
              </div>
            </Link>

            <div className="pt-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Masuk ke Portal P2H
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Gunakan Nomor Registrasi Pokok (NRP) dan kata sandi akun Anda untuk mengakses sistem.
              </p>
            </div>
          </div>

          {/* Alert Notification */}
          {alert && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
                alert.type === "success"
                  ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200 shadow-lg shadow-emerald-950/50"
                  : "bg-rose-950/80 border-rose-500/40 text-rose-200 shadow-lg shadow-rose-950/50"
              }`}
            >
              {alert.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}

              <div className="flex-1 text-xs">
                <div
                  className={`font-bold text-sm mb-0.5 ${
                    alert.type === "success" ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {alert.title}
                </div>
                <p className="leading-relaxed opacity-95">{alert.message}</p>
              </div>

              <button
                type="button"
                onClick={() => setAlert(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                aria-label="Tutup notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NRP Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="nrp"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
              >
                Nomor Registrasi Pokok (NRP)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="nrp"
                  type="text"
                  inputMode="numeric"
                  value={nrp}
                  onChange={(e) => setNrp(e.target.value)}
                  placeholder="Contoh: 12345"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
                >
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun"
                  disabled={isLoading}
                  className="w-full pl-10 pr-11 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-98 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" strokeWidth={2.5} />
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          {/* Quick Info / Portal Direct Link */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-850 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Ingin isi form P2H publik tanpa login?</span>
            </div>
            <Link
              href="/p2h"
              className="font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors shrink-0 ml-2"
            >
              Portal P2H &rarr;
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="w-full text-center lg:text-left py-4 text-xs text-slate-500 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} PT Batara Dharma Persada &bull; Site Muara Pahu</span>
          <div className="flex items-center gap-1 text-slate-500">
            <HardHat className="w-3.5 h-3.5 text-amber-500/70" />
            <span>Safety First</span>
          </div>
        </div>
      </div>
    </div>
  );
}
