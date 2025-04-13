import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import ProductForm from './ProductForm';
import ProductItem from './ProductItem';
import API_BASE_URL from '../config';

const Products = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated, token, loading, logout } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to load products');
      }
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setMessage(data.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(error.message || 'Error loading products');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (name, price) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, price }),
      });
      if (!response.ok) {
        throw new Error('Failed to add product');
      }
      const data = await response.json();
      if (data.success && data.data) {
        setProducts([...products, data.data]);
        setMessage('Product added successfully');
        setMessageType('success');
      } else {
        setMessage(data.message || 'Error adding product');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(error.message || 'Error adding product');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async (id, name, price) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, price }),
      });
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
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
        setMessage(data.message || 'Error updating product');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(error.message || 'Error updating product');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?'))
      return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      const data = await response.json();
      if (data.success) {
        setProducts(products.filter((product) => product._id !== id));
        setMessage('Product deleted successfully');
        setMessageType('success');
      } else {
        setMessage(data.message || 'Error deleting product');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(error.message || 'Error deleting product');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="lg">
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Product Management
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 4 }}>
        <Card elevation={6}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Welcome, {localStorage.getItem('username')}
            </Typography>

            {message && (
              <Alert
                severity={messageType === 'error' ? 'error' : 'success'}
                sx={{ mb: 2 }}
              >
                {message}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ProductForm
                  onAddProduct={handleAddProduct}
                  isLoading={isLoading}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Products
                </Typography>
                {isLoading ? (
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', py: 4 }}
                  >
                    <CircularProgress size={40} />
                  </Box>
                ) : products.length === 0 ? (
                  <Typography variant="body1" align="center">
                    No products found
                  </Typography>
                ) : (
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    {products.map((product) => (
                      <ProductItem
                        key={product._id}
                        product={product}
                        onUpdateProduct={handleUpdateProduct}
                        onDeleteProduct={handleDeleteProduct}
                        isLoading={isLoading}
                      />
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Products;
