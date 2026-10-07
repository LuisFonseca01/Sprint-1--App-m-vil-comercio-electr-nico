import AsyncStorage from '@react-native-async-storage/async-storage';
import { products as seedProducts } from './data/products';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
const USERS_KEY = 'gamecube_local_users';
const SESSION_KEY = 'gamecube_local_session';
const SESSION_USER_KEY = 'gamecube_local_session_user';
const ADMIN_PRODUCTS_KEY = 'gamecube_local_admin_products';

async function readJson(key, fallback) {
  const value = await AsyncStorage.getItem(key);
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

async function writeJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role || 'customer', createdAt: user.createdAt };
}

function localKey(type, token) {
  return `gamecube_local_${type}_${token}`;
}

async function request(path, options = {}, token) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'No se pudo conectar con el servidor');
    error.status = response.status;
    throw error;
  }
  return data;
}

function isLocalToken(token) {
  return token?.startsWith('local-');
}

async function storeSession(session) {
  await AsyncStorage.setItem(SESSION_KEY, session.token);
  await AsyncStorage.setItem(SESSION_USER_KEY, JSON.stringify(session.user));
  return session;
}

export const authApi = {
  async register(payload) {
    const name = payload.name?.trim();
    const email = payload.email?.trim().toLowerCase();
    if (!name || !email || !payload.password || payload.password.length < 6) throw new Error('Nombre, email y una contraseña de 6 caracteres son obligatorios');
    try {
      return await storeSession(await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password: payload.password }),
      }));
    } catch (error) {
      if (error.status) throw error;
    }
    const users = await readJson(USERS_KEY, []);
    if (users.some((user) => user.email === email)) throw new Error('Ya existe una cuenta con ese email');
    const user = { id: `local-user-${Date.now()}`, name, email, password: payload.password, role: 'customer', createdAt: new Date().toISOString() };
    await writeJson(USERS_KEY, [...users, user]);
    return storeSession({ user: publicUser(user), token: user.id });
  },
  async login(payload) {
    const email = payload.email?.trim().toLowerCase();
    try {
      return await storeSession(await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: payload.password }),
      }));
    } catch (error) {
      if (error.status) throw error;
    }
    if (email === 'admin@gamecube.mx' && payload.password === 'admin123') {
      const admin = { id: 'local-admin', name: 'Administrador', email, role: 'admin', createdAt: new Date().toISOString() };
      await writeJson(USERS_KEY, [...(await readJson(USERS_KEY, [])).filter((user) => user.id !== admin.id), admin]);
      return storeSession({ user: publicUser(admin), token: admin.id });
    }
    const users = await readJson(USERS_KEY, []);
    const user = users.find((item) => item.email === email && item.password === payload.password);
    if (!user) throw new Error('Email o contraseña incorrectos');
    return storeSession({ user: publicUser(user), token: user.id });
  },
  async restore() {
    const token = await AsyncStorage.getItem(SESSION_KEY);
    if (!token) return null;
    const users = await readJson(USERS_KEY, []);
    const localUser = users.find((item) => item.id === token);
    if (localUser) return { user: publicUser(localUser), token };
    const cachedUser = await readJson(SESSION_USER_KEY, null);
    try {
      const result = await request('/auth/me', {}, token);
      return storeSession({ user: result.user, token });
    } catch (error) {
      if (error.status === 401) {
        await AsyncStorage.removeItem(SESSION_KEY);
        await AsyncStorage.removeItem(SESSION_USER_KEY);
        return null;
      }
      if (error.status) throw error;
      return cachedUser ? { user: cachedUser, token } : null;
    }
  },
  async logout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    await AsyncStorage.removeItem(SESSION_USER_KEY);
  },
};

