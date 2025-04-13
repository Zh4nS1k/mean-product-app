import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

import connectDB from './db/conn.js';
import Product from './models/products.js';
import User from './models/users.js';
import RevokedToken from './models/revokedTokens.js';

import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';

const app = express();

// Security middleware
// app.use(helmet());
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://code.jquery.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
      },
    },
  })
);

app.use(express.json()); // important

// Rate limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 1000 requests per windowMs
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
});

const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
});

app.use(globalLimiter);

app.use('/products', strictLimiter, productRoutes);
app.use('/', userRoutes);

import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../frontend')));

// 404 handling middleware
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../frontend/404.html'));
});

// Fallback for HTML5 history API - should be LAST
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/404.html'));
// });

app.listen(5000, () => {
  connectDB();
  console.log('Server started on port 5000');
});

dotenv.config();

// Middleware setup
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
});
app.use(limiter);

// Connect to MongoDB
connectDB();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  try {
    const revoked = await RevokedToken.exists({ token });
    if (revoked) {
      return res.status(401).json({ success: false, message: 'Token revoked' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err)
        return res
          .status(403)
          .json({ success: false, message: 'Invalid token' });
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};

// Admin role check middleware
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res
      .status(403)
      .json({ success: false, message: 'Admin access required' });
  }
  next();
};

// Routes
app.use('/products', productRoutes);
app.use('/', userRoutes);

// Admin panel endpoint
app.get('/admin', authenticateToken, adminOnly, (req, res) => {
  res.json({ success: true, message: 'Welcome to admin panel' });
});

// Authentication endpoints
app.post('/login', async (req, res) => {
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

app.post('/logout', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded?.exp) {
        await RevokedToken.create({
          token,
          expiresAt: new Date(decoded.exp * 1000),
        });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
  } else {
    return res
      .status(404)
      .json({ success: false, message: 'No token provided' });
  }

  res.json({ success: true, message: 'Logged out successfully' });
});

// Check server status
app.get('/check', (req, res) => {
  res.send('Server is running ✅');
});

// Product CRUD endpoints
app.post('/products', authenticateToken, async (req, res) => {
  try {
    const { name, price, image, type } = req.body;

    if (!name || !price) {
      return res
        .status(400)
        .json({ success: false, message: 'Name and price are required' });
    }

    const newProduct = new Product({ name, price, image, type });
    await newProduct.save();

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.put('/products/:id', authenticateToken, async (req, res) => {
  try {
    const { name, price, image, type } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, image, type },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.delete('/products/:id', authenticateToken, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT} 🚀`));
