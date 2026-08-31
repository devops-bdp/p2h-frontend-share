import { getAuthSession } from "./auth.service";
import { API_BASE_URL } from "./api.config";

export const MASTER_PUBLIC_P2H_TOKEN = "#BATARAMPH2026";
export const DEFAULT_PUBLIC_P2H_TOKEN = "#BATARAMPH2026";

export const CATEGORY_PUBLIC_TOKENS: Record<string, string> = {
  LIGHT_VECHICLE: "#BATARALV2026",
  TELEHENDLER: "#BATARATH2026",
  STORING_TRUCK: "#BATARAST2026",
  FUEL_TRUCK: "#BATARAFT2026",
  GENSET: "#BATARAGS2026",
  COMPRESSOR: "#BATARACP2026",
  DUMP_TRUCK: "#BATARADT2026",
};

export function getPublicTokenForCategory(category?: string): string {
  if (category && CATEGORY_PUBLIC_TOKENS[category]) {
    return CATEGORY_PUBLIC_TOKENS[category];
  }
  return MASTER_PUBLIC_P2H_TOKEN;
}

export function saveCategorySessionToken(category: string, token: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(`p2h_token_${category}`, token.trim());
  }
}

export function getCategorySessionToken(category: string): string | null {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem(`p2h_token_${category}`) || null;
  }
  return null;
}

export function clearCategorySessionToken(category: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(`p2h_token_${category}`);
  }
}

export interface DamageCheckItem {
  item: string;
  condition: "BAIK" | "MINOR" | "MAJOR";
  note?: string;
}

export interface TyreCheckData {
  condition: "BAIK" | "RETAK" | "BOTAK" | "BOCOR";
  pressure: "BAIK" | "RETAK" | "BOTAK" | "BOCOR";
  problemPositions: string[];
  notes?: string;
}

export interface SafetyToolItem {
  item: string;
  status: "ADA" | "TIDAK_ADA";
}

export interface FitToWorkItem {
  question: string;
  answer: "YA" | "TIDAK";
}

export interface WarningDetails {
  problemType?: "Unit bermasalah" | "Driver tidak fit" | string;
  actionTaken?: "Istirahat" | "Ganti Driver" | "Perbaikan Unit" | string;
  additionalNotes?: string;
}

export type TelehandlerCondition = "BAIK" | "TIDAK BAIK" | "PERLU TINDAKAN";

export interface TelehandlerCheckItem {
  id: number;
  item: string;
  category: string;
  condition: TelehandlerCondition;
  note?: string;
}

export const TELEHANDLER_CATEGORIES = [
  { id: "exterior", name: "1. Pemeriksaan Fisik Luar (Walkaround Exterior)" },
  { id: "tyre", name: "2. Kondisi Ban, Baut & Suspensi (Tyre & Underbody)" },
  { id: "attachment", name: "3. Attachment, Fork & Boom Hidrolik" },
  { id: "fluids", name: "4. Pemeriksaan Fluida & Level Mesin" },
  { id: "cabin", name: "5. Kabin & Operasional Mesin (Cabin & Engine)" },
  { id: "functions", name: "6. Uji Fungsi Gerak Boom & Manuver" },
  { id: "safety", name: "7. Perlengkapan Keselamatan & K3 (Safety Equipment)" },
];

