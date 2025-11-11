// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const smsRoutes = require('./routes/smsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ====================================
// MIDDLEWARE
// ====================================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ====================================
// ROUTES
// ====================================
app.use('/api/sms', smsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TAARA Pet Adoption API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      sms: {
        adoptionRequest: 'POST /api/sms/adoption-request',
        adoptionApproval: 'POST /api/sms/adoption-approval',
        adoptionRejection: 'POST /api/sms/adoption-rejection',
        donationConfirmation: 'POST /api/sms/donation-confirmation',
        sendGeneral: 'POST /api/sms/send',
        validatePhone: 'POST /api/sms/validate-phone'
      }
    }
  });
});

// ====================================
// ERROR HANDLING
// ====================================
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// ====================================
// START SERVER
// ====================================
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 TAARA Backend Server Running`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Twilio Configured: ${!!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)}`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
  });
});