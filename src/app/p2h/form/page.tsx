"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  Loader2,
  ShieldCheck,
  Disc,
  LifeBuoy,
  HeartPulse,
  Award,
  Sparkles,
  Gauge,
  Clock,
  Building2,
  User,
  ArrowLeft,
  Home,
  Check,
  Wrench,
  Droplets,
  CheckCheck,
  FileText,
  Zap,
  Layers,
  ChevronDown,
  Wind,
  KeyRound,
  Lock,
} from "lucide-react";
import {
  fetchPublicP2HOptions,
  submitPublicP2H,
  getPublicTokenForCategory,
  getCategorySessionToken,
  saveCategorySessionToken,
  CATEGORY_PUBLIC_TOKENS,
  DEFAULT_PUBLIC_P2H_TOKEN,
} from "@/services/p2h.service";
import {
  showAlertSuccess,
  showAlertError,
  showAlertWarning,
  showConfirmDialog,
  showToast,
} from "@/lib/swal";
import {
  DamageCheckItem,
  TyreCheckData,
  SafetyToolItem,
  FitToWorkItem,
  WarningDetails,
  P2HStatus,
  ShiftType,
  P2HInspection,
  BAKU_TELEHANDLER_CHECKS,
  TELEHANDLER_CATEGORIES,
  TelehandlerCheckItem,
  TelehandlerCondition,
  BAKU_STORING_TRUCK_CHECKS,
  STORING_TRUCK_CATEGORIES,
  BAKU_STORING_TRUCK_FIT_TO_WORK,
  StoringTruckCheckItem,
  StoringTruckCondition,
  BAKU_FUEL_TRUCK_CHECKS,
  FUEL_TRUCK_CATEGORIES,
  FuelTruckCheckItem,
  FuelTruckCondition,
  BAKU_GENSET_CHECKS,
  GENSET_CATEGORIES,
  GensetCheckItem,
  GensetCondition,
  BAKU_COMPRESSOR_DIESEL_CHECKS,
  BAKU_COMPRESSOR_LISTRIK_CHECKS,
  CompressorCheckItem,
  CompressorCondition,
} from "@/services/p2h.service";

// ================= FORM BAKU STANDAR (20 GENERAL CHECK ITEMS) =================
const BAKU_DAMAGE_CHECKS: DamageCheckItem[] = [
  { item: "Lampu Bahaya", condition: "BAIK" },
  { item: "Lampu Sen", condition: "BAIK" },
  { item: "Lampu Kabin", condition: "BAIK" },
  { item: "Speedometer", condition: "BAIK" },
  { item: "Air Accu", condition: "BAIK" },
  { item: "Minyak Rem", condition: "BAIK" },
  { item: "Air Radiator", condition: "BAIK" },
  { item: "Oli Mesin", condition: "BAIK" },
  { item: "Steering", condition: "BAIK" },
  { item: "Seat Belt", condition: "BAIK" },
  { item: "Kaca", condition: "BAIK" },
  { item: "Spion", condition: "BAIK" },
  { item: "Alarm Mundur", condition: "BAIK" },
  { item: "Rem", condition: "BAIK" },
  { item: "Wiper", condition: "BAIK" },
  { item: "Klakson", condition: "BAIK" },
  { item: "Lampu Utama", condition: "BAIK" },
  { item: "Transmisi", condition: "BAIK" },
  { item: "Ban Cadangan", condition: "BAIK" },
  { item: "Baut Roda", condition: "BAIK" },
];

// ================= FORM BAKU STANDAR (6 SAFETY TOOLS) =================
const BAKU_SAFETY_TOOLS: SafetyToolItem[] = [
  { item: "Segitiga Pengaman", status: "ADA" },
  { item: "APAR", status: "ADA" },
  { item: "Dongkrak", status: "ADA" },
  { item: "Radio", status: "ADA" },
  { item: "Kotak P3K", status: "ADA" },
  { item: "Strobe Light", status: "ADA" },
];

// ================= FORM BAKU STANDAR (10 FIT TO WORK + PSM) =================
const BAKU_FIT_TO_WORK: FitToWorkItem[] = [
  { question: "Mengantuk?", answer: "TIDAK" },
  { question: "Cukup tidur?", answer: "YA" },
  { question: "Minum obat?", answer: "TIDAK" },
  { question: "Ada masalah pribadi?", answer: "TIDAK" },
  { question: "Apakah Anda menggunakan APD lengkap?", answer: "YA" },
  { question: "Apakah Anda membawa SIMPER yang masih berlaku?", answer: "YA" },
  { question: "Apakah Anda siap mematuhi rambu & aturan tambang?", answer: "YA" },
  { question: "Apakah Anda tidak menggunakan HP saat mengemudi?", answer: "YA" },
  { question: "Apakah Anda memahami SOP berkendara aman?", answer: "YA" },
  { question: "Apakah Anda siap dan aman untuk bekerja?", answer: "YA" },
];

const GF_SECTIONS = [
  "MANAGEMENT",
  "PLANT",
  "PRODUKSI",
  "HSE",
  "HRGA",
  "HCGA",
  "LOGISTIC",
  "ERT",
  "MEDIC",
];

const GF_SISTEM_KERJA = [
  "Standby",
  "Parkir Area Mess",
  "Tambang",
  "Antar Jemput",
  "Jalur Hauling",
];

const GF_TYRE_POSITIONS = [
  "Depan Kiri",
  "Depan Kanan",
  "Belakang Kiri",
  "Belakang Kanan",
];

function mapDepartmentToSection(department?: string): string {
  if (!department) return "PLANT";
  const deptUpper = department.toUpperCase();
  if (
    deptUpper === "OPERATIONS" ||
    deptUpper === "PRODUCTION_AND_ENGINEERING" ||
    deptUpper === "PRODUKSI"
  ) {
    return "PRODUKSI";
  }
  if (deptUpper === "HSE" || deptUpper === "ERT" || deptUpper === "MEDIC") {
    return "HSE";
  }
  if (deptUpper === "HRGA" || deptUpper === "HCGA" || deptUpper === "LOGISTIC") {
    return "HRGA";
  }
  if (deptUpper === "MANAGEMENT") {
    return "MANAGEMENT";
  }
  return "PLANT";
}

type P2HCategory = "LIGHT_VECHICLE" | "TELEHENDLER" | "STORING_TRUCK" | "FUEL_TRUCK" | "GENSET" | "COMPRESSOR";