export const cartApi = {
  get: async (token) => {
    if (isLocalToken(token)) return { cart: await readJson(localKey('cart', token), []) };
    try { return await request('/cart', {}, token); } catch (error) {
      if (error.status) throw error;
      return { cart: await readJson(localKey('cart', token), []) };
    }
  },
  add: async (product, token) => {
    if (!isLocalToken(token)) {
      try { return await request('/cart', { method: 'POST', body: JSON.stringify({ product }) }, token); } catch (error) {
        if (error.status) throw error;
      }
    }
    const cart = [...await readJson(localKey('cart', token), []), product];
    await writeJson(localKey('cart', token), cart);
    return { cart };
  },
  remove: async (productId, token) => {
    if (!isLocalToken(token)) {
      try { return await request(`/cart/${encodeURIComponent(productId)}`, { method: 'DELETE' }, token); } catch (error) {
        if (error.status) throw error;
      }
    }
    const cart = await readJson(localKey('cart', token), []);
    const index = cart.findIndex((item) => item.id === productId);
    if (index >= 0) cart.splice(index, 1);
    await writeJson(localKey('cart', token), cart);
    return { cart };
  },
  updateQuantity: async (productId, quantity, token) => {
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) throw new Error('La cantidad debe estar entre 0 y 99');
    if (!isLocalToken(token)) {
      try {
        return await request(`/cart/${encodeURIComponent(productId)}`, {
          method: 'PATCH',
          body: JSON.stringify({ quantity }),
        }, token);
      } catch (error) {
        if (error.status) throw error;
      }
    }
    const cart = await readJson(localKey('cart', token), []);
    const existingQuantity = cart.filter((item) => item.id === productId).length;
    const product = cart.find((item) => item.id === productId);
    if (!product) throw new Error('El producto ya no está en tu carrito');
    const updatedCart = cart.filter((item) => item.id !== productId);
    if (quantity > existingQuantity) {
      updatedCart.push(...Array.from({ length: quantity - existingQuantity }, () => product));
    } else if (quantity > 0) {
      updatedCart.push(...Array.from({ length: quantity }, () => product));
    }
    await writeJson(localKey('cart', token), updatedCart);
    return { cart: updatedCart };
  },
};

export const favoritesApi = {
  get: async (token) => ({ favorites: await readJson(localKey('favorites', token), []) }),
  add: async (product, token) => {
    const favorites = await readJson(localKey('favorites', token), []);
    if (!favorites.some((item) => item.id === product.id)) favorites.push(product);
    await writeJson(localKey('favorites', token), favorites);
    return { favorites };
  },
  remove: async (productId, token) => {
    const favorites = (await readJson(localKey('favorites', token), [])).filter((item) => item.id !== productId);
    await writeJson(localKey('favorites', token), favorites);
    return { favorites };
  },
};

