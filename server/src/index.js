import 'dotenv/config';
import dns from 'node:dns';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const port = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET || 'development-secret-change-me';

app.use(cors());
app.use(express.json());

const cartItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: String,
  shortName: String,
  categoryLabel: String,
  price: Number,
  currency: { type: String, default: 'MXN' },
  image: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  cart: { type: [cartItemSchema], default: [] },
  favorites: { type: [cartItemSchema], default: [] },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  shortName: String,
  category: String,
  categoryLabel: String,
  price: Number,
  oldPrice: Number,
  discount: Number,
  rating: String,
  image: String,
  gallery: [String],
  description: String,
  specs: [String],
  retailerSources: [String],
}, { timestamps: true });
const Product = mongoose.model('Product', productSchema);
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [cartItemSchema], required: true },
  subtotal: Number,
  shippingCost: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'MXN' },
  paymentMethod: { type: String, enum: ['card', 'paypal', 'transfer', 'cash'] },
  last4: String,
  shippingAddress: {
    street: String,
    city: String,
    postalCode: String,
    reference: String,
  },
  status: { type: String, enum: ['processing', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
}, { timestamps: true });
const Order = mongoose.model('Order', orderSchema);
const supportMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['customer', 'support'], required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true, maxlength: 1000, trim: true },
}, { timestamps: true });
const SupportMessage = mongoose.model('SupportMessage', supportMessageSchema);

function createToken(user) { return jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '7d' }); }
function publicUser(user) { return { id: user.id, name: user.name, email: user.email, role: user.role || 'customer', createdAt: user.createdAt }; }
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Necesitas iniciar sesión' });
  try { req.userId = jwt.verify(token, jwtSecret).id; next(); } catch { res.status(401).json({ message: 'Sesión no válida o caducada' }); }
}
function adminOnly(req, res, next) {
  User.findById(req.userId).select('role').then((user) => {
    if (user?.role !== 'admin') return res.status(403).json({ message: 'Se requieren permisos de administrador' });
    next();
  }).catch(() => res.status(500).json({ message: 'No se pudo validar el permiso' }));
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/products', async (req, res) => {
  try { res.json(await Product.find({}).sort({ category: 1, id: 1 })); }
  catch (error) { res.status(500).json({ message: 'No se pudieron obtener los productos', error: error.message }); }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 6) return res.status(400).json({ message: 'Nombre, email y una contraseña de 6 caracteres son obligatorios' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'Ya existe una cuenta con ese email' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ user: publicUser(user), token: createToken(user) });
  } catch { res.status(500).json({ message: 'No se pudo crear la cuenta' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gamecube.mx').toLowerCase();
    if (email === adminEmail && req.body.password === (process.env.ADMIN_PASSWORD || 'admin123')) {
      const admin = await User.findOneAndUpdate({ email: adminEmail }, { name: 'Administrador', email: adminEmail, password: await bcrypt.hash(req.body.password, 12), role: 'admin' }, { upsert: true, new: true, setDefaultsOnInsert: true });
      return res.json({ user: publicUser(admin), token: createToken(admin) });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    let validPassword = await bcrypt.compare(req.body.password || '', user.password);
    if (!validPassword && user.password === req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 12);
      await user.save();
      validPassword = true;
    }
    if (!validPassword) return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    res.json({ user: publicUser(user), token: createToken(user) });
  } catch { res.status(500).json({ message: 'No se pudo iniciar sesión' }); }
});

app.get('/api/auth/me', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json({ user: publicUser(user) });
});

app.get('/api/cart', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('cart');
  res.json({ cart: user?.cart || [] });
});

app.get('/api/favorites', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('favorites');
  res.json({ favorites: user?.favorites || [] });
});

app.post('/api/favorites', auth, async (req, res) => {
  const { product } = req.body;
  if (!product?.id || typeof product.price !== 'number') return res.status(400).json({ message: 'Producto no válido' });
  const user = await User.findById(req.userId);
  if (!user.favorites.some((item) => item.id === product.id)) user.favorites.push(product);
  await user.save();
  res.status(201).json({ favorites: user.favorites });
});

app.delete('/api/favorites/:productId', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  user.favorites = user.favorites.filter((item) => item.id !== req.params.productId);
  await user.save();
  res.json({ favorites: user.favorites });
});

app.post('/api/cart', auth, async (req, res) => {
  const { product } = req.body;
  if (!product?.id || typeof product.price !== 'number') return res.status(400).json({ message: 'Producto no válido' });
  const user = await User.findById(req.userId);
  user.cart.push(product);
  await user.save();
  res.status(201).json({ cart: user.cart });
});