export const BAKU_TELEHANDLER_CHECKS: TelehandlerCheckItem[] = [
  // 1. Fisik Luar (Exterior)
  { id: 1, category: "1. Pemeriksaan Fisik Luar (Walkaround Exterior)", item: "Kondisi umum unit bersih & tidak ada kebocoran", condition: "BAIK" },
  { id: 2, category: "1. Pemeriksaan Fisik Luar (Walkaround Exterior)", item: "Kondisi body dan panel aman, tidak ada kerusakan", condition: "BAIK" },
  { id: 3, category: "1. Pemeriksaan Fisik Luar (Walkaround Exterior)", item: "Tangga naik & handrail dalam kondisi baik", condition: "BAIK" },
  { id: 4, category: "1. Pemeriksaan Fisik Luar (Walkaround Exterior)", item: "Spion & kaca depan lengkap dan bersih", condition: "BAIK" },
  { id: 5, category: "1. Pemeriksaan Fisik Luar (Walkaround Exterior)", item: "Wiper dan washer berfungsi", condition: "BAIK" },
  { id: 6, category: "1. Pemeriksaan Fisik Luar (Walkaround Exterior)", item: "Lampu kerja, lampu utama, lampu rem, dan sein berfungsi", condition: "BAIK" },
  { id: 7, category: "1. Pemeriksaan Fisik Luar (Walkaround Exterior)", item: "Klakson berfungsi normal", condition: "BAIK" },

  // 2. Ban & Baut Roda (Tyre & Underbody)
  { id: 8, category: "2. Kondisi Ban, Baut & Suspensi (Tyre & Underbody)", item: "Kondisi tyre tidak aus berlebihan / sobek", condition: "BAIK" },
  { id: 9, category: "2. Kondisi Ban, Baut & Suspensi (Tyre & Underbody)", item: "Tekanan tyre sesuai standar", condition: "BAIK" },
  { id: 10, category: "2. Kondisi Ban, Baut & Suspensi (Tyre & Underbody)", item: "Baut roda lengkap dan kencang", condition: "BAIK" },
  { id: 11, category: "2. Kondisi Ban, Baut & Suspensi (Tyre & Underbody)", item: "Suspensi & axle tidak ada kebocoran / kerusakan", condition: "BAIK" },

  // 3. Attachment, Fork & Boom
  { id: 12, category: "3. Attachment, Fork & Boom Hidrolik", item: "Kondisi fork tidak bengkok / retak", condition: "BAIK" },
  { id: 13, category: "3. Attachment, Fork & Boom Hidrolik", item: "Locking pin attachment terpasang dengan baik", condition: "BAIK" },
  { id: 14, category: "3. Attachment, Fork & Boom Hidrolik", item: "Hidrolik boom tidak bocor", condition: "BAIK" },
  { id: 15, category: "3. Attachment, Fork & Boom Hidrolik", item: "Boom extension bergerak normal", condition: "BAIK" },

  // 4. Fluida & Pelumas
  { id: 16, category: "4. Pemeriksaan Fluida & Level Mesin", item: "Level oli engine normal", condition: "BAIK" },
  { id: 17, category: "4. Pemeriksaan Fluida & Level Mesin", item: "Level oli hidrolik normal", condition: "BAIK" },
  { id: 18, category: "4. Pemeriksaan Fluida & Level Mesin", item: "Level minyak rem normal", condition: "BAIK" },
  { id: 19, category: "4. Pemeriksaan Fluida & Level Mesin", item: "Tidak ada kebocoran fluida di bawah unit", condition: "BAIK" },

  // 5. Kabin & Mesin
  { id: 20, category: "5. Kabin & Operasional Mesin (Cabin & Engine)", item: "Kursi & seatbelt berfungsi", condition: "BAIK" },
  { id: 21, category: "5. Kabin & Operasional Mesin (Cabin & Engine)", item: "Panel indikator & display hidup normal", condition: "BAIK" },
  { id: 22, category: "5. Kabin & Operasional Mesin (Cabin & Engine)", item: "Engine start normal tanpa suara abnormal", condition: "BAIK" },
  { id: 23, category: "5. Kabin & Operasional Mesin (Cabin & Engine)", item: "Pedal gas & rem responsif", condition: "BAIK" },
  { id: 24, category: "5. Kabin & Operasional Mesin (Cabin & Engine)", item: "Parking brake berfungsi", condition: "BAIK" },
  { id: 25, category: "5. Kabin & Operasional Mesin (Cabin & Engine)", item: "Steering normal tanpa getaran abnormal", condition: "BAIK" },

  // 6. Uji Fungsi Gerak Boom & Manuver
  { id: 26, category: "6. Uji Fungsi Gerak Boom & Manuver", item: "Boom naik/turun normal", condition: "BAIK" },
  { id: 27, category: "6. Uji Fungsi Gerak Boom & Manuver", item: "Boom extend/retract normal", condition: "BAIK" },
  { id: 28, category: "6. Uji Fungsi Gerak Boom & Manuver", item: "Tilt fork berfungsi", condition: "BAIK" },
  { id: 29, category: "6. Uji Fungsi Gerak Boom & Manuver", item: "Sistem pengereman bekerja baik", condition: "BAIK" },
  { id: 30, category: "6. Uji Fungsi Gerak Boom & Manuver", item: "Unit berjalan maju/mundur normal", condition: "BAIK" },

  // 7. Safety & K3
  { id: 31, category: "7. Perlengkapan Keselamatan & K3 (Safety Equipment)", item: "APAR tersedia & masih layak", condition: "BAIK" },
  { id: 32, category: "7. Perlengkapan Keselamatan & K3 (Safety Equipment)", item: "Kotak P3K tersedia", condition: "BAIK" },
  { id: 33, category: "7. Perlengkapan Keselamatan & K3 (Safety Equipment)", item: "Reverse alarm berfungsi", condition: "BAIK" },
  { id: 34, category: "7. Perlengkapan Keselamatan & K3 (Safety Equipment)", item: "Rotating beacon (lampu strobo) berfungsi", condition: "BAIK" },
  { id: 35, category: "7. Perlengkapan Keselamatan & K3 (Safety Equipment)", item: "Seatbelt wajib digunakan", condition: "BAIK" },
];

export type StoringTruckCondition = "NORMAL" | "RUSAK" | "TIDAK NORMAL" | "BAIK" | "TIDAK BAIK" | "PERLU TINDAKAN";

export interface StoringTruckCheckItem {
  id: number;
  item: string;
  category: string;
  condition: StoringTruckCondition;
  note?: string;
}

export const STORING_TRUCK_CATEGORIES = [
  { id: "general_truck", name: "1. Kondisi Umum Truck (28 Item)" },
  { id: "compressor", name: "2. Pengecekan Kompressor Diesel (4 Item)" },
  { id: "hydraulic", name: "3. Hydraulic Attachment Belakang / Tyre Lifter (5 Item)" },
];

