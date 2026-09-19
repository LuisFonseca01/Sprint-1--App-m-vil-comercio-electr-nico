import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'gamecube_token';

async function request(path, options = {}, token) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'No se pudo conectar con el servidor');
  return data;
}

export const authApi = {
  async register(payload) {
    const result = await request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    await AsyncStorage.setItem(TOKEN_KEY, result.token);
    return result;
  },
  async login(payload) {
    const result = await request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
    await AsyncStorage.setItem(TOKEN_KEY, result.token);
    return result;
  },
  async restore() {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try { return { ...(await request('/auth/me', {}, token)), token }; } catch { await AsyncStorage.removeItem(TOKEN_KEY); return null; }
  },
  async logout() { await AsyncStorage.removeItem(TOKEN_KEY); },
};

export const cartApi = {
  get: (token) => request('/cart', {}, token),
  add: (product, token) => request('/cart', { method: 'POST', body: JSON.stringify({ product }) }, token),
  remove: (productId, token) => request(`/cart/${productId}`, { method: 'DELETE' }, token),
  checkout: (token) => request('/orders', { method: 'POST' }, token),
};

export const favoritesApi = {
  get: (token) => request('/favorites', {}, token),
  add: (product, token) => request('/favorites', { method: 'POST', body: JSON.stringify({ product }) }, token),
  remove: (productId, token) => request(`/favorites/${productId}`, { method: 'DELETE' }, token),
};

export const ordersApi = {
  get: (token) => request('/orders', {}, token),
  buyNow: (product, token) => request('/orders/direct', { method: 'POST', body: JSON.stringify({ product }) }, token),
};
