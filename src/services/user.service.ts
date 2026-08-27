import { getAuthSession } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'USER';

export type UserDepartment =
  | 'OPERATIONS'
  | 'PRODUCTION_AND_ENGINEERING'
  | 'PLANT'
  | 'LOGISTIC'
  | 'HSE'
  | 'HRGA';

export type UserPosition =
  | 'SITE_MANAGER'
  | 'SITE_SUPERVISOR'
  | 'SITE_SUPERINTENDENT'
  | 'OPERATOR'
  | 'MECHANIC'
  | 'ELECTRICIAN'
  | 'TYREMAN'
  | 'DRIVER'
  | 'ADMIN';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  nrp: number;
  department: UserDepartment;
  posision: UserPosition;
  phoneNumber?: string | null;
  email?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  _count?: {
    p2hInspections: number;
  };
}

export interface UserInput {
  firstName: string;
  lastName: string;
  nrp: number;
  password: string;
  department?: UserDepartment;
  posision?: UserPosition;
  phoneNumber?: string;
  email?: string;
  role?: UserRole;
}

export interface UserUpdateInput {
  firstName?: string;
  lastName?: string;
  nrp?: number;
  password?: string;
  department?: UserDepartment;
  posision?: UserPosition;
  phoneNumber?: string;
  email?: string;
  role?: UserRole;
}

export const USER_ROLES: { value: UserRole; label: string; description: string }[] = [
  {
    value: 'SUPERADMIN',
    label: 'Super Admin',
    description: 'Akses penuh ke seluruh sistem, master data & konfigurasi level tertinggi',
  },
  {
    value: 'ADMIN',
    label: 'Administrator',
    description: 'Akses operasional, verifikasi laporan P2H, unit fleet & akun user',
  },
  {
    value: 'USER',
    label: 'User / Operator',
    description: 'Akses pengisian form P2H & view profil akun sendiri',
  },
];

export const USER_DEPARTMENTS: { value: UserDepartment; label: string }[] = [
  { value: 'OPERATIONS', label: 'Operations (Produksi & Tambang)' },
  { value: 'PRODUCTION_AND_ENGINEERING', label: 'Production & Engineering' },
  { value: 'PLANT', label: 'Plant & Maintenance' },
  { value: 'LOGISTIC', label: 'Logistic & Supply Chain' },
  { value: 'HSE', label: 'HSE / K3 & Lingkungan' },
  { value: 'HRGA', label: 'HRGA (Human Resource & General Affair)' },
];

export const USER_POSITIONS: { value: UserPosition; label: string }[] = [
  { value: 'OPERATOR', label: 'Operator Alat Berat' },
  { value: 'DRIVER', label: 'Driver / Pengemudi Unit' },
  { value: 'MECHANIC', label: 'Mekanik / Fitter' },
  { value: 'ELECTRICIAN', label: 'Electrician (Listrik)' },
  { value: 'TYREMAN', label: 'Tyreman (Spesialis Ban)' },
  { value: 'ADMIN', label: 'Staff Admin Operasional' },
  { value: 'SITE_SUPERVISOR', label: 'Site Supervisor / Pengawas' },
  { value: 'SITE_SUPERINTENDENT', label: 'Site Superintendent' },
  { value: 'SITE_MANAGER', label: 'Project / Site Manager' },
];

function getAuthHeaders() {
  const { token } = getAuthSession();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchUsers(params?: {
  search?: string;
  role?: string;
  department?: string;
  posision?: string;
}): Promise<{ success: boolean; count: number; data: User[] }> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.role) query.append('role', params.role);
  if (params?.department) query.append('department', params.department);
  if (params?.posision) query.append('posision', params.posision);

  const url = `${API_URL}/api/users${query.toString() ? `?${query.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat data user.');
  }

  return data;
}

export async function fetchUserById(id: number): Promise<{ success: boolean; data: User }> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal memuat detail user.');
  }

  return data;
}

export async function createUser(
  data: UserInput
): Promise<{ success: boolean; message: string; data: User }> {
  const response = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Gagal menambahkan user baru.');
  }

  return result;
}

