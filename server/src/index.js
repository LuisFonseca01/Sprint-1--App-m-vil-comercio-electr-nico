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
  total: { type: Number, required: true },
  status: { type: String, default: 'confirmed' },
}, { timestamps: true });
const Order = mongoose.model('Order', orderSchema);

function createToken(user) { return jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '7d' }); }
function publicUser(user) { return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }; }
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Necesitas iniciar sesión' });
  try { req.userId = jwt.verify(token, jwtSecret).id; next(); } catch { res.status(401).json({ message: 'Sesión no válida o caducada' }); }
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
    const user = await User.findOne({ email: req.body.email?.trim().toLowerCase() });
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

app.post('/api/orders', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user?.cart.length) return res.status(400).json({ message: 'El carrito está vacío' });
  const total = user.cart.reduce((sum, item) => sum + item.price, 0);
  const order = await Order.create({ user: user.id, items: user.cart, total });
  user.cart = [];
  await user.save();
  res.status(201).json({ message: 'Compra realizada correctamente', orderId: order.id, total });
});

app.post('/api/orders/direct', auth, async (req, res) => {
  const { product } = req.body;
  if (!product?.id || typeof product.price !== 'number') return res.status(400).json({ message: 'Producto no válido' });
  const order = await Order.create({ user: req.userId, items: [product], total: product.price });
  res.status(201).json({ message: 'Compra realizada correctamente', orderId: order.id, total: order.total });
});

app.get('/api/orders', auth, async (req, res) => {
  const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json({ orders });
});

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gamecube')
  .then(() => app.listen(port, '0.0.0.0', () => console.log(`Gamecube API escuchando en http://0.0.0.0:${port}`)))
  .catch((error) => { console.error('No se pudo conectar con MongoDB:', error.message); process.exit(1); });
