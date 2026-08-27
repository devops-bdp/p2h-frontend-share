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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-100 h-80 bg-amber-600/10 blur-3xl rounded-full pointer-events-none" />

      {/* Top Header Navigation */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Main Login Card Container */}
      <div className="w-full max-w-md mx-auto px-4 py-8 relative z-10 flex-1 flex flex-col justify-center">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl">
          {/* Logo & Brand Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-linear-to-tr from-amber-500 via-amber-400 to-yellow-300 items-center justify-center shadow-lg shadow-amber-500/25">
              <Truck className="w-7 h-7 text-slate-950" strokeWidth={2.5} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                BATARA MP <span className="text-amber-500">P2H PORTAL</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Portal Pelaksanaan Pemeriksaan Harian Alat &amp; Unit
              </p>
            </div>
          </div>

          {/* ================= ALERT NOTIFICATION ================= */}
          {alert && (
            <div
              className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
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

          {/* ================= LOGIN FORM ================= */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors disabled:opacity-50"
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
                  Password
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
                  placeholder="Masukkan password akun"
                  disabled={isLoading}
                  className="w-full pl-10 pr-11 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors disabled:opacity-50"
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
              className="w-full mt-2 py-3.5 px-4 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" strokeWidth={2.5} />
                  <span>Masuk ke Portal P2H</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          {/* Quick Help / Footer Badge */}
          <div className="mt-8 pt-6 border-t border-slate-850 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
            <HardHat className="w-3.5 h-3.5 text-amber-500/70" />
            <span>Safety First &bull; PT Batara Mining</span>
          </div>
        </div>
      </div>

      {/* Page Bottom Copyright */}
      <div className="w-full text-center py-6 text-xs text-slate-600 relative z-10">
        &copy; {new Date().getFullYear()} PT Batara Mining. Hak cipta dilindungi.
      </div>
    </div>
  );
}
