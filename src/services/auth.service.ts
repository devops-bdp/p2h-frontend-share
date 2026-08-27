const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  nrp: number;
  department: string;
  posision: string;
  role: string;
  phoneNumber?: string;
  email?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserProfile;
}

export async function loginUser(nrp: number, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nrp, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login gagal. Periksa NRP dan password Anda.');
  }

  return data;
}

export async function fetchDrivers(): Promise<{
  success: boolean;
  count: number;
  data: UserProfile[];
}> {
  const session = getAuthSession();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (session.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }

  const response = await fetch(`${API_URL}/api/auth/drivers`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Gagal mengambil data operator/driver.');
  }

  return data;
}

export function saveAuthSession(token: string, user: LoginResponse['user']) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('batara_p2h_token', token);
    localStorage.setItem('batara_p2h_user', JSON.stringify(user));
  }
}

export function getAuthSession() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('batara_p2h_token');
    const userStr = localStorage.getItem('batara_p2h_user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  }
  return { token: null, user: null };
}

export function clearAuthSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('batara_p2h_token');
    localStorage.removeItem('batara_p2h_user');
  }
}
