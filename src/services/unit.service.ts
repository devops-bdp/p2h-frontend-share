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

export interface BulkUnitError {
  row: number;
  unitNo?: string;
  reason: string;
}

export interface BulkUnitResponse {
  success: boolean;
  message: string;
  summary: {
    totalProcessed: number;
    successCount: number;
    failedCount: number;
  };
  createdUnits: Unit[];
  errors: BulkUnitError[];
}

export async function bulkCreateUnits(
  units: Partial<UnitInput>[]
): Promise<BulkUnitResponse> {
  const response = await fetch(`${API_BASE_URL}/units/bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ units }),
  });

  const result = await response.json();
  if (!response.ok && !result.summary) {
    throw new Error(result.message || 'Gagal memproses bulk create unit.');
  }

  return result;
}

/**
 * Generate string CSV Template untuk Impor Unit Armada Masal
 */
export function generateUnitCsvTemplate(): string {
  const sep = ';';

  const instructions = [
    '# ==========================================================================',
    '# TEMPLATE RESMI IMPOR MASSAL MASTER UNIT ARMADA (BATARA P2H PORTAL)',
    '# ==========================================================================',
    '# PETUNJUK PENGISIAN:',
    '# 1. Baris yang diawali tanda pagar (#) adalah petunjuk dan akan diabaikan otomatis oleh sistem.',
    '# 2. Kolom WAJIB diisi: unitNo; category; brand',
    '# 3. Pilihan Nilai Kolom category: ',
    '#    - LIGHT_VECHICLE (atau LV)',
    '#    - TELEHENDLER (atau TH)',
    '#    - STORING_TRUCK (atau ST)',
    '#    - FUEL_TRUCK (atau FT)',
    '#    - GENSET (atau GS)',
    '#    - COMPRESSOR (atau CP)',
    '#    - EXCAVATOR',
    '#    - DOZER',
    '#    - COMPACTOR',
    '#    - CRANE_TRUCK',
    '#    - MOBILE_CRANE',
    '#    - AMBULANCE',
    '# 4. Kolom description: Tipe/Model (Opsional)',
    '# 5. Kolom ownerName: Pemilik Unit (Default: PT Batara Dharma Persada)',
    '# 6. Kolom km: Odometer KM Awal (Angka, default: 0)',
    '# 7. Kolom hourMeter: Hour Meter HM Awal (Angka, opsional)',
    '# 8. Kolom status: ACTIVE atau INACTIVE (Default: ACTIVE)',
    '# ==========================================================================',
  ];

  const headers = [
    'unitNo',
    'category',
    'brand',
    'description',
    'ownerName',
    'km',
    'hourMeter',
    'status',
  ];

  const sampleRows = [
    ['LV-01', 'LIGHT_VECHICLE', 'Toyota', 'Hilux Double Cabin 4x4', 'PT Batara Dharma Persada', '0', '', 'ACTIVE'],
    ['TH-01', 'TELEHENDLER', 'JCB', 'JCB 535-95 Telehandler', 'PT Batara Dharma Persada', '0', '0', 'ACTIVE'],
    ['ST-01', 'STORING_TRUCK', 'Hino', 'Dutro 130 HD Workshop', 'PT Batara Dharma Persada', '0', '', 'ACTIVE'],
    ['FT-01', 'FUEL_TRUCK', 'Hino', 'Ranger FM 260 JD (16.000L)', 'PT Batara Dharma Persada', '0', '0', 'ACTIVE'],
    ['GS-01', 'GENSET', 'Denyo', 'DCA-80ESK (80 kVA)', 'PT Batara Dharma Persada', '0', '0', 'ACTIVE'],
    ['CP-01', 'COMPRESSOR', 'Airman', 'PDS185S Diesel Compressor', 'PT Batara Dharma Persada', '0', '0', 'ACTIVE'],
    ['EX-01', 'EXCAVATOR', 'Komatsu', 'PC200-8M0 Excavator', 'PT Batara Dharma Persada', '0', '0', 'ACTIVE'],
    ['DZ-01', 'DOZER', 'Caterpillar', 'D6R Bulldozer', 'PT Batara Dharma Persada', '0', '0', 'ACTIVE'],
  ];

  const csvLines = [
    `sep=${sep}`,
    ...instructions,
    headers.join(sep),
    ...sampleRows.map((row) => row.join(sep)),
  ];

  return '\uFEFF' + csvLines.join('\r\n');
}

/**
 * Download file template CSV Unit ke browser
 */
export function downloadUnitCsvTemplate() {
  const csvContent = generateUnitCsvTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'template_import_unit_armada_batara.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper untuk parse teks CSV menjadi array UnitInput
 */
export function parseUnitsCsv(csvText: string): {
  data: Partial<UnitInput>[];
  errors: string[];
} {
  const lines = csvText
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('sep='));

  if (lines.length <= 1) {
    return {
      data: [],
      errors: ['File CSV kosong atau hanya berisi baris komentar/header.'],
    };
  }

  const firstLine = lines[0];
  const separator = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';

  const rawHeaders = firstLine
    .split(separator)
    .map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

  const getIndex = (...aliases: string[]) => {
    return rawHeaders.findIndex((h) => aliases.some((a) => h.includes(a)));
  };

  const idxUnitNo = getIndex('unitno', 'unit_no', 'lambung', 'no_lambung', 'kode_unit', 'nomor');
  const idxCategory = getIndex('category', 'kategori', 'jenis', 'tipe_unit');
  const idxBrand = getIndex('brand', 'merk', 'brand_unit', 'merek');
  const idxDesc = getIndex('description', 'deskripsi', 'model', 'tipe', 'keterangan');
  const idxOwner = getIndex('ownername', 'owner_name', 'owner', 'pemilik', 'kontraktor', 'perusahaan');
  const idxKm = getIndex('km', 'kilometer', 'odometer', 'km_awal');
  const idxHm = getIndex('hourmeter', 'hour_meter', 'hm', 'hm_awal');
  const idxStatus = getIndex('status', 'kondisi', 'operasional');

  if (idxUnitNo === -1 || idxCategory === -1 || idxBrand === -1) {
    return {
      data: [],
      errors: [
        'Format kolom header CSV tidak sesuai. Kolom wajib: unitNo (No. Lambung), category (Kategori Unit), dan brand (Merk).',
      ],
    };
  }

  const categoryMap: Record<string, string> = {
    LIGHT_VECHICLE: 'LIGHT_VECHICLE',
    LIGHT_VEHICLE: 'LIGHT_VECHICLE',
    LV: 'LIGHT_VECHICLE',
    TELEHENDLER: 'TELEHENDLER',
    TELEHANDLER: 'TELEHENDLER',
    TH: 'TELEHENDLER',
    STORING_TRUCK: 'STORING_TRUCK',
    STORING: 'STORING_TRUCK',
    ST: 'STORING_TRUCK',
    FUEL_TRUCK: 'FUEL_TRUCK',
    FUEL_TANKER: 'FUEL_TRUCK',
    FT: 'FUEL_TRUCK',
    GENSET: 'GENSET',
    GENERATOR: 'GENSET',
    GS: 'GENSET',
    COMPRESSOR: 'COMPRESSOR',
    KOMPRESOR: 'COMPRESSOR',
    CP: 'COMPRESSOR',
    COMPACTOR: 'COMPACTOR',
    ROLLER: 'COMPACTOR',
    CMP: 'COMPACTOR',
    DOZER: 'DOZER',
    BULLDOZER: 'DOZER',
    DZ: 'DOZER',
    EXCAVATOR: 'EXCAVATOR',
    EXCA: 'EXCAVATOR',
    HEX: 'EXCAVATOR',
    CRANE_TRUCK: 'CRANE_TRUCK',
    TRUCK_CRANE: 'CRANE_TRUCK',
    MOBILE_CRANE: 'MOBILE_CRANE',
    MC: 'MOBILE_CRANE',
    AMBULANCE: 'AMBULANCE',
    AMBULAN: 'AMBULANCE',
  };

  const parsedUnits: Partial<UnitInput>[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1;
    const line = lines[i];
    if (!line || line.startsWith('#')) continue;

    const cells = line
      .split(separator)
      .map((c) => c.replace(/^["']|["']$/g, '').trim());

    const unitNo = cells[idxUnitNo] || '';
    const rawCat = (cells[idxCategory] || '').toUpperCase().replace(/[\s\-_]+/g, '_');
    const brand = cells[idxBrand] || '';

    if (!unitNo) {
      errors.push(`Baris ${rowNum}: Nomor Lambung (unitNo) tidak boleh kosong.`);
      continue;
    }

    const category = categoryMap[rawCat];
    if (!category) {
      errors.push(`Baris ${rowNum}: Kategori "${cells[idxCategory] || '-'}" tidak valid.`);
      continue;
    }

    if (!brand) {
      errors.push(`Baris ${rowNum}: Merk / Brand untuk unit ${unitNo} tidak boleh kosong.`);
      continue;
    }

    const description = (idxDesc !== -1 ? cells[idxDesc] : '') || brand;
    const ownerName = (idxOwner !== -1 ? cells[idxOwner] : '') || 'PT Batara Dharma Persada';
    
    const kmRaw = idxKm !== -1 ? cells[idxKm] : '0';
    const kmNum = Number(kmRaw);
    const km = !isNaN(kmNum) && kmNum >= 0 ? kmNum : 0;

    let hourMeter: number | null = null;
    if (idxHm !== -1 && cells[idxHm] !== '') {
      const hmNum = Number(cells[idxHm]);
      if (!isNaN(hmNum) && hmNum >= 0) {
        hourMeter = hmNum;
      }
    }

    let status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE';
    if (idxStatus !== -1 && cells[idxStatus]) {
      const stClean = cells[idxStatus].toUpperCase();
      if (stClean === 'INACTIVE' || stClean === 'NONAKTIF' || stClean === 'NON_AKTIF' || stClean === 'NON-AKTIF') {
        status = 'INACTIVE';
      }
    }

    parsedUnits.push({
      unitNo,
      category,
      brand,
      description,
      ownerName,
      km,
      hourMeter,
      status,
    });
  }

  return { data: parsedUnits, errors };
}
