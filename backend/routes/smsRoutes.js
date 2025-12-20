const express = require('express');
const router = express.Router();
const smsService = require('../services/smsService');


router.post('/', async (req, res) => {
  try {
    console.log('📥 Full request body:', JSON.stringify(req.body, null, 2));
    
    const { ownerPhone, petName, adopterName, adopterPhone } = req.body;
    
    console.log('🔍 Owner Phone (raw):', ownerPhone);
    console.log('🔍 Owner Phone type:', typeof ownerPhone);
    
    if (!ownerPhone || ownerPhone === 'undefined' || ownerPhone === 'null') {
      console.error('❌ Invalid owner phone number!');
      return res.status(400).json({
        success: false,
        message: 'Owner phone number is missing or invalid'
      });
    }

    const smsResult = await smsService.sendAdoptionNotification({
      ownerPhone: ownerPhone,
      petName: petName,
      adopterName: adopterName,
      adopterContact: adopterPhone,
      adoptionId: `ADT-${Date.now()}`
    });
    
    console.log('✅ SMS Result:', smsResult);
    
    res.status(201).json({
      success: true,
      smsResult: smsResult
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


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
      message: error.message || 'Failed to send SMS notification'
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
        message: 'Missing required fields'
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
        message: 'Missing required fields'
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

module.exports = router;