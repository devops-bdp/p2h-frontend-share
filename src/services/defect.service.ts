import { getAuthSession } from "./auth.service";
import { API_BASE_URL } from "./api.config";

export type DefectSeverity = "CRITICAL" | "MAJOR" | "MINOR";
export type DefectStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type DefectType =
  | "DAMAGE_CHECK"
  | "TYRE_ISSUE"
  | "SAFETY_TOOL_MISSING"
  | "OPERATIONAL_WARNING"
  | "BREAKDOWN_REPORT";

export interface DefectItem {
  id: string; // e.g. "DEF-10-DC-1"
  inspectionId: number;
  p2hNo: string;
  date: string | Date;
  shift: "PAGI" | "SIANG" | "MALAM";
  section: string;
  driverName: string;
  driverNrp: number | null;
  unitId: number;
  unitNo: string;
  category: "LIGHT_VECHICLE" | "TELEHENDLER" | "STORING_TRUCK" | "FUEL_TRUCK" | "GENSET" | "COMPRESSOR" | string;
  brand: string;
  description: string;
  km: number;
  hourMeter: number | null;
  unitStatus: string;
  
  // Defect specific info
  component: string;
  defectType: DefectType;
  details: string;
  severity: DefectSeverity;
  status: DefectStatus;
  mechanicName?: string | null;
  repairNotes?: string | null;
  resolvedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DefectStats {
  totalDefects: number;
  criticalDefects: number;
  majorDefects: number;
  minorDefects: number;
  openDefects: number;
  inProgressDefects: number;
  resolvedDefects: number;
  byCategory: {
    LIGHT_VECHICLE: number;
    TELEHENDLER: number;
    STORING_TRUCK: number;
    FUEL_TRUCK: number;
    GENSET: number;
    COMPRESSOR: number;
    [key: string]: number;
  };
}

export interface DefectFilterParams {
  category?: string;
  status?: string;
  severity?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DefectListResponse {
  success: boolean;
  data: DefectItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export interface DirectBreakdownPayload {
  unitId: number;
  component: string;
  details: string;
  severity?: DefectSeverity;
  driverName?: string;
  driverNrp?: number;
  shift?: "PAGI" | "SIANG" | "MALAM";
  km?: number;
  hourMeter?: number;
}

/**
 * Fetch list of all defects with optional filters
 */
export async function fetchDefects(
  params?: DefectFilterParams
): Promise<DefectListResponse> {
  const session = getAuthSession();
  const token = session.token;

  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.append("category", params.category);
  if (params?.status) searchParams.append("status", params.status);
  if (params?.severity) searchParams.append("severity", params.severity);
  if (params?.search) searchParams.append("search", params.search);
  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.limit) searchParams.append("limit", String(params.limit));

  const url = `${API_BASE_URL}/defects?${searchParams.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Gagal memuat daftar defect & breakdown");
  }

  return json;
}

/**
 * Fetch KPI summary stats of defects
 */
export async function fetchDefectStats(): Promise<{
  success: boolean;
  data: DefectStats;
  message?: string;
}> {
  const session = getAuthSession();
  const token = session.token;

  const res = await fetch(`${API_BASE_URL}/defects/stats/summary`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Gagal memuat statistik defect");
  }

  return json;
}

/**
 * Update defect repair status and mechanic assignment
 */
export async function updateDefectStatus(
  defectId: string,
  payload: {
    status: DefectStatus;
    mechanicName?: string;
    repairNotes?: string;
  }
): Promise<{ success: boolean; message: string; data?: any }> {
  const session = getAuthSession();
  const token = session.token;

  const res = await fetch(`${API_BASE_URL}/defects/${defectId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Gagal memperbarui status defect");
  }

  return json;
}

/**
 * Create a direct breakdown report on the field
 */
export async function createDirectBreakdown(
  payload: DirectBreakdownPayload
): Promise<{ success: boolean; message: string; data?: any }> {
  const session = getAuthSession();
  const token = session.token;

  const res = await fetch(`${API_BASE_URL}/defects/breakdown`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Gagal membuat laporan breakdown");
  }

  return json;
}
