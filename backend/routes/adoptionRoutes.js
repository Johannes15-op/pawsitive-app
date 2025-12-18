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

module.exports = router;