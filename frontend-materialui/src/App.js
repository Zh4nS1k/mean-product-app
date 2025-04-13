import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Products from './components/Products';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/products" element={<Products />} />
      <Route path="/" element={<Products />} />
    </Routes>
  );
}

export default App;