export const BAKU_STORING_TRUCK_CHECKS: StoringTruckCheckItem[] = [
  // 1. Kondisi Umum Truck (28 Item)
  { id: 1, category: "1. Kondisi Umum Truck (28 Item)", item: "Body truck tidak rusak", condition: "NORMAL" },
  { id: 2, category: "1. Kondisi Umum Truck (28 Item)", item: "Tidak ada kebocoran oli", condition: "NORMAL" },
  { id: 3, category: "1. Kondisi Umum Truck (28 Item)", item: "Klakson berfungsi normal", condition: "NORMAL" },
  { id: 4, category: "1. Kondisi Umum Truck (28 Item)", item: "Ban truck normal (tidak gundul / bocor)", condition: "NORMAL" },
  { id: 5, category: "1. Kondisi Umum Truck (28 Item)", item: "Kaca & spion bersih dan utuh", condition: "NORMAL" },
  { id: 6, category: "1. Kondisi Umum Truck (28 Item)", item: "Level oli mesin", condition: "NORMAL" },
  { id: 7, category: "1. Kondisi Umum Truck (28 Item)", item: "Level oli rem", condition: "NORMAL" },
  { id: 8, category: "1. Kondisi Umum Truck (28 Item)", item: "Level air radiator", condition: "NORMAL" },
  { id: 9, category: "1. Kondisi Umum Truck (28 Item)", item: "Level air wiper", condition: "NORMAL" },
  { id: 10, category: "1. Kondisi Umum Truck (28 Item)", item: "Lampu depan berfungsi", condition: "NORMAL" },
  { id: 11, category: "1. Kondisi Umum Truck (28 Item)", item: "Lampu belakang berfungsi", condition: "NORMAL" },
  { id: 12, category: "1. Kondisi Umum Truck (28 Item)", item: "Lampu rem berfungsi", condition: "NORMAL" },
  { id: 13, category: "1. Kondisi Umum Truck (28 Item)", item: "Lampu sein berfungsi", condition: "NORMAL" },
  { id: 14, category: "1. Kondisi Umum Truck (28 Item)", item: "Klakson cadangan / mundur berfungsi", condition: "NORMAL" },
  { id: 15, category: "1. Kondisi Umum Truck (28 Item)", item: "Indikator panel normal", condition: "NORMAL" },
  { id: 16, category: "1. Kondisi Umum Truck (28 Item)", item: "Rem utama berfungsi", condition: "NORMAL" },
  { id: 17, category: "1. Kondisi Umum Truck (28 Item)", item: "Rem tangan berfungsi", condition: "NORMAL" },
  { id: 18, category: "1. Kondisi Umum Truck (28 Item)", item: "Tidak ada kebocoran pada sistem rem", condition: "NORMAL" },
  { id: 19, category: "1. Kondisi Umum Truck (28 Item)", item: "Tekanan rem normal", condition: "NORMAL" },
  { id: 20, category: "1. Kondisi Umum Truck (28 Item)", item: "Tekanan ban sesuai", condition: "NORMAL" },
  { id: 21, category: "1. Kondisi Umum Truck (28 Item)", item: "Tidak ada kebocoran ban", condition: "NORMAL" },
  { id: 22, category: "1. Kondisi Umum Truck (28 Item)", item: "Kondisi tapak ban tidak retak / sobek", condition: "NORMAL" },
  { id: 23, category: "1. Kondisi Umum Truck (28 Item)", item: "Baut roda kencang", condition: "NORMAL" },
  { id: 24, category: "1. Kondisi Umum Truck (28 Item)", item: "Velg tidak retak", condition: "NORMAL" },
  { id: 25, category: "1. Kondisi Umum Truck (28 Item)", item: "Kaca depan utuh tanpa retak", condition: "NORMAL" },
  { id: 26, category: "1. Kondisi Umum Truck (28 Item)", item: "Wiper berfungsi", condition: "NORMAL" },
  { id: 27, category: "1. Kondisi Umum Truck (28 Item)", item: "Sabuk pengaman tersedia & berfungsi", condition: "NORMAL" },
  { id: 28, category: "1. Kondisi Umum Truck (28 Item)", item: "Pintu dapat dibuka/tutup dengan baik", condition: "NORMAL" },

  // 2. Pengecekan Kompressor Diesel (4 Item)
  { id: 29, category: "2. Pengecekan Kompressor Diesel (4 Item)", item: "Kondisi tabung kompressor", condition: "NORMAL" },
  { id: 30, category: "2. Pengecekan Kompressor Diesel (4 Item)", item: "Oli kompressor", condition: "NORMAL" },
  { id: 31, category: "2. Pengecekan Kompressor Diesel (4 Item)", item: "Kondisi hose-hose kompressor", condition: "NORMAL" },
  { id: 32, category: "2. Pengecekan Kompressor Diesel (4 Item)", item: "Fanbelt kompressor", condition: "NORMAL" },

  // 3. Hydraulic Attachment Belakang (5 Item)
  { id: 33, category: "3. Hydraulic Attachment Belakang / Tyre Lifter (5 Item)", item: "Oli Hydraulic", condition: "NORMAL" },
  { id: 34, category: "3. Hydraulic Attachment Belakang / Tyre Lifter (5 Item)", item: "Remote attachment", condition: "NORMAL" },
  { id: 35, category: "3. Hydraulic Attachment Belakang / Tyre Lifter (5 Item)", item: "Kondisi cylinder apakah ada kebocoran", condition: "NORMAL" },
  { id: 36, category: "3. Hydraulic Attachment Belakang / Tyre Lifter (5 Item)", item: "Kondisi hose apakah ada kebocoran", condition: "NORMAL" },
  { id: 37, category: "3. Hydraulic Attachment Belakang / Tyre Lifter (5 Item)", item: "Pengunci tyre apakah dalam kondisi baik", condition: "NORMAL" },
];

export const BAKU_STORING_TRUCK_FIT_TO_WORK: FitToWorkItem[] = [
  { question: "Apakah operator cukup tidur (minimal 6 jam)?", answer: "YA" },
  { question: "Apakah operator dalam kondisi fit?", answer: "YA" },
  { question: "Apakah operator mengonsumsi obat?", answer: "TIDAK" },
  { question: "Apakah operator siap untuk mematuhi rambu dan peraturan yang ada?", answer: "YA" },
  { question: "Apakah operator memiliki SIMPER sesuai?", answer: "YA" },
];

// ============================================================================
// P2H FUEL TRUCK CONSTANTS & TYPES (26 ITEMS IN 3 CATEGORIES)
// ============================================================================
export type FuelTruckCondition = "BAIK" | "RUSAK" | "NORMAL" | "TIDAK BAIK" | "PERLU TINDAKAN";

