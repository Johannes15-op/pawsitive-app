const twilio = require('twilio');
const twilioConfig = require('../config/twilio.config');

class SMSService {
  constructor() {
    if (twilioConfig.isConfigured) {
      this.client = twilio(twilioConfig.accountSid, twilioConfig.authToken);
      this.fromNumber = twilioConfig.phoneNumber;
      this.enabled = true;
      console.log('✅ SMS Service enabled with Twilio');
    } else {
      this.enabled = false;
      this.fromNumber = '+1234567890';
      console.log('📱 SMS Service running in MOCK mode');
    }
  }

  /**
   * Send a single SMS
   * @param {string} to - Recipient phone number (format: +1234567890)
   * @param {string} message - Message content
   * @returns {Promise<Object>} Result object with success status
   */
  async sendSMS(to, message) {
    try {
      // Validate inputs
      if (!to || !message) {
        throw new Error('Phone number and message are required');
      }

      if (!this.validatePhoneNumber(to)) {
        throw new Error('Invalid phone number format. Use international format: +1234567890');
      }

      // MOCK MODE - Log instead of sending
      if (!this.enabled) {
        console.log('\n📱 ========== MOCK SMS ==========');
        console.log('To:', to);
        console.log('From:', this.fromNumber);
        console.log('Message:', message);
        console.log('================================\n');
        return {
          success: true,
          messageSid: 'MOCK_' + Date.now(),
          status: 'sent',
          to: to,
          from: this.fromNumber,
          mock: true
        };
      }

      // REAL MODE - Actually send SMS
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      });
      
      console.log('✅ SMS sent successfully:', result.sid);
      return {
        success: true,
        messageSid: result.sid,
        status: result.status,
        to: result.to,
        from: result.from
      };
    } catch (error) {
      console.error('❌ Error sending SMS:', error.message);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Send adoption request notification to admin
   */
  async sendAdoptionRequestNotification(adminPhone, adopterName, petName, adopterPhone) {
    const message = `🐾 NEW ADOPTION REQUEST

Adopter: ${adopterName}
Pet: ${petName}
Contact: ${adopterPhone}

Please review the request in your admin dashboard.

- Pet Adoption App`;
    
    return await this.sendSMS(adminPhone, message);
  }

  /**
   * Send adoption approval notification to adopter
   */
  async sendAdoptionApproval(adopterPhone, petName, organizationName, contactInfo) {
    const message = `🎉 CONGRATULATIONS!

Your adoption request for ${petName} has been APPROVED by ${organizationName}!

We're excited to help you welcome ${petName} to your family. Our team will contact you soon with the next steps.

Contact us: ${contactInfo}

- Pet Adoption App`;
    
    return await this.sendSMS(adopterPhone, message);
  }

  /**
   * Send adoption rejection notification to adopter
   */
  async sendAdoptionRejection(adopterPhone, petName, organizationName, reason = '') {
    const reasonText = reason ? `\n\nReason: ${reason}` : '';
    const message = `📋 ADOPTION APPLICATION UPDATE

Thank you for your interest in adopting ${petName} from ${organizationName}.

Unfortunately, your application was not approved at this time.${reasonText}

Please don't be discouraged! Feel free to browse other available pets and submit another application.

- Pet Adoption App`;
    
    return await this.sendSMS(adopterPhone, message);
  }

  /**
   * Send donation confirmation
   */
  async sendDonationConfirmation(donorPhone, amount, organizationName, donorName) {
    const message = `❤️ DONATION CONFIRMED

Dear ${donorName},

Thank you for your generous donation of $${amount} to ${organizationName}!

Your support helps us:
• Feed and care for rescued animals
• Provide medical treatment
• Find loving homes for pets in need

Every contribution makes a difference!

- Pet Adoption App`;
    
    return await this.sendSMS(donorPhone, message);
  }

  /**
   * Send volunteer welcome message
   */
  async sendVolunteerWelcome(volunteerPhone, organizationName, volunteerName) {
    const message = `🌟 WELCOME TO OUR TEAM!

Hi ${volunteerName},

Thank you for joining ${organizationName} as a volunteer!

We're thrilled to have you on board. You'll receive updates about:
• Volunteer opportunities
• Special events
• Ways to help our furry friends

Together, we can make a difference!

- Pet Adoption App`;
    
    return await this.sendSMS(volunteerPhone, message);
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(userPhone, petName, appointmentDate, appointmentTime, location) {
    const message = `📅 APPOINTMENT REMINDER

Pet: ${petName}
Date: ${appointmentDate}
Time: ${appointmentTime}
Location: ${location}

We're looking forward to seeing you! Please arrive 10 minutes early.

To reschedule, please contact us.

- Pet Adoption App`;
    
    return await this.sendSMS(userPhone, message);
  }

  /**
   * Send account verification code
   */
  async sendVerificationCode(userPhone, code, userName) {
    const message = `🔐 VERIFICATION CODE

Hi ${userName},

Your verification code is: ${code}

This code will expire in 10 minutes.

Do not share this code with anyone.

- Pet Adoption App`;
    
    return await this.sendSMS(userPhone, message);
  }

  /**
   * Send password reset code
   */
  async sendPasswordResetCode(userPhone, code, userName) {
    const message = `🔑 PASSWORD RESET

Hi ${userName},

Your password reset code is: ${code}

This code will expire in 15 minutes.

If you didn't request this, please ignore this message.

- Pet Adoption App`;
    
    return await this.sendSMS(userPhone, message);
  }

  /**
   * Send pet status update
   */
  async sendPetStatusUpdate(userPhone, petName, status, message) {
    const statusMessage = `🐕 PET UPDATE: ${petName}

Status: ${status}

${message}

- Pet Adoption App`;
    
    return await this.sendSMS(userPhone, statusMessage);
  }

  /**
   * Send bulk SMS to multiple recipients
   */
  async sendBulkSMS(recipients, message) {
    const results = [];
    
    for (const recipient of recipients) {
      const result = await this.sendSMS(recipient, message);
      results.push({
        to: recipient,
        ...result
      });
      
      // Add delay to avoid rate limiting (1 SMS per second for free tier)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`📊 Bulk SMS Results: ${successful} sent, ${failed} failed`);
    
    return {
      totalSent: successful,
      totalFailed: failed,
      results: results
    };
  }

  /**
   * Validate phone number format (international format)
   */
  validatePhoneNumber(phoneNumber) {
    // Must start with + and have 7-15 digits
    const phoneRegex = /^\+[1-9]\d{6,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Format phone number to international format
   */
  formatPhoneNumber(phoneNumber, countryCode = '+63') {
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 0, remove it (common in Philippines)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // If it doesn't start with country code, add it
    if (!cleaned.startsWith(countryCode.replace('+', ''))) {
      return `${countryCode}${cleaned}`;
    }
    
    return `+${cleaned}`;
  }
}

module.exports = new SMSService();