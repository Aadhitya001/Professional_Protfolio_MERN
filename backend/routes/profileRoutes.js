import express from 'express';
import Profile from '../models/Profile.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get profile
// @route   GET /api/profile
// @access  Public
router.get('/', async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({
        name: 'Alex Mercer',
        title: 'Full-Stack Developer',
        bio: 'Building beautiful, interactive web experiences with modern tech stacks.',
        bioDetails: 'I am a passionate software engineer specializing in JavaScript ecosystems. I love designing immersive user interfaces and architecting robust, scalable backend services.',
        email: 'alex.mercer@example.com',
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        instagram: 'https://instagram.com',
        location: 'San Francisco, CA'
      });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update profile
// @route   PUT /api/profile
// @access  Private
router.put('/', protect, async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile(req.body);
    } else {
      Object.assign(profile, req.body);
    }
    const updatedProfile = await profile.save();
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
