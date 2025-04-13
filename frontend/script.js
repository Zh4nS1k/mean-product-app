$(document).ready(function () {
  // Check authentication status
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  if (window.location.href.includes('products.html')) {
    // If on products page but not authenticated, redirect to login
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    // Verify token validity
    try {
      const payload = decodeToken(token);
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        // Token expired
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = 'login.html';
        return;
      }
      $('#welcome-message').text(`Welcome, ${username}`);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = 'login.html';
      return;
    }

    // Load products
    loadProducts();

    // Product form submission
    $('#product-form').on('submit', function (e) {
      e.preventDefault();
      const name = $('#product-name').val().trim();
      const price = $('#product-price').val();

      if (!name || !price) {
        showMessage('Please fill in all fields', 'error');
        return;
      }

      $.ajax({
        url: '/products',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        contentType: 'application/json',
        data: JSON.stringify({ name, price }),
        success: function (response) {
          $('#product-name').val('');
          $('#product-price').val('');
          loadProducts();
          showMessage('Product added successfully', 'success');
        },
        error: function (xhr) {
          showMessage('Failed to add product', 'error');
        },
      });
    });

    // Logout functionality
    $('#logout-btn').on('click', function () {
      $.ajax({
        url: '/logout',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        success: function (response) {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          window.location.href = 'login.html';
        },
        error: function (xhr) {
          showMessage('Logout failed', 'error');
        },
      });
    });

    // Product actions (Edit, Save, Cancel, Delete)
    $('#products').on('click', '.edit-btn', function () {
      const productId = $(this).data('id');
      const productName = $(this)
        .closest('.product-item')
        .find('.product-name')
        .text();
      const productPrice = $(this)
        .closest('.product-item')
        .find('.product-price')
        .text()
        .replace('$', '');

      // Create edit form
      const editForm = `
                <div class="edit-form">
                    <input type="text" id="edit-name" value="${productName}" required>
                    <input type="number" id="edit-price" value="${productPrice}" step="0.01" required>
                    <button class="save-btn" data-id="${productId}">Save</button>
                    <button class="cancel-btn">Cancel</button>
                </div>
            `;
      $(this).closest('.product-item').find('.product-details').html(editForm);
    });

    $('#products').on('click', '.save-btn', function () {
      const productId = $(this).data('id');
      const name = $(this)
        .closest('.edit-form')
        .find('#edit-name')
        .val()
        .trim();
      const price = $(this).closest('.edit-form').find('#edit-price').val();

      if (!name || !price) {
        showMessage('Please fill in all fields', 'error');
        return;
      }

      $.ajax({
        url: `/products/${productId}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        contentType: 'application/json',
        data: JSON.stringify({ name, price }),
        success: function (response) {
          loadProducts();
          showMessage('Product updated successfully', 'success');
        },
        error: function (xhr) {
          showMessage('Failed to update product', 'error');
        },
      });
    });

    $('#products').on('click', '.cancel-btn', function () {
      loadProducts();
    });

    $('#products').on('click', '.delete-btn', function () {
      if (!confirm('Are you sure you want to delete this product?')) return;
      const productId = $(this).data('id');

      $.ajax({
        url: `/products/${productId}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        success: function (response) {
          loadProducts();
          showMessage('Product deleted successfully', 'success');
        },
        error: function (xhr) {
          showMessage('Failed to delete product', 'error');
        },
      });
    });
  }

  // Login page functionality
  if (window.location.href.includes('login.html')) {
    $('#login-form').on('submit', function (e) {
      e.preventDefault();
      const username = $('#username').val().trim();
      const password = $('#password').val().trim();

      if (!username || !password) {
        showMessage('Please enter both username and password', 'error');
        return;
      }

      $.ajax({
        url: '/login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username, password }),
        success: function (response) {
          if (response.success) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('username', username);
            window.location.href = 'products.html';
          } else {
            showMessage(response.message, 'error');
          }
        },
        error: function (xhr) {
          showMessage('Login failed. Please try again.', 'error');
        },
      });
    });
  }

  function loadProducts() {
    $.ajax({
      url: '/products',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      success: function (response) {
        if (!response.success) {
          showMessage(response.message, 'error');
          return;
        }
        const products = response.data;
        $('#products').empty();
        if (products.length === 0) {
          $('#products').append('<li class="empty">No products found</li>');
          return;
        }
        products.forEach((product) => {
          const productItem = `
                        <li class="product-item">
                            <div class="product-details">
                                <div class="product-name">${product.name}</div>
                                <div class="product-price">$${product.price}</div>
                            </div>
                            <div class="product-actions">
                                <button class="edit-btn" data-id="${product._id}">Edit</button>
                                <button class="delete-btn" data-id="${product._id}">Delete</button>
                            </div>
                        </li>
                    `;
          $('#products').append(productItem);
        });
      },
      error: function (xhr) {
        showMessage('Failed to load products', 'error');
      },
    });
  }

  function decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to decode JWT', e);
      return null;
    }
  }

  function showMessage(text, type) {
    const messageDiv = $('#message');
    messageDiv.text(text);
    messageDiv.removeClass('hidden error success');
    messageDiv.addClass(type);
    setTimeout(() => {
      messageDiv.addClass('hidden');
    }, 3000);
  }
});
