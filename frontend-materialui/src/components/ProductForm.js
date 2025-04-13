import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';

const ProductForm = ({ onAddProduct, isLoading }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      return;
    }
    onAddProduct(name, price);
    setName('');
    setPrice('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Add New Product
      </Typography>

      <TextField
        fullWidth
        label="Product Name"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        margin="normal"
        InputProps={{
          style: { borderRadius: 8 },
        }}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#dcdcdc',
            },
            '&:hover fieldset': {
              borderColor: '#a5a5a5',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976d2',
            },
          },
        }}
      />

      <TextField
        fullWidth
        label="Price"
        type="number"
        variant="outlined"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        step="0.01"
        required
        margin="normal"
        InputProps={{
          style: { borderRadius: 8 },
          inputProps: { min: 0 },
        }}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#dcdcdc',
            },
            '&:hover fieldset': {
              borderColor: '#a5a5a5',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976d2',
            },
          },
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={isLoading}
        startIcon={isLoading && <CircularProgress size={20} />}
        sx={{
          mt: 2,
          borderRadius: 20,
          py: 1.5,
          boxShadow: 2,
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        }}
      >
        {isLoading ? 'Adding...' : 'Add Product'}
      </Button>
    </Box>
  );
};

export default ProductForm;
