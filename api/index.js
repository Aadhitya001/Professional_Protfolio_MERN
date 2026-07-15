import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../backend/config/db.js';
import authRoutes from '../backend/routes/authRoutes.js';
import profileRoutes from '../backend/routes/profileRoutes.js';
import projectRoutes from '../backend/routes/projectRoutes.js';
import experienceRoutes from '../backend/routes/experienceRoutes.js';
import skillRoutes from '../backend/routes/skillRoutes.js';
import messageRoutes from '../backend/routes/messageRoutes.js';
import uploadRoutes from '../backend/routes/uploadRoutes.js';
import certificateRoutes from '../backend/routes/certificateRoutes.js';
import { protect } from '../backend/middleware/authMiddleware.js';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', protect, profileRoutes);
app.use('/api/projects', protect, projectRoutes);
app.use('/api/experience', protect, experienceRoutes);
app.use('/api/skills', protect, skillRoutes);
app.use('/api/messages', protect, messageRoutes);
app.use('/api/upload', protect, uploadRoutes);
app.use('/api/certificates', protect, certificateRoutes);

export default app;
