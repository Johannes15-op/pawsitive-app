const express = require('express');
const router = express.Router();
const smsService = require('../services/smsService');


router.post('/adoption-notification', async (req, res) => {
  try {
    console.log('📥 Received adoption notification request:', req.body);

    const { ownerPhone, petName, adopterName, adopterContact, adoptionId } = req.body;

    if (!ownerPhone || !petName || !adopterName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: ownerPhone, petName, adopterName'
      });
    }


    const result = await smsService.sendAdoptionNotification({
      ownerPhone,
      petName,
      adopterName,
      adopterContact: adopterContact || adopterName,
      adoptionId: adoptionId || 'N/A'
    });

    res.json(result);

  } catch (error) {
    console.error('❌ SMS Route Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send SMS notification',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
});

router.post('/approval-notification', async (req, res) => {
  try {
    console.log('📥 Received approval notification request:', req.body);

    const { adopterPhone, petName, ownerName, ownerContact } = req.body;

    if (!adopterPhone || !petName || !ownerName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: adopterPhone, petName, ownerName'
      });
    }

    const result = await smsService.sendApprovalNotification({
      adopterPhone,
      petName,
      ownerName,
      ownerContact
    });

    res.json(result);

  } catch (error) {
    console.error('❌ Approval SMS Route Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


router.post('/rejection-notification', async (req, res) => {
  try {
    console.log('📥 Received rejection notification request:', req.body);

    const { adopterPhone, petName, reason } = req.body;

    if (!adopterPhone || !petName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: adopterPhone, petName'
      });
    }

    const result = await smsService.sendRejectionNotification({
      adopterPhone,
      petName,
      reason
    });

    res.json(result);

  } catch (error) {
    console.error('❌ Rejection SMS Route Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


router.get('/balance', async (req, res) => {
  try {
    const balance = await smsService.checkBalance();
    res.json(balance);
  } catch (error) {
    console.error('❌ Balance Check Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


router.get('/test', (req, res) => {
  const iprogConfig = require('../config/iprog.config');
  
  res.json({
    configured: iprogConfig.isConfigured,
    senderId: iprogConfig.senderId,
    apiKey: iprogConfig.apiKey ? 'Set ✅' : 'Missing ❌',
    mode: iprogConfig.isConfigured ? 'LIVE' : 'MOCK',
    provider: 'iProg SMS'
  });
});

module.exports = router;