export interface FuelTruckCheckItem {
  id: number;
  category: string;
  item: string;
  condition: FuelTruckCondition;
  note?: string;
}

export const FUEL_TRUCK_CATEGORIES = [
  { id: "CAT_1", name: "1. Item Check General (16 Item)" },
  { id: "CAT_2", name: "2. Item Check Perlengkapan Safety (4 Item)" },
  { id: "CAT_3", name: "3. Persyaratan Masuk Pit (6 Item)" },
];

export const BAKU_FUEL_TRUCK_CHECKS: FuelTruckCheckItem[] = [
  // 1. Item Check General (16 Item)
  { id: 1, category: "1. Item Check General (16 Item)", item: "Fungsi Steering", condition: "BAIK" },
  { id: 2, category: "1. Item Check General (16 Item)", item: "Kondisi Ban dan Baut", condition: "BAIK" },
  { id: 3, category: "1. Item Check General (16 Item)", item: "Kaca Kabin dan Spion", condition: "BAIK" },
  { id: 4, category: "1. Item Check General (16 Item)", item: "Lampu Kerja dan Sign", condition: "BAIK" },
  { id: 5, category: "1. Item Check General (16 Item)", item: "Alarm Mundur", condition: "BAIK" },
  { id: 6, category: "1. Item Check General (16 Item)", item: "Level Oil Lebih dari Batas Maximum", condition: "BAIK" },
  { id: 7, category: "1. Item Check General (16 Item)", item: "Minyak Rem Lebih dari Batas Maximum", condition: "BAIK" },
  { id: 8, category: "1. Item Check General (16 Item)", item: "Air Radiator Lebih dari Batas Maximum", condition: "BAIK" },
  { id: 9, category: "1. Item Check General (16 Item)", item: "Tuas Berfungsi dengan Baik", condition: "BAIK" },
  { id: 10, category: "1. Item Check General (16 Item)", item: "Rem Tangan/Kaki", condition: "BAIK" },
  { id: 11, category: "1. Item Check General (16 Item)", item: "Air Wipper/Washer", condition: "BAIK" },
  { id: 12, category: "1. Item Check General (16 Item)", item: "Klakson", condition: "BAIK" },
  { id: 13, category: "1. Item Check General (16 Item)", item: "Seat Belt", condition: "BAIK" },
  { id: 14, category: "1. Item Check General (16 Item)", item: "Kondisi dan Level Air Aki", condition: "BAIK" },
  { id: 15, category: "1. Item Check General (16 Item)", item: "Body Unit", condition: "BAIK" },
  { id: 16, category: "1. Item Check General (16 Item)", item: "Periksa Spring dan Sistem Suspensi", condition: "BAIK" },

  // 2. Item Check Perlengkapan Safety (4 Item)
  { id: 17, category: "2. Item Check Perlengkapan Safety (4 Item)", item: "Tanda Bahaya Segitiga", condition: "BAIK" },
  { id: 18, category: "2. Item Check Perlengkapan Safety (4 Item)", item: "APAR", condition: "BAIK" },
  { id: 19, category: "2. Item Check Perlengkapan Safety (4 Item)", item: "Kunci Roda dan Roda Cadangan", condition: "BAIK" },
  { id: 20, category: "2. Item Check Perlengkapan Safety (4 Item)", item: "Jack", condition: "BAIK" },

  // 3. Persyaratan Masuk Pit (6 Item)
  { id: 21, category: "3. Persyaratan Masuk Pit (6 Item)", item: "Lampu Atap Kabin", condition: "BAIK" },
  { id: 22, category: "3. Persyaratan Masuk Pit (6 Item)", item: "Rotary Lamp", condition: "BAIK" },
  { id: 23, category: "3. Persyaratan Masuk Pit (6 Item)", item: "Scotlight Reflector", condition: "BAIK" },
  { id: 24, category: "3. Persyaratan Masuk Pit (6 Item)", item: "Identification, Vehicle No", condition: "BAIK" },
  { id: 25, category: "3. Persyaratan Masuk Pit (6 Item)", item: "Buggy Whip", condition: "BAIK" },
  { id: 26, category: "3. Persyaratan Masuk Pit (6 Item)", item: "Radio Komunikasi", condition: "BAIK" },
];

// ================= FORM BAKU GENSET (30 ITEMS DALAM 3 KATEGORI) =================
export type GensetCondition = "BAIK" | "RUSAK" | "NORMAL" | "TIDAK BAIK" | "PERLU TINDAKAN";

export interface GensetCheckItem {
  id: number;
  category: string;
  item: string;
  condition: GensetCondition;
  note?: string;
}

export const GENSET_CATEGORIES = [
  { id: "cat1", name: "1. Pemeriksaan Mesin, Pendingin & Aki (10 Item)" },
  { id: "cat2", name: "2. Sistem Bahan Bakar & Operasi Mesin (10 Item)" },
  { id: "cat3", name: "3. Panel Kontrol, Generator & Fisik Unit (10 Item)" },
];

