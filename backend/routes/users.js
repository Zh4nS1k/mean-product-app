import express from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/users.js';
import RevokedToken from '../models/revokedTokens.js';

import { authenticateToken, adminOnly } from '../middleware/auth.js';

import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаём экземпляр router перед его использованием
const router = express.Router();

// Define specific routes for HTML files
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/login.html'));
});

router.get('/index', authenticateToken, adminOnly, (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Login endpoint remains the same
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  const token =
    req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        await RevokedToken.create({
          token,
          expiresAt: new Date(decoded.exp * 1000), // Convert seconds to milliseconds
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
  } else {
    return res
      .status(404)
      .json({ success: false, message: 'No token provided' });
  }

  res.json({ success: true, message: 'Logged out successfully' });
});

// Admin panel endpoint
router.get('/admin', authenticateToken, adminOnly, (req, res) => {
  res.json({ success: true, message: 'Welcome to admin panel' });
});

export default router;