export const ordersApi = {
  get: async (token) => {
    if (!isLocalToken(token)) {
      try { return await request('/orders', {}, token); } catch (error) {
        if (error.status) throw error;
      }
    }
    return { orders: await readJson(localKey('orders', token), []) };
  },
  simulateCheckout: async (cart, paymentMethod, last4, shippingAddress, user, token) => {
    if (!cart.length) throw new Error('El carrito está vacío');
    if (!['card', 'paypal', 'transfer', 'cash'].includes(paymentMethod)) throw new Error('Selecciona un método de pago válido');
    if (!shippingAddress?.street?.trim() || !shippingAddress?.city?.trim() || !shippingAddress?.postalCode?.trim()) {
      throw new Error('Completa la calle, ciudad y código postal de envío.');
    }

    if (!isLocalToken(token)) {
      try {
        return await request('/orders/simulated', {
          method: 'POST',
          body: JSON.stringify({
            paymentMethod,
            last4,
            shippingAddress: {
              street: shippingAddress.street.trim(),
              city: shippingAddress.city.trim(),
              postalCode: shippingAddress.postalCode.trim(),
              reference: shippingAddress.reference?.trim() || '',
            },
          }),
        }, token);
      } catch (error) {
        if (error.status) throw error;
      }
    }

    const groupedItems = new Map();
    cart.forEach((product) => {
      const item = groupedItems.get(product.id);
      if (item) item.quantity += 1;
      else groupedItems.set(product.id, { ...product, quantity: 1 });
    });
    const items = [...groupedItems.values()];
    for (const item of items) {
      for (let quantity = 0; quantity < item.quantity; quantity += 1) {
        await cartApi.remove(item.id, token);
      }
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orders = await readJson(localKey('orders', token), []);
    const order = {
      id: `local-order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: token,
      customerName: user?.name || 'Cliente',
      customerEmail: user?.email || '',
      items,
      subtotal: total,
      shippingCost: 0,
      total,
      shippingAddress,
      paymentMethod,
      ...(last4 ? { last4 } : {}),
      status: 'processing',
      createdAt: new Date().toISOString(),
    };
    await writeJson(localKey('orders', token), [order, ...orders]);
    return { message: 'Pago simulado correctamente', orderId: order.id, total, paymentMethod: order.paymentMethod, last4: order.last4, shippingAddress: order.shippingAddress };
  },
};

async function localOrders() {
  const keys = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith('gamecube_local_orders_'));
  const orders = (await Promise.all(keys.map((key) => readJson(key, [])))).flat();
  const users = await readJson(USERS_KEY, []);
  const usersById = new Map(users.map((user) => [user.id, user]));
  return orders.map((order) => {
    const user = usersById.get(order.userId);
    return { ...order, customerName: order.customerName || user?.name || 'Cliente', customerEmail: order.customerEmail || user?.email || '' };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export const supportApi = {
  getMessages: async (token) => {
    if (!isLocalToken(token)) {
      try { return await request('/support/messages', {}, token); } catch (error) {
        if (error.status) throw error;
      }
    }
    return { messages: await readJson(localKey('support', token), []) };
  },
  sendMessage: async (text, token, user) => {
    const messageText = text.trim();
    if (!messageText) throw new Error('Escribe un mensaje antes de enviarlo.');
    if (messageText.length > 1000) throw new Error('El mensaje no puede superar 1000 caracteres.');
    if (!isLocalToken(token)) {
      try {
        return await request('/support/messages', { method: 'POST', body: JSON.stringify({ text: messageText }) }, token);
      } catch (error) {
        if (error.status) throw error;
      }
    }
    const key = localKey('support', token);
    const messages = await readJson(key, []);
    const message = { id: `local-message-${Date.now()}`, text: messageText, senderId: token, senderName: user?.name || 'Cliente', senderRole: 'customer', createdAt: new Date().toISOString() };
    await writeJson(key, [...messages, message]);
    setTimeout(async () => {
      const current = await readJson(key, []);
      if (current.some((item) => item.id === message.id)) {
        current.push({
          id: `local-reply-${Date.now()}`,
          text: 'Gracias por escribirnos. Hemos recibido tu mensaje y nuestro equipo de soporte te ayudará pronto.',
          senderId: 'local-support',
          senderName: 'Soporte Gamecube',
          senderRole: 'support',
          createdAt: new Date().toISOString(),
        });
        await writeJson(key, current);
      }
    }, 900);
    return { message };
  },
  getConversations: async (token) => {
    if (!isLocalToken(token)) {
      try { return await request('/admin/support/conversations', {}, token); } catch (error) {
        if (error.status) throw error;
      }
    }
    const keys = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith('gamecube_local_support_'));
    const conversations = await Promise.all(keys.map(async (key) => {
      const messages = await readJson(key, []);
      if (!messages.length) return null;
      const latest = messages[messages.length - 1];
      return { userId: key.replace('gamecube_local_support_', ''), customerName: messages[0].senderName || 'Cliente', customerEmail: '', lastMessage: latest, updatedAt: latest.createdAt, messages };
    }));
    return { conversations: conversations.filter(Boolean).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) };
  },
  reply: async (userId, text, token) => {
    const messageText = text.trim();
    if (!messageText) throw new Error('Escribe una respuesta antes de enviarla.');
    if (messageText.length > 1000) throw new Error('El mensaje no puede superar 1000 caracteres.');
    if (!isLocalToken(token)) {
      try {
        return await request('/admin/support/messages', { method: 'POST', body: JSON.stringify({ userId, text: messageText }) }, token);
      } catch (error) {
        if (error.status) throw error;
      }
    }
    const key = localKey('support', userId);
    const messages = await readJson(key, []);
    if (!messages.length) throw new Error('La conversación ya no está disponible.');
    const message = { id: `local-reply-${Date.now()}`, text: messageText, senderId: token, senderName: 'Soporte Gamecube', senderRole: 'support', createdAt: new Date().toISOString() };
    await writeJson(key, [...messages, message]);
    return { message };
  },
};

export const adminOrdersApi = {
  get: async (token) => {
    if (!isLocalToken(token)) {
      try { return await request('/admin/orders', {}, token); } catch (error) {
        if (error.status) throw error;
      }
    }
    return { orders: await localOrders() };
  },
  updateStatus: async (orderId, status, token) => {
    if (!['processing', 'shipped', 'delivered', 'cancelled'].includes(status)) throw new Error('Selecciona un estado válido.');
    if (!isLocalToken(token)) {
      try {
        return await request(`/admin/orders/${encodeURIComponent(orderId)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
      } catch (error) {
        if (error.status) throw error;
      }
    }
    const keys = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith('gamecube_local_orders_'));
    for (const key of keys) {
      const orders = await readJson(key, []);
      const orderIndex = orders.findIndex((order) => order.id === orderId);
      if (orderIndex >= 0) {
        orders[orderIndex] = { ...orders[orderIndex], status, updatedAt: new Date().toISOString() };
        await writeJson(key, orders);
        return { order: orders[orderIndex] };
      }
    }
    throw new Error('No se encontró el pedido.');
  },
};

