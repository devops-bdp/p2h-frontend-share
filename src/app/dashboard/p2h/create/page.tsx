"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck,
  Truck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  Plus,
  Trash2,
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
  Radio,
  FileCheck,
  Info,
  Lock,
  Wrench,
  Droplets,
  CheckCheck,
  FileText,
  Zap,
  Wind,
} from "lucide-react";
import {
  createP2HInspection,
  DamageCheckItem,
  TyreCheckData,
  SafetyToolItem,
  FitToWorkItem,
  WarningDetails,
  P2HStatus,
  ShiftType,
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
  COMPRESSOR_CATEGORIES,
  CompressorCheckItem,
  CompressorCondition,
} from "@/services/p2h.service";
import {
  showAlertSuccess,
  showAlertError,
  showAlertWarning,
  showConfirmDialog,
  showToast,
} from "@/lib/swal";
import { fetchUnits, Unit } from "@/services/unit.service";
import { getAuthSession, fetchDrivers, UserProfile } from "@/services/auth.service";

// 1. Exact 20 items for GENERAL CHECK from Google Form
const GF_DAMAGE_CHECKS: DamageCheckItem[] = [
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

// 2. Exact 6 items for SAFETY TOOL from Google Form
const GF_SAFETY_TOOLS: SafetyToolItem[] = [
  { item: "Segitiga Pengaman", status: "ADA" },
  { item: "APAR", status: "ADA" },
  { item: "Dongkrak", status: "ADA" },
  { item: "Radio", status: "ADA" },
  { item: "Kotak P3K", status: "ADA" },
  { item: "Strobe Light", status: "ADA" },
];

// 3. Exact 10 items for FIT TO WORK + PSM from Google Form
const GF_FIT_TO_WORK: FitToWorkItem[] = [
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
  if (deptUpper === "LOGISTIC" || deptUpper === "LOGISTIK") {
    return "LOGISTIC";
  }
  if (deptUpper === "HSE") return "HSE";
  if (deptUpper === "HRGA") return "HRGA";
  if (deptUpper === "HCGA") return "HCGA";
  if (deptUpper === "PLANT") return "PLANT";
  if (deptUpper === "ERT") return "ERT";
  if (deptUpper === "MEDIC") return "MEDIC";
  if (deptUpper === "MANAGEMENT") return "MANAGEMENT";
  return department;
}

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

export default function CreateP2HPage() {
  const router = useRouter();

  // Drivers/Operators list from User table (excluding SITE_MANAGER)
  const [drivers, setDrivers] = useState<UserProfile[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | string>("");
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);

  const [vehicleCategoryFilter, setVehicleCategoryFilter] = useState<string>("ALL");
  const isDriverLocked = Boolean(selectedDriverId && selectedDriverId !== "custom");

  // Units list
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<number | "">("");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // 1. Identitas Unit & Driver State
  const [driverName, setDriverName] = useState("");
  const [driverNrp, setDriverNrp] = useState("");
  const [nopol, setNopol] = useState("");
  const [km, setKm] = useState<number | "">("");
  const [hourMeter, setHourMeter] = useState<number | "">("");
  const [shift, setShift] = useState<ShiftType>("PAGI");
  const [section, setSection] = useState("PLANT");
  const [selectedWorkSystems, setSelectedWorkSystems] = useState<string[]>(["Tambang"]);

  // 2. General Check / Keterangan Kerusakan State (LV)
  const [damageChecks, setDamageChecks] = useState<DamageCheckItem[]>(GF_DAMAGE_CHECKS);
  const [customDamageItem, setCustomDamageItem] = useState("");

  // 2b. Telehandler Check State (35 Items in 7 Categories)
  const [telehandlerChecks, setTelehandlerChecks] = useState<TelehandlerCheckItem[]>(BAKU_TELEHANDLER_CHECKS);

  // 2c. Storing Truck Check State (37 Items in 3 Categories)
  const [storingTruckChecks, setStoringTruckChecks] = useState<StoringTruckCheckItem[]>(BAKU_STORING_TRUCK_CHECKS);
  const [storingTruckFitToWork, setStoringTruckFitToWork] = useState<FitToWorkItem[]>(BAKU_STORING_TRUCK_FIT_TO_WORK);

  // 2d. Fuel Truck Check State (26 Items in 3 Categories)
  const [fuelTruckChecks, setFuelTruckChecks] = useState<FuelTruckCheckItem[]>(BAKU_FUEL_TRUCK_CHECKS);

  // 2e. Genset Check State (30 Items in 3 Categories)
  const [gensetChecks, setGensetChecks] = useState<GensetCheckItem[]>(BAKU_GENSET_CHECKS);

  // 2f. Compressor Check State (10 Diesel / 9 Listrik)
  const [compressorType, setCompressorType] = useState<"COMPRESSOR DIESEL" | "COMPRESSOR LISTRIK">("COMPRESSOR DIESEL");
  const [compressorDieselChecks, setCompressorDieselChecks] = useState<CompressorCheckItem[]>(BAKU_COMPRESSOR_DIESEL_CHECKS);
  const [compressorListrikChecks, setCompressorListrikChecks] = useState<CompressorCheckItem[]>(BAKU_COMPRESSOR_LISTRIK_CHECKS);

  // 3. Tyre Check State
  const [tyreCheck, setTyreCheck] = useState<TyreCheckData>({
    condition: "BAIK",
    pressure: "BAIK",
    problemPositions: [],
    notes: "",
  });

  // 4. Safety Tool State
  const [safetyTools, setSafetyTools] = useState<SafetyToolItem[]>(GF_SAFETY_TOOLS);
  const [customSafetyItem, setCustomSafetyItem] = useState("");

  // 5. Fit To Work + PSM State
  const [fitToWork, setFitToWork] = useState<FitToWorkItem[]>(GF_FIT_TO_WORK);
  const [customPsmQuestion, setCustomPsmQuestion] = useState("");

  // 6. Warning / Tidak Layak State
  const [hasWarning, setHasWarning] = useState(false);
  const [warningDetails, setWarningDetails] = useState<WarningDetails>({
    problemType: "Unit bermasalah",
    actionTaken: "Perbaikan Unit",
    additionalNotes: "",
  });

  // 7. Data Operasi & Final / Kesimpulan State
  const [driverValidation, setDriverValidation] = useState(true);
  const [unitStatus, setUnitStatus] = useState<P2HStatus>("LAYAK");
  const [driverStatus, setDriverStatus] = useState<P2HStatus>("LAYAK");
  const [supervisorNotes, setSupervisorNotes] = useState("");

  // UI State
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const isTelehandler = selectedUnit?.category === "TELEHENDLER";
  const isStoringTruck = selectedUnit?.category === "STORING_TRUCK";
  const isFuelTruck = selectedUnit?.category === "FUEL_TRUCK";
  const isGenset = selectedUnit?.category === "GENSET";
  const isCompressor = selectedUnit?.category === "COMPRESSOR";

  // Filtered units by category
  const filteredUnits = units.filter((u) => {
    if (vehicleCategoryFilter === "ALL") return true;
    if (vehicleCategoryFilter === "LIGHT_VECHICLE") return u.category === "LIGHT_VECHICLE";
    if (vehicleCategoryFilter === "TELEHENDLER") return u.category === "TELEHENDLER";
    if (vehicleCategoryFilter === "STORING_TRUCK") return u.category === "STORING_TRUCK";
    if (vehicleCategoryFilter === "FUEL_TRUCK") return u.category === "FUEL_TRUCK";
    if (vehicleCategoryFilter === "GENSET") return u.category === "GENSET";
    if (vehicleCategoryFilter === "COMPRESSOR") return u.category === "COMPRESSOR";
    return true;
  });

  useEffect(() => {
    loadDriversAndUnits();
  }, []);

  const loadDriversAndUnits = async () => {
    setIsLoadingDrivers(true);
    setIsLoadingUnits(true);

    const session = getAuthSession();
    const currentUser = session.user;

    try {
      // 1. Fetch Drivers (all users except SITE_MANAGER)
      const driversRes = await fetchDrivers().catch(() => ({ success: false, count: 0, data: [] }));
      const driverList = driversRes.data || [];
      setDrivers(driverList);

      // Match current logged-in user if exists in driver list
      if (currentUser) {
        const matchedDriver = driverList.find((d) => d.id === currentUser.id);
        if (matchedDriver) {
          setSelectedDriverId(matchedDriver.id);
          setDriverName(`${matchedDriver.firstName} ${matchedDriver.lastName || ""}`.trim());
          setDriverNrp(String(matchedDriver.nrp));
          setSection(mapDepartmentToSection(matchedDriver.department));
        } else {
          // Default to current user details if not site manager
          setDriverName(`${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim());
          setDriverNrp(currentUser.nrp ? String(currentUser.nrp) : "");
          setSection(mapDepartmentToSection(currentUser.department));
        }
      }

      // 2. Fetch Units
      const unitsRes = await fetchUnits();
      const allUnits = unitsRes.data || [];
      setUnits(allUnits);

      if (allUnits.length > 0) {
        const defaultU = allUnits.find((u) => u.category === "LIGHT_VECHICLE") || allUnits[0];
        setSelectedUnitId(defaultU.id);
        setSelectedUnit(defaultU);
        setKm(defaultU.km);
        setHourMeter(defaultU.hourMeter || "");
      }
    } catch (error: any) {
      setAlert({
        type: "error",
        title: "Gagal Mengambil Data",
        message: error.message || "Tidak dapat memuat data operator atau unit.",
      });
    } finally {
      setIsLoadingDrivers(false);
      setIsLoadingUnits(false);
    }
  };

  // Handler when user selects driver/operator from database dropdown
  const handleDriverSelect = (driverIdStr: string) => {
    if (driverIdStr === "custom" || driverIdStr === "") {
      setSelectedDriverId("");
      return;
    }
    const id = Number(driverIdStr);
    setSelectedDriverId(id);
    const selected = drivers.find((d) => d.id === id);
    if (selected) {
      setDriverName(`${selected.firstName} ${selected.lastName || ""}`.trim());
      setDriverNrp(String(selected.nrp));
      setSection(mapDepartmentToSection(selected.department));
    }
  };

  const handleUnitSelect = (id: number) => {
    setSelectedUnitId(id);
    const u = units.find((item) => item.id === id) || null;
    setSelectedUnit(u);
    if (u) {
      setKm(u.km);
      setHourMeter(u.hourMeter || "");
      if (u.category === "TELEHENDLER") {
        setVehicleCategoryFilter("TELEHENDLER");
      } else if (u.category === "STORING_TRUCK") {
        setVehicleCategoryFilter("STORING_TRUCK");
      } else if (u.category === "FUEL_TRUCK") {
        setVehicleCategoryFilter("FUEL_TRUCK");
      } else if (u.category === "GENSET") {
        setVehicleCategoryFilter("GENSET");
      } else if (u.category === "COMPRESSOR") {
        setVehicleCategoryFilter("COMPRESSOR");
        if (u.brand?.toLowerCase().includes("listrik") || u.description?.toLowerCase().includes("listrik")) {
          setCompressorType("COMPRESSOR LISTRIK");
        } else {
          setCompressorType("COMPRESSOR DIESEL");
        }
      } else if (u.category === "LIGHT_VECHICLE") {
        setVehicleCategoryFilter("LIGHT_VECHICLE");
      }
    }
  };

  // Toggle work system multiselect
  const handleToggleWorkSystem = (sys: string) => {
    if (selectedWorkSystems.includes(sys)) {
      setSelectedWorkSystems(selectedWorkSystems.filter((s) => s !== sys));
    } else {
      setSelectedWorkSystems([...selectedWorkSystems, sys]);
    }
  };

  // Damage condition handler (LV)
  const handleDamageCondition = (index: number, condition: "BAIK" | "MINOR" | "MAJOR") => {
    const updated = [...damageChecks];
    updated[index].condition = condition;
    setDamageChecks(updated);

    const hasIssues = updated.some((d) => d.condition === "MAJOR" || d.condition === "MINOR");
    if (hasIssues && unitStatus === "LAYAK") {
      setUnitStatus("SIAP");
    }
  };

  // Custom damage item (LV)
  const handleAddCustomDamage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDamageItem.trim()) return;
    setDamageChecks([...damageChecks, { item: customDamageItem.trim(), condition: "BAIK" }]);
    setCustomDamageItem("");
  };

  // Telehandler condition handler
  const handleTelehandlerCondition = (id: number, condition: TelehandlerCondition) => {
    setTelehandlerChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, condition } : item))
    );
    if (condition === "TIDAK BAIK" && unitStatus === "LAYAK") {
      setUnitStatus("SIAP");
    }
  };

  // Telehandler note handler
  const handleTelehandlerNote = (id: number, note: string) => {
    setTelehandlerChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  // Telehandler mark category all good
  const handleTelehandlerMarkCategoryAllGood = (categoryName: string) => {
    setTelehandlerChecks((prev) =>
      prev.map((item) =>
        item.category === categoryName ? { ...item, condition: "BAIK", note: "" } : item
      )
    );
  };

  // Telehandler mark all 35 items good
  const handleTelehandlerMarkAllGood = () => {
    setTelehandlerChecks((prev) =>
      prev.map((item) => ({ ...item, condition: "BAIK", note: "" }))
    );
  };

  // Storing Truck condition handler
  const handleStoringTruckCondition = (id: number, condition: StoringTruckCondition) => {
    setStoringTruckChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, condition } : item))
    );
    if (condition === "TIDAK NORMAL" && unitStatus === "LAYAK") {
      setUnitStatus("SIAP");
    }
  };

  // Storing Truck note handler
  const handleStoringTruckNote = (id: number, note: string) => {
    setStoringTruckChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  // Storing Truck mark category all good
  const handleStoringTruckMarkCategoryAllGood = (categoryName: string) => {
    setStoringTruckChecks((prev) =>
      prev.map((item) =>
        item.category === categoryName ? { ...item, condition: "NORMAL", note: "" } : item
      )
    );
  };

  // Storing Truck mark all items good
  const handleStoringTruckMarkAllGood = () => {
    setStoringTruckChecks((prev) =>
      prev.map((item) => ({ ...item, condition: "NORMAL", note: "" }))
    );
  };

  // Storing Truck fit to work handler
  const handleStoringTruckFitToWorkAnswer = (index: number, answer: "YA" | "TIDAK") => {
    const updated = [...storingTruckFitToWork];
    updated[index].answer = answer;
    setStoringTruckFitToWork(updated);
  };

  // Fuel Truck condition handler
  const handleFuelTruckCondition = (id: number, condition: FuelTruckCondition) => {
    setFuelTruckChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, condition } : item))
    );
    if (condition === "RUSAK" && unitStatus === "LAYAK") {
      setUnitStatus("SIAP");
    }
  };

  // Fuel Truck note handler
  const handleFuelTruckNote = (id: number, note: string) => {
    setFuelTruckChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  // Fuel Truck mark category all good
  const handleFuelTruckMarkCategoryAllGood = (categoryName: string) => {
    setFuelTruckChecks((prev) =>
      prev.map((item) =>
        item.category === categoryName ? { ...item, condition: "BAIK", note: "" } : item
      )
    );
  };

  // Fuel Truck mark all 26 items good
  const handleFuelTruckMarkAllGood = () => {
    setFuelTruckChecks((prev) =>
      prev.map((item) => ({ ...item, condition: "BAIK", note: "" }))
    );
  };

  // Genset condition handler
  const handleGensetCondition = (id: number, condition: GensetCondition) => {
    setGensetChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, condition } : item))
    );
    if (condition === "RUSAK" && unitStatus === "LAYAK") {
      setUnitStatus("SIAP");
    }
  };

  // Genset note handler
  const handleGensetNote = (id: number, note: string) => {
    setGensetChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  // Genset mark category all good
  const handleGensetMarkCategoryAllGood = (categoryName: string) => {
    setGensetChecks((prev) =>
      prev.map((item) =>
        item.category === categoryName ? { ...item, condition: "BAIK", note: "" } : item
      )
    );
  };

  // Genset mark all 30 items good
  const handleGensetMarkAllGood = () => {
    setGensetChecks((prev) =>
      prev.map((item) => ({ ...item, condition: "BAIK", note: "" }))
    );
  };

  // Compressor condition & note handlers
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

  // Tyre position toggle
  const handleToggleTyrePos = (pos: string) => {
    const current = tyreCheck.problemPositions;
    const exists = current.includes(pos);
    const updated = exists ? current.filter((p) => p !== pos) : [...current, pos];
    setTyreCheck({ ...tyreCheck, problemPositions: updated });
  };

  // Safety tool handler
  const handleSafetyStatus = (index: number, status: "ADA" | "TIDAK_ADA") => {
    const updated = [...safetyTools];
    updated[index].status = status;
    setSafetyTools(updated);
  };

  const handleAddCustomSafety = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSafetyItem.trim()) return;
    setSafetyTools([...safetyTools, { item: customSafetyItem.trim(), status: "ADA" }]);
    setCustomSafetyItem("");
  };

  // Fit to work handler
  const handleFitToWorkAnswer = (index: number, answer: "YA" | "TIDAK") => {
    const updated = [...fitToWork];
    updated[index].answer = answer;
    setFitToWork(updated);
  };

  const handleAddCustomPsm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPsmQuestion.trim()) return;
    setFitToWork([...fitToWork, { question: customPsmQuestion.trim(), answer: "TIDAK" }]);
    setCustomPsmQuestion("");
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!driverName.trim()) {
      showAlertWarning("Nama Operator Wajib Diisi", "NAMA OPERATOR/DRIVER/INSPEKTOR wajib diisi.");
      return;
    }

    if (!driverNrp.trim()) {
      showAlertWarning("NRP Wajib Diisi", "NRP Operator/Driver wajib diisi.");
      return;
    }

    if (!selectedUnitId) {
      showAlertWarning("Unit Belum Dipilih", "Pilih nomor unit yang diinspeksi.");
      return;
    }

    if (!isGenset && !isCompressor && (km === "" || Number(km) < 0)) {
      showAlertWarning("Kilometer (KM) Wajib Diisi", "KM Unit wajib diisi dengan angka positif.");
      return;
    }

    if ((isTelehandler || isGenset || isCompressor) && (hourMeter === "" || Number(hourMeter) < 0)) {
      showAlertWarning(
        "Hour Meter (HM) Wajib Diisi",
        `Hour Meter (HM) Unit ${isGenset ? "Genset" : isCompressor ? "Kompresor" : "Telehandler"} wajib diisi.`
      );
      return;
    }

    if (!driverValidation) {
      showAlertWarning(
        "Validasi Belum Dicentang",
        "Anda harus mencentang validasi driver ('Saya menyatakan data benar')."
      );
      return;
    }

    const isConfirmed = await showConfirmDialog({
      title: "Simpan Inspeksi P2H?",
      text: "Data pemeriksaan harian ini akan disimpan ke database pusat PT Batara Mining.",
      confirmButtonText: "Ya, Simpan",
    });
    if (!isConfirmed) return;

    setIsSubmitting(true);

    try {
      const activeCompressorChecks = compressorType === "COMPRESSOR DIESEL" ? compressorDieselChecks : compressorListrikChecks;

      const payload = {
        unitId: Number(selectedUnitId),
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

      const res = await createP2HInspection(payload);

      if (res.success) {
        showAlertSuccess(
          "Form P2H Berhasil Disimpan!",
          `Inspeksi P2H no ${res.data.p2hNo} berhasil dibuat. Mengalihkan ke riwayat P2H...`
        );

        setTimeout(() => {
          router.push("/dashboard/p2h");
        }, 1200);
      }
    } catch (error: any) {
      showAlertError(
        "Gagal Menyimpan P2H",
        error.message || "Terjadi kesalahan saat menyimpan formulir P2H."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* ================= TOP NAVIGATION HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <Link
            href="/dashboard/p2h"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-amber-400 transition-colors group mb-1"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Daftar P2H</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              FORM PEMERIKSAAN HARIAN (P2H) - IDENTITAS UNIT
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Formulir standar operasional pemeriksaan harian armada Light Vehicle &amp; unit site PT Batara Mining.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl">
          <Building2 className="w-4 h-4 text-amber-500" />
          <span>
            Section: <strong className="text-white">{section}</strong>
          </span>
        </div>
      </div>

      {/* ================= ALERTS BANNER ================= */}
      {alert && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-200 ${
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
        {/* ================= 1. IDENTITAS UNIT & DRIVER ================= */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                {isGenset ? <Zap className="w-5 h-5 text-yellow-400" /> : isFuelTruck ? <Droplets className="w-5 h-5 text-cyan-400" /> : isTelehandler ? <Wrench className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>1. Identitas Unit &amp; Operator / Driver</span>
                  {isGenset && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-extrabold tracking-normal">
                      ⚡ GENSET MODE
                    </span>
                  )}
                  {isFuelTruck && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-extrabold tracking-normal">
                      ⛽ FUEL TRUCK MODE
                    </span>
                  )}
                  {isStoringTruck && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold tracking-normal">
                      🚛 STORING TRUCK MODE
                    </span>
                  )}
                  {isTelehandler && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold tracking-normal">
                      🚜 TELEHANDLER MODE
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">
                  {isGenset
                    ? "Pemeriksaan harian unit Genset (Sistem mesin, pendingin, aki, bahan bakar & panel generator)."
                    : isFuelTruck
                    ? "Pemeriksaan harian khusus unit Fuel Truck (General check, safety tools & persyaratan pit)."
                    : isStoringTruck
                    ? "Pemeriksaan harian khusus unit Storing Truck (Kompresor, hydraulic tyre lifter & kondisi fisik)."
                    : isTelehandler
                    ? "Pemeriksaan harian unit Telehandler (Attachment fork, boom, hidrolik & perlengkapan K3)."
                    : "Informasi pengemudi, nomor lambung, nopol, KM, shift, dan sistem kerja."}
                </p>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setVehicleCategoryFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  vehicleCategoryFilter === "ALL"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                Semua ({units.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setVehicleCategoryFilter("LIGHT_VECHICLE");
                  const lv = units.find((u) => u.category === "LIGHT_VECHICLE");
                  if (lv) handleUnitSelect(lv.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  vehicleCategoryFilter === "LIGHT_VECHICLE"
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <span>🚗 LV</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setVehicleCategoryFilter("TELEHENDLER");
                  const th = units.find((u) => u.category === "TELEHENDLER");
                  if (th) handleUnitSelect(th.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  vehicleCategoryFilter === "TELEHENDLER"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <span>🚜 Telehandler</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setVehicleCategoryFilter("STORING_TRUCK");
                  const st = units.find((u) => u.category === "STORING_TRUCK");
                  if (st) handleUnitSelect(st.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  vehicleCategoryFilter === "STORING_TRUCK"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <span>🚛 Storing</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setVehicleCategoryFilter("FUEL_TRUCK");
                  const ft = units.find((u) => u.category === "FUEL_TRUCK");
                  if (ft) handleUnitSelect(ft.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  vehicleCategoryFilter === "FUEL_TRUCK"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <span>⛽ Fuel Truck</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setVehicleCategoryFilter("GENSET");
                  const gs = units.find((u) => u.category === "GENSET");
                  if (gs) handleUnitSelect(gs.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  vehicleCategoryFilter === "GENSET"
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-bold"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <span>⚡ Genset</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setVehicleCategoryFilter("COMPRESSOR");
                  const cp = units.find((u) => u.category === "COMPRESSOR");
                  if (cp) handleUnitSelect(cp.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  vehicleCategoryFilter === "COMPRESSOR"
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <span>💨 Compressor</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* NAMA OPERATOR/DRIVER (Dropdown dari User database kecuali SITE_MANAGER) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  NAMA OPERATOR / DRIVER <span className="text-amber-400">*</span>
                </label>
                {isDriverLocked && (
                  <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Terkunci otomatis
                  </span>
                )}
              </div>
              
              {isLoadingDrivers ? (
                <div className="py-2 text-xs text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Memuat data operator/driver...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Select from existing users */}
                  <select
                    value={selectedDriverId}
                    onChange={(e) => handleDriverSelect(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer text-white"
                  >
                    <option value="" disabled className="bg-slate-950">
                      -- Pilih Operator/Driver dari Database User --
                    </option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id} className="bg-slate-950">
                        {d.firstName} {d.lastName || ""} (NRP: {d.nrp} - {d.posision} / Dept. {d.department})
                      </option>
                    ))}
                    <option value="custom" className="bg-slate-950 text-amber-400">
                      + Input Manual / Nama Lainnya...
                    </option>
                  </select>

                  {/* Name field (Locked/ReadOnly if selected from DB) */}
                  <div className="relative">
                    {isDriverLocked ? (
                      <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    ) : (
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    )}
                    <input
                      type="text"
                      required
                      readOnly={isDriverLocked}
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="Nama lengkap operator/driver"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none transition-all ${
                        isDriverLocked
                          ? "bg-slate-900/90 border border-slate-800 text-slate-300 cursor-not-allowed select-none focus:ring-0"
                          : "bg-slate-950/70 border border-slate-800 placeholder:text-slate-500 focus:ring-1 focus:ring-amber-500"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* NRP (Locked/ReadOnly if selected from DB) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  NRP (Nomor Registrasi Pokok) <span className="text-amber-400">*</span>
                </label>
                {isDriverLocked && (
                  <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Terkunci otomatis
                  </span>
                )}
              </div>
              <div className="relative">
                {isDriverLocked && (
                  <Lock className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                )}
                <input
                  type="number"
                  required
                  readOnly={isDriverLocked}
                  value={driverNrp}
                  onChange={(e) => setDriverNrp(e.target.value)}
                  placeholder="NRP terisi otomatis sesuai driver"
                  className={`w-full py-2.5 rounded-xl text-xs focus:outline-none transition-all ${
                    isDriverLocked
                      ? "pl-10 pr-3.5 bg-slate-900/90 border border-slate-800 text-slate-300 cursor-not-allowed select-none focus:ring-0"
                      : "px-3.5 bg-slate-950 border border-slate-800 placeholder:text-slate-500 focus:ring-1 focus:ring-amber-500"
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* No Unit */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  No Unit <span className="text-amber-400">*</span>
                </label>
                {selectedUnit && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">
                    {selectedUnit.category}
                  </span>
                )}
              </div>
              {isLoadingUnits ? (
                <div className="py-2 text-xs text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Memuat unit...</span>
                </div>
              ) : (
                <select
                  value={selectedUnitId}
                  onChange={(e) => handleUnitSelect(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="" disabled className="bg-slate-950">-- Pilih No Unit --</option>
                  {filteredUnits.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-950">
                      {u.unitNo} ({u.brand} - {u.description}) [{u.category}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Hour Meter (HM) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Hour Meter (HM) {(isTelehandler || isGenset || isCompressor) && <span className="text-amber-400">*</span>}
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  required={isTelehandler || isGenset || isCompressor}
                  value={hourMeter}
                  onChange={(e) => setHourMeter(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder={isTelehandler || isGenset || isCompressor ? "Wajib diisi (Contoh: 340.5)" : "Opsional (Contoh: 120)"}
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs focus:outline-none ${
                    isTelehandler || isGenset || isCompressor
                      ? "border-amber-500/50 focus:ring-1 focus:ring-amber-500 bg-amber-500/5"
                      : "border-slate-800 focus:ring-1 focus:ring-amber-500"
                  }`}
                />
              </div>
            </div>

            {/* KM UNIT (Khusus unit bergerak) */}
            {!isGenset && !isCompressor && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  KM UNIT <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Gauge className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    required={!isGenset && !isCompressor}
                    value={km}
                    onChange={(e) => setKm(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Contoh: 45200"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className={`grid grid-cols-1 ${isTelehandler || isStoringTruck || isFuelTruck || isGenset ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-4 pt-1`}>
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

            {/* Nopol (Khusus LV / Non-Telehandler, Non-StoringTruck, Non-FuelTruck, Non-Genset, Non-Compressor) */}
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

            {/* Section */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Section <span className="text-amber-400">*</span>
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
        </div>

        {/* ========================================================================= */}
        {/* MODE A-00: COMPRESSOR FORM CHECKLIST (10 DIESEL / 9 LISTRIK)              */}
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
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-teal-400" />
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
                  className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-yellow-500/15 text-yellow-400 font-bold text-xs flex items-center justify-center border border-yellow-500/20">
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
          <div className="space-y-5">
            {/* Header Fuel Truck Inspection */}
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

            {/* 3 Categories */}
            {FUEL_TRUCK_CATEGORIES.map((cat, catIdx) => {
              const catItems = fuelTruckChecks.filter((item) => item.category === cat.name);
              const goodCount = catItems.filter((i) => i.condition === "BAIK" || i.condition === "NORMAL").length;
              const isAllGood = goodCount === catItems.length;

              return (
                <div
                  key={cat.id}
                  className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-400 font-bold text-xs flex items-center justify-center border border-cyan-500/20">
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

            {/* Section: Temuan & Catatan Tambahan Fuel Truck */}
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
          <div className="space-y-5">
            {/* Header Storing Truck Inspection */}
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
                    Pemeriksaan kondisi umum truk, kompressor diesel, dan hydraulic tyre lifter. Status: <strong className="text-emerald-400">NORMAL</strong> / <strong className="text-rose-400">TIDAK NORMAL</strong>.
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

            {/* 3 Categories */}
            {STORING_TRUCK_CATEGORIES.map((cat, catIdx) => {
              const catItems = storingTruckChecks.filter((item) => item.category === cat.name);
              const goodCount = catItems.filter((i) => i.condition === "NORMAL" || i.condition === "BAIK").length;
              const isAllGood = goodCount === catItems.length;

              return (
                <div
                  key={cat.id}
                  className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/20">
                        {catIdx + 1}
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                          {cat.name}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {catItems.length} poin pemeriksaan &bull; Status:{" "}
                          <span className={isAllGood ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                            {goodCount}/{catItems.length} Normal
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
                      const isProblem = check.condition === "TIDAK NORMAL" || check.condition === "TIDAK BAIK";

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
                                onClick={() => handleStoringTruckCondition(check.id, "TIDAK NORMAL")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                  isProblem
                                    ? "bg-rose-500 text-white font-extrabold shadow-md shadow-rose-500/20"
                                    : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                                }`}
                              >
                                TIDAK NORMAL
                              </button>
                            </div>
                          </div>

                          {isProblem && (
                            <div className="pt-2 border-t border-slate-800/80 animate-in fade-in duration-150">
                              <input
                                type="text"
                                value={check.note || ""}
                                onChange={(e) => handleStoringTruckNote(check.id, e.target.value)}
                                placeholder={`Catatan detail untuk "${check.item}" (penjelasan ketidaksesuaian/kerusakan)...`}
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

            {/* Section: Fit to Work Operator Storing Truck (5 Pertanyaan) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                    KELAYAKAN OPERATOR / FIT TO WORK (5 PERTANYAAN)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Jawab pernyataan kesehatan, jam tidur, dan kepatuhan aturan K3 berikut dengan jujur.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {storingTruckFitToWork.map((ftw, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between gap-3"
                  >
                    <span className="text-xs font-semibold text-slate-200 leading-snug">
                      {idx + 1}. {ftw.question}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleStoringTruckFitToWorkAnswer(idx, "YA")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          ftw.answer === "YA"
                            ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        YA
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStoringTruckFitToWorkAnswer(idx, "TIDAK")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          ftw.answer === "TIDAK"
                            ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20"
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

            {/* Section: Temuan & Catatan Tambahan Storing Truck */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <FileText className="w-5 h-5 text-amber-400" />
                <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  TEMUAN DAN CATATAN TAMBAHAN (OPSIONAL)
                </h4>
              </div>
              <p className="text-xs text-slate-400">
                Tuliskan temuan kerusakan, kebocoran oli/hidrolik, kendala kompresor, atau catatan penting lainnya.
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
        ) : isTelehandler ? (
          <div className="space-y-5">
            {/* Header Telehandler Inspection */}
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
                    Pilihan status: <strong className="text-emerald-400">BAIK</strong>, <strong className="text-rose-400">TIDAK BAIK</strong>, atau <strong className="text-amber-400">PERLU TINDAKAN</strong>.
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

            {/* 7 Grouped Categories */}
            {TELEHANDLER_CATEGORIES.map((cat, catIdx) => {
              const catItems = telehandlerChecks.filter((item) => item.category === cat.name);
              const goodCount = catItems.filter((i) => i.condition === "BAIK").length;
              const isAllGood = goodCount === catItems.length;

              return (
                <div
                  key={cat.id}
                  className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl"
                >
                  {/* Category Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/20">
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

                  {/* Category Items List */}
                  <div className="space-y-3">
                    {catItems.map((check) => {
                      const isProblem = check.condition !== "BAIK";

                      return (
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

                          {/* Optional Note Field if Not Baik */}
                          {isProblem && (
                            <div className="pt-2 border-t border-slate-800/80 animate-in fade-in duration-150">
                              <input
                                type="text"
                                value={check.note || ""}
                                onChange={(e) => handleTelehandlerNote(check.id, e.target.value)}
                                placeholder={`Catatan detail untuk "${check.item}" (penjelasan kendala/tindakan)...`}
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

            {/* Section: Temuan & Catatan Tambahan Telehandler */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <FileText className="w-5 h-5 text-amber-400" />
                <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  TEMUAN DAN CATATAN TAMBAHAN (OPSIONAL)
                </h4>
              </div>
              <p className="text-xs text-slate-400">
                Tuliskan temuan abnormal, kebocoran tambahan, atau rekomendasi perbaikan untuk unit Telehandler.
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
        ) : (
          /* ========================================================================= */
          /* MODE B: STANDARD LIGHT VEHICLE (LV) CHECKLIST (20 ITEMS + TYRE + K3)      */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* ================= 2. GENERAL CHECK (BAKU: 20 ITEMS) ================= */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Disc className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                      2. General Check / Keterangan Kerusakan
                    </h2>
                    <p className="text-xs text-slate-400">Pilih kondisi (Baik, Minor, Major) untuk 20 item inspeksi fisik &amp; mesin baku.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Baik</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">Minor</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">Major</span>
                </div>
              </div>

              {/* 20 Baku Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {damageChecks.map((check, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                      check.condition === "MAJOR"
                        ? "bg-rose-950/20 border-rose-500/40"
                        : check.condition === "MINOR"
                        ? "bg-amber-950/20 border-amber-500/40"
                        : "bg-slate-950/60 border-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {check.item}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDamageCondition(index, "BAIK")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          check.condition === "BAIK"
                            ? "bg-emerald-500 text-slate-950 font-extrabold"
                            : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                        }`}
                      >
                        Baik
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDamageCondition(index, "MINOR")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          check.condition === "MINOR"
                            ? "bg-amber-400 text-slate-950 font-extrabold"
                            : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                        }`}
                      >
                        Minor
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDamageCondition(index, "MAJOR")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          check.condition === "MAJOR"
                            ? "bg-rose-500 text-white font-extrabold"
                            : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                        }`}
                      >
                        Major
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= 3. TYRE CHECK ================= */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Disc className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                    3. Tyre Check
                  </h2>
                  <p className="text-xs text-slate-400">Pemeriksaan kondisi ban, tekanan, posisi bermasalah, dan catatan kerusakan.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kondisi Ban */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Kondisi Ban <span className="text-amber-400">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["Baik", "Retak", "Botak", "Bocor"] as const).map((c) => {
                      const upperC = c.toUpperCase() as "BAIK" | "RETAK" | "BOTAK" | "BOCOR";
                      const isSelected = tyreCheck.condition === upperC;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setTyreCheck({ ...tyreCheck, condition: upperC })}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                            isSelected
                              ? upperC === "BAIK"
                                ? "bg-emerald-500 text-slate-950 border-emerald-400"
                                : "bg-amber-400 text-slate-950 border-amber-300"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tekanan Ban */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Tekanan Ban <span className="text-amber-400">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["Baik", "Retak", "Botak", "Bocor"] as const).map((p) => {
                      const upperP = p.toUpperCase() as "BAIK" | "RETAK" | "BOTAK" | "BOCOR";
                      const isSelected = tyreCheck.pressure === upperP;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setTyreCheck({ ...tyreCheck, pressure: upperP })}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                            isSelected
                              ? upperP === "BAIK"
                                ? "bg-emerald-500 text-slate-950 border-emerald-400"
                                : "bg-amber-400 text-slate-950 border-amber-300"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Posisi Ban Bermasalah */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Posisi Ban Bermasalah
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GF_TYRE_POSITIONS.map((pos) => {
                    const isSelected = tyreCheck.problemPositions.includes(pos);
                    return (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => handleToggleTyrePos(pos)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? "bg-rose-500/20 border-rose-500 text-rose-300"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <span>{pos}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Keterangan Kerusakan Ban */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Keterangan Kerusakan Ban
                </label>
                <textarea
                  rows={2}
                  value={tyreCheck.notes || ""}
                  onChange={(e) => setTyreCheck({ ...tyreCheck, notes: e.target.value })}
                  placeholder="Tuliskan catatan kondisi ban jika terdapat kerusakan..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* ================= 4. SAFETY TOOL (BAKU: 6 ITEMS) ================= */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                    4. Safety Tool (Perlengkapan K3)
                  </h2>
                  <p className="text-xs text-slate-400">Pilih status ketersediaan perlengkapan keselamatan K3 (Ada / Tidak Ada).</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {safetyTools.map((tool, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                      tool.status === "ADA" ? "bg-slate-950/60 border-slate-800/80" : "bg-rose-950/20 border-rose-500/40"
                    }`}
                  >
                    <span className="text-xs font-semibold text-slate-200 truncate pr-2">
                      {tool.item}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSafetyStatus(index, "ADA")}
                        className={`px-3.5 py-1 rounded-xl text-xs font-bold transition-all ${
                          tool.status === "ADA"
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        Ada
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSafetyStatus(index, "TIDAK_ADA")}
                        className={`px-3.5 py-1 rounded-xl text-xs font-bold transition-all ${
                          tool.status === "TIDAK_ADA"
                            ? "bg-rose-500 text-white"
                            : "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        Tidak Ada
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= 5. FIT TO WORK + PSM (BAKU: 10 ITEMS) ================= */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                    5. FIT TO WORK + PSM
                  </h2>
                  <p className="text-xs text-slate-400">10 pertanyaan baku pemeriksaan kesiapan mandiri &amp; kepatuhan K3 pengemudi (YA / TIDAK).</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {fitToWork.map((ftw, index) => (
                  <div
                    key={index}
                    className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">
                        {ftw.question}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleFitToWorkAnswer(index, "YA")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          ftw.answer === "YA"
                            ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-extrabold"
                            : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                        }`}
                      >
                        YA
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFitToWorkAnswer(index, "TIDAK")}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          ftw.answer === "TIDAK"
                            ? "bg-slate-700 text-white shadow-md shadow-slate-700/20 font-extrabold"
                            : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                        }`}
                      >
                        TIDAK
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= 6. WARNING / TIDAK LAYAK ================= */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                      6. WARNING / TIDAK LAYAK (Jika Terdapat Masalah)
                    </h2>
                    <p className="text-xs text-slate-400">Aktifkan bagian ini jika unit memiliki kendala atau kondisi driver tidak fit.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setHasWarning(!hasWarning)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    hasWarning
                      ? "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {hasWarning ? "✓ Masalah Terdeteksi" : "+ Ada Kendala / Warning"}
                </button>
              </div>

              {hasWarning && (
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Jenis Masalah */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Jenis Masalah
                      </label>
                      <select
                        value={warningDetails.problemType}
                        onChange={(e) => setWarningDetails({ ...warningDetails, problemType: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                      >
                        <option value="Unit bermasalah" className="bg-slate-950">Unit bermasalah</option>
                        <option value="Driver tidak fit" className="bg-slate-950">Driver tidak fit</option>
                      </select>
                    </div>

                    {/* Tindakan yang diambil */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Tindakan yang diambil
                      </label>
                      <select
                        value={warningDetails.actionTaken}
                        onChange={(e) => setWarningDetails({ ...warningDetails, actionTaken: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                      >
                        <option value="Istirahat" className="bg-slate-950">Istirahat</option>
                        <option value="Ganti Driver" className="bg-slate-950">Ganti Driver</option>
                        <option value="Perbaikan Unit" className="bg-slate-950">Perbaikan Unit</option>
                      </select>
                    </div>
                  </div>

                  {/* Keterangan Tambahan */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Keterangan tambahan
                    </label>
                    <textarea
                      rows={2}
                      value={warningDetails.additionalNotes || ""}
                      onChange={(e) => setWarningDetails({ ...warningDetails, additionalNotes: e.target.value })}
                      placeholder="Jelaskan detail kendala teknis atau kondisi pengemudi..."
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= DATA OPERASI & FINAL / KESIMPULAN ================= */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                {isGenset
                  ? "3. Validasi & Kesimpulan Kelayakan Genset"
                  : isFuelTruck
                  ? "3. Validasi & Kesimpulan Kelayakan Fuel Truck"
                  : isStoringTruck
                  ? "4. Validasi & Kesimpulan Kelayakan Storing Truck"
                  : isTelehandler
                  ? "3. Validasi & Kesimpulan Kelayakan Telehandler"
                  : "7. Data Operasi & Final (Validasi & Kesimpulan)"}
              </h2>
              <p className="text-xs text-slate-400">Validasi kejujuran data pengemudi dan kesimpulan status kelayakan operasi.</p>
            </div>
          </div>

          {/* Validasi Driver Checkbox */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
            <input
              type="checkbox"
              id="dashboardDriverValidation"
              checked={driverValidation}
              onChange={(e) => setDriverValidation(e.target.checked)}
              className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
            />
            <label htmlFor="dashboardDriverValidation" className="text-xs font-bold text-white cursor-pointer select-none">
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
                    Status Unit {isGenset ? "Genset" : isFuelTruck ? "Fuel Truck" : isStoringTruck ? "Storing Truck" : isTelehandler ? "Telehandler" : "Armada"}
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
                  <span className="text-xs font-bold text-white">Status Operator / Inspector</span>
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
          {!isTelehandler && !isStoringTruck && !isFuelTruck && !isGenset && (
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
              {isGenset
                ? "Formulir P2H Genset (30 Item) • Mode Manajemen Dashboard"
                : isFuelTruck
                ? "Formulir P2H Fuel Truck (26 Item) • Mode Manajemen Dashboard"
                : isStoringTruck
                ? "Formulir P2H Storing Truck (37 Item) • Mode Manajemen Dashboard"
                : isTelehandler
                ? "Formulir P2H Telehandler (35 Item) • Mode Manajemen Dashboard"
                : "Formulir P2H Light Vehicle • Mode Manajemen Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/dashboard/p2h"
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 text-center transition-colors"
            >
              Batal
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
  );
}
