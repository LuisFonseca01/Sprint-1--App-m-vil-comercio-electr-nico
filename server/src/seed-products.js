import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import { products } from '../../src/data/products.js';

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  shortName: String,
  category: { type: String, required: true },
  categoryLabel: String,
  price: { type: Number, required: true },
  currency: { type: String, default: 'MXN' },
  oldPrice: Number,
  rating: String,
  image: String,
  gallery: [String],
  description: String,
  specs: [String],
  retailerSources: [String],
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gamecube';

dns.setServers(['8.8.8.8', '8.8.4.4']);

try {
  await mongoose.connect(mongoUri);
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Productos insertados correctamente: ${products.length}`);
} catch (error) {
  console.error('No se pudieron insertar los productos:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