async function localAdminProducts() {
  const stored = await readJson(ADMIN_PRODUCTS_KEY, null);
  if (stored) return stored;
  await writeJson(ADMIN_PRODUCTS_KEY, seedProducts);
  return seedProducts;
}

function completeProduct(product) {
  const image = product.image || seedProducts[0].image;
  return {
    ...product,
    shortName: product.shortName || product.name,
    category: product.category || 'components',
    categoryLabel: product.categoryLabel || 'Componentes',
    rating: product.rating || '5.0',
    image,
    gallery: product.gallery?.length ? product.gallery : [image],
    description: product.description || `${product.name} pensado para llevar tu experiencia gaming a otro nivel. Ofrece rendimiento consistente, materiales duraderos y una integración sencilla con tu setup.`,
    specs: product.specs?.length ? product.specs : ['Rendimiento gaming', 'Instalación sencilla', 'Garantía oficial'],
    retailerSources: product.retailerSources || ['GameCube'],
  };
}

export const productsApi = {
  async get() {
    try {
      const result = await request('/products');
      return { products: result.map(completeProduct) };
    } catch {
      return { products: (await localAdminProducts()).map(completeProduct) };
    }
  },
};

export const adminApi = {
  dashboard: async (token) => {
    try { return await request('/admin/dashboard', {}, token); } catch {
      const users = (await readJson(USERS_KEY, [])).filter((user) => user.role !== 'admin');
      const products = await localAdminProducts();
      const orders = (await Promise.all(users.map((user) => readJson(localKey('orders', user.id), [])))).flat();
      const sales = orders.reduce((sum, order) => sum + order.total, 0);
      return { metrics: { sales, users: users.length, products: products.length, orders: orders.length }, salesTrend: [24, 38, 32, 54, 48, 71, 63], userTrend: [18, 26, 24, 39, 44, 52, 61], topProducts: products.slice(0, 5).map((product, index) => ({ ...product, sold: 18 - index * 2 })) };
    }
  },
  users: async (token) => {
    try { return await request('/admin/users', {}, token); } catch {
      return { users: (await readJson(USERS_KEY, [])).filter((user) => user.role !== 'admin').map(publicUser) };
    }
  },
  updateUser: async (id, payload, token) => {
    try { return await request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, token); } catch {
      const users = await readJson(USERS_KEY, []);
      const updated = users.map((user) => user.id === id ? { ...user, name: payload.name.trim(), email: payload.email.trim().toLowerCase() } : user);
      await writeJson(USERS_KEY, updated);
      return { user: publicUser(updated.find((user) => user.id === id)) };
    }
  },
  deleteUser: async (id, token) => {
    try { return await request(`/admin/users/${id}`, { method: 'DELETE' }, token); } catch {
      await writeJson(USERS_KEY, (await readJson(USERS_KEY, [])).filter((user) => user.id !== id));
      return { message: 'Usuario eliminado' };
    }
  },
  products: async (token) => {
    try { return await request('/admin/products', {}, token); } catch { return { products: await localAdminProducts() }; }
  },
  createProduct: async (payload, token) => {
    const completed = completeProduct(payload);
    try {
      const result = await request('/admin/products', { method: 'POST', body: JSON.stringify(completed) }, token);
      return { ...result, product: completeProduct(result.product) };
    } catch {
      const product = completeProduct({ ...completed, id: `local-product-${Date.now()}` });
      const products = [product, ...(await localAdminProducts())];
      await writeJson(ADMIN_PRODUCTS_KEY, products);
      return { product, products };
    }
  },
  updateProduct: async (id, payload, token) => {
    const completed = completeProduct(payload);
    try { return await request(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(completed) }, token); } catch {
      const products = (await localAdminProducts()).map((product) => product.id === id ? completeProduct({ ...product, ...completed }) : product);
      await writeJson(ADMIN_PRODUCTS_KEY, products);
      return { product: products.find((product) => product.id === id), products };
    }
  },
  deleteProduct: async (id, token) => {
    try { return await request(`/admin/products/${id}`, { method: 'DELETE' }, token); } catch {
      await writeJson(ADMIN_PRODUCTS_KEY, (await localAdminProducts()).filter((product) => product.id !== id));
      return { message: 'Producto eliminado' };
    }
  },
};
