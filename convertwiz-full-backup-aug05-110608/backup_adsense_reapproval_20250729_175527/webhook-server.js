// Razorpay Webhook Server (Express + Node.js)
// Deploy on Render for Always-On webhook support

const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Razorpay Secret for Signature Validation
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'CWsecret2025@123';

// Dev & Prod URLs
const SUBSCRIPTION_API_DEV = 'https://35ecc3c8-b269-410e-ba9e-2756d5961cee-00-1dq4jtpoozmmw.riker.replit.dev/api/confirm-subscription';
const SUBSCRIPTION_API_PROD = 'https://www.convertwiz.in/api/confirm-subscription';

// Helper: Forward to Confirm API
async function forwardToSubscriptionAPI(paymentData) {
  const fetch = (await import('node-fetch')).default;

  const targetURL = process.env.ENV === 'prod' ? SUBSCRIPTION_API_PROD : SUBSCRIPTION_API_DEV;

  try {
    console.log(`🔄 Forwarding to: ${targetURL}`);
    const res = await fetch(targetURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    const data = await res.text();
    console.log('✅ Forwarded to Subscription API:', data);
  } catch (err) {
    console.error('❌ Failed to forward to subscription API:', err);
  }
}

// Webhook Route
app.post('/razorpay-webhook', (req, res) => {
  console.log('🔔 Webhook received at external server');
  
  const razorpaySignature = req.headers['x-razorpay-signature'];
  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  console.log('📋 Signature validation:');
  console.log('- Received:', razorpaySignature);
  console.log('- Generated:', generatedSignature);

  if (generatedSignature !== razorpaySignature) {
    console.log('❌ Invalid signature');
    return res.status(400).send('Invalid signature');
  }

  console.log('✅ Signature verified');
  
  const event = req.body.event;
  console.log(`📝 Event: ${event}`);
  
  if (event === 'payment.captured') {
    const payment = req.body.payload.payment.entity;
    const paymentData = {
      razorpay_order_id: payment.order_id,
      razorpay_payment_id: payment.id,
      amount: payment.amount,
      status: 'captured',
      user_email: payment.notes?.email || payment.email || 'unknown',
      timestamp: new Date().toISOString()
    };
    
    console.log('💰 Payment data to forward:', paymentData);
    forwardToSubscriptionAPI(paymentData);
  }

  res.status(200).json({ status: 'Webhook received and processed' });
});

app.get('/', (req, res) => {
  res.send('ConvertWiz Razorpay Webhook Server is Live ✅');
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ConvertWiz Webhook Server running on port ${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/razorpay-webhook`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});