export const BAKU_GENSET_CHECKS: GensetCheckItem[] = [
  // 1. Pemeriksaan Mesin, Pendingin & Aki (10 Item)
  { id: 1, category: "1. Pemeriksaan Mesin, Pendingin & Aki (10 Item)", item: "Hours Meter Indicator", condition: "BAIK" },
  { id: 2, category: "1. Pemeriksaan Mesin, Pendingin & Aki (10 Item)", item: "Level Air Pendingin Mesin", condition: "BAIK" },
  { id: 3, category: "1. Pemeriksaan Mesin, Pendingin & Aki (10 Item)", item: "Periksa Kondisi Radiator", condition: "BAIK" },
  { id: 4, category: "1. Pemeriksaan Mesin, Pendingin & Aki (10 Item)", item: "Periksa Kebocoran Air Pendingin", condition: "BAIK" },
  { id: 5, category: "1. Pemeriksaan Mesin, Pendingin & Aki (10 Item)", item: "Level Oli Mesin", condition: "BAIK" },
  { id: 6, category: "1. Pemeriksaan Mesin, Pendingin & Aki (10 Item)", item: "Periksa Kebocoran Oli Mesin", condition: "BAIK" },
  { id: 7, category: "1. Pemeriksaan Mesin, Pendingin & Aki (10 Item)", item: "Periksa Saringan Udara", condition: "BAIK" },
  { id: 8, category: "1. Pemeriksaan Mesin, Pendingin & Aki (10 Item)", item: "Periksa Kebocoran System Udara", condition: "BAIK" },
  { id: 9, category: "1. Pemeriksaan Mesin, Pendingin & Aki (10 Item)", item: "Periksa Kondisi Battery", condition: "BAIK" },
  { id: 10, category: "1. Pemeriksaan Mesin, Pendingin & Aki (10 Item)", item: "Level Bahan Bakar Mesin", condition: "BAIK" },

  // 2. Sistem Bahan Bakar & Operasi Mesin (10 Item)
  { id: 11, category: "2. Sistem Bahan Bakar & Operasi Mesin (10 Item)", item: "Periksa Kebocoran Bahan Bakar", condition: "BAIK" },
  { id: 12, category: "2. Sistem Bahan Bakar & Operasi Mesin (10 Item)", item: "Bersihkan Endapan Bahan Bakar", condition: "BAIK" },
  { id: 13, category: "2. Sistem Bahan Bakar & Operasi Mesin (10 Item)", item: "Periksa Kipas Pendingin Radiator", condition: "BAIK" },
  { id: 14, category: "2. Sistem Bahan Bakar & Operasi Mesin (10 Item)", item: "Periksa Ketegangan Belt Kipas", condition: "BAIK" },
  { id: 15, category: "2. Sistem Bahan Bakar & Operasi Mesin (10 Item)", item: "Periksa Baut2 Pengikat Mesin", condition: "BAIK" },
  { id: 16, category: "2. Sistem Bahan Bakar & Operasi Mesin (10 Item)", item: "Periksa Kabel2 Kelistrikan Mesin", condition: "BAIK" },
  { id: 17, category: "2. Sistem Bahan Bakar & Operasi Mesin (10 Item)", item: "Kondisi Start Up Mesin", condition: "BAIK" },
  { id: 18, category: "2. Sistem Bahan Bakar & Operasi Mesin (10 Item)", item: "Periksa Indicator Tekanan Oli Mesin", condition: "BAIK" },
  { id: 19, category: "2. Sistem Bahan Bakar & Operasi Mesin (10 Item)", item: "Periksa Suara Mesin", condition: "BAIK" },
  { id: 20, category: "2. Sistem Bahan Bakar & Operasi Mesin (10 Item)", item: "Monitor Temperature Mesin", condition: "BAIK" },

  // 3. Panel Kontrol, Generator & Fisik Unit (10 Item)
  { id: 21, category: "3. Panel Kontrol, Generator & Fisik Unit (10 Item)", item: "Periksa Kabel2 Kelistrikan Panel", condition: "BAIK" },
  { id: 22, category: "3. Panel Kontrol, Generator & Fisik Unit (10 Item)", item: "Periksa Kondisi Alat Ukur & Saklar", condition: "BAIK" },
  { id: 23, category: "3. Panel Kontrol, Generator & Fisik Unit (10 Item)", item: "Periksa Cara Kerja Alat2 Ukur", condition: "BAIK" },
  { id: 24, category: "3. Panel Kontrol, Generator & Fisik Unit (10 Item)", item: "Periksa Indicator Tegangan / Arus Listrik", condition: "BAIK" },
  { id: 25, category: "3. Panel Kontrol, Generator & Fisik Unit (10 Item)", item: "Periksa Kabel2 Listrik Generator", condition: "BAIK" },
  { id: 26, category: "3. Panel Kontrol, Generator & Fisik Unit (10 Item)", item: "Periksa Baut2 Pengikat Generator", condition: "BAIK" },
  { id: 27, category: "3. Panel Kontrol, Generator & Fisik Unit (10 Item)", item: "Periksa Saklar & Indicator Generator", condition: "BAIK" },
  { id: 28, category: "3. Panel Kontrol, Generator & Fisik Unit (10 Item)", item: "Periksa Suara Generator", condition: "BAIK" },
  { id: 29, category: "3. Panel Kontrol, Generator & Fisik Unit (10 Item)", item: "Monitor Pengoperasian Generator", condition: "BAIK" },
  { id: 30, category: "3. Panel Kontrol, Generator & Fisik Unit (10 Item)", item: "Periksa Kondisi body & Frame", condition: "BAIK" },
];

// ================= FORM BAKU COMPRESSOR (DIESEL & LISTRIK) =================
export type CompressorCondition = "BAIK" | "RUSAK" | "NORMAL" | "TIDAK BAIK" | "PERLU TINDAKAN";

export interface CompressorCheckItem {
  id: number;
  category: "COMPRESSOR DIESEL" | "COMPRESSOR LISTRIK" | string;
  item: string;
  condition: CompressorCondition;
  note?: string;
}

export const COMPRESSOR_CATEGORIES = [
  { id: "diesel", name: "COMPRESSOR DIESEL (10 Item)" },
  { id: "listrik", name: "COMPRESSOR LISTRIK (9 Item)" },
];

