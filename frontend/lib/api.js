const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

// Wrapper tipis di atas fetch: nempelin base URL, header auth, dan ngelempar
// pesan error dari backend (bukan cuma "Failed to fetch") biar gampang ditampilkan di UI.
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error || 'Terjadi kesalahan, coba lagi.');
    error.status = res.status;
    error.payload = data; // dipakai buat baca unpaidUnits pas gating event 402
    throw error;
  }

  return data;
}

// Upload file (multipart) - TIDAK pakai apiFetch karena harus tanpa header
// Content-Type: application/json (browser yang nentuin boundary multipart sendiri).
export async function apiUpload(path, file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Upload gagal.');
  return data;
}
