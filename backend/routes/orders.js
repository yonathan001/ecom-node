const express = require('express');
const db = require('../config/db');
const { betterAuthMiddleware, adminAuthMiddleware } = require('../middleware/better-auth');

const router = express.Router();

// Get all orders (admin) or user's orders
router.get('/', betterAuthMiddleware, async (req, res) => {
  try {
    let query;
    let params;

    if (req.user.is_admin) {
      // Admin sees all orders with user info
      query = `
        SELECT o.*, u.name as user_name, u.email as user_email 
        FROM orders o 
        JOIN user u ON o.user_id = u.id 
        ORDER BY o.created_at DESC
      `;
      params = [];
    } else {
      // Regular user sees only their orders
      query = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC';
      params = [req.user.id];
    }

    const [orders] = await db.query(query, params);

    // Get order items for each order
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name, p.image_url 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create order
router.post('/', betterAuthMiddleware, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { shipping_address } = req.body;

    if (!shipping_address) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    await connection.beginTransaction();

    // Get cart items
    const [cartItems] = await connection.query(
      `SELECT c.*, p.price, p.stock 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Check stock availability
    for (let item of cartItems) {
      if (item.stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({ error: `Insufficient stock for product ID ${item.product_id}` });
      }
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)',
      [req.user.id, total, shipping_address]
    );

    const orderId = orderResult.insertId;

    // Create order items and update stock
    for (let item of cartItems) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );

      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await connection.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    await connection.commit();

    res.status(201).json({
      message: 'Order placed successfully',
      order_id: orderId,
      total
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

// Get single order
router.get('/:id', betterAuthMiddleware, async (req, res) => {
  try {
    let query;
    let params;

    if (req.user.is_admin) {
      query = `
        SELECT o.*, u.name as user_name, u.email as user_email 
        FROM orders o 
        JOIN user u ON o.user_id = u.id 
        WHERE o.id = ?
      `;
      params = [req.params.id];
    } else {
      query = 'SELECT * FROM orders WHERE id = ? AND user_id = ?';
      params = [req.params.id, req.user.id];
    }

    const [orders] = await db.query(query, params);

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];

    const [items] = await db.query(
      `SELECT oi.*, p.name, p.image_url 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [order.id]
    );

    order.items = items;

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status (admin only)
router.put('/:id/status', betterAuthMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
