import express from 'express';
import Experience from '../models/Experience.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const experiences = await Experience.find({}).sort({ createdAt: -1 });
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const experience = new Experience(req.body);
    const createdExperience = await experience.save();
    res.status(201).json(createdExperience);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (experience) {
      Object.assign(experience, req.body);
      const updatedExperience = await experience.save();
      res.json(updatedExperience);
    } else {
      res.status(404).json({ message: 'Experience not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (experience) {
      await experience.deleteOne();
      res.json({ message: 'Experience removed' });
    } else {
      res.status(404).json({ message: 'Experience not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
