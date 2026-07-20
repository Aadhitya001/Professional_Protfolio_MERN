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

import mongoose from 'mongoose';
import Profile from '../backend/models/Profile.js';
import Project from '../backend/models/Project.js';
import Experience from '../backend/models/Experience.js';
import Skill from '../backend/models/Skill.js';
import Certificate from '../backend/models/Certificate.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Await database connection on every request (crucial for serverless functions)
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection middleware error:', err);
  }
  next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/certificates', certificateRoutes);

app.get('/api/portfolio-data', async (req, res) => {
  try {
    const [profile, projects, experiences, skills, certificates] = await Promise.all([
      Profile.findOne(),
      Project.find({}).sort({ featured: -1, createdAt: -1 }),
      Experience.find({}).sort({ duration: -1 }),
      Skill.find({}),
      Certificate.find({})
    ]);

    res.json({
      profile: profile || {},
      projects: projects || [],
      experiences: experiences || [],
      skills: skills || [],
      certificates: certificates || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/health', (req, res) => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };
  res.status(200).json({ 
    status: 'healthy', 
    databaseMode: global.useJsonDb ? 'Fallback JSON (Ephemeral / Temporary)' : 'MongoDB (Persistent)',
    mongooseState: states[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString() 
  });
});

export default app;
