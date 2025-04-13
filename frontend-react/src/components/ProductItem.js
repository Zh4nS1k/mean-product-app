import React, { useState } from 'react';
import '../style.css';

const ProductItem = ({ product, onUpdateProduct, onDeleteProduct }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(product.name);
  const [editPrice, setEditPrice] = useState(product.price);

  const handleEdit = () => setIsEditing(true);

  const handleSave = () => {
    if (!editName.trim() || !editPrice) return;
    onUpdateProduct(product._id, editName, editPrice);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(product.name);
    setEditPrice(product.price);
  };

  return (
    <li className="product-item">
      {!isEditing ? (
        <>
          <div className="product-details">
            <div className="product-name">{product.name}</div>
            <div className="product-price">${product.price}</div>
          </div>
          <div className="product-actions">
            <button className="edit-btn" onClick={handleEdit}>
              Edit
            </button>
            <button
              className="delete-btn"
              onClick={() => onDeleteProduct(product._id)}
            >
              Delete
            </button>
          </div>
        </>
      ) : (
        <div className="edit-form">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <input
            type="number"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            step="0.01"
            required
          />
          <button className="save-btn" onClick={handleSave}>
            Save
          </button>
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      )}
    </li>
  );
};

export default ProductItem;
