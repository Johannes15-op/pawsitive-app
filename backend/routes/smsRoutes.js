const express = require('express');
const router = express.Router();
const smsService = require('../services/smsService');

// POST /api/sms/send
router.post('/send', async (req, res) => {
  const { to, message } = req.body;

  try {
    const result = await smsService.sendSMS(to, message);
    res.json({ success: true, message: 'SMS sent successfully', messageSid: result.sid });
  } catch (error) {
    console.error('❌ SMS Send Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
