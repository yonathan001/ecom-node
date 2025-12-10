const express = require('express');
const db = require('../config/db');
const { betterAuthMiddleware, adminAuthMiddleware } = require('../middleware/better-auth');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create category (admin only)
router.post('/', betterAuthMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const [result] = await db.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );

    res.status(201).json({
      message: 'Category created successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update category (admin only)
router.put('/:id', betterAuthMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    const [result] = await db.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete category (admin only)
router.delete('/:id', betterAuthMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
