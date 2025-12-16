const express = require('express');
const router = express.Router();
const { betterAuthMiddleware } = require('../middleware/better-auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware to check if user is delivery personnel
const deliveryAuth = (req, res, next) => {
  if (req.user.role !== 'delivery') {
    return res.status(403).json({ error: 'Delivery access required' });
  }
  next();
};

// Get assigned orders
router.get('/orders', betterAuthMiddleware, deliveryAuth, async (req, res) => {
  try {
    const deliveryId = req.user.id;

    const orders = await prisma.orders.findMany({
      where: { assigned_to: deliveryId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone_number: true,
          }
        },
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
    console.error('Get delivery orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
router.put('/orders/:id/status', betterAuthMiddleware, deliveryAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const deliveryId = req.user.id;

    const validStatuses = ['assigned', 'out_for_delivery', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if order is assigned to this delivery person
    const order = await prisma.orders.findFirst({
      where: {
        id: parseInt(id),
        assigned_to: deliveryId
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found or not assigned to you' });
    }

    const updatedOrder = await prisma.orders.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({
      success: true,
      message: 'Order status updated',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
