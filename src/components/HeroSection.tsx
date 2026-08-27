import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-slate-850">
      {/* Hero Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-1.jpeg')" }}
      />
      {/* Dark gradient overlay — keeps text readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
      {/* Amber glow accent */}
      <div className="absolute top-1/3 left-1/4 w-96 h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Pelaksanaan Pemeriksaan Harian Alat & Unit</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Inspeksi Armada Tambang{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-amber-300 to-yellow-200">
                Cepat, Akurat &amp; Terintegrasi
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Platform digitalisasi P2H untuk memastikan seluruh kendaraan
              support dan alat berat <span className="text-white font-medium">PT Batara Mining</span> dalam kondisi siap operasi (ready-to-work), aman, dan terpelihara optimal sebelum memasuki area tambang.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/p2h"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-semibold text-slate-950 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Mulai P2H Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
              >
                <span>Lihat Fitur &amp; Keunggulan</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            {/* Key Metrics */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-850/80 max-w-lg mx-auto lg:mx-0">
              <div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-slate-400">Paperless Checklist</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">Real-Time</div>
                <div className="text-xs text-slate-400">Defect Notification</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">K3 Mining</div>
                <div className="text-xs text-slate-400">Safety Compliant</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Demo Card Mockup */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-black/60 backdrop-blur-xl">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-850">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Unit EX-2001</div>
                    <div className="text-xs text-slate-400">Excavator Komatsu PC200</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  READY
                </span>
              </div>

              {/* Inspection Status Items */}
              <div className="py-4 space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-300">Level Oli &amp; Pendingin Mesin</span>
                  </div>
                  <span className="text-emerald-400 font-medium">Normal</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-300">Sistem Rem &amp; Safety Horn</span>
                  </div>
                  <span className="text-emerald-400 font-medium">Baik</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-300">Kebocoran Selang Hidrolik</span>
                  </div>
                  <span className="text-emerald-400 font-medium">Nihil</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-300">APAR &amp; Perlengkapan K3</span>
                  </div>
                  <span className="text-emerald-400 font-medium">Lengkap</span>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Shift Pagi: 06:45 WITA</span>
                </div>
                <span className="text-amber-400 font-semibold">Dept. OPERATIONS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
