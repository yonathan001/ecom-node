const express = require('express');
const router = express.Router();
const axios = require('axios');
const { betterAuthMiddleware } = require('../middleware/better-auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CHAPA_API_URL = 'https://api.chapa.co/v1';

// Helper function to generate transaction reference
function generateTxRef() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = 'TX-';
  for (let i = 0; i < 15; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

// Initialize payment
router.post('/initialize', betterAuthMiddleware, async (req, res) => {
  try {
    const { amount, orderId, shippingAddress } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!amount || !orderId) {
      return res.status(400).json({ error: 'Amount and order ID are required' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate transaction reference
    const tx_ref = generateTxRef();

    // Get phone number from user or use default
    const phone_number = user.phone_number || '0911121314';
    
    // Chapa rejects certain email domains (like @example.com)
    // Use a fallback email if user's email might be rejected
    let email = user.email;
    const invalidDomains = ['example.com', 'test.com', 'localhost'];
    const emailDomain = email.split('@')[1];
    if (invalidDomains.includes(emailDomain)) {
      email = `customer${userId.substring(0, 8)}@gmail.com`;
      console.log(`Using fallback email for Chapa: ${email}`);
    }
    
    // Prepare payment data
    const paymentData = {
      first_name: user.name.split(' ')[0] || 'Customer',
      last_name: user.name.split(' ')[1] || 'User',
      email: email,
      phone_number: phone_number,
      currency: 'ETB',
      amount: amount.toString(),
      tx_ref: tx_ref,
      callback_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/callback`,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?order_id=${orderId}&tx_ref=${tx_ref}`,
      customization: {
        title: 'ecom Payment',
        description: `Payment for Order ${orderId}`,
      },
    };

    console.log('Initializing Chapa payment with data:', JSON.stringify(paymentData, null, 2));
    
    // Initialize payment with Chapa
    const chapaResponse = await axios.post(
      `${CHAPA_API_URL}/transaction/initialize`,
      paymentData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    const response = chapaResponse.data;

    // Store transaction reference with order
    await prisma.orders.update({
      where: { id: orderId },
      data: {
        payment_reference: tx_ref,
        payment_status: 'pending'
      }
    });

    res.json({
      success: true,
      checkout_url: response.data.checkout_url,
      tx_ref: tx_ref,
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    console.error('Error message:', error.message);
    console.error('Error status:', error.status);
    
    // Try to extract more details from the error
    let errorDetails = 'Unknown error';
    if (error.response) {
      console.error('Error response:', error.response);
      errorDetails = error.response.data || error.response;
    } else if (error.data) {
      console.error('Error data:', error.data);
      errorDetails = error.data;
    }
    
    res.status(500).json({ 
      error: 'Failed to initialize payment',
      message: error.message || 'Chapa API error',
      status: error.status,
      details: errorDetails
    });
  }
});

// Verify payment (public endpoint - no auth required)
router.get('/verify/:tx_ref', async (req, res) => {
  try {
    const { tx_ref } = req.params;

    // Verify payment with Chapa
    const chapaResponse = await axios.get(
      `${CHAPA_API_URL}/transaction/verify/${tx_ref}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        }
      }
    );
    
    const response = chapaResponse.data;
    
    console.log('Chapa verification response:', JSON.stringify(response, null, 2));

    // Check if payment was successful (handle both test and live modes)
    const isSuccess = response.status === 'success' && 
                     response.data && 
                     (response.data.status === 'success' || response.data.status === 'paid');
    
    if (isSuccess) {
      // Update order status (no user_id check since this is public)
      await prisma.orders.updateMany({
        where: {
          payment_reference: tx_ref
        },
        data: {
          payment_status: 'paid',
          status: 'confirmed'
        }
      });

      console.log('Order updated successfully for tx_ref:', tx_ref);

      // Get the updated order
      const order = await prisma.orders.findFirst({
        where: { payment_reference: tx_ref }
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment: response.data,
        order: order,
      });
    } else {
      console.log('Payment verification failed. Status:', response.status, 'Data status:', response.data?.status);
      res.json({
        success: false,
        message: 'Payment verification failed',
        status: response.status,
        data: response.data,
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    console.error('Error response:', error.response?.data);
    res.status(500).json({ 
      success: false,
      error: 'Failed to verify payment',
      message: error.message,
      details: error.response?.data
    });
  }
});

// Webhook callback from Chapa
router.post('/callback', async (req, res) => {
  try {
    const { tx_ref, status } = req.body;

    console.log('Chapa callback received:', { tx_ref, status });

    if (status === 'success') {
      // Verify the payment
      const chapaResponse = await axios.get(
        `${CHAPA_API_URL}/transaction/verify/${tx_ref}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          }
        }
      );
      
      const response = chapaResponse.data;

      if (response.status === 'success' && response.data.status === 'success') {
        // Update order status
        await prisma.orders.updateMany({
          where: { payment_reference: tx_ref },
          data: {
            payment_status: 'paid',
            status: 'confirmed'
          }
        });

        console.log('Order updated successfully for tx_ref:', tx_ref);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});

module.exports = router;
