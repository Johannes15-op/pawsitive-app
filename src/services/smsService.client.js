const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const smsService = {

  async sendAdoptionNotification(data) {
    try {
      console.log('📤 Sending adoption notification...', data);
      
      const response = await fetch(`${API_URL}/sms/adoption-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send SMS');
      }

      console.log('✅ SMS notification sent:', result);
      return result;

    } catch (error) {
      console.error('❌ SMS Service Error:', error);
      throw error;
    }
  },


  async sendApprovalNotification(data) {
    try {
      console.log('📤 Sending approval notification...', data);
      
      const response = await fetch(`${API_URL}/sms/approval-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send approval SMS');
      }

      console.log('✅ Approval SMS sent:', result);
      return result;

    } catch (error) {
      console.error('❌ Approval SMS Error:', error);
      throw error;
    }
  },


  async sendRejectionNotification(data) {
    try {
      console.log('📤 Sending rejection notification...', data);
      
      const response = await fetch(`${API_URL}/sms/rejection-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send rejection SMS');
      }

      console.log('✅ Rejection SMS sent:', result);
      return result;

    } catch (error) {
      console.error('❌ Rejection SMS Error:', error);
      throw error;
    }
  },

  
  async checkBalance() {
    try {
      const response = await fetch(`${API_URL}/sms/balance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to check balance');
      }

      return result;

    } catch (error) {
      console.error('❌ Balance Check Error:', error);
      throw error;
    }
  }
};

export default smsService;