app.delete('/api/cart/:productId', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  const index = user.cart.findIndex((item) => item.id === req.params.productId);
  if (index >= 0) user.cart.splice(index, 1);
  await user.save();
  res.json({ cart: user.cart });
});

app.patch('/api/cart/:productId', auth, async (req, res) => {
  const { quantity } = req.body;
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) return res.status(400).json({ message: 'La cantidad debe estar entre 0 y 99' });
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  const matchingItems = user.cart.filter((item) => item.id === req.params.productId);
  if (!matchingItems.length) return res.status(404).json({ message: 'El producto ya no está en tu carrito' });
  const product = matchingItems[0].toObject();
  user.cart = user.cart.filter((item) => item.id !== req.params.productId);
  if (quantity > 0) {
    user.cart.push(...Array.from({ length: quantity }, () => product));
  }
  await user.save();
  res.json({ cart: user.cart });
});

app.post('/api/orders', auth, async (req, res) => {
  res.status(410).json({ message: 'Los pedidos de demostración se registran localmente desde la app' });
});

app.post('/api/orders/direct', auth, async (req, res) => {
  res.status(410).json({ message: 'Añade el producto al carrito y confirma la simulación desde la app' });
});

app.post('/api/orders/simulated', auth, async (req, res) => {
  const { paymentMethod, last4, shippingAddress } = req.body;
  if (!['card', 'paypal', 'transfer', 'cash'].includes(paymentMethod)) {
    return res.status(400).json({ message: 'Selecciona un método de pago válido' });
  }
  if (paymentMethod === 'card' && (typeof last4 !== 'string' || !/^\d{4}$/.test(last4))) {
    return res.status(400).json({ message: 'Los últimos cuatro dígitos de la tarjeta no son válidos' });
  }
  if (
    !shippingAddress?.street?.trim()
    || !shippingAddress?.city?.trim()
    || !shippingAddress?.postalCode?.trim()
  ) {
    return res.status(400).json({ message: 'Completa la calle, ciudad y código postal de envío' });
  }
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  if (!user.cart.length) return res.status(400).json({ message: 'El carrito está vacío' });

  const quantities = user.cart.reduce((result, item) => {
    result.set(item.id, (result.get(item.id) || 0) + 1);
    return result;
  }, new Map());
  const products = await Product.find({ id: { $in: [...quantities.keys()] } }).lean();
  const productsById = new Map(products.map((product) => [product.id, product]));
  const items = [];
  for (const [id, quantity] of quantities) {
    const product = productsById.get(id);
    if (!product || !Number.isFinite(product.price) || product.price <= 0) {
      return res.status(400).json({ message: 'Uno de los productos ya no está disponible. Actualiza tu carrito.' });
    }
    for (let count = 0; count < quantity; count += 1) {
      items.push({
        id: product.id,
        name: product.name,
        shortName: product.shortName || product.name,
        categoryLabel: product.categoryLabel || '',
        price: product.price,
        currency: 'MXN',
        image: product.image || '',
      });
    }
  }
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const order = await Order.create({
    user: user.id,
    items,
    subtotal,
    shippingCost: 0,
    total: subtotal,
    currency: 'MXN',
    paymentMethod,
    ...(paymentMethod === 'card' ? { last4 } : {}),
    shippingAddress: {
      street: shippingAddress.street.trim(),
      city: shippingAddress.city.trim(),
      postalCode: shippingAddress.postalCode.trim(),
      reference: shippingAddress.reference?.trim() || '',
    },
    status: 'processing',
  });
  user.cart = [];
  await user.save();
  res.status(201).json({
    message: 'Pedido de demostración creado correctamente',
    orderId: order.id,
    total: order.total,
    paymentMethod: order.paymentMethod,
    last4: order.last4,
    shippingAddress: order.shippingAddress,
  });
});

app.get('/api/orders', auth, async (req, res) => {
  const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json({ orders });
});

app.get('/api/admin/orders', auth, adminOnly, async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(500);
  res.json({ orders });
});

app.patch('/api/admin/orders/:id/status', auth, adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!['processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Selecciona un estado de pedido válido' });
  }
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'El identificador del pedido no es válido' });
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
    .populate('user', 'name email');
  if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });
  res.json({ order });
});

app.get('/api/support/messages', auth, async (req, res) => {
  const messages = await SupportMessage.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .limit(500);
  res.json({ messages: messages.reverse() });
});

app.post('/api/support/messages', auth, async (req, res) => {
  const text = req.body.text?.trim();
  if (!text || text.length > 1000) return res.status(400).json({ message: 'Escribe un mensaje de hasta 1000 caracteres' });
  const user = await User.findById(req.userId).select('name');
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  const message = await SupportMessage.create({
    user: user.id,
    sender: user.id,
    senderRole: 'customer',
    senderName: user.name,
    text,
  });
  res.status(201).json({ message });
});

