import React, { useState } from 'react';
import '../style.css';

const ProductForm = ({ onAddProduct }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    onAddProduct(name, price);
    setName('');
    setPrice('');
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-group">
        <label htmlFor="product-name">Product Name:</label>
        <input
          type="text"
          id="product-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="product-price">Price:</label>
        <input
          type="number"
          id="product-price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          step="0.01"
          required
        />
      </div>
      <button type="submit" className="btn">
        Add Product
      </button>
    </form>
  );
};

export default ProductForm;
