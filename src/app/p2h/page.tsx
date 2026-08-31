"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Truck,
  Wrench,
  Droplets,
  Zap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ClipboardCheck,
  Home,
  CheckCircle2,
  ListChecks,
  Gauge,
  Layers,
  Wind,
  KeyRound,
  Loader2,
  X,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  fetchPublicP2HOptions,
  saveCategorySessionToken,
  getCategorySessionToken,
  CATEGORY_PUBLIC_TOKENS,
} from "@/services/p2h.service";
import { showToast } from "@/lib/swal";

interface CategoryCardItem {
  id: string;
  category: "LIGHT_VECHICLE" | "TELEHENDLER" | "STORING_TRUCK" | "FUEL_TRUCK" | "GENSET" | "COMPRESSOR" | "DUMP_TRUCK";
  title: string;
  code: string;
  badge: string;
  subtitle: string;
  description: string;
  itemsCountText: string;
  imageSrc: string;
  icon: any;
  colorScheme: {
    border: string;
    bgGradient: string;
    badgeBg: string;
    iconBg: string;
    iconColor: string;
    btnGradient: string;
    glow: string;
  };
  features: string[];
}

const CATEGORY_CARDS: CategoryCardItem[] = [
  {
    id: "lv",
    category: "LIGHT_VECHICLE",
    title: "Light Vehicle (LV)",
    code: "P2H-LV",
    badge: "🚗 SARANA & OPERASIONAL",
    subtitle: "Kendaraan Ringan, Double Cabin, Triton, Hilux & Sarana Site",
    description:
      "Pemeriksaan harian kelayakan berkendara kendaraan ringan untuk mobilitas operasional tambang dan jalur hauling.",
    itemsCountText: "20 Item Baku + Ban + Safety Tools + 10 Fit to Work",
    imageSrc: "/card-category/LVCARD.jpeg",
    icon: Truck,
    colorScheme: {
      border: "border-sky-500/40 hover:border-sky-400 group-hover:shadow-sky-500/20",
      bgGradient: "from-sky-600/30 via-slate-900/50 to-slate-950/90",
      badgeBg: "bg-sky-500/25 text-sky-200 border-sky-400/40 shadow-sm",
      iconBg: "bg-sky-500/25 text-sky-300 border-sky-400/40 shadow-md",
      iconColor: "text-sky-300",
      btnGradient: "from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950",
      glow: "hover:shadow-sky-500/20",
    },
    features: [
      "20 Item General Check (Lampu, Rem, Oli, Radiator, Wiper)",
      "Pemeriksaan Fisik & Tekanan 4 Posisi Ban",
      "6 Perlengkapan Keselamatan (APAR, P3K, Dongkrak)",
      "10 Pertanyaan Fit To Work & PSM Pengemudi",
    ],
  },
  {
    id: "dump_truck",
    category: "DUMP_TRUCK",
    title: "Dump Truck (DT)",
    code: "P2H-DT",
    badge: "🚛 HEAVY HAULER",
    subtitle: "Truk Jungkit, Hauling Truck, Hino / Fuso / Scania Dump",
    description:
      "Pemeriksaan harian komprehensif dump truck: mesin, hidrolik hoist dump vessel, sistem rem angin, ban tandem & kelayakan hauling tambang.",
    itemsCountText: "33 Item Baku (6 Kategori) + KM & Hour Meter",
    imageSrc: "/card-category/DTCARD.jpeg",
    icon: Truck,
    colorScheme: {
      border: "border-orange-500/40 hover:border-orange-400 group-hover:shadow-orange-500/20",
      bgGradient: "from-orange-600/30 via-slate-900/50 to-slate-950/90",
      badgeBg: "bg-orange-500/25 text-orange-200 border-orange-400/40 shadow-sm",
      iconBg: "bg-orange-500/25 text-orange-300 border-orange-400/40 shadow-md",
      iconColor: "text-orange-300",
      btnGradient: "from-orange-400 to-amber-500 hover:from-orange-300 hover:to-amber-400 text-slate-950",
      glow: "hover:shadow-orange-500/20",
    },
    features: [
      "Walkaround Fisik, Tangga Kabin & Bak Dump Vessel",
      "Sistem Hidrolik Hoist Tipping & Safety Prop",
      "Kondisi Ban Tandem, Baut Roda & Suspensi Spring",
      "Sistem Rem Angin (Pneumatic), Steering & Safety K3",
    ],
  },
  {
    id: "telehandler",
    category: "TELEHENDLER",
    title: "Telehandler",
    code: "P2H-TH",
    badge: "🚜 HEAVY EQUIPMENT",
    subtitle: "Telescopic Handler, Forklift All-Terrain & Boom Lift",
    description:
      "Pemeriksaan mekanik spesifik boom hidrolik, attachment fork, ban underbody, dan pengujian gerak manuver telehandler.",
    itemsCountText: "35 Item Baku (7 Kategori Inspeksi) + Hour Meter",
    imageSrc: "/card-category/THCARD.jpeg",
    icon: Wrench,
    colorScheme: {
      border: "border-amber-500/40 hover:border-amber-400 group-hover:shadow-amber-500/20",
      bgGradient: "from-amber-600/30 via-slate-900/50 to-slate-950/90",
      badgeBg: "bg-amber-500/25 text-amber-200 border-amber-400/40 shadow-sm",
      iconBg: "bg-amber-500/25 text-amber-300 border-amber-400/40 shadow-md",
      iconColor: "text-amber-300",
      btnGradient: "from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950",
      glow: "hover:shadow-amber-500/20",
    },
    features: [
      "Pemeriksaan Fisik Luar & Body Panel",
      "Kondisi Ban, Baut Roda & Suspensi Axle",
      "Attachment Fork, Locking Pin & Boom Hidrolik",
      "Uji Fungsi Gerak Naik/Turun & Extend Boom",
    ],
  },
  {
    id: "storing_truck",
    category: "STORING_TRUCK",
    title: "Storing Truck",
    code: "P2H-ST",
    badge: "🚛 SERVICE VEHICLE",
    subtitle: "Truk Servis Mekanik, Mobile Workshop, Tyre Service Truck",
    description:
      "Pemeriksaan terpadu 3 sub-sistem utama: Kendaraan Truk Sasis, Kompresor Udara Diesel, dan Hydraulic Tyre Lifter.",
    itemsCountText: "37 Item Baku (3 Modul Mesin) + 5 Fit to Work",
    imageSrc: "/card-category/WTCARD.png",
    icon: Truck,
    colorScheme: {
      border: "border-emerald-500/40 hover:border-emerald-400 group-hover:shadow-emerald-500/20",
      bgGradient: "from-emerald-600/30 via-slate-900/50 to-slate-950/90",
      badgeBg: "bg-emerald-500/25 text-emerald-200 border-emerald-400/40 shadow-sm",
      iconBg: "bg-emerald-500/25 text-emerald-300 border-emerald-400/40 shadow-md",
      iconColor: "text-emerald-300",
      btnGradient: "from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950",
      glow: "hover:shadow-emerald-500/20",
    },
    features: [
      "Pemeriksaan Kendaraan Truk (Rem, Kemudi, Mesin, Oli)",
      "Pemeriksaan Kompresor Servis (Belt, Oli, Safety Valve)",
      "Pemeriksaan Hydraulic Tyre Lifter & Locking Arm",
      "5 Pertanyaan Fit To Work Driver/Mekanik Servis",
    ],
  },
  {
    id: "fuel_truck",
    category: "FUEL_TRUCK",
    title: "Fuel Truck (Truk Solar)",
    code: "P2H-FT",
    badge: "⛽ TANGKI DISTRIBUSI",
    subtitle: "Truk Tangki Solar, Fuel Dispenser & Mobil Pengisian BBM Pit",
    description:
      "Pemeriksaan spesifik kelayakan tangki solar, pompa discharge, selang nozzle, grounding kabel & standar keselamatan masuk tambang.",
    itemsCountText: "26 Item Baku (3 Kategori) + Catatan Temuan Tangki",
    imageSrc: "/card-category/FTCARD.png",
    icon: Droplets,
    colorScheme: {
      border: "border-cyan-500/40 hover:border-cyan-400 group-hover:shadow-cyan-500/20",
      bgGradient: "from-cyan-600/30 via-slate-900/50 to-slate-950/90",
      badgeBg: "bg-cyan-500/25 text-cyan-200 border-cyan-400/40 shadow-sm",
      iconBg: "bg-cyan-500/25 text-cyan-300 border-cyan-400/40 shadow-md",
      iconColor: "text-cyan-300",
      btnGradient: "from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950",
      glow: "hover:shadow-cyan-500/20",
    },
    features: [
      "Pemeriksaan General (Rem, Kemudi, Lampu & Wiper)",
      "Perlengkapan Safety (Kabel Grounding, Double APAR 6kg/9kg)",
      "Persyaratan Masuk Pit Tambang & Spill Kit",
      "Pompa Solar, Selang Nozzle & Flowmeter BBM",
    ],
  },
  {
    id: "genset",
    category: "GENSET",
    title: "Genset (Generator Set)",
    code: "P2H-GS",
    badge: "⚡ POWER GENERATION",
    subtitle: "Generator Listrik Site, Diesel Generator & Auxiliary Power",
    description:
      "Pemeriksaan komprehensif 30 item baku: mesin diesel, radiator pendingin, tangki solar harian, dan instrumen panel generator AC.",
    itemsCountText: "30 Item Baku (3 Modul Panel) + Hour Meter",
    imageSrc: "/card-category/GSCARD.png",
    icon: Zap,
    colorScheme: {
      border: "border-yellow-500/40 hover:border-yellow-400 group-hover:shadow-yellow-500/20",
      bgGradient: "from-yellow-600/30 via-slate-900/50 to-slate-950/90",
      badgeBg: "bg-yellow-500/25 text-yellow-200 border-yellow-400/40 shadow-sm",
      iconBg: "bg-yellow-500/25 text-yellow-300 border-yellow-400/40 shadow-md",
      iconColor: "text-yellow-300",
      btnGradient: "from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950",
      glow: "hover:shadow-yellow-500/20",
    },
    features: [
      "Pemeriksaan Mesin (Oli, Baterai, Filter, Air Radiator)",
      "Bahan Bakar & Kipas Pendingin (Fan Belt, Saluran Solar)",
      "Panel Generator (MCB, Volt, Hz, Ampere, Selector)",
      "Pencatatan Hour Meter (HM) & Temuan Servis Berkala",
    ],
  },
  {
    id: "compressor",
    category: "COMPRESSOR",
    title: "Kompresor (Compressor)",
    code: "P2H-CP",
    badge: "💨 TEKANAN UDARA",
    subtitle: "Kompresor Udara Diesel & Listrik, Tyre Shop & Workshop Utility",
    description:
      "Pemeriksaan harian kompresor udara diesel & listrik: tangki angin, valve safety, belt, saklar kelistrikan, dan indikator pressure gauge.",
    itemsCountText: "10 Item (Diesel) / 9 Item (Listrik) + Hour Meter",
    imageSrc: "/card-category/COMPRESSOR-CARD.png",
    icon: Wind,
    colorScheme: {
      border: "border-teal-500/40 hover:border-teal-400 group-hover:shadow-teal-500/20",
      bgGradient: "from-teal-600/30 via-slate-900/50 to-slate-950/90",
      badgeBg: "bg-teal-500/25 text-teal-200 border-teal-400/40 shadow-sm",
      iconBg: "bg-teal-500/25 text-teal-300 border-teal-400/40 shadow-md",
      iconColor: "text-teal-300",
      btnGradient: "from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-slate-950",
      glow: "hover:shadow-teal-500/20",
    },
    features: [
      "Level & Kebocoran Oli Mesin (Khusus Diesel)",
      "Kebocoran Tangki Angin & Selang Sambungan",
      "Kondisi Belt, Baut Pengikat Mesin & Suara Mesin",
      "Sistem Safety (MCB/Relay), Saklar & Pressure Gauge",
    ],
  },
];