app.get('/api/admin/support/conversations', auth, adminOnly, async (req, res) => {
  const messages = await SupportMessage.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(2000);
  const conversations = new Map();
  messages.forEach((message) => {
    const userId = String(message.user._id);
    if (!conversations.has(userId)) {
      conversations.set(userId, {
        userId,
        customerName: message.user.name,
        customerEmail: message.user.email,
        updatedAt: message.createdAt,
        lastMessage: message,
        messages: [],
      });
    }
    conversations.get(userId).messages.unshift(message);
  });
  res.json({ conversations: [...conversations.values()].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) });
});

app.post('/api/admin/support/messages', auth, adminOnly, async (req, res) => {
  const { userId } = req.body;
  const text = req.body.text?.trim();
  if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ message: 'La conversación seleccionada no es válida' });
  if (!text || text.length > 1000) return res.status(400).json({ message: 'Escribe una respuesta de hasta 1000 caracteres' });
  const user = await User.findById(userId).select('name');
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  const supportUser = await User.findById(req.userId).select('name');
  const message = await SupportMessage.create({
    user: user.id,
    sender: req.userId,
    senderRole: 'support',
    senderName: supportUser?.name || 'Soporte Gamecube',
    text,
  });
  res.status(201).json({ message });
});

app.get('/api/admin/dashboard', auth, adminOnly, async (req, res) => {
  const [users, products, orders] = await Promise.all([User.countDocuments({ role: 'customer' }), Product.countDocuments(), Order.find({}).sort({ createdAt: -1 }).limit(100).lean()]);
  const sales = orders.reduce((sum, order) => sum + order.total, 0);
  const productSales = orders.flatMap((order) => order.items).reduce((map, item) => { map[item.id] = (map[item.id] || 0) + 1; return map; }, {});
  const topProducts = await Product.find({ id: { $in: Object.keys(productSales) } }).lean();
  res.json({ metrics: { sales, users, products, orders: await Order.countDocuments() }, salesTrend: [24, 38, 32, 54, 48, 71, 63], userTrend: [18, 26, 24, 39, 44, 52, 61], topProducts: topProducts.map((product) => ({ ...product, sold: productSales[product.id] })).sort((a, b) => b.sold - a.sold).slice(0, 5) });
});

app.get('/api/admin/users', auth, adminOnly, async (req, res) => res.json({ users: await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 }).lean() }));
app.patch('/api/admin/users/:id', auth, adminOnly, async (req, res) => {
  const { name, email } = req.body;
  if (!name?.trim() || !email?.trim()) return res.status(400).json({ message: 'Nombre y email son obligatorios' });
  const user = await User.findOneAndUpdate({ _id: req.params.id, role: 'customer' }, { name: name.trim(), email: email.trim().toLowerCase() }, { new: true, runValidators: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json({ user });
});
app.delete('/api/admin/users/:id', auth, adminOnly, async (req, res) => {
  const result = await User.deleteOne({ _id: req.params.id, role: 'customer' });
  if (!result.deletedCount) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json({ message: 'Usuario eliminado' });
});
app.get('/api/admin/products', auth, adminOnly, async (req, res) => res.json({ products: await Product.find({}).sort({ createdAt: -1 }).lean() }));
app.post('/api/admin/products', auth, adminOnly, async (req, res) => {
  const { name, category, categoryLabel, price, image } = req.body;
  if (!name?.trim() || !category?.trim() || !categoryLabel?.trim() || !Number.isFinite(Number(price)) || Number(price) <= 0) return res.status(400).json({ message: 'Completa nombre, categoría y precio válido' });
  const product = await Product.create({ ...req.body, id: `product-${Date.now()}`, name: name.trim(), price: Number(price) });
  res.status(201).json({ product, products: await Product.find({}).sort({ createdAt: -1 }).lean() });
});
app.patch('/api/admin/products/:id', auth, adminOnly, async (req, res) => {
  const product = await Product.findOneAndUpdate({ id: req.params.id }, { ...req.body, price: Number(req.body.price) }, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
  res.json({ product, products: await Product.find({}).sort({ createdAt: -1 }).lean() });
});
app.delete('/api/admin/products/:id', auth, adminOnly, async (req, res) => {
  const result = await Product.deleteOne({ id: req.params.id });
  if (!result.deletedCount) return res.status(404).json({ message: 'Producto no encontrado' });
  res.json({ message: 'Producto eliminado' });
});

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gamecube')
  .then(() => app.listen(port, '0.0.0.0', () => console.log(`Gamecube API escuchando en http://0.0.0.0:${port}`)))
  .catch((error) => { console.error('No se pudo conectar con MongoDB:', error.message); process.exit(1); });
