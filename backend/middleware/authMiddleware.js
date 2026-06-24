import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    // If admin token, bypass DB lookup
    if (decoded.id === 'admin') {
      req.user = { _id: 'admin', username: process.env.ADMIN_USER, isAdmin: true };
    } else {
      req.user = await User.findById(decoded.id).select('-password');
    }
    return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { protect };
