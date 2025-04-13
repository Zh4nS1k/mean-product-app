import express from 'express';

import Product from '../models/products.js';

import { authenticateToken, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/search', async (req, res) => {
  const query = req.query.q || '';
  const regex = new RegExp(query, 'i');

  try {
    const products = await Product.find({ name: regex });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: 'Error searching products' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticateToken, adminOnly, async (req, res) => {
  const product = req.body;

  if (!product.name || !product.price) {
    return res
      .status(400)
      .json({ success: false, message: 'Required fields missing' });
  }

  const newProduct = new Product(product);

  try {
    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: 'Error while creating new product' });
  }
});

router.put('/:id', authenticateToken, adminOnly, async (req, res) => {
  const { id } = req.params;
  const product = req.body;

  if (!product.name || !product.price) {
    return res
      .status(400)
      .json({ success: false, message: 'Required fields missing' });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, product);
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: 'Error while updating product' });
  }
});

router.delete('/:id', authenticateToken, adminOnly, async (req, res) => {
  const { id } = req.params;

  try {
    await Product.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.log(error);
    res.status(404).json({ success: false, message: 'Product not found' });
  }
});

export default router;