export const BAKU_COMPRESSOR_DIESEL_CHECKS: CompressorCheckItem[] = [
  { id: 1, category: "COMPRESSOR DIESEL", item: "Periksa Level Oli Mesin", condition: "BAIK" },
  { id: 2, category: "COMPRESSOR DIESEL", item: "Periksa Kebocoran Oli Mesin", condition: "BAIK" },
  { id: 3, category: "COMPRESSOR DIESEL", item: "Periksa Kebocoran Tangki Angin", condition: "BAIK" },
  { id: 4, category: "COMPRESSOR DIESEL", item: "Periksa Kondisi Baterai", condition: "BAIK" },
  { id: 5, category: "COMPRESSOR DIESEL", item: "Periksa Kondisi Belt", condition: "BAIK" },
  { id: 6, category: "COMPRESSOR DIESEL", item: "Periksa Baut Pengikat Mesin", condition: "BAIK" },
  { id: 7, category: "COMPRESSOR DIESEL", item: "Periksa Suara Mesin", condition: "BAIK" },
  { id: 8, category: "COMPRESSOR DIESEL", item: "Periksa Level Fuel", condition: "BAIK" },
  { id: 9, category: "COMPRESSOR DIESEL", item: "Periksa Selang / Sambungan angin", condition: "BAIK" },
  { id: 10, category: "COMPRESSOR DIESEL", item: "Periksa Alat Ukur (Pressure Gauge)", condition: "BAIK" },
];

export const BAKU_COMPRESSOR_LISTRIK_CHECKS: CompressorCheckItem[] = [
  { id: 1, category: "COMPRESSOR LISTRIK", item: "Periksa Kabel Kelistrikan Mesin", condition: "BAIK" },
  { id: 2, category: "COMPRESSOR LISTRIK", item: "Periksa Kebocoran Tangki Angin", condition: "BAIK" },
  { id: 3, category: "COMPRESSOR LISTRIK", item: "Periksa Kondisi Belt", condition: "BAIK" },
  { id: 4, category: "COMPRESSOR LISTRIK", item: "Periksa Baut Pengikat Mesin", condition: "BAIK" },
  { id: 5, category: "COMPRESSOR LISTRIK", item: "Periksa Suara Mesin", condition: "BAIK" },
  { id: 6, category: "COMPRESSOR LISTRIK", item: "Periksa Kondisi Saklar", condition: "BAIK" },
  { id: 7, category: "COMPRESSOR LISTRIK", item: "Periksa Sistem Safety (MCB/Relay)", condition: "BAIK" },
  { id: 8, category: "COMPRESSOR LISTRIK", item: "Periksa Indikator Alat Ukur (Pressure Gauge)", condition: "BAIK" },
  { id: 9, category: "COMPRESSOR LISTRIK", item: "Periksa Selang / Sambungan angin", condition: "BAIK" },
];

// ================= FORM BAKU DUMP TRUCK (33 ITEMS DALAM 6 KATEGORI) =================
export type DumpTruckCondition = "BAIK" | "RUSAK" | "NORMAL" | "TIDAK BAIK" | "PERLU TINDAKAN";

export interface DumpTruckCheckItem {
  id: number;
  category: string;
  item: string;
  condition: DumpTruckCondition;
  note?: string;
}

export const DUMP_TRUCK_CATEGORIES = [
  { id: "cat1", name: "1. Pemeriksaan Fisik Luar, Bodi & Dump Vessel (6 Item)" },
  { id: "cat2", name: "2. Kondisi Ban, Baut Roda & Suspensi (5 Item)" },
  { id: "cat3", name: "3. Pemeriksaan Mesin & Level Fluida (6 Item)" },
  { id: "cat4", name: "4. Sistem Hidrolik & Dump Hoist (5 Item)" },
  { id: "cat5", name: "5. Kabin, Sistem Pengereman & Kemudi (6 Item)" },
  { id: "cat6", name: "6. Perlengkapan Keselamatan & K3 (5 Item)" },
];

