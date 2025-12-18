const axios = require('axios');
const iprogConfig = require('../config/iprog.config');

class SMSService {
  constructor() {
    if (iprogConfig.isConfigured) {
      console.log('🔧 iProg SMS Configuration Status:');
      console.log('  API Key:', iprogConfig.apiKey ? '✅ Set' : '❌ Missing');
      console.log('  Sender ID:', iprogConfig.senderId || 'Not set');
      console.log('  Sender Name:', iprogConfig.senderName || 'Not set');
      console.log('  Status:', iprogConfig.enabled ? '✅ ENABLED' : '⚠️ DISABLED');
      console.log('✅ iProg SMS Service initialized');
    } else {
      console.warn('⚠️ iProg SMS not configured - running in MOCK mode');
    }
  }

  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return null;
    
    let cleaned = phoneNumber.replace(/[\s\-()+ ]/g, '');
    
    if (cleaned.startsWith('63') && cleaned.length === 12) {
      return cleaned;
    }
    
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      return '63' + cleaned.substring(1);
    }
    
    if (cleaned.startsWith('9') && cleaned.length === 10) {
      return '63' + cleaned;
    }
    
    return cleaned;
  }


  cleanMessage(message) {
 
    return message
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') 
      .replace(/[\u{2600}-\u{26FF}]/gu, '')  
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   
      .trim();
  }

  async sendSMS(phoneNumber, message) {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      if (!formattedPhone) {
        throw new Error('Invalid phone number');
      }


      const cleanedMessage = this.cleanMessage(message);

      console.log('📱 Sending SMS via iProg...');
      console.log('  To:', formattedPhone);
      console.log('  Sender:', iprogConfig.senderName || iprogConfig.senderId || 'TAARA');
      console.log('  Message length:', cleanedMessage.length);
      console.log('  Message preview:', cleanedMessage.substring(0, 50) + '...');

      if (!iprogConfig.isConfigured) {
        console.log('🔧 MOCK MODE - SMS not actually sent');
        console.log('📝 Message:', cleanedMessage);
        return {
          success: true,
          mock: true,
          message: 'SMS simulated (iProg not configured)',
          to: formattedPhone,
          messageBody: cleanedMessage
        };
      }

 
      const response = await axios.post(
        'https://sms.iprogtech.com/api/v1/sms_messages',
        null,
        {
          params: {
            api_token: iprogConfig.apiKey,
            phone_number: formattedPhone,
            message: cleanedMessage, 
            sender_name: iprogConfig.senderName || iprogConfig.senderId || 'TAARA'
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('📥 iProg Response:', JSON.stringify(response.data, null, 2));

      if (response.data.status === 200 || response.data.status === 'success') {
        console.log('✅ SMS queued successfully via iProg!');
        
      
        const messageId = response.data.message_id;
        if (messageId) {
          console.log('⏱️  Will check delivery status in 10 seconds...');
          setTimeout(() => this.checkMessageStatus(messageId), 10000);
        }
        
        return {
          success: true,
          provider: 'iProg',
          to: formattedPhone,
          messageId: messageId || null,
          response: response.data,
          message: 'SMS sent successfully'
        };
      } else {
        throw new Error(response.data.message || 'Failed to send SMS');
      }

    } catch (error) {
      console.error('❌ iProg SMS Error:', error.message);
      
      if (error.response) {
        console.error('📥 Error Response:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.data.message?.includes('sender')) {
          console.error('🚨 SENDER NAME ISSUE: The sender name may not be approved!');
          console.error('   → Log in to iProg dashboard');
          console.error('   → Check "Sender Names" section');
        }
        
        throw new Error(error.response.data.message || 'iProg API error');
      }
      
      throw error;
    }
  }

  async checkMessageStatus(messageId) {
    try {
      if (!iprogConfig.isConfigured) return;

      console.log('🔍 Checking SMS delivery status for message:', messageId);
      
      const response = await axios.get(
        'https://sms.iprogtech.com/api/v1/sms_messages/status',
        {
          params: {
            api_token: iprogConfig.apiKey,
            message_id: messageId
          }
        }
      );

      const status = response.data;
      console.log('📊 Message Status Response:', JSON.stringify(status, null, 2));

      if (status.delivery_status === 'delivered' || status.status === 'delivered') {
        console.log('✅ SMS CONFIRMED DELIVERED!');
      } else if (status.delivery_status === 'failed' || status.status === 'failed') {
        console.error('❌ SMS DELIVERY FAILED!');
        console.error('   Reason:', status.failure_reason || status.error || 'Unknown');
      } else {
        console.warn('⏳ SMS Status:', status.delivery_status || status.status);
      }

      return status;

    } catch (error) {
      console.error('❌ Status Check Error:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
    }
  }

  async sendAdoptionNotification({
    ownerPhone,
    petName,
    adopterName,
    adopterContact,
    adoptionId
  }) {
    try {
      
      const message = `TAARA ADOPTION ALERT
Pet: ${petName}
Adopter: ${adopterName}
Phone: ${adopterContact}
Request ID: ${adoptionId}

Please check your dashboard to review this adoption request.`;

      console.log('📧 Adoption Notification:');
      console.log('---MESSAGE START---');
      console.log(message);
      console.log('---MESSAGE END---');
      console.log('Character count:', message.length);

      return await this.sendSMS(ownerPhone, message);

    } catch (error) {
      console.error('❌ Adoption Notification Error:', error.message);
      throw error;
    }
  }

  async sendApprovalNotification({
    adopterPhone,
    petName,
    ownerName,
    ownerContact
  }) {
    try {
      const message = `TAARA: ADOPTION APPROVED!
Pet: ${petName}
Owner: ${ownerName}
Contact: ${ownerContact}

Congratulations! The owner will contact you soon to arrange the adoption.`;

      console.log('📧 Approval notification length:', message.length);
      return await this.sendSMS(adopterPhone, message);

    } catch (error) {
      console.error('❌ Approval Notification Error:', error.message);
      throw error;
    }
  }

  async sendRejectionNotification({
    adopterPhone,
    petName,
    reason
  }) {
    try {
      const message = `TAARA: Adoption Update
Your request for ${petName} was not approved.
${reason ? 'Reason: ' + reason : ''}

Please check our website for other pets available for adoption.`;

      return await this.sendSMS(adopterPhone, message);

    } catch (error) {
      console.error('❌ Rejection Notification Error:', error.message);
      throw error;
    }
  }

  async checkBalance() {
    try {
      if (!iprogConfig.isConfigured) {
        return { balance: 'N/A (Mock Mode)' };
      }

      const response = await axios.get(
        'https://sms.iprogtech.com/api/v1/account/sms_credits',
        {
          params: {
            api_token: iprogConfig.apiKey
          }
        }
      );

      return {
        balance: response.data.data.load_balance,
        status: response.data.status
      };

    } catch (error) {
      console.error('❌ Balance Check Error:', error.message);
      throw error;
    }
  }

  async testSMS(testPhone = '09936639774') {
    try {
      console.log('🧪 Testing SMS functionality...');
      
      const testMessage = 'Test from TAARA Pet Adoption. If you receive this message with full text, SMS is working correctly.';
      
      console.log('Test message:', testMessage);
      console.log('Test phone:', testPhone);
      
      const result = await this.sendSMS(testPhone, testMessage);
      
      console.log('✅ Test Result:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Test Failed:', error.message);
      throw error;
    }
  }
}

module.exports = new SMSService();