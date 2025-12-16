const express = require('express');
const router = express.Router();
const { betterAuthMiddleware, adminAuthMiddleware } = require('../middleware/better-auth');
const auth = require('../lib/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all delivery personnel
router.get('/delivery-users', betterAuthMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const deliveryUsers = await prisma.user.findMany({
      where: { role: 'delivery' },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        createdAt: true,
        _count: {
          select: { assigned_orders: true }
        }
      }
    });

    res.json(deliveryUsers);
  } catch (error) {
    console.error('Get delivery users error:', error);
    res.status(500).json({ error: 'Failed to fetch delivery users' });
  }
});

// Create delivery user
router.post('/delivery-users', betterAuthMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const { name, email, password, phone_number } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Use Better Auth's signUpEmail to create user with proper password hashing
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        callbackURL: '/delivery'
      }
    });

    if (!result || !result.user) {
      throw new Error('Failed to create user with Better Auth');
    }

    // Update user role and phone number
    const user = await prisma.user.update({
      where: { id: result.user.id },
      data: {
        role: 'delivery',
        phone_number: phone_number || null,
      }
    });

    res.json({
      success: true,
      message: 'Delivery user created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
      }
    });
  } catch (error) {
    console.error('Create delivery user error:', error);
    res.status(500).json({ error: error.message || 'Failed to create delivery user' });
  }
});

// Assign order to delivery person
router.put('/orders/:id/assign', betterAuthMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_user_id } = req.body;

    if (!delivery_user_id) {
      return res.status(400).json({ error: 'Delivery user ID is required' });
    }

    // Verify delivery user exists
    const deliveryUser = await prisma.user.findFirst({
      where: {
        id: delivery_user_id,
        role: 'delivery'
      }
    });

    if (!deliveryUser) {
      return res.status(404).json({ error: 'Delivery user not found' });
    }

    const updatedOrder = await prisma.orders.update({
      where: { id: parseInt(id) },
      data: {
        assigned_to: delivery_user_id,
        status: 'assigned'
      },
      include: {
        delivery_person: {
          select: {
            name: true,
            phone_number: true,
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Order assigned successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Assign order error:', error);
    res.status(500).json({ error: 'Failed to assign order' });
  }
});

module.exports = router;
