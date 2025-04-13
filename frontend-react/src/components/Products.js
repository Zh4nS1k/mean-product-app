import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import ProductForm from './ProductForm';
import ProductItem from './ProductItem';
import '../style.css';
import API_BASE_URL from '../config';

const Products = () => {
  const { isAuthenticated, token, loading, logout } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else {
        loadProducts();
      }
    }
  }, [isAuthenticated, loading]);

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to load products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setMessage(data.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    }
  };

  const handleAddProduct = async (name, price) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, price }),
      });
      if (!response.ok) throw new Error('Failed to add product');
      const data = await response.json();
      if (data.success && data.data) {
        setProducts([...products, data.data]);
        setMessage('Product added successfully');
        setMessageType('success');
      } else {
        setMessage(data.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    }
  };

  const handleUpdateProduct = async (id, name, price) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, price }),
      });
      if (!response.ok) throw new Error('Failed to update product');
      const data = await response.json();
      if (data.success) {
        setProducts(
          products.map((product) =>
            product._id === id ? { ...product, name, price } : product
          )
        );
        setMessage('Product updated successfully');
        setMessageType('success');
      } else {
        setMessage(data.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?'))
      return;
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete product');
      const data = await response.json();
      if (data.success) {
        setProducts(products.filter((product) => product._id !== id));
        setMessage('Product deleted successfully');
        setMessageType('success');
      } else {
        setMessage(data.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container">
      <header>
        <h1>Product Management</h1>
        <div className="user-info">
          <span id="welcome-message">
            Welcome, {localStorage.getItem('username')}
          </span>
          <button className="btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <div className="crud-container">
        <ProductForm onAddProduct={handleAddProduct} />
        {message && <div className={`message ${messageType}`}>{message}</div>}
        <div className="products-list">
          <h2>Products</h2>
          {products.length === 0 ? (
            <p>No products found</p>
          ) : (
            <ul id="products">
              {products.map((product) => (
                <ProductItem
                  key={product._id}
                  product={product}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