export async function updateUser(
  id: number,
  data: UserUpdateInput
): Promise<{ success: boolean; message: string; data: User }> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Gagal memperbarui data user.');
  }

  return result;
}

export async function resetUserPassword(
  id: number,
  newPassword?: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/api/users/${id}/reset-password`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ newPassword }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Gagal mereset kata sandi user.');
  }

  return result;
}

export async function deleteUser(
  id: number
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Gagal menghapus user.');
  }

  return result;
}

export interface BulkUserError {
  row: number;
  nrp?: number | string;
  name?: string;
  reason: string;
}

export interface BulkUserResponse {
  success: boolean;
  message: string;
  summary: {
    totalProcessed: number;
    successCount: number;
    failedCount: number;
  };
  createdUsers: User[];
  errors: BulkUserError[];
}

export async function bulkCreateUsers(
  users: Partial<UserInput>[]
): Promise<BulkUserResponse> {
  const response = await fetch(`${API_URL}/api/users/bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ users }),
  });

  const result = await response.json();
  if (!response.ok && !result.summary) {
    throw new Error(result.message || 'Gagal memproses bulk create user.');
  }

  return result;
}

/**
 * Generate string CSV Template untuk Impor User Masal
 * Dilengkapi panduan petunjuk pengisian di bagian atas file
 */
export function generateUserCsvTemplate(): string {
  // Gunakan semicolon (;) sebagai separator agar Excel Indonesia langsung membaca per kolom.
  // Baris "sep=;" memberi tahu Excel secara eksplisit separator yang dipakai.
  const sep = ';';

  const instructions = [
    '# ==========================================================================',
    '# TEMPLATE RESMI IMPOR MASSAL PENGGUNA (BATARA P2H PORTAL)',
    '# ==========================================================================',
    '# PETUNJUK PENGISIAN:',
    '# 1. Baris yang diawali tanda pagar (#) adalah petunjuk dan akan diabaikan otomatis oleh sistem.',
    '# 2. Kolom WAJIB diisi: firstName; lastName; nrp',
    '# 3. Kolom password bersifat OPSIONAL. Jika dikosongkan; otomatis menggunakan default: Batara@123',
    '# 4. Nilai Kolom role: USER; ADMIN; SUPERADMIN (Default: USER)',
    '# 5. Nilai Kolom department: OPERATIONS; PRODUCTION_AND_ENGINEERING; PLANT; LOGISTIC; HSE; HRGA',
    '# 6. Nilai Kolom position: OPERATOR; DRIVER; MECHANIC; ELECTRICIAN; TYREMAN; ADMIN; SITE_SUPERVISOR; SITE_SUPERINTENDENT; SITE_MANAGER',
    '# 7. Simpan file ini dalam format .CSV sebelum diunggah ke sistem.',
    '# ==========================================================================',
  ];

  const headers = [
    'firstName',
    'lastName',
    'nrp',
    'password',
    'department',
    'position',
    'role',
    'phoneNumber',
    'email',
  ];

  const sampleRows = [
    ['Ahmad', 'Subagyo', '8021001', 'Batara@123', 'OPERATIONS', 'OPERATOR', 'USER', '081234567890', 'ahmad.subagyo@batara.co.id'],
    ['Bambang', 'Kurniawan', '8021002', 'Batara@123', 'OPERATIONS', 'DRIVER', 'USER', '081298765432', 'bambang.kurniawan@batara.co.id'],
    ['Dedi', 'Pratama', '8021003', 'Batara@123', 'PLANT', 'MECHANIC', 'USER', '081377889900', 'dedi.pratama@batara.co.id'],
    ['Eko', 'Sulistyo', '8021004', 'Batara@123', 'OPERATIONS', 'SITE_SUPERVISOR', 'ADMIN', '081155667788', 'eko.sulistyo@batara.co.id'],
    ['Fajar', 'Hidayat', '8021005', 'Batara@123', 'HSE', 'ADMIN', 'USER', '081199223344', 'fajar.hidayat@batara.co.id'],
  ];

  const csvLines = [
    // Baris pertama ini memberitahu Excel separator yang dipakai (tidak akan tampil sebagai data)
    `sep=${sep}`,
    ...instructions,
    headers.join(sep),
    ...sampleRows.map((row) => row.join(sep)),
  ];

  // \uFEFF = UTF-8 BOM agar Excel membaca huruf Indonesia dengan benar
  return '\uFEFF' + csvLines.join('\r\n');
}

