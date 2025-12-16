const express = require('express');
const router = express.Router();
const { betterAuthMiddleware } = require('../middleware/better-auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user profile
router.get('/', betterAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone_number: true,
        address: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/', betterAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone_number, address } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const updateData = {
      name: name.trim()
    };

    if (phone_number !== undefined) {
      updateData.phone_number = phone_number.trim() || null;
    }

    if (address !== undefined) {
      updateData.address = address.trim() || null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone_number: true,
        address: true,
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user order history
router.get('/orders', betterAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.orders.findMany({
      where: { user_id: userId },
      include: {
        order_items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