function P2HFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCategory = searchParams.get("category");
  const rawUnitId = searchParams.get("unitId");

  const activeCategory: P2HCategory = useMemo(() => {
    if (rawCategory === "COMPRESSOR") return "COMPRESSOR";
    if (rawCategory === "GENSET") return "GENSET";
    if (rawCategory === "FUEL_TRUCK") return "FUEL_TRUCK";
    if (rawCategory === "STORING_TRUCK") return "STORING_TRUCK";
    if (rawCategory === "TELEHENDLER") return "TELEHENDLER";
    return "LIGHT_VECHICLE";
  }, [rawCategory]);

  const isTelehandler = activeCategory === "TELEHENDLER";
  const isStoringTruck = activeCategory === "STORING_TRUCK";
  const isFuelTruck = activeCategory === "FUEL_TRUCK";
  const isGenset = activeCategory === "GENSET";
  const isCompressor = activeCategory === "COMPRESSOR";

  // Options from API
  const [units, setUnits] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Form States - Identity
  const [selectedUnitId, setSelectedUnitId] = useState<string>(rawUnitId || "");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const isDriverLocked = Boolean(selectedDriverId && selectedDriverId !== "custom");
  const [driverName, setDriverName] = useState<string>("");
  const [driverNrp, setDriverNrp] = useState<string>("");
  const [nopol, setNopol] = useState<string>("");
  const [section, setSection] = useState<string>("PLANT");
  const [selectedWorkSystems, setSelectedWorkSystems] = useState<string[]>(["Standby"]);
  const [shift, setShift] = useState<ShiftType>("PAGI");
  const [km, setKm] = useState<number | "">("");
  const [hourMeter, setHourMeter] = useState<number | "">("");

  // Subtype for Compressor
  const [compressorType, setCompressorType] = useState<"COMPRESSOR DIESEL" | "COMPRESSOR LISTRIK">("COMPRESSOR DIESEL");

  // Form States - Standard LV Checklist
  const [damageChecks, setDamageChecks] = useState<DamageCheckItem[]>(BAKU_DAMAGE_CHECKS);
  const [tyreCheck, setTyreCheck] = useState<TyreCheckData>({
    condition: "BAIK",
    pressure: "BAIK",
    problemPositions: [],
  });
  const [safetyTools, setSafetyTools] = useState<SafetyToolItem[]>(BAKU_SAFETY_TOOLS);
  const [fitToWork, setFitToWork] = useState<FitToWorkItem[]>(BAKU_FIT_TO_WORK);

  // Form States - Telehandler Checklist (35 items)
  const [telehandlerChecks, setTelehandlerChecks] = useState<TelehandlerCheckItem[]>(BAKU_TELEHANDLER_CHECKS);

  // Form States - Storing Truck Checklist (37 items + 5 Fit to Work)
  const [storingTruckChecks, setStoringTruckChecks] = useState<StoringTruckCheckItem[]>(BAKU_STORING_TRUCK_CHECKS);
  const [storingTruckFitToWork, setStoringTruckFitToWork] = useState<FitToWorkItem[]>(BAKU_STORING_TRUCK_FIT_TO_WORK);

  // Form States - Fuel Truck Checklist (26 items)
  const [fuelTruckChecks, setFuelTruckChecks] = useState<FuelTruckCheckItem[]>(BAKU_FUEL_TRUCK_CHECKS);

  // Form States - Genset Checklist (30 items)
  const [gensetChecks, setGensetChecks] = useState<GensetCheckItem[]>(BAKU_GENSET_CHECKS);

  // Form States - Compressor Checklist (10 Diesel / 9 Listrik)
  const [compressorDieselChecks, setCompressorDieselChecks] = useState<CompressorCheckItem[]>(BAKU_COMPRESSOR_DIESEL_CHECKS);
  const [compressorListrikChecks, setCompressorListrikChecks] = useState<CompressorCheckItem[]>(BAKU_COMPRESSOR_LISTRIK_CHECKS);

  // Form States - Warning & Notes
  const [hasWarning, setHasWarning] = useState<boolean>(false);
  const [warningDetails, setWarningDetails] = useState<WarningDetails>({
    problemType: "Unit bermasalah",
    actionTaken: "Perbaikan Unit",
    additionalNotes: "",
  });
  const [supervisorNotes, setSupervisorNotes] = useState<string>("");

  // Form States - Validation & Conclusion
  const [driverValidation, setDriverValidation] = useState<boolean>(false);
  const [unitStatus, setUnitStatus] = useState<P2HStatus>("LAYAK");
  const [driverStatus, setDriverStatus] = useState<P2HStatus>("LAYAK");

  // UI States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);
  const [createdP2H, setCreatedP2H] = useState<P2HInspection | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Token Gate Verification States
  const rawQueryToken = searchParams.get("token");
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return rawQueryToken || getCategorySessionToken(activeCategory);
  });
  const [isTokenVerified, setIsTokenVerified] = useState<boolean>(false);
  const [tokenGateInput, setTokenGateInput] = useState<string>("");
  const [tokenGateError, setTokenGateError] = useState<string | null>(null);
  const [isVerifyingGate, setIsVerifyingGate] = useState<boolean>(false);

  // Verify and Load Public Options using Token
  const verifyAndLoadOptions = async (tokenToUse: string) => {
    setIsLoadingOptions(true);
    setTokenGateError(null);
    try {
      const res = await fetchPublicP2HOptions(tokenToUse);
      if (res.success) {
        setUnits(res.data.units || []);
        setDrivers(res.data.drivers || []);
        setIsTokenVerified(true);
        setSessionToken(tokenToUse);
        saveCategorySessionToken(activeCategory, tokenToUse);

        // If unitId passed in query
        if (rawUnitId) {
          const matched = (res.data.units || []).find((u: any) => String(u.id) === String(rawUnitId));
          if (matched) {
            setSelectedUnitId(String(matched.id));
            setNopol((matched as any).nopol || "");
            if (matched.hourMeter != null) setHourMeter(matched.hourMeter);
            if (matched.km != null) setKm(matched.km);
            if (matched.category === "COMPRESSOR") {
              if (matched.brand?.toLowerCase().includes("listrik") || matched.description?.toLowerCase().includes("listrik")) {
                setCompressorType("COMPRESSOR LISTRIK");
              } else {
                setCompressorType("COMPRESSOR DIESEL");
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Gagal memverifikasi token P2H:", err);
      setIsTokenVerified(false);
      setTokenGateError(
        err.message ||
          `Token tidak valid untuk kategori ${headerInfo?.title || activeCategory}. Silakan masukkan token resmi.`
      );
    } finally {
      setIsLoadingOptions(false);
    }
  };

  useEffect(() => {
    const candidateToken = rawQueryToken || getCategorySessionToken(activeCategory);
    if (candidateToken) {
      verifyAndLoadOptions(candidateToken);
    } else {
      setIsLoadingOptions(false);
      setIsTokenVerified(false);
    }
  }, [activeCategory, rawUnitId]);

  const handleVerifyGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenGateInput.trim()) {
      setTokenGateError("Silakan masukkan token akses terlebih dahulu.");
      return;
    }
    setIsVerifyingGate(true);
    await verifyAndLoadOptions(tokenGateInput.trim());
    setIsVerifyingGate(false);
  };

  // Filter units according to activeCategory
  const categoryUnits = useMemo(() => {
    return units.filter((u) => u.category === activeCategory);
  }, [units, activeCategory]);

  // Selected unit object
  const selectedUnit = useMemo(() => {
    return categoryUnits.find((u) => String(u.id) === String(selectedUnitId)) || null;
  }, [categoryUnits, selectedUnitId]);

  // Unit selection handler in Section 1
  const handleUnitSelect = (unitId: string) => {
    setSelectedUnitId(unitId);
    const u = categoryUnits.find((item) => String(item.id) === String(unitId));
    if (u) {
      if (u.hourMeter != null) setHourMeter(u.hourMeter);
      if (u.km != null) setKm(u.km);
      if ((u as any).nopol) setNopol((u as any).nopol);
      if (u.category === "COMPRESSOR") {
        if (u.brand?.toLowerCase().includes("listrik") || u.description?.toLowerCase().includes("listrik")) {
          setCompressorType("COMPRESSOR LISTRIK");
        } else {
          setCompressorType("COMPRESSOR DIESEL");
        }
      }
    }
  };

  // Handle Driver Select
  const handleDriverSelect = (driverId: string) => {
    if (driverId === "custom" || driverId === "") {
      setSelectedDriverId("custom");
      return;
    }
    setSelectedDriverId(driverId);
    const d = drivers.find((drv) => String(drv.id) === String(driverId));
    if (d) {
      const fullName = `${d.firstName} ${d.lastName || ""}`.trim();
      setDriverName(fullName);
      setDriverNrp(d.nrp ? String(d.nrp) : "");
      setSection(mapDepartmentToSection(d.department));
    }
  };

  // Work System Toggle
  const handleToggleWorkSystem = (sys: string) => {
    if (selectedWorkSystems.includes(sys)) {
      if (selectedWorkSystems.length > 1) {
        setSelectedWorkSystems(selectedWorkSystems.filter((s) => s !== sys));
      }
    } else {
      setSelectedWorkSystems([...selectedWorkSystems, sys]);
    }
  };

  // Standard LV Damage Checks Handlers
  const handleConditionChange = (index: number, condition: "BAIK" | "MAJOR") => {
    const updated = [...damageChecks];
    updated[index].condition = condition;
    setDamageChecks(updated);
    if (condition === "MAJOR" && unitStatus === "LAYAK") {
      setUnitStatus("SIAP");
    }
  };

  const handleMarkAllGood = () => {
    setDamageChecks(BAKU_DAMAGE_CHECKS.map((i) => ({ ...i, condition: "BAIK" })));
  };

  // Telehandler Handlers
  const handleTelehandlerCondition = (id: number, condition: TelehandlerCondition) => {
    setTelehandlerChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, condition } : item))
    );
    if ((condition === "TIDAK BAIK" || condition === "PERLU TINDAKAN") && unitStatus === "LAYAK") {
      setUnitStatus("SIAP");
    }
  };

  const handleTelehandlerNote = (id: number, note: string) => {
    setTelehandlerChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  const handleTelehandlerMarkCategoryAllGood = (categoryName: string) => {
    setTelehandlerChecks((prev) =>
      prev.map((item) =>
        item.category === categoryName ? { ...item, condition: "BAIK", note: "" } : item
      )
    );
  };

  const handleTelehandlerMarkAllGood = () => {
    setTelehandlerChecks((prev) =>
      prev.map((item) => ({ ...item, condition: "BAIK", note: "" }))
    );
  };

  // Storing Truck Handlers
  const handleStoringTruckCondition = (id: number, condition: StoringTruckCondition) => {
    setStoringTruckChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, condition } : item))
    );
    if (condition === "RUSAK" && unitStatus === "LAYAK") {
      setUnitStatus("SIAP");
    }
  };

  const handleStoringTruckNote = (id: number, note: string) => {
    setStoringTruckChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  const handleStoringTruckMarkCategoryAllGood = (categoryName: string) => {
    setStoringTruckChecks((prev) =>
      prev.map((item) =>
        item.category === categoryName ? { ...item, condition: "NORMAL", note: "" } : item
      )
    );
  };

  const handleStoringTruckMarkAllGood = () => {
    setStoringTruckChecks((prev) =>
      prev.map((item) => ({ ...item, condition: "NORMAL", note: "" }))
    );
  };

  const handleStoringTruckFitToWork = (index: number, answer: "YA" | "TIDAK") => {
    const updated = [...storingTruckFitToWork];
    updated[index].answer = answer;
    setStoringTruckFitToWork(updated);
  };

  // Fuel Truck Handlers
  const handleFuelTruckCondition = (id: number, condition: FuelTruckCondition) => {
    setFuelTruckChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, condition } : item))
    );
    if (condition === "RUSAK" && unitStatus === "LAYAK") {
      setUnitStatus("SIAP");
    }
  };

  const handleFuelTruckNote = (id: number, note: string) => {
    setFuelTruckChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  const handleFuelTruckMarkCategoryAllGood = (categoryName: string) => {
    setFuelTruckChecks((prev) =>
      prev.map((item) =>
        item.category === categoryName ? { ...item, condition: "BAIK", note: "" } : item
      )
    );
  };

  const handleFuelTruckMarkAllGood = () => {
    setFuelTruckChecks((prev) =>
      prev.map((item) => ({ ...item, condition: "BAIK", note: "" }))
    );
  };

  // Genset Handlers
  const handleGensetCondition = (id: number, condition: GensetCondition) => {
    setGensetChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, condition } : item))
    );
    if (condition === "RUSAK" && unitStatus === "LAYAK") {
      setUnitStatus("SIAP");
    }
  };

  const handleGensetNote = (id: number, note: string) => {
    setGensetChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  const handleGensetMarkCategoryAllGood = (categoryName: string) => {
    setGensetChecks((prev) =>
      prev.map((item) =>
        item.category === categoryName ? { ...item, condition: "BAIK", note: "" } : item
      )
    );
  };

  const handleGensetMarkAllGood = () => {
    setGensetChecks((prev) =>
      prev.map((item) => ({ ...item, condition: "BAIK", note: "" }))
    );
  };

  // Compressor Handlers
  const handleCompressorDieselCondition = (id: number, condition: CompressorCondition) => {
    setCompressorDieselChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, condition } : item))
    );
    if (condition === "RUSAK" && unitStatus === "LAYAK") {
      setUnitStatus("SIAP");
    }
  };

  const handleCompressorDieselNote = (id: number, note: string) => {
    setCompressorDieselChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  const handleCompressorListrikCondition = (id: number, condition: CompressorCondition) => {
    setCompressorListrikChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, condition } : item))
    );
    if (condition === "RUSAK" && unitStatus === "LAYAK") {
      setUnitStatus("SIAP");
    }
  };

  const handleCompressorListrikNote = (id: number, note: string) => {
    setCompressorListrikChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  const handleCompressorMarkAllGood = () => {
    if (compressorType === "COMPRESSOR DIESEL") {
      setCompressorDieselChecks((prev) => prev.map((item) => ({ ...item, condition: "BAIK", note: "" })));
    } else {
      setCompressorListrikChecks((prev) => prev.map((item) => ({ ...item, condition: "BAIK", note: "" })));
    }
  };

  // Tyre Position Toggle
  const handleToggleTyrePos = (pos: string) => {
    const current = tyreCheck.problemPositions;
    const exists = current.includes(pos);
    const updated = exists ? current.filter((p) => p !== pos) : [...current, pos];
    setTyreCheck({ ...tyreCheck, problemPositions: updated });
  };

  // Safety Tools Handler
  const handleSafetyStatus = (index: number, status: "ADA" | "TIDAK_ADA") => {
    const updated = [...safetyTools];
    updated[index].status = status;
    setSafetyTools(updated);
  };

  // Fit to Work Handler
  const handleFitToWorkAnswer = (index: number, answer: "YA" | "TIDAK") => {
    const updated = [...fitToWork];
    updated[index].answer = answer;
    setFitToWork(updated);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!selectedUnitId) {
      showAlertWarning(
        "Unit Belum Dipilih",
        "Silakan pilih unit operasional terlebih dahulu pada dropdown Nomor Unit."
      );
      return;
    }

    if (!driverName.trim()) {
      showAlertWarning("Data Operator Belum Lengkap", "NAMA OPERATOR / INSPEKTOR wajib diisi.");
      return;
    }

    if (!driverNrp.trim()) {
      showAlertWarning("NRP Belum Diisi", "NRP Operator/Inspektor wajib diisi (contoh: 24001234).");
      return;
    }

    if (!isGenset && !isCompressor && (km === "" || Number(km) < 0)) {
      showAlertWarning("Kilometer (KM) Wajib Diisi", "Masukkan angka KM kendaraan saat pemeriksaan.");
      return;
    }

    // Validasi Angka KM tidak boleh kurang dari KM unit saat ini
    if (!isGenset && !isCompressor && km !== "" && selectedUnit?.km != null && selectedUnit.km > 0) {
      if (Number(km) < selectedUnit.km) {
        showAlertWarning(
          "Validasi KM Tidak Valid",
          `Angka KM (${km}) tidak boleh lebih rendah dari KM unit saat ini (${selectedUnit.km} KM). Silakan masukkan angka KM aktual yang sama atau lebih besar.`
        );
        return;
      }
    }

    if ((isTelehandler || isGenset || isCompressor) && (hourMeter === "" || Number(hourMeter) < 0)) {
      showAlertWarning(
        "Hour Meter (HM) Wajib Diisi",
        `Hour Meter (HM) Unit ${isGenset ? "Genset" : isCompressor ? "Kompresor" : "Telehandler"} wajib diisi.`
      );
      return;
    }

    // Validasi Angka HM tidak boleh kurang dari HM unit saat ini
    if (hourMeter !== "" && selectedUnit?.hourMeter != null && selectedUnit.hourMeter > 0) {
      if (Number(hourMeter) < selectedUnit.hourMeter) {
        showAlertWarning(
          "Validasi HM Tidak Valid",
          `Angka Hour Meter / HM (${hourMeter}) tidak boleh lebih rendah dari HM unit saat ini (${selectedUnit.hourMeter} HM). Silakan masukkan angka HM aktual yang sama atau lebih besar.`
        );
        return;
      }
    }

    if (!driverValidation) {
      showAlertWarning(
        "Validasi Belum Dicentang",
        "Anda harus mencentang validasi operator ('Saya menyatakan data pemeriksaan di atas adalah benar')."
      );
      return;
    }

    const isConfirmed = await showConfirmDialog({
      title: "Kirim Formulir P2H?",
      text: `Pastikan seluruh data pemeriksaan ${headerInfo.badge} dan kesimpulan kelayakan telah sesuai kondisi aktual unit.`,
      confirmButtonText: "Ya, Kirim Formulir",
    });
    if (!isConfirmed) return;

    setIsSubmitting(true);

    try {
      const activeCompressorChecks = compressorType === "COMPRESSOR DIESEL" ? compressorDieselChecks : compressorListrikChecks;

      const payload = {
        unitId: Number(selectedUnitId),
        driverId: selectedDriverId ? Number(selectedDriverId) : undefined,
        driverName: driverName.trim(),
        driverNrp: driverNrp ? Number(driverNrp) : undefined,
        nopol: isTelehandler || isStoringTruck || isFuelTruck || isGenset || isCompressor ? undefined : (nopol.trim() || undefined),
        section,
        workSystem: selectedWorkSystems,
        shift,
        km: isGenset || isCompressor ? (km === "" ? 0 : Number(km)) : Number(km),
        hourMeter: hourMeter !== "" ? Number(hourMeter) : selectedUnit?.hourMeter || null,
        damageChecks: isCompressor
          ? activeCompressorChecks
          : isGenset
          ? gensetChecks
          : isFuelTruck
          ? fuelTruckChecks
          : isStoringTruck
          ? storingTruckChecks
          : isTelehandler
          ? telehandlerChecks
          : damageChecks,
        tyreCheck,
        safetyTools,
        fitToWork: isGenset || isFuelTruck || isCompressor ? [] : isStoringTruck ? storingTruckFitToWork : fitToWork,
        warningDetails: hasWarning ? warningDetails : null,
        driverValidation: true,
        unitStatus,
        driverStatus,
        supervisorNotes: supervisorNotes.trim() || undefined,
      };

      const tokenToSubmit = sessionToken || getCategorySessionToken(activeCategory) || tokenGateInput.trim();
      const res = await submitPublicP2H(tokenToSubmit, payload);

      if (res.success) {
        setCreatedP2H(res.data);
        setShowSuccessModal(true);

        // Update local unit state with newly recorded KM/HM
        const newKmVal = isGenset || isCompressor ? (km === "" ? 0 : Number(km)) : Number(km);
        const newHmVal = hourMeter !== "" ? Number(hourMeter) : selectedUnit?.hourMeter || null;
        setUnits((prevUnits) =>
          prevUnits.map((u) =>
            String(u.id) === String(selectedUnitId)
              ? {
                  ...u,
                  km: (newKmVal != null && newKmVal > (u.km || 0)) ? newKmVal : u.km,
                  hourMeter: (newHmVal != null && newHmVal > (u.hourMeter || 0)) ? newHmVal : u.hourMeter,
                }
              : u
          )
        );

        showAlertSuccess(
          "P2H Berhasil Disimpan!",
          `Inspeksi harian unit ${headerInfo.badge} telah tercatat resmi dengan No P2H: ${res.data.p2hNo}.`
        );
      } else {
        showAlertError(
          "Pengiriman Gagal",
          res.message || "Gagal menyimpan formulir P2H. Silakan periksa kembali data Anda."
        );
      }
    } catch (err: any) {
      showAlertError(
        "Kesalahan Sistem",
        err.message || "Terjadi kesalahan saat menghubungkan ke server."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryHeaderInfo = () => {
    switch (activeCategory) {
      case "COMPRESSOR":
        return {
          title: "FORM P2H KOMPRESOR (COMPRESSOR)",
          subtitle: "Pemeriksaan harian kompresor udara diesel & listrik, kebocoran tangki, belt, saklar dan pressure gauge.",
          badge: "💨 KOMPRESOR",
          theme: "bg-teal-500/10 border-teal-500/30 text-teal-400",
          icon: <Wind className="w-5 h-5" />,
        };
      case "GENSET":
        return {
          title: "FORM P2H GENSET (GENERATOR SET)",
          subtitle: "Pemeriksaan harian mesin genset, sistem pendingin, bahan bakar, dan panel generator listrik.",
          badge: "⚡ GENSET",
          theme: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
          icon: <Zap className="w-5 h-5" />,
        };
      case "FUEL_TRUCK":
        return {
          title: "FORM P2H FUEL TRUCK",
          subtitle: "Pemeriksaan harian truk tangki solar, pompa distribusi, perlengkapan safety & persyaratan masuk pit.",
          badge: "⛽ FUEL TRUCK",
          theme: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
          icon: <Droplets className="w-5 h-5" />,
        };
      case "STORING_TRUCK":
        return {
          title: "FORM P2H STORING TRUCK",
          subtitle: "Pemeriksaan harian truk servis, kompresor diesel, hydraulic tyre lifter & kelayakan mekanik.",
          badge: "🚛 STORING TRUCK",
          theme: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          icon: <Truck className="w-5 h-5" />,
        };
      case "TELEHENDLER":
        return {
          title: "FORM P2H TELEHANDLER",
          subtitle: "Pemeriksaan 7 kategori baku telescopic handler: attachment fork, boom hidrolik, underbody & safety.",
          badge: "🚜 TELEHANDLER",
          theme: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          icon: <Wrench className="w-5 h-5" />,
        };
      default:
        return {
          title: "FORM P2H LIGHT VEHICLE (LV)",
          subtitle: "Pemeriksaan harian 20 item general check, kondisi ban, perlengkapan safety & 10 fit to work.",
          badge: "🚗 LIGHT VEHICLE",
          theme: "bg-sky-500/10 border-sky-500/30 text-sky-400",
          icon: <Truck className="w-5 h-5" />,
        };
    }
  };

  const headerInfo = getCategoryHeaderInfo();

  // If token is not yet verified -> Render Token Gate Security Screen
  if (!isTokenVerified && !isLoadingOptions) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border mx-auto shadow-inner ${headerInfo.theme}`}>
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${headerInfo.theme}`}>
                {headerInfo.badge}
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                Autentikasi Token Akses {headerInfo.badge}
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Halaman ini dilindungi. Masukkan token akses resmi untuk membuka formulir pemeriksaan harian unit {headerInfo.badge}.
              </p>
            </div>
          </div>

          {tokenGateError && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Akses Ditolak:</span>
                <p className="mt-0.5">{tokenGateError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleVerifyGateSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-bold text-white">
                TOKEN OTORISASI {headerInfo.badge} <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={tokenGateInput}
                  onChange={(e) => {
                    setTokenGateInput(e.target.value.toUpperCase());
                    setTokenGateError(null);
                  }}
                  placeholder={`Contoh: ${CATEGORY_PUBLIC_TOKENS[activeCategory] || "#BATARA..."}`}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Gunakan token khusus kategori {headerInfo.badge} yang diberikan oleh Supervisor / Dispatcher Plant.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isVerifyingGate || !tokenGateInput.trim()}
                className="w-full py-3 px-4 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isVerifyingGate ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Token...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-3" />
                    <span>Buka Formulir P2H</span>
                  </>
                )}
              </button>

              <Link
                href="/p2h"
                className="w-full py-2.5 px-4 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-center block transition-colors"
              >
                ← Kembali ke Pilihan Kategori
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 py-6 sm:py-10 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ================= TOP CATEGORY BAR & RETURN ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1.5">
            <Link
              href="/p2h"
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors group mb-0.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>← Pilih Kategori Armada Lain</span>
            </Link>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {headerInfo.title}
              </h1>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${headerInfo.theme}`}>
                {headerInfo.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {headerInfo.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>
                Section: <strong className="text-white">{section}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Alerts Banner */}
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
            <button onClick={() => setAlert(null)} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= FORM P2H ================= */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ================= 1. IDENTITAS UNIT & OPERATOR ================= */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                  1. Identitas Unit &amp; Operator / Inspektor
                </h2>
                <p className="text-xs text-slate-400">
                  Pilih nomor unit {headerInfo.badge} yang akan diperiksa dan tentukan data operasional.
                </p>
              </div>
            </div>

            {/* UNIT SELECTION DROPDOWN */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3">
              <label className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Truck className="w-4 h-4" />
                  <span>PILIH NOMOR UNIT ({headerInfo.badge}) <strong className="text-rose-400">*</strong></span>
                </span>
                <span className="text-[11px] font-normal text-slate-400">
                  {categoryUnits.length} unit tersedia
                </span>
              </label>

              <select
                required
                value={selectedUnitId}
                onChange={(e) => handleUnitSelect(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="" disabled className="bg-slate-950 text-slate-400">
                  -- Silakan Pilih Unit {headerInfo.badge} yang Diinspeksi --
                </option>
                {categoryUnits.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-950 text-white py-1">
                    {u.unitNo} - {u.brand} ({u.description || "Unit Operasional"}) {(u as any).nopol && !isTelehandler && !isStoringTruck && !isFuelTruck && !isGenset && !isCompressor ? `[${(u as any).nopol}]` : ""}
                  </option>
                ))}
              </select>

              {/* Selected Unit Details Preview */}
              {selectedUnit && (
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-400 text-sm">
                      {selectedUnit.unitNo}
                    </span>
                    <span className="text-slate-300 font-medium">
                      &bull; {selectedUnit.brand} {selectedUnit.description ? `(${selectedUnit.description})` : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                    {selectedUnit.hourMeter != null && (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>HM: {selectedUnit.hourMeter}</span>
                      </span>
                    )}
                    {selectedUnit.km != null && !isGenset && !isCompressor && (
                      <span className="text-sky-400 flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5" />
                        <span>KM: {selectedUnit.km}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Compressor Subtype Selector (Diesel / Listrik) */}
            {isCompressor && (
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 space-y-2.5">
                <label className="block text-xs font-bold text-teal-300">
                  JENIS COMPRESSOR <span className="text-amber-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCompressorType("COMPRESSOR DIESEL")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all text-center flex items-center justify-center gap-2 ${
                      compressorType === "COMPRESSOR DIESEL"
                        ? "bg-teal-400 text-slate-950 border-teal-300 shadow-md shadow-teal-400/20"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>COMPRESSOR DIESEL</span>
                    {compressorType === "COMPRESSOR DIESEL" && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompressorType("COMPRESSOR LISTRIK")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all text-center flex items-center justify-center gap-2 ${
                      compressorType === "COMPRESSOR LISTRIK"
                        ? "bg-teal-400 text-slate-950 border-teal-300 shadow-md shadow-teal-400/20"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>COMPRESSOR LISTRIK</span>
                    {compressorType === "COMPRESSOR LISTRIK" && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Operator & Operasional Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* NAMA OPERATOR/DRIVER */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    NAMA OPERATOR / INSPEKTOR <span className="text-amber-400">*</span>
                  </label>
                  {isDriverLocked && (
                    <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Terkunci otomatis
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <select
                    value={selectedDriverId}
                    onChange={(e) => handleDriverSelect(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer text-white"
                  >
                    <option value="" disabled className="bg-slate-950">
                      -- Pilih Operator/Inspektor dari Database User --
                    </option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id} className="bg-slate-950">
                        {d.firstName} {d.lastName || ""} (NRP: {d.nrp} - {d.posision} / Dept. {d.department})
                      </option>
                    ))}
                    <option value="custom" className="bg-slate-950 text-amber-400 font-semibold">
                      + Input Manual / Nama Lainnya...
                    </option>
                  </select>

                  <div className="relative">
                    {isDriverLocked ? (
                      <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    ) : (
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    )}
                    <input
                      type="text"
                      required
                      readOnly={isDriverLocked}
                      value={driverName}
                      onChange={(e) => {
                        setDriverName(e.target.value);
                        setSelectedDriverId("custom");
                      }}
                      placeholder="Nama lengkap operator/inspektor..."
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none transition-all ${
                        isDriverLocked
                          ? "bg-slate-900/90 border border-slate-800 text-slate-300 cursor-not-allowed select-none focus:ring-0"
                          : "bg-slate-950/70 border border-slate-800 placeholder:text-slate-500 focus:ring-1 focus:ring-amber-500"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* NRP DRIVER */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    NRP OPERATOR / INSPEKTOR <span className="text-amber-400">*</span>
                  </label>
                  {isDriverLocked && (
                    <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Terkunci otomatis
                    </span>
                  )}
                </div>
                <div className="relative">
                  {isDriverLocked ? (
                    <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  ) : (
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                  <input
                    type="number"
                    required
                    readOnly={isDriverLocked}
                    value={driverNrp}
                    onChange={(e) => setDriverNrp(e.target.value)}
                    placeholder={isDriverLocked ? "NRP terkunci otomatis sesuai user" : "Contoh: 24001234"}
                    className={`w-full py-2.5 rounded-xl text-xs focus:outline-none transition-all ${
                      isDriverLocked
                        ? "pl-10 pr-3.5 bg-slate-900/90 border border-slate-800 text-slate-300 cursor-not-allowed select-none focus:ring-0"
                        : "pl-10 pr-3.5 bg-slate-950 border border-slate-800 placeholder:text-slate-500 focus:ring-1 focus:ring-amber-500"
                    }`}
                  />
                </div>
              </div>

              {/* Hour Meter (HM) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Hour Meter (HM) {(isTelehandler || isGenset || isCompressor) && <span className="text-amber-400">*</span>}
                  </label>
                  {selectedUnit?.hourMeter != null && selectedUnit.hourMeter > 0 && (
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      HM Terakhir: <strong>{selectedUnit.hourMeter}</strong>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={selectedUnit?.hourMeter != null ? selectedUnit.hourMeter : 0}
                    step="0.1"
                    required={isTelehandler || isGenset || isCompressor}
                    value={hourMeter}
                    onChange={(e) => setHourMeter(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder={
                      selectedUnit?.hourMeter != null
                        ? `Min. ${selectedUnit.hourMeter} (Contoh: ${selectedUnit.hourMeter + 5})`
                        : isTelehandler || isGenset || isCompressor
                        ? "Wajib diisi (Contoh: 340.5)"
                        : "Opsional (Contoh: 120)"
                    }
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs focus:outline-none transition-all ${
                      hourMeter !== "" && selectedUnit?.hourMeter != null && Number(hourMeter) < selectedUnit.hourMeter
                        ? "border-rose-500 text-rose-300 focus:ring-1 focus:ring-rose-500 bg-rose-950/20"
                        : isTelehandler || isGenset || isCompressor
                        ? "border-amber-500/50 focus:ring-1 focus:ring-amber-500 bg-amber-500/5"
                        : "border-slate-800 focus:ring-1 focus:ring-amber-500"
                    }`}
                  />
                </div>
                {hourMeter !== "" && selectedUnit?.hourMeter != null && Number(hourMeter) < selectedUnit.hourMeter && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium pt-0.5 animate-in fade-in">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>HM tidak boleh kurang dari HM sebelumnya ({selectedUnit.hourMeter} HM).</span>
                  </p>
                )}
              </div>

              {/* KM UNIT (Khusus unit non-genset & non-compressor) */}
              {!isGenset && !isCompressor && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300">
                      KM UNIT <span className="text-amber-400">*</span>
                    </label>
                    {selectedUnit?.km != null && selectedUnit.km > 0 && (
                      <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                        KM Terakhir: <strong>{selectedUnit.km}</strong>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Gauge className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={selectedUnit?.km != null ? selectedUnit.km : 0}
                      required={!isGenset && !isCompressor}
                      value={km}
                      onChange={(e) => setKm(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder={
                        selectedUnit?.km != null
                          ? `Min. ${selectedUnit.km} (Contoh: ${selectedUnit.km + 20})`
                          : "Contoh: 45200"
                      }
                      className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs focus:outline-none transition-all ${
                        km !== "" && selectedUnit?.km != null && Number(km) < selectedUnit.km
                          ? "border-rose-500 text-rose-300 focus:ring-1 focus:ring-rose-500 bg-rose-950/20"
                          : "border-slate-800 focus:ring-1 focus:ring-amber-500"
                      }`}
                    />
                  </div>
                  {km !== "" && selectedUnit?.km != null && Number(km) < selectedUnit.km && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium pt-0.5 animate-in fade-in">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>KM tidak boleh kurang dari KM sebelumnya ({selectedUnit.km} KM).</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className={`grid grid-cols-1 ${isTelehandler || isStoringTruck || isFuelTruck || isGenset || isCompressor ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-4 pt-1`}>
              {/* SIFT (2 Shifts Standard: Day Shift & Night Shift) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  SHIFT KERJA <span className="text-amber-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShift("SIANG")}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      shift === "SIANG" || shift === "PAGI"
                        ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>☀️ DAY SHIFT (SIANG)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShift("MALAM")}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      shift === "MALAM"
                        ? "bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/20"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>🌙 NIGHT SHIFT (MALAM)</span>
                  </button>
                </div>
              </div>

              {/* Nopol (Khusus LV) */}
              {!isTelehandler && !isStoringTruck && !isFuelTruck && !isGenset && !isCompressor && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Nopol / Plat Unit
                  </label>
                  <input
                    type="text"
                    value={nopol}
                    onChange={(e) => setNopol(e.target.value.toUpperCase())}
                    placeholder="Contoh: KT 1234 BM"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              )}

              {/* SECTION */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    SECTION <span className="text-amber-400">*</span>
                  </label>
                  {isDriverLocked && (
                    <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Sesuai Dept. User
                    </span>
                  )}
                </div>
                <div className="relative">
                  {isDriverLocked && (
                    <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    disabled={isDriverLocked}
                    className={`w-full py-2.5 rounded-xl text-xs focus:outline-none transition-all ${
                      isDriverLocked
                        ? "pl-10 pr-3.5 bg-slate-900/90 border border-slate-800 text-slate-300 cursor-not-allowed select-none appearance-none"
                        : "px-3.5 bg-slate-950 border border-slate-800 text-white focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    }`}
                  >
                    {GF_SECTIONS.map((sec) => (
                      <option key={sec} value={sec} className="bg-slate-950">
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SISTEM KERJA */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-300">
                SISTEM KERJA <span className="text-amber-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {GF_SISTEM_KERJA.map((sys) => {
                  const isChecked = selectedWorkSystems.includes(sys);
                  return (
                    <button
                      key={sys}
                      type="button"
                      onClick={() => handleToggleWorkSystem(sys)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        isChecked
                          ? "bg-amber-400/15 border-amber-400 text-amber-300 font-semibold"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${isChecked ? "bg-amber-400 text-slate-950" : "border border-slate-700"}`}>
                        {isChecked && "✓"}
                      </span>
                      <span>{sys}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MODE A-00: COMPRESSOR FORM CHECKLIST (DIESEL 10 ITEMS / LISTRIK 9 ITEMS)  */}
          {/* ========================================================================= */}
          {isCompressor ? (
            <div className="space-y-5">
              <div className="p-4 sm:p-5 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                    <Wind className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>DAFTAR PEMERIKSAAN P2H {compressorType}</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Pemeriksaan harian komponen mesin kompresor, tangki angin, sabuk belt, dan sistem safety. Pilihan: <strong className="text-emerald-400">Baik</strong> atau <strong className="text-rose-400">Rusak</strong>.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCompressorMarkAllGood}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Tandai Semua BAIK</span>
                </button>
              </div>

              {/* Checklist Items */}
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-400" />
                    <span>CHECKLIST DESCRIPTION ({compressorType === "COMPRESSOR DIESEL" ? "10 Item" : "9 Item"})</span>
                  </h4>
                </div>

                <div className="space-y-3">
                  {(compressorType === "COMPRESSOR DIESEL" ? compressorDieselChecks : compressorListrikChecks).map((check) => {
                    const isProblem = check.condition === "RUSAK" || check.condition === "TIDAK BAIK" || check.condition === "PERLU TINDAKAN";

                    return (
                      <div
                        key={check.id}
                        className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                          isProblem
                            ? "bg-rose-950/25 border-rose-500/40"
                            : "bg-slate-950/60 border-slate-800/80"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {check.id}
                            </span>
                            <span className="text-xs font-semibold text-slate-200 leading-relaxed">
                              {check.item}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() =>
                                compressorType === "COMPRESSOR DIESEL"
                                  ? handleCompressorDieselCondition(check.id, "BAIK")
                                  : handleCompressorListrikCondition(check.id, "BAIK")
                              }
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                !isProblem
                                  ? "bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20"
                                  : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                              }`}
                            >
                              Baik
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                compressorType === "COMPRESSOR DIESEL"
                                  ? handleCompressorDieselCondition(check.id, "RUSAK")
                                  : handleCompressorListrikCondition(check.id, "RUSAK")
                              }
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                isProblem
                                  ? "bg-rose-500 text-white font-extrabold shadow-md shadow-rose-500/20"
                                  : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                              }`}
                            >
                              Rusak
                            </button>
                          </div>
                        </div>

                        {/* Note Input for Issues */}
                        {isProblem && (
                          <div className="pt-2 border-t border-rose-900/40">
                            <input
                              type="text"
                              value={check.note || ""}
                              onChange={(e) =>
                                compressorType === "COMPRESSOR DIESEL"
                                  ? handleCompressorDieselNote(check.id, e.target.value)
                                  : handleCompressorListrikNote(check.id, e.target.value)
                              }
                              placeholder={`Tuliskan detail kerusakan untuk "${check.item}"...`}
                              className="w-full px-3 py-2 bg-slate-950/80 border border-rose-500/50 rounded-xl text-xs placeholder:text-rose-400/50 focus:outline-none focus:ring-1 focus:ring-rose-500"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Temuan Backlog */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                  <FileText className="w-5 h-5 text-teal-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    TEMUAN BACKLOG / CATATAN KHUSUS KOMPRESOR
                  </h4>
                </div>
                <p className="text-xs text-slate-400">
                  Tuliskan temuan kebocoran oli, kendala tekanan pressure gauge bar/psi, kondisi selang angin, atau suku cadang yang perlu diganti:
                </p>
                <textarea
                  rows={3}
                  value={supervisorNotes}
                  onChange={(e) => setSupervisorNotes(e.target.value)}
                  placeholder="Contoh: Tekanan angin normal mencapai 7 bar, tangki aman tidak bocor. Perlu pembersihan filter udara pada servis berikutnya."
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 leading-relaxed"
                />
              </div>
            </div>
          ) : isGenset ? (
            /* ================= MODE A-0: GENSET (30 ITEMS) ================= */
            <div className="space-y-5">
              {/* Header Genset Inspection */}
              <div className="p-4 sm:p-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>DAFTAR PERIKSA HARIAN GENSET (30 ITEM)</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Pemeriksaan harian sistem mesin, pendingin, aki, bahan bakar, dan panel generator. Pilihan status: <strong className="text-emerald-400">BAIK</strong> atau <strong className="text-rose-400">RUSAK</strong>.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGensetMarkAllGood}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Tandai Semua 30 Item BAIK</span>
                </button>
              </div>

              {/* 3 Categories */}
              {GENSET_CATEGORIES.map((cat, catIdx) => {
                const catItems = gensetChecks.filter((item) => item.category === cat.name);
                const goodCount = catItems.filter((i) => i.condition === "BAIK" || i.condition === "NORMAL").length;
                const isAllGood = goodCount === catItems.length;

                return (
                  <div
                    key={cat.id}
                    className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 font-bold text-xs flex items-center justify-center">
                          {catIdx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                            {cat.name}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {catItems.length} poin pemeriksaan &bull; Status:{" "}
                            <span className={isAllGood ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                              {goodCount}/{catItems.length} Baik
                            </span>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleGensetMarkCategoryAllGood(cat.name)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 self-start sm:self-auto cursor-pointer"
                      >
                        Semua Baik ({catItems.length})
                      </button>
                    </div>

                    <div className="space-y-3">
                      {catItems.map((check) => {
                        const isProblem = check.condition === "RUSAK" || check.condition === "TIDAK BAIK" || check.condition === "PERLU TINDAKAN";

                        return (
                          <div
                            key={check.id}
                            className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                              isProblem
                                ? "bg-rose-950/25 border-rose-500/40"
                                : "bg-slate-950/60 border-slate-800/80"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                  {check.id}
                                </span>
                                <span className="text-xs font-semibold text-slate-200 leading-relaxed">
                                  {check.item}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => handleGensetCondition(check.id, "BAIK")}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    !isProblem
                                      ? "bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20"
                                      : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                                  }`}
                                >
                                  BAIK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleGensetCondition(check.id, "RUSAK")}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    isProblem
                                      ? "bg-rose-500 text-white font-extrabold shadow-md shadow-rose-500/20"
                                      : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                                  }`}
                                >
                                  RUSAK
                                </button>
                              </div>
                            </div>

                            {/* Note Input for Issues */}
                            {isProblem && (
                              <div className="pt-2 border-t border-rose-900/40">
                                <input
                                  type="text"
                                  value={check.note || ""}
                                  onChange={(e) => handleGensetNote(check.id, e.target.value)}
                                  placeholder={`Tuliskan detail kerusakan / temuan untuk ${check.item}...`}
                                  className="w-full px-3 py-2 bg-slate-950/80 border border-rose-500/50 rounded-xl text-xs placeholder:text-rose-400/50 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Genset Additional Notes Card */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                  <FileText className="w-4 h-4 text-yellow-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Rangkuman Pengecekan &amp; Temuan Khusus Genset (Opsional)
                  </h4>
                </div>
                <p className="text-xs text-slate-400">
                  Catat kondisi genset tambahan seperti kVA output, tegangan fasa (R-S-T), frekuensi (Hz), level oli mesin, solar tangki harian, atau permintaan servis berkala:
                </p>
                <textarea
                  rows={3}
                  value={supervisorNotes}
                  onChange={(e) => setSupervisorNotes(e.target.value)}
                  placeholder="Contoh: Genset Denyo GS001 beroperasi stabil tegangan 380V frekuensi 50Hz. Level oli mesin normal, solar tangki harian 85%."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            </div>
          ) : isFuelTruck ? (
            /* ================= MODE A: FUEL TRUCK (26 ITEMS) ================= */
            <div className="space-y-5">
              <div className="p-4 sm:p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Droplets className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>DAFTAR PEMERIKSAAN P2H FUEL TRUCK (26 ITEM)</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Pemeriksaan general check, perlengkapan safety, dan persyaratan masuk pit. Pilihan status: <strong className="text-emerald-400">BAIK</strong> atau <strong className="text-rose-400">RUSAK</strong>.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFuelTruckMarkAllGood}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Tandai Semua 26 Item BAIK</span>
                </button>
              </div>

              {FUEL_TRUCK_CATEGORIES.map((cat, catIdx) => {
                const catItems = fuelTruckChecks.filter((item) => item.category === cat.name);
                const goodCount = catItems.filter((i) => i.condition === "BAIK" || i.condition === "NORMAL").length;
                const isAllGood = goodCount === catItems.length;

                return (
                  <div
                    key={cat.id}
                    className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold text-xs flex items-center justify-center">
                          {catIdx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                            {cat.name}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {catItems.length} poin pemeriksaan &bull; Status:{" "}
                            <span className={isAllGood ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                              {goodCount}/{catItems.length} Baik
                            </span>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleFuelTruckMarkCategoryAllGood(cat.name)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 self-start sm:self-auto cursor-pointer"
                      >
                        Semua Baik ({catItems.length})
                      </button>
                    </div>

                    <div className="space-y-3">
                      {catItems.map((check) => {
                        const isProblem = check.condition === "RUSAK" || check.condition === "TIDAK BAIK" || check.condition === "PERLU TINDAKAN";

                        return (
                          <div
                            key={check.id}
                            className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                              isProblem
                                ? "bg-rose-950/25 border-rose-500/40"
                                : "bg-slate-950/60 border-slate-800/80"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                  {check.id}
                                </span>
                                <span className="text-xs font-semibold text-slate-200 leading-relaxed">
                                  {check.item}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => handleFuelTruckCondition(check.id, "BAIK")}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    !isProblem
                                      ? "bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20"
                                      : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                                  }`}
                                >
                                  BAIK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleFuelTruckCondition(check.id, "RUSAK")}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    isProblem
                                      ? "bg-rose-500 text-white font-extrabold shadow-md shadow-rose-500/20"
                                      : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                                  }`}
                                >
                                  RUSAK
                                </button>
                              </div>
                            </div>

                            {isProblem && (
                              <div className="pt-2 border-t border-slate-800/80 animate-in fade-in duration-150">
                                <input
                                  type="text"
                                  value={check.note || ""}
                                  onChange={(e) => handleFuelTruckNote(check.id, e.target.value)}
                                  placeholder={`Catatan detail kerusakan untuk "${check.item}"...`}
                                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    TEMUAN DAN CATATAN TAMBAHAN (OPSIONAL)
                  </h4>
                </div>
                <p className="text-xs text-slate-400">
                  Tuliskan temuan kebocoran tangki solar, pompa, dispenser meter, nozzle, atau rekomendasi perbaikan unit Fuel Truck.
                </p>
                <textarea
                  rows={3}
                  value={supervisorNotes}
                  onChange={(e) => setSupervisorNotes(e.target.value)}
                  placeholder="Tuliskan temuan atau catatan tambahan di sini..."
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
                />
              </div>
            </div>
          ) : isStoringTruck ? (
            /* ================= MODE B: STORING TRUCK (37 ITEMS) ================= */
            <div className="space-y-5">
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>DAFTAR PEMERIKSAAN P2H STORING TRUCK (37 ITEM)</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Pemeriksaan kompresor, hydraulic tyre lifter, kelistrikan, dan kondisi fisik storing truck. Pilihan status: <strong className="text-emerald-400">NORMAL</strong> atau <strong className="text-rose-400">RUSAK</strong>.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStoringTruckMarkAllGood}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Tandai Semua 37 Item NORMAL</span>
                </button>
              </div>

              {STORING_TRUCK_CATEGORIES.map((cat, catIdx) => {
                const catItems = storingTruckChecks.filter((item) => item.category === cat.name);
                const normalCount = catItems.filter((i) => i.condition === "NORMAL" || i.condition === "BAIK").length;
                const isAllNormal = normalCount === catItems.length;

                return (
                  <div
                    key={cat.id}
                    className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center">
                          {catIdx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                            {cat.name}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {catItems.length} poin pemeriksaan &bull; Status:{" "}
                            <span className={isAllNormal ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                              {normalCount}/{catItems.length} Normal
                            </span>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStoringTruckMarkCategoryAllGood(cat.name)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 self-start sm:self-auto cursor-pointer"
                      >
                        Semua Normal ({catItems.length})
                      </button>
                    </div>

                    <div className="space-y-3">
                      {catItems.map((check) => {
                        const isProblem = check.condition === "RUSAK" || check.condition === "TIDAK BAIK" || check.condition === "PERLU TINDAKAN";

                        return (
                          <div
                            key={check.id}
                            className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                              isProblem
                                ? "bg-rose-950/25 border-rose-500/40"
                                : "bg-slate-950/60 border-slate-800/80"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                  {check.id}
                                </span>
                                <span className="text-xs font-semibold text-slate-200 leading-relaxed">
                                  {check.item}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => handleStoringTruckCondition(check.id, "NORMAL")}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    !isProblem
                                      ? "bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20"
                                      : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                                  }`}
                                >
                                  NORMAL
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStoringTruckCondition(check.id, "RUSAK")}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    isProblem
                                      ? "bg-rose-500 text-white font-extrabold shadow-md shadow-rose-500/20"
                                      : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                                  }`}
                                >
                                  RUSAK
                                </button>
                              </div>
                            </div>

                            {isProblem && (
                              <div className="pt-2 border-t border-slate-800/80 animate-in fade-in duration-150">
                                <input
                                  type="text"
                                  value={check.note || ""}
                                  onChange={(e) => handleStoringTruckNote(check.id, e.target.value)}
                                  placeholder={`Catatan detail kerusakan untuk "${check.item}"...`}
                                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* FIT TO WORK OPERATOR STORING TRUCK */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                      3. Fit To Work / Kelayakan Operator Storing Truck
                    </h2>
                    <p className="text-xs text-slate-400">
                      Deklarasi kesiapan fisik, mental, dan kepatuhan keselamatan kerja operator.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {storingTruckFitToWork.map((ftw, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <span className="text-xs font-semibold text-slate-200">
                        {idx + 1}. {ftw.question}
                      </span>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleStoringTruckFitToWork(idx, "YA")}
                          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                            ftw.answer === "YA"
                              ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          YA
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStoringTruckFitToWork(idx, "TIDAK")}
                          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                            ftw.answer === "TIDAK"
                              ? "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          TIDAK
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : isTelehandler ? (
            /* ================= MODE C: TELEHANDLER (35 ITEMS) ================= */
            <div className="space-y-5">
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>DAFTAR PEMERIKSAAN P2H TELEHANDLER (35 ITEM)</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Pemeriksaan 7 kategori baku Telehandler. Pilihan status: <strong className="text-emerald-400">BAIK</strong>, <strong className="text-rose-400">TIDAK BAIK</strong>, atau <strong className="text-amber-400">PERLU TINDAKAN</strong>.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTelehandlerMarkAllGood}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Tandai Semua 35 Item BAIK</span>
                </button>
              </div>

              {TELEHANDLER_CATEGORIES.map((cat, catIdx) => {
                const catItems = telehandlerChecks.filter((item) => item.category === cat.name);
                const goodCount = catItems.filter((i) => i.condition === "BAIK").length;
                const isAllGood = goodCount === catItems.length;

                return (
                  <div
                    key={cat.id}
                    className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center justify-center">
                          {catIdx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                            {cat.name}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {catItems.length} poin pemeriksaan &bull; Status:{" "}
                            <span className={isAllGood ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                              {goodCount}/{catItems.length} Baik
                            </span>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTelehandlerMarkCategoryAllGood(cat.name)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 self-start sm:self-auto cursor-pointer"
                      >
                        Semua Baik ({catItems.length})
                      </button>
                    </div>

                    <div className="space-y-3">
                      {catItems.map((check) => (
                        <div
                          key={check.id}
                          className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                            check.condition === "TIDAK BAIK"
                              ? "bg-rose-950/25 border-rose-500/40"
                              : check.condition === "PERLU TINDAKAN"
                              ? "bg-amber-950/25 border-amber-500/40"
                              : "bg-slate-950/60 border-slate-800/80"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {check.id}
                              </span>
                              <span className="text-xs font-semibold text-slate-200 leading-relaxed">
                                {check.item}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => handleTelehandlerCondition(check.id, "BAIK")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                  check.condition === "BAIK"
                                    ? "bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20"
                                    : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                                }`}
                              >
                                BAIK
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTelehandlerCondition(check.id, "TIDAK BAIK")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                  check.condition === "TIDAK BAIK"
                                    ? "bg-rose-500 text-white font-extrabold shadow-md shadow-rose-500/20"
                                    : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                                }`}
                              >
                                TIDAK BAIK
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTelehandlerCondition(check.id, "PERLU TINDAKAN")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                  check.condition === "PERLU TINDAKAN"
                                    ? "bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-400/20"
                                    : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                                }`}
                              >
                                PERLU TINDAKAN
                              </button>
                            </div>
                          </div>

                          {(check.condition === "TIDAK BAIK" || check.condition === "PERLU TINDAKAN") && (
                            <div className="pt-2 border-t border-slate-800/80 animate-in fade-in duration-150">
                              <input
                                type="text"
                                value={check.note || ""}
                                onChange={(e) => handleTelehandlerNote(check.id, e.target.value)}
                                placeholder={`Catatan detail temuan untuk "${check.item}"...`}
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
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
            /* ================= STANDARD LV INSPECTION FORM ================= */
            <>
              {/* 2. GENERAL CHECK (20 ITEM BAKU) */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Disc className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                        2. General Check (20 Item Baku)
                      </h2>
                      <p className="text-xs text-slate-400">Pemeriksaan komponen fisik utama kendaraan armada.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleMarkAllGood}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-400 transition-colors border border-slate-700/80 self-start sm:self-auto cursor-pointer"
                  >
                    Tandai Semua BAIK
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {damageChecks.map((check, index) => {
                    const isRusak = check.condition === "MAJOR";
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                          isRusak
                            ? "bg-rose-950/20 border-rose-500/40"
                            : "bg-slate-950/60 border-slate-800/80"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-200 truncate">
                            {check.item}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleConditionChange(index, "BAIK")}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                              !isRusak
                                ? "bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20"
                                : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                            }`}
                          >
                            BAIK
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConditionChange(index, "MAJOR")}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                              isRusak
                                ? "bg-rose-500 text-white font-extrabold shadow-md shadow-rose-500/20"
                                : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                            }`}
                          >
                            RUSAK
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. PEMERIKSAAN BAN */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <LifeBuoy className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                      3. Pemeriksaan Kondisi Ban
                    </h2>
                    <p className="text-xs text-slate-400">Pemeriksaan fisik dan tekanan ban armada.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTyreCheck({ condition: "BAIK", pressure: "BAIK", problemPositions: [] })}
                      className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                        tyreCheck.condition === "BAIK"
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      BAN BAIK (SEMUA AMAN)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTyreCheck({ ...tyreCheck, condition: "BOTAK" })}
                      className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                        tyreCheck.condition !== "BAIK"
                          ? "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      BAN RUSAK / GANGGUAN
                    </button>
                  </div>

                  {tyreCheck.condition !== "BAIK" && (
                    <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2 animate-in fade-in duration-200">
                      <label className="block text-xs font-bold text-rose-300">
                        Pilih Posisi Ban Bermasalah:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {GF_TYRE_POSITIONS.map((pos) => {
                          const isProblem = tyreCheck.problemPositions.includes(pos);
                          return (
                            <button
                              key={pos}
                              type="button"
                              onClick={() => handleToggleTyrePos(pos)}
                              className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                                isProblem
                                  ? "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/25"
                                  : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white"
                              }`}
                            >
                              {pos}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. PERLENGKAPAN KESELAMATAN (SAFETY TOOLS) */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                      4. Perlengkapan Keselamatan (Safety Tools)
                    </h2>
                    <p className="text-xs text-slate-400">Perlengkapan standar keselamatan operasional kendaraan.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {safetyTools.map((tool, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {tool.item}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSafetyStatus(idx, "ADA")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            tool.status === "ADA"
                              ? "bg-emerald-500 text-slate-950"
                              : "bg-slate-900 text-slate-500 hover:text-white"
                          }`}
                        >
                          ADA
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSafetyStatus(idx, "TIDAK_ADA")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            tool.status === "TIDAK_ADA"
                              ? "bg-rose-500 text-white"
                              : "bg-slate-900 text-slate-500 hover:text-white"
                          }`}
                        >
                          TIDAK
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. FIT TO WORK OPERATOR */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                      5. Fit To Work &amp; PSM (10 Pertanyaan)
                    </h2>
                    <p className="text-xs text-slate-400">Deklarasi kesiapan fisik, mental, dan kepatuhan SOP.</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {fitToWork.map((ftw, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <span className="text-xs font-semibold text-slate-200">
                        {idx + 1}. {ftw.question}
                      </span>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleFitToWorkAnswer(idx, "YA")}
                          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                            ftw.answer === "YA"
                              ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          YA
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFitToWorkAnswer(idx, "TIDAK")}
                          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                            ftw.answer === "TIDAK"
                              ? "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          TIDAK
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. PERINGATAN / KENDALA OPERASIONAL */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                      6. Peringatan &amp; Kendala Operasional (Opsional)
                    </h2>
                    <p className="text-xs text-slate-400">Catat kendala operasional atau kondisi darurat jika ada.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <input
                      type="checkbox"
                      id="hasWarningCheckbox"
                      checked={hasWarning}
                      onChange={(e) => setHasWarning(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                    />
                    <label htmlFor="hasWarningCheckbox" className="text-xs font-semibold text-slate-300 cursor-pointer">
                      Terdapat Peringatan / Kerusakan Unit / Kendala Driver Khusus
                    </label>
                  </div>

                  {hasWarning && (
                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3 animate-in fade-in duration-200">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">Deskripsi Kendala</label>
                        <textarea
                          rows={2}
                          value={warningDetails.additionalNotes || ""}
                          onChange={(e) => setWarningDetails({ ...warningDetails, additionalNotes: e.target.value })}
                          placeholder="Jelaskan detail kendala..."
                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">Tindakan Langsung</label>
                        <input
                          type="text"
                          value={warningDetails.actionTaken || ""}
                          onChange={(e) => setWarningDetails({ ...warningDetails, actionTaken: e.target.value })}
                          placeholder="Tindakan sementara..."
                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ================= FINAL VALIDATION & CONCLUSION ================= */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                  {isCompressor
                    ? "3. Validasi & Kesimpulan Kelayakan Kompresor"
                    : isGenset
                    ? "3. Validasi & Kesimpulan Kelayakan Genset"
                    : isFuelTruck
                    ? "3. Validasi & Kesimpulan Kelayakan Fuel Truck"
                    : isStoringTruck
                    ? "4. Validasi & Kesimpulan Kelayakan Storing Truck"
                    : isTelehandler
                    ? "3. Validasi & Kesimpulan Kelayakan Telehandler"
                    : "7. Data Operasi & Final (Validasi & Kesimpulan)"}
                </h2>
                <p className="text-xs text-slate-400">Validasi data pemeriksaan dan kesimpulan status kelayakan operasi armada.</p>
              </div>
            </div>

            {/* Validasi Driver Checkbox */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
              <input
                type="checkbox"
                id="driverValidationCheck"
                checked={driverValidation}
                onChange={(e) => setDriverValidation(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
              />
              <label htmlFor="driverValidationCheck" className="text-xs font-bold text-white cursor-pointer select-none">
                ➤ VALIDASI OPERATOR / INSPEKTOR : <span className="text-amber-400">✔ Saya menyatakan data pemeriksaan di atas adalah benar</span>
              </label>
            </div>

            {/* Kesimpulan Matrix */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                ➤ KESIMPULAN STATUS KELAYAKAN <span className="text-amber-400">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status Unit */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">
                      Status Unit {headerInfo.badge}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(["LAYAK", "TIDAK_LAYAK", "SIAP", "TIDAK_SIAP"] as const).map((s) => {
                      const isPositive = s === "LAYAK" || s === "SIAP";
                      const isSelected = unitStatus === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setUnitStatus(s)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all text-center flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? isPositive
                                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                                : "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          <span>{s.replace(/_/g, " ")}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status Driver */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Status Operator / Inspektor</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(["LAYAK", "TIDAK_LAYAK", "SIAP", "TIDAK_SIAP"] as const).map((s) => {
                      const isPositive = s === "LAYAK" || s === "SIAP";
                      const isSelected = driverStatus === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setDriverStatus(s)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all text-center flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? isPositive
                                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                                : "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          <span>{s.replace(/_/g, " ")}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Supervisor Notes if LV */}
            {!isTelehandler && !isStoringTruck && !isFuelTruck && !isGenset && !isCompressor && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Catatan Tambahan Pengemudi / Supervisor
                </label>
                <textarea
                  rows={2}
                  value={supervisorNotes}
                  onChange={(e) => setSupervisorNotes(e.target.value)}
                  placeholder="Catatan tambahan saat melakukan pemeriksaan..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                {isCompressor
                  ? `Formulir P2H ${compressorType}`
                  : isGenset
                  ? "Formulir P2H Genset (30 Item)"
                  : isFuelTruck
                  ? "Formulir P2H Fuel Truck (26 Item)"
                  : isStoringTruck
                  ? "Formulir P2H Storing Truck (37 Item)"
                  : isTelehandler
                  ? "Formulir P2H Telehandler (35 Item)"
                  : "Formulir P2H Light Vehicle"}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/p2h"
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 text-center transition-colors"
              >
                Ganti Kategori
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Formulir P2H...</span>
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="w-5 h-5" strokeWidth={2.5} />
                    <span>Simpan Formulir P2H</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ================= SUCCESS MODAL ================= */}
      {showSuccessModal && createdP2H && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <Check className="w-8 h-8 stroke-3" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                P2H Berhasil Disimpan!
              </h3>
              <p className="text-xs text-slate-400">
                Pemeriksaan harian kendaraan telah tercatat secara resmi pada sistem PT Batara Dharma Persada.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-left text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Nomor P2H:</span>
                <span className="font-extrabold text-amber-400 font-mono text-sm">
                  {createdP2H.p2hNo}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Unit / Armada:</span>
                <span className="font-bold text-white">
                  {createdP2H.unit?.unitNo} ({createdP2H.unit?.brand})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Operator / Driver:</span>
                <span className="font-semibold text-slate-200">{createdP2H.driverName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status Kelayakan:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${createdP2H.unitStatus === "LAYAK" || createdP2H.unitStatus === "SIAP" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                  {createdP2H.unitStatus.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <Link
                href="/p2h"
                className="py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Pilih Kategori Lain</span>
              </Link>
              <Link
                href="/"
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Beranda Utama</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function P2HPublicFormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-3" />
          <h2 className="text-lg font-bold text-white">Memuat Formulir P2H...</h2>
        </div>
      }
    >
      <P2HFormContent />
    </Suspense>
  );
}