/**
 * Download file template CSV ke browser
 */
export function downloadUserCsvTemplate() {
  const csvContent = generateUserCsvTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'template_import_user_batara_p2h.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper untuk parse teks CSV menjadi array UserInput
 */
export function parseUsersCsv(csvText: string): {
  data: Partial<UserInput>[];
  errors: string[];
} {
  const lines = csvText
    .replace(/^\uFEFF/, '') // remove BOM
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('sep=')); // skip komentar & baris sep=

  if (lines.length <= 1) {
    return {
      data: [],
      errors: ['File CSV kosong atau hanya berisi baris komentar/header.'],
    };
  }

  // Deteksi separator (, atau ;)
  const firstLine = lines[0];
  const separator = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';

  const rawHeaders = firstLine
    .split(separator)
    .map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

  // Index lookup dengan dukungan alias bahasa Indonesia & Inggris
  const getIndex = (...aliases: string[]) => {
    return rawHeaders.findIndex((h) => aliases.some((a) => h.includes(a)));
  };

  const idxFirstName = getIndex('firstname', 'first_name', 'depan', 'nama_depan');
  const idxLastName = getIndex('lastname', 'last_name', 'belakang', 'nama_belakang');
  const idxNrp = getIndex('nrp', 'nik', 'nomor');
  const idxPassword = getIndex('password', 'sandi', 'pass', 'kata_sandi');
  const idxDept = getIndex('department', 'departemen', 'dept', 'divisi');
  const idxPos = getIndex('position', 'posision', 'posisi', 'jabatan');
  const idxRole = getIndex('role', 'hak_akses', 'akses');
  const idxPhone = getIndex('phone', 'telepon', 'hp', 'no_hp', 'whatsapp', 'kontak');
  const idxEmail = getIndex('email', 'surel');

  if (idxFirstName === -1 || idxLastName === -1 || idxNrp === -1) {
    return {
      data: [],
      errors: [
        'Format kolom header CSV tidak sesuai. Kolom wajib: firstName (Nama Depan), lastName (Nama Belakang), dan nrp (NRP).',
      ],
    };
  }

  const parsedUsers: Partial<UserInput>[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1;
    const line = lines[i];
    if (!line || line.startsWith('#')) continue;

    // Simple split respecting basic quotes
    const cells = line
      .split(separator)
      .map((c) => c.replace(/^["']|["']$/g, '').trim());

    const firstName = cells[idxFirstName] || '';
    const lastName = cells[idxLastName] || '';
    const nrpRaw = cells[idxNrp] || '';
    const nrpNum = Number(nrpRaw);

    if (!firstName || !lastName) {
      errors.push(`Baris ${rowNum}: Nama depan dan belakang tidak boleh kosong.`);
      continue;
    }

    if (!nrpRaw || isNaN(nrpNum)) {
      errors.push(`Baris ${rowNum}: NRP "${nrpRaw}" tidak valid (harus angka).`);
      continue;
    }

    const password = (idxPassword !== -1 ? cells[idxPassword] : '') || 'Batara@123';
    const department = (idxDept !== -1 ? cells[idxDept] : '') as UserDepartment;
    const posision = (idxPos !== -1 ? cells[idxPos] : '') as UserPosition;
    const role = (idxRole !== -1 ? cells[idxRole] : '') as UserRole;
    const phoneNumber = idxPhone !== -1 ? cells[idxPhone] : '';
    const email = idxEmail !== -1 ? cells[idxEmail] : '';

    parsedUsers.push({
      firstName,
      lastName,
      nrp: nrpNum,
      password,
      department: department || ('OPERATIONS' as UserDepartment),
      posision: posision || ('OPERATOR' as UserPosition),
      role: role || ('USER' as UserRole),
      phoneNumber: phoneNumber || undefined,
      email: email || undefined,
    });
  }

  return { data: parsedUsers, errors };
}

