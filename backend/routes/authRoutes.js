import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendOtpEmail } from '../utils/sendEmail.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d'
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email || '',
        token: generateToken(user._id)
      });
    } else if (
      username === process.env.ADMIN_USER &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Admin credentials match; create a pseudo admin object
      const adminUser = { _id: 'admin', username: process.env.ADMIN_USER, email: '' };
      res.json({
        _id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        token: generateToken(adminUser._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reset admin password
// @route   POST /api/auth/reset-password
// @access  Private (Admin)
router.post('/reset-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }
  try {
    let user = await User.findOne({ username: req.user.username });
    
    if (!user) {
      // If user does not exist in db, but matches env credentials (for pseudo admin)
      if (req.user._id === 'admin' && currentPassword === (process.env.ADMIN_PASSWORD || 'Admin786')) {
        user = new User({
          username: req.user.username,
          password: newPassword
        });
        await user.save();
        return res.json({ message: 'Password updated successfully' });
      } else {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      // Fallback check against environment password if user logged in via env bypass
      if (req.user._id === 'admin' && currentPassword === (process.env.ADMIN_PASSWORD || 'Admin786')) {
        // proceed
      } else {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update admin username and email
// @route   PUT /api/auth/update-username
// @access  Private (Admin)
router.put('/update-username', protect, async (req, res) => {
  const { newUsername, newEmail } = req.body;
  if (!newUsername || !newUsername.trim()) {
    return res.status(400).json({ message: 'New username is required' });
  }
  try {
    let user = await User.findOne({ username: req.user.username });
    if (!user) {
      user = new User({
        username: newUsername,
        email: newEmail || '',
        password: process.env.ADMIN_PASSWORD || 'Admin786',
        isAdmin: true
      });
    } else {
      user.username = newUsername;
      if (newEmail !== undefined) user.email = newEmail;
    }

    await user.save();
    
    // Generate new token
    const token = generateToken(user._id);

    res.json({
      message: 'Admin account settings updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email || '',
        token
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Forgot password - sends OTP to admin email
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.email) {
      return res.status(400).json({ message: 'Admin account has no email registered for OTP reset.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const emailSent = await sendOtpEmail(user.email, user.username, otp);

    if (emailSent) {
      res.json({ message: 'OTP sent to your registered email address.' });
    } else {
      console.log(`[Forgot Password] Generated OTP for ${username}: ${otp}`);
      res.json({ 
        message: 'OTP generated. Check console logs as SMTP is not configured.',
        otpDebug: process.env.NODE_ENV !== 'production' ? otp : undefined
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password-otp
// @access  Public
router.post('/reset-password-otp', async (req, res) => {
  const { username, otp, newPassword } = req.body;
  if (!username || !otp || !newPassword) {
    return res.status(400).json({ message: 'Username, OTP, and new password are required' });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp || user.otp !== otp || new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

