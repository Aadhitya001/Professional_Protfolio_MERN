import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env');
  process.exit(1);
}

await mongoose.connect(MONGO_URI);
console.log('✅ Connected to MongoDB');

const collections = ['profiles', 'projects', 'experiences', 'skills', 'certificates', 'messages'];

for (const col of collections) {
  const result = await mongoose.connection.db.collection(col).deleteMany({});
  console.log(`🗑️  Cleared "${col}" — deleted ${result.deletedCount} document(s)`);
}

console.log('\n✅ All data cleared! You can now add your fresh details.');
await mongoose.disconnect();
