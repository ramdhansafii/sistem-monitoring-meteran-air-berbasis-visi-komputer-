export const API_BASE = (typeof window !== 'undefined' && window.METERAN_API_BASE) || 'http://192.168.43.185/sisfor_restoran_new111/api';

function getToken() {
  try { return localStorage.getItem('meteran-token'); } catch { return null; }
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok && res.status === 401) {
    try { localStorage.removeItem('meteran-token'); localStorage.removeItem('meteran-user'); } catch { }
    if (typeof window !== 'undefined' && window.location && !window.location.pathname.includes('login')) {
      window.location.reload();
    }
  }
  if (!res.ok) {
    const err = new Error(json.error || json.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

export const api = {
  login: (username, password) =>
    request('/login.php', { method: 'POST', body: JSON.stringify({ username, password }) }),

  register: (data) =>
    request('/register.php', { method: 'POST', body: JSON.stringify(data) }),

  me: () =>
    request('/me.php'),

  logout: () =>
    request('/logout.php', { method: 'POST' }),

  getReadings: (limit = 30) =>
    request(`/meter-reading.php?limit=${limit}`),

  getHistory: (month = null, year = null) => {
    let url = '/meter-reading.php';

    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }

    return request(url);
  },

  getLatest: () =>
    request('/meter-reading.php?latest=1'),

  saveReading: (payload) =>
    request('/meter-reading.php', { method: 'POST', body: JSON.stringify(payload) }),

  getProfile: () =>
    request('/profile.php'),

  updateProfile: (data) =>
    request('/profile.php', { method: 'PUT', body: JSON.stringify(data) }),

  getBill: (month, year) =>
    request(`/bill.php?month=${month}&year=${year}`),
};

export const adminApi = {
  // Dashboard
  getDashboard: () =>
    request('/admin-dashboard.php'),

  // Users CRUD
  getUsers: (search = '') =>
    request(`/admin-users.php${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createUser: (payload) =>
    request('/admin-users.php', { method: 'POST', body: JSON.stringify(payload) }),
  updateUser: (id, payload) =>
    request(`/admin-users.php?id=${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteUser: (id) =>
    request(`/admin-users.php?id=${id}`, { method: 'DELETE' }),

  // Devices CRUD
  getDevices: (search = '') =>
    request(`/admin-devices.php${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createDevice: (payload) =>
    request('/admin-devices.php', { method: 'POST', body: JSON.stringify(payload) }),
  updateDevice: (id, payload) =>
    request(`/admin-devices.php?id=${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteDevice: (id) =>
    request(`/admin-devices.php?id=${id}`, { method: 'DELETE' }),

  // Map
  getMap: () =>
    request('/admin-map.php'),

  // History (semua pengguna)
  getHistory: ({ search = '', dateFrom = '', dateTo = '', page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    params.set('page', page);
    params.set('limit', limit);
    return request(`/admin-history.php?${params.toString()}`);
  },
};

export function isAuthenticated() {
  return !!getToken();
}

export function getUser() {
  try {
    const raw = localStorage.getItem('meteran-user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
