import { getAuthSession } from './auth.service';
import { API_BASE_URL } from './api.config';

export interface Unit {
  id: number;
  unitNo: string;
  category: string;
  brand: string;
  description: string;
  ownerName: string;
  km: number;
  hourMeter: number | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface UnitInput {
  unitNo: string;
  category: string;
  brand: string;
  description: string;
  ownerName: string;
  km: number;
  hourMeter?: number | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

function getAuthHeaders() {
  const { token } = getAuthSession();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchUnits(params?: {
  search?: string;
  category?: string;
  status?: string;
}): Promise<{ success: boolean; count: number; data: Unit[] }> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.category) query.append('category', params.category);
  if (params?.status) query.append('status', params.status);

  const url = `${API_BASE_URL}/units${query.toString() ? `?${query.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal mengambil data unit.');
  }

  return data;
}

export async function fetchUnitById(id: number): Promise<{ success: boolean; data: Unit }> {
  const response = await fetch(`${API_BASE_URL}/units/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal mengambil detail unit.');
  }

  return data;
}

export async function createUnit(data: UnitInput): Promise<{ success: boolean; message: string; data: Unit }> {
  const response = await fetch(`${API_BASE_URL}/units`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Gagal menambahkan unit baru.');
  }

  return result;
}

export async function updateUnit(
  id: number,
  data: Partial<UnitInput>
): Promise<{ success: boolean; message: string; data: Unit }> {
  const response = await fetch(`${API_BASE_URL}/units/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Gagal memperbarui unit.');
  }

  return result;
}

export async function deleteUnit(id: number): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/units/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Gagal menghapus unit.');
  }

  return result;
}
