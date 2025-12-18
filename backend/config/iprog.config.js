require('dotenv').config();

const iprogConfig = {
  apiKey: process.env.IPROG_API_KEY,
  senderId: process.env.IPROG_SENDER_ID || 'TAARA',
  senderName: 'kaprets', 
  isConfigured: Boolean(process.env.IPROG_API_KEY)
};

console.log('🔧 iProg SMS Configuration Status:');
console.log('  API Key:', iprogConfig.apiKey ? '✅ Set' : '❌ Missing');
console.log('  Sender ID:', iprogConfig.senderId);
console.log('  Sender Name:', iprogConfig.senderName); 
console.log('  Status:', iprogConfig.isConfigured ? '✅ ENABLED' : '❌ MOCK MODE');

module.exports = iprogConfig;