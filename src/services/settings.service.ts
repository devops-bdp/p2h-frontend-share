import { getAuthSession, saveAuthSession } from "./auth.service";
import { API_BASE_URL } from "./api.config";

export interface SystemConfig {
  p2hToken: string;
  portalUrl: string;
  companyName: string;
  siteLocation: string;
  emergencyHseContact: string;
  plantWorkshopContact: string;
  shifts: {
    dayShift: string;
    nightShift: string;
  };
  autoDeactivateOnDefect: boolean;
  mandatoryHourMeterForPlant: boolean;
  serviceIntervalHM: number;
  serviceIntervalKM: number;
}

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  p2hToken: "#BATARAMPH2026",
  portalUrl: typeof window !== "undefined" ? `${window.location.origin}/p2h` : "http://localhost:3000/p2h",
  companyName: "PT Batara Dharma Persada",
  siteLocation: "Workshop Central Plant - Hauling KM 14",
  emergencyHseContact: "+62 811-5500-9911 (HSE Control Room 24/7)",
  plantWorkshopContact: "+62 811-5500-9922 (Maintenance Dispatcher)",
  shifts: {
    dayShift: "06:00 - 18:00 WITA (Day Shift)",
    nightShift: "18:00 - 06:00 WITA (Night Shift)",
  },
  autoDeactivateOnDefect: true,
  mandatoryHourMeterForPlant: true,
  serviceIntervalHM: 250,
  serviceIntervalKM: 5000,
};

/**
 * Fetch current user profile from /api/auth/me
 */
export async function fetchCurrentProfile() {
  const session = getAuthSession();
  const token = session.token;

  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Gagal memuat data profil");
  }

  return json;
}

/**
 * Update current user profile
 */
export async function updateCurrentProfile(userId: number, payload: {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  department?: string;
  posision?: string;
}) {
  const session = getAuthSession();
  const token = session.token;

  const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Gagal memperbarui profil");
  }

  // Update local session if updated self
  if (session.user && session.user.id === userId && json.data) {
    const updatedUser = { ...session.user, ...json.data };
    saveAuthSession(token || "", updatedUser);
  }

  return json;
}

/**
 * Change current user password
 */
export async function changeUserPassword(userId: number, payload: {
  password: string;
}) {
  const session = getAuthSession();
  const token = session.token;

  const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ password: payload.password }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Gagal mengubah kata sandi");
  }

  return json;
}

/**
 * Get stored system settings from localStorage or defaults
 */
export function getLocalSystemConfig(): SystemConfig {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("batara_system_config");
    if (stored) {
      try {
        return { ...DEFAULT_SYSTEM_CONFIG, ...JSON.parse(stored) };
      } catch (e) {
        return DEFAULT_SYSTEM_CONFIG;
      }
    }
  }
  return DEFAULT_SYSTEM_CONFIG;
}

/**
 * Save system settings to localStorage
 */
export function saveLocalSystemConfig(config: SystemConfig): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("batara_system_config", JSON.stringify(config));
  }
}
