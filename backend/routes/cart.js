const express = require('express');
const db = require('../config/db');
const { betterAuthMiddleware } = require('../middleware/better-auth');

const router = express.Router();

// Get user's cart
router.get('/', betterAuthMiddleware, async (req, res) => {
  try {
    const [cartItems] = await db.query(
      `SELECT c.*, p.name, p.price, p.image_url, p.stock 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({ items: cartItems, total });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add to cart
router.post('/', betterAuthMiddleware, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    // Check if product exists and has stock
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [product_id]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (products[0].stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check if item already in cart
    const [existing] = await db.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    if (existing.length > 0) {
      // Update quantity
      await db.query(
        'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
        [quantity, req.user.id, product_id]
      );
    } else {
      // Insert new item
      await db.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, product_id, quantity]
      );
    }

    res.json({ message: 'Item added to cart' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update cart item quantity
router.put('/:id', betterAuthMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const [result] = await db.query(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove from cart
router.delete('/:id', betterAuthMiddleware, async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM cart WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear cart
router.delete('/', betterAuthMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