export const BAKU_DUMP_TRUCK_CHECKS: DumpTruckCheckItem[] = [
  // 1. Pemeriksaan Fisik Luar, Bodi & Dump Vessel (6 Item)
  { id: 1, category: "1. Pemeriksaan Fisik Luar, Bodi & Dump Vessel (6 Item)", item: "Kondisi bodi kabin, spion & kaca utuh/bersih", condition: "BAIK" },
  { id: 2, category: "1. Pemeriksaan Fisik Luar, Bodi & Dump Vessel (6 Item)", item: "Kondisi dump vessel (bak) & subframe", condition: "BAIK" },
  { id: 3, category: "1. Pemeriksaan Fisik Luar, Bodi & Dump Vessel (6 Item)", item: "Tangga naik kabin & handrail aman", condition: "BAIK" },
  { id: 4, category: "1. Pemeriksaan Fisik Luar, Bodi & Dump Vessel (6 Item)", item: "Lampu utama, sen, lampu rem, lampu mundur & kerja", condition: "BAIK" },
  { id: 5, category: "1. Pemeriksaan Fisik Luar, Bodi & Dump Vessel (6 Item)", item: "Rotary lamp / strobe & buggy whip", condition: "BAIK" },
  { id: 6, category: "1. Pemeriksaan Fisik Luar, Bodi & Dump Vessel (6 Item)", item: "Klakson & alarm mundur berfungsi", condition: "BAIK" },

  // 2. Kondisi Ban, Baut Roda & Suspensi (5 Item)
  { id: 7, category: "2. Kondisi Ban, Baut Roda & Suspensi (5 Item)", item: "Kondisi tapak ban depan & belakang (tidak aus/sobek)", condition: "BAIK" },
  { id: 8, category: "2. Kondisi Ban, Baut Roda & Suspensi (5 Item)", item: "Tekanan angin ban depan & belakang tandem", condition: "BAIK" },
  { id: 9, category: "2. Kondisi Ban, Baut Roda & Suspensi (5 Item)", item: "Baut roda (wheel nut) lengkap & kencang", condition: "BAIK" },
  { id: 10, category: "2. Kondisi Ban, Baut Roda & Suspensi (5 Item)", item: "Kondisi spring / per daun, trunnion & torque rod", condition: "BAIK" },
  { id: 11, category: "2. Kondisi Ban, Baut Roda & Suspensi (5 Item)", item: "Kerapian & pelindung lumpur (mud flap / rock ejector)", condition: "BAIK" },

  // 3. Pemeriksaan Mesin & Level Fluida (6 Item)
  { id: 12, category: "3. Pemeriksaan Mesin & Level Fluida (6 Item)", item: "Level oli mesin (engine oil dipstick)", condition: "BAIK" },
  { id: 13, category: "3. Pemeriksaan Mesin & Level Fluida (6 Item)", item: "Level air radiator & coolant reservoir", condition: "BAIK" },
  { id: 14, category: "3. Pemeriksaan Mesin & Level Fluida (6 Item)", item: "Level minyak rem & minyak kopling", condition: "BAIK" },
  { id: 15, category: "3. Pemeriksaan Mesin & Level Fluida (6 Item)", item: "Level oli power steering", condition: "BAIK" },
  { id: 16, category: "3. Pemeriksaan Mesin & Level Fluida (6 Item)", item: "Kondisi baterai / accu & kabel terminal", condition: "BAIK" },
  { id: 17, category: "3. Pemeriksaan Mesin & Level Fluida (6 Item)", item: "Tidak ada kebocoran oli, solar atau air di bawah unit", condition: "BAIK" },

  // 4. Sistem Hidrolik & Dump Hoist (5 Item)
  { id: 18, category: "4. Sistem Hidrolik & Dump Hoist (5 Item)", item: "Level oli hidrolik dump", condition: "BAIK" },
  { id: 19, category: "4. Sistem Hidrolik & Dump Hoist (5 Item)", item: "Silinder hidrolik hoist (tidak baret / bocor oli)", condition: "BAIK" },
  { id: 20, category: "4. Sistem Hidrolik & Dump Hoist (5 Item)", item: "Selang hidrolik & sambungan fitting", condition: "BAIK" },
  { id: 21, category: "4. Sistem Hidrolik & Dump Hoist (5 Item)", item: "Fungsi tuas kontrol hoist dump (Up, Hold, Lower)", condition: "BAIK" },
  { id: 22, category: "4. Sistem Hidrolik & Dump Hoist (5 Item)", item: "Safety prop / penahan bak dump berfungsi", condition: "BAIK" },

  // 5. Kabin, Sistem Pengereman & Kemudi (6 Item)
  { id: 23, category: "5. Kabin, Sistem Pengereman & Kemudi (6 Item)", item: "Kursi pengemudi & seatbelt berfungsi", condition: "BAIK" },
  { id: 24, category: "5. Kabin, Sistem Pengereman & Kemudi (6 Item)", item: "Panel indikator, display & pressure gauge angin", condition: "BAIK" },
  { id: 25, category: "5. Kabin, Sistem Pengereman & Kemudi (6 Item)", item: "Fungsi rem utama (service brake / pedal rem angin)", condition: "BAIK" },
  { id: 26, category: "5. Kabin, Sistem Pengereman & Kemudi (6 Item)", item: "Fungsi rem parkir (parking brake) & exhaust brake", condition: "BAIK" },
  { id: 27, category: "5. Kabin, Sistem Pengereman & Kemudi (6 Item)", item: "Sistem kemudi (steering) normal tanpa speling berlebih", condition: "BAIK" },
  { id: 28, category: "5. Kabin, Sistem Pengereman & Kemudi (6 Item)", item: "Wiper dan air washer kaca depan", condition: "BAIK" },

  // 6. Perlengkapan Keselamatan & K3 (5 Item)
  { id: 29, category: "6. Perlengkapan Keselamatan & K3 (5 Item)", item: "APAR 6 kg terpasang & bertekanan baik", condition: "BAIK" },
  { id: 30, category: "6. Perlengkapan Keselamatan & K3 (5 Item)", item: "Kotak P3K lengkap", condition: "BAIK" },
  { id: 31, category: "6. Perlengkapan Keselamatan & K3 (5 Item)", item: "Segitiga pengaman & wheel chock (ganjal ban)", condition: "BAIK" },
  { id: 32, category: "6. Perlengkapan Keselamatan & K3 (5 Item)", item: "Radio komunikasi (Rig 2 arah) berfungsi", condition: "BAIK" },
  { id: 33, category: "6. Perlengkapan Keselamatan & K3 (5 Item)", item: "Sabuk pengaman wajib terpasang saat operasi", condition: "BAIK" },
];

export const BAKU_DUMP_TRUCK_FIT_TO_WORK: FitToWorkItem[] = [
  { question: "Apakah Anda cukup tidur (minimal 6 jam)?", answer: "YA" },
  { question: "Apakah kondisi fisik Anda sehat & fit untuk mengemudi?", answer: "YA" },
  { question: "Apakah Anda tidak meminum obat yang menyebabkan kantuk?", answer: "YA" },
  { question: "Apakah Anda menggunakan APD lengkap & membawa SIMPER aktif?", answer: "YA" },
  { question: "Apakah Anda siap mematuhi batas kecepatan & rambu tambang?", answer: "YA" },
];

