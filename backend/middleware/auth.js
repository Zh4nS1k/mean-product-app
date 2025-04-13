import jwt from 'jsonwebtoken';

import RevokedToken from '../models/revokedTokens.js';

// Authentication middleware
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  try {
    // Check if token is revoked
    const revoked = await RevokedToken.exists({ token });
    if (revoked) {
      return res.status(401).json({ success: false, message: 'Token revoked' });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err)
        return res
          .status(403)
          .json({ success: false, message: 'Invalid token' });
      req.user = user;
      next();
    });
  } catch (error) {
    console.log('Unexpected error: ' + error);
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};

// Admin role check middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ success: false, message: 'Admin access required' });
  }
  next();
};
