import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete, Save, Cancel } from '@mui/icons-material';

const ProductItem = ({
  product,
  onUpdateProduct,
  onDeleteProduct,
  isLoading,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(product.name);
  const [editPrice, setEditPrice] = useState(product.price);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editName.trim() || !editPrice) {
      return;
    }
    onUpdateProduct(product._id, editName, editPrice);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(product.name);
    setEditPrice(product.price);
  };

  return (
    <ListItem divider>
      {!isEditing ? (
        <>
          <ListItemText
            primary={product.name}
            secondary={`$${product.price}`}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={handleEdit}
              color="primary"
              disabled={isLoading}
            >
              <Edit />
            </IconButton>
            <IconButton
              onClick={() => onDeleteProduct(product._id)}
              color="error"
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={20} /> : <Delete />}
            </IconButton>
          </Box>
        </>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Product Name"
            variant="outlined"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
            InputProps={{
              style: { borderRadius: 8 },
            }}
          />

          <TextField
            fullWidth
            label="Price"
            type="number"
            variant="outlined"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            step="0.01"
            required
            InputProps={{
              style: { borderRadius: 8 },
              inputProps: { min: 0 },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              onClick={handleSave}
              color="primary"
              startIcon={<Save />}
              disabled={isLoading}
            >
              Save
            </Button>
            <Button
              onClick={handleCancel}
              color="secondary"
              startIcon={<Cancel />}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </ListItem>
  );
};

export default ProductItem;
