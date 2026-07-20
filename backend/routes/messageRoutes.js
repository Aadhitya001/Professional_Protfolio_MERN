import express from 'express';
import Message from '../models/Message.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendConfirmationEmail } from '../utils/sendEmail.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, subject, message, contactNumber } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required' });
  }

  try {
    const newMessage = await Message.create({ name, email, subject, message, contactNumber });
    
    // Send confirmation email (must be awaited in serverless environments to prevent freezing)
    await sendConfirmationEmail(email, name, subject, message);
    
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (message) {
      message.read = true;
      const updatedMessage = await message.save();
      res.json(updatedMessage);
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (message) {
      await message.deleteOne();
      res.json({ message: 'Message removed' });
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