export default function P2HCategorySelectionPage() {
  const router = useRouter();
  const [unitCounts, setUnitCounts] = useState<{ [key: string]: number }>({});
  const [totalUnits, setTotalUnits] = useState<number>(0);

  // Token Modal Gate States
  const [selectedCard, setSelectedCard] = useState<CategoryCardItem | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean>(false);
  const [inputToken, setInputToken] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUnits() {
      try {
        const res = await fetchPublicP2HOptions();
        if (res.success && res.data.units) {
          const counts: { [key: string]: number } = {
            LIGHT_VECHICLE: 0,
            TELEHENDLER: 0,
            STORING_TRUCK: 0,
            FUEL_TRUCK: 0,
            GENSET: 0,
            COMPRESSOR: 0,
            DUMP_TRUCK: 0,
          };
          res.data.units.forEach((u: any) => {
            if (counts[u.category] !== undefined) {
              counts[u.category] += 1;
            }
          });
          setUnitCounts(counts);
          setTotalUnits(res.data.units.length);
        }
      } catch (err) {
        console.error("Gagal memuat info armada:", err);
      }
    }
    loadUnits();
  }, []);

  // When card is clicked -> check if token is already verified in this session
  const handleCardClick = (card: CategoryCardItem) => {
    const existingToken = getCategorySessionToken(card.category);
    if (existingToken) {
      router.push(`/p2h/form?category=${card.category}`);
      return;
    }

    setSelectedCard(card);
    setInputToken("");
    setTokenError(null);
    setIsTokenModalOpen(true);
  };

  // Verify entered token against backend API
  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard || !inputToken.trim()) {
      setTokenError("Silakan masukkan token akses terlebih dahulu.");
      return;
    }

    setIsVerifying(true);
    setTokenError(null);

    const tokenClean = inputToken.trim();

    try {
      // Test verify token with backend endpoint for this specific category
      const res = await fetchPublicP2HOptions(tokenClean);

      if (res.success) {
        // Save verified token for this category in sessionStorage
        saveCategorySessionToken(selectedCard.category, tokenClean);
        setIsTokenModalOpen(false);
        showToast(`Token Terverifikasi: ${selectedCard.title}`, "success");
        router.push(`/p2h/form?category=${selectedCard.category}`);
      } else {
        const msg = "Token akses tidak valid untuk kategori ini.";
        setTokenError(msg);
        showToast(msg, "error");
      }
    } catch (err: any) {
      const msg =
        err.message ||
        `Token tidak valid untuk kategori ${selectedCard.title}. Pastikan Anda memasukkan token resmi kategori ini.`;
      setTokenError(msg);
      showToast(msg, "error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* ================= TOP NAVIGATION BAR ================= */}
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pilih Kategori Armada Sebelum Mengisi Form P2H</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            PORTAL PEMERIKSAAN HARIAN (P2H)
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Silakan pilih kategori armada yang akan diinspeksi. Pemilihan nomor unit spesifik akan dilakukan langsung di dalam halaman formulir P2H.
          </p>

          <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Total <strong className="text-white">{totalUnits || 19} Unit Armada</strong> Terdaftar dalam 6 Kategori
            </span>
          </div>
        </div>

        {/* ================= 6 CATEGORY CARDS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {CATEGORY_CARDS.map((card) => {
            const Icon = card.icon;
            const count = unitCounts[card.category] ?? null;

            return (
              <div
                key={card.id}
                className={`group relative rounded-3xl overflow-hidden border ${card.colorScheme.border} p-6 flex flex-col justify-between space-y-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${card.colorScheme.glow}`}
              >
                {/* Background Photo with subtle zoom on hover */}
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${card.imageSrc}')` }}
                />

                {/* Bright & Balanced Gradient Overlays for High Photo Visibility & Readability */}
                <div className={`absolute inset-0 bg-linear-to-b ${card.colorScheme.bgGradient} opacity-40 group-hover:opacity-30 transition-opacity`} />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-slate-950/15" />

                {/* Top Row: Icon + Badge + Code */}
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl ${card.colorScheme.iconBg} flex items-center justify-center border shadow-lg backdrop-blur-md group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border backdrop-blur-md ${card.colorScheme.badgeBg}`}
                    >
                      {card.badge}
                    </span>
                    <span className="text-[10px] font-mono text-slate-200 font-bold bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-700/80 backdrop-blur-md">
                      {card.code}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="relative z-10 space-y-1.5 pt-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight drop-shadow-md">
                      {card.title}
                    </h2>
                    {count !== null && (
                      <span className="text-[11px] font-bold text-slate-200 bg-slate-950/90 px-2.5 py-0.5 rounded-lg border border-slate-700/80 backdrop-blur-md shadow-md">
                        {count} Unit
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold text-amber-300 drop-shadow-sm">
                    {card.subtitle}
                  </p>

                  <p className="text-xs text-slate-200 leading-relaxed drop-shadow-md">
                    {card.description}
                  </p>
                </div>

                {/* Features List with Translucent Dark Backdrop */}
                <div className="relative z-10 space-y-2 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md shadow-lg">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-200">
                    <ListChecks className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cakupan Pemeriksaan:</span>
                  </div>

                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    {card.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1 drop-shadow-xs">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action CTA Button */}
                <div className="relative z-10 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCardClick(card)}
                    className={`w-full py-3.5 px-4 rounded-2xl bg-linear-to-r ${card.colorScheme.btnGradient} font-black text-xs flex items-center justify-center gap-2 shadow-xl transition-all group-hover:scale-[1.02] cursor-pointer`}
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Akses Form {card.title.split(" ")[0]}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= TOKEN AUTHENTICATION MODAL ================= */}
        {isTokenModalOpen && selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="max-w-md w-full p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${selectedCard.colorScheme.badgeBg}`}>
                    {(() => {
                      const Icon = selectedCard.icon;
                      return <Icon className="w-5 h-5" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Verifikasi Token {selectedCard.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedCard.code}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTokenModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {tokenError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>{tokenError}</p>
                </div>
              )}

              <form onSubmit={handleVerifyToken} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-bold text-white">
                    MASUKKAN TOKEN AKSES {selectedCard.code} <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      autoFocus
                      value={inputToken}
                      onChange={(e) => {
                        setInputToken(e.target.value.toUpperCase());
                        setTokenError(null);
                      }}
                      placeholder={`Contoh: ${CATEGORY_PUBLIC_TOKENS[selectedCard.category] || "#BATARA..."}`}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Masukkan token otorisasi khusus {selectedCard.title} (atau Master Token) untuk membuka formulir inspeksi harian.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsTokenModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isVerifying || !inputToken.trim()}
                    className={`px-6 py-2.5 rounded-xl font-bold bg-linear-to-r ${selectedCard.colorScheme.btnGradient} flex items-center gap-2 shadow-lg disabled:opacity-60 cursor-pointer`}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memverifikasi...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-3" />
                        <span>Buka Formulir</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= FOOTER / SAFETY GUIDELINES ================= */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-3 text-xs text-slate-400 shadow-lg">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Standar Keselamatan &amp; Operasional P2H PT Batara Dharma Persada</span>
          </div>
          <p className="leading-relaxed">
            Pemeriksaan Harian (P2H) wajib dilakukan oleh setiap operator/driver sebelum mengoperasikan unit armada pada setiap awal shift kerja. Pastikan kondisi unit dalam keadaan aman dan layak beroperasi sesuai standar keselamatan kerja pertambangan.
          </p>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} PT Batara Dharma Persada. All Rights Reserved.</span>
          <span className="text-slate-400 font-medium">Sistem Manajemen Pemeriksaan Harian (P2H)</span>
        </div>
      </footer>
    </div>
  );
}
