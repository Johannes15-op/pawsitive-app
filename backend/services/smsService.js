const axios = require('axios');
const iprogConfig = require('../config/iprog.config');

class SMSService {
  constructor() {
    if (iprogConfig.isConfigured) {
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


  async sendSMS(phoneNumber, message) {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      if (!formattedPhone) {
        throw new Error('Invalid phone number');
      }

      console.log('📱 Sending SMS via iProg...');
      console.log('  To:', formattedPhone);
      console.log('  Message length:', message.length);

   
      if (!iprogConfig.isConfigured) {
        console.log('🔧 MOCK MODE - SMS not actually sent');
        console.log('📝 Message:', message);
        return {
          success: true,
          mock: true,
          message: 'SMS simulated (iProg not configured)',
          to: formattedPhone,
          messageBody: message
        };
      }

      
      const response = await axios.post(
        'https://sms.iprogtech.com/api/v1/sms_messages',
        null,
        {
          params: {
            api_token: iprogConfig.apiKey,
            phone_number: formattedPhone,
            message: message
          }
        }
      );

      console.log('📥 iProg Response:', response.data);

    
      if (response.data.status === 200 || response.data.status === 'success') {
        console.log('✅ SMS sent successfully via iProg!');
        return {
          success: true,
          provider: 'iProg',
          to: formattedPhone,
          messageId: response.data.message_id || null,
          response: response.data,
          message: 'SMS sent successfully'
        };
      } else {
        throw new Error(response.data.message || 'Failed to send SMS');
      }

    } catch (error) {
      console.error('❌ iProg SMS Error:', error.message);
      
      if (error.response) {
        console.error('Response:', error.response.data);
        throw new Error(error.response.data.message || 'iProg API error');
      }
      
      throw error;
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
      const message = `🐾 TAARA PET ADOPTION ALERT

Someone wants to adopt ${petName}!

Adopter: ${adopterName}
Contact: ${adopterContact}
Request ID: ${adoptionId}

Please log in to your account to review and respond to this adoption request.

- TAARA Pet Adoption Team`;

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
      const message = `🎉 ADOPTION APPROVED!

Congratulations! Your adoption request for ${petName} has been approved!

Owner: ${ownerName}
Contact: ${ownerContact}

The owner will contact you soon to arrange the adoption details.

Thank you for choosing to adopt!
- TAARA Pet Adoption Team`;

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
      const message = `TAARA Pet Adoption Update

We regret to inform you that your adoption request for ${petName} was not approved at this time.

${reason ? `Reason: ${reason}` : ''}

Please don't be discouraged! There are many wonderful pets waiting for loving homes.

- TAARA Pet Adoption Team`;

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
}


module.exports = new SMSService();