export type P2HStatus = "LAYAK" | "TIDAK_LAYAK" | "SIAP" | "TIDAK_SIAP";
export type ShiftType = "PAGI" | "MALAM" | "SIANG";

export interface P2HInspection {
  id: number;
  p2hNo: string;
  unitId: number;
  unit: {
    id: number;
    unitNo: string;
    category: string;
    brand: string;
    description: string;
    ownerName: string;
    status: string;
    km: number;
    hourMeter: number | null;
  };
  userId: number;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    nrp: number;
    role: string;
    department: string;
    posision: string;
  };
  driverName?: string;
  driverNrp?: number;
  nopol?: string;
  section?: string;
  workSystem?: string[];
  shift: ShiftType;
  date: string;
  km: number;
  hourMeter: number | null;
  damageChecks: (DamageCheckItem | TelehandlerCheckItem | StoringTruckCheckItem | FuelTruckCheckItem | GensetCheckItem | DumpTruckCheckItem)[];
  tyreCheck: TyreCheckData;
  safetyTools: SafetyToolItem[];
  fitToWork: FitToWorkItem[];
  warningDetails?: WarningDetails | null;
  driverValidation: boolean;
  unitStatus: P2HStatus;
  driverStatus: P2HStatus;
  supervisorNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface P2HInput {
  unitId: number;
  driverId?: number;
  driverName?: string;
  driverNrp?: number;
  nopol?: string;
  section?: string;
  workSystem?: string[];
  shift: ShiftType;
  km: number;
  hourMeter?: number | null;
  damageChecks: (DamageCheckItem | TelehandlerCheckItem | StoringTruckCheckItem | FuelTruckCheckItem | GensetCheckItem | DumpTruckCheckItem)[];
  tyreCheck: TyreCheckData;
  safetyTools: SafetyToolItem[];
  fitToWork: FitToWorkItem[];
  warningDetails?: WarningDetails | null;
  driverValidation?: boolean;
  unitStatus: P2HStatus;
  driverStatus: P2HStatus;
  supervisorNotes?: string;
}

function getHeaders(): HeadersInit {
  const session = getAuthSession();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (session.token) {
    headers["Authorization"] = `Bearer ${session.token}`;
  }
  return headers;
}

/**
 * Public: Mengambil data unit & driver untuk pengisian P2H publik via token
 */
export async function fetchPublicP2HOptions(token: string = DEFAULT_PUBLIC_P2H_TOKEN): Promise<{
  success: boolean;
  data: {
    units: Array<{
      id: number;
      unitNo: string;
      category: string;
      brand: string;
      description: string;
      ownerName: string;
      km: number;
      hourMeter: number | null;
      status: string;
    }>;
    drivers: Array<{
      id: number;
      firstName: string;
      lastName: string;
      nrp: number;
      department: string;
      posision: string;
    }>;
  };
}> {
  const res = await fetch(`${API_BASE_URL}/p2h/public/options`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-p2h-token": token,
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Token akses tidak valid atau gagal memuat data.");
  }
  return json;
}

/**
 * Public: Kirim formulir P2H publik via token (tanpa login)
 */
export async function submitPublicP2H(
  token: string,
  data: P2HInput
): Promise<{ success: boolean; message: string; data: P2HInspection }> {
  const res = await fetch(`${API_BASE_URL}/p2h/public/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-p2h-token": token,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Gagal mengirimkan formulir P2H.");
  }
  return json;
}

export async function fetchP2HInspections(params?: {
  unitId?: number;
  unitNo?: string;
  category?: string;
  shift?: string;
  section?: string;
  unitStatus?: string;
  driverStatus?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data: P2HInspection[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> {
  const query = new URLSearchParams();
  if (params?.unitId) query.set("unitId", String(params.unitId));
  if (params?.unitNo) query.set("unitNo", params.unitNo);
  if (params?.category) query.set("category", params.category);
  if (params?.shift) query.set("shift", params.shift);
  if (params?.section) query.set("section", params.section);
  if (params?.unitStatus) query.set("unitStatus", params.unitStatus);
  if (params?.driverStatus) query.set("driverStatus", params.driverStatus);
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const url = `${API_BASE_URL}/p2h${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Gagal mengambil data pemeriksaan P2H");
  }
  return json;
}

export async function getP2HInspectionById(id: number): Promise<{
  success: boolean;
  data: P2HInspection;
}> {
  const res = await fetch(`${API_BASE_URL}/p2h/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Data P2H tidak ditemukan");
  }
  return json;
}

export async function createP2HInspection(
  data: P2HInput
): Promise<{ success: boolean; message: string; data: P2HInspection }> {
  const res = await fetch(`${API_BASE_URL}/p2h`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Gagal menyimpan pemeriksaan P2H");
  }
  return json;
}

export async function updateP2HInspection(
  id: number,
  data: Partial<P2HInput>
): Promise<{ success: boolean; message: string; data: P2HInspection }> {
  const res = await fetch(`${API_BASE_URL}/p2h/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Gagal memperbarui pemeriksaan P2H");
  }
  return json;
}

export async function deleteP2HInspection(
  id: number
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/p2h/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Gagal menghapus data P2H");
  }
  return json;
}

export async function fetchP2HStats(): Promise<{
  success: boolean;
  data: {
    totalAll: number;
    totalToday: number;
    readyCount: number;
    notReadyCount: number;
  };
}> {
  const res = await fetch(`${API_BASE_URL}/p2h/stats/summary`, {
    method: "GET",
    headers: getHeaders(),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Gagal mengambil statistik P2H");
  }
  return json;
}
