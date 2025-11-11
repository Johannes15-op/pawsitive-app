// config/twilio.config.js
require('dotenv').config();

const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  // This is what was missing!
  isConfigured: !!(
    process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_PHONE_NUMBER
  )
};

// Debug logging (optional but helpful)
console.log('🔧 Twilio Configuration Status:');
console.log('  Account SID:', twilioConfig.accountSid ? '✅ Set' : '❌ Missing');
console.log('  Auth Token:', twilioConfig.authToken ? '✅ Set' : '❌ Missing');
console.log('  Phone Number:', twilioConfig.phoneNumber || '❌ Missing');
console.log('  Status:', twilioConfig.isConfigured ? '✅ ENABLED' : '❌ MOCK MODE');

module.exports = twilioConfig;