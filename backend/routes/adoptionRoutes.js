const express = require('express');
const router = express.Router();
const smsService = require('../services/smsService');

router.post('/', async (req, res) => {
  try {
    console.log('📥 New adoption request received:', req.body);

    const { 
      petId, 
      petName, 
      adopterName, 
      adopterPhone, 
      adopterEmail,
      ownerPhone,
      ownerId,
      message 
    } = req.body;


    if (!petId || !petName || !adopterName || !adopterPhone || !ownerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    
    const adoptionId = `ADT-${Date.now()}`;


    try {
      const smsResult = await smsService.sendAdoptionNotification({
        ownerPhone: ownerPhone,
        petName: petName,
        adopterName: adopterName,
        adopterContact: adopterPhone,
        adoptionId: adoptionId
      });

      console.log('✅ SMS sent successfully:', smsResult);

      res.status(201).json({
        success: true,
        message: 'Adoption request submitted and owner notified',
        adoptionId: adoptionId,
        smsStatus: smsResult
      });

    } catch (smsError) {
      console.error('⚠️ SMS failed:', smsError.message);
      
      
      res.status(201).json({
        success: true,
        message: 'Adoption request submitted (SMS notification failed)',
        adoptionId: adoptionId,
        smsError: smsError.message
      });
    }

  } catch (error) {
    console.error('❌ Adoption request error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;