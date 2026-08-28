/**
 * Normalizes the backend API base URL so all endpoints route reliably through /api
 * Handles URLs with or without trailing slashes or '/api' suffixes.
 */
const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const cleanUrl = rawUrl.replace(/\/+$/, '');

export const API_BASE_URL = cleanUrl.endsWith('/api')
  ? cleanUrl
  : `${cleanUrl}/api`;

