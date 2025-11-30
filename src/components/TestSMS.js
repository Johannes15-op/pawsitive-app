import React, { useState } from 'react';
import smsService from '../services/smsService.client';

const TestSMS = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [balance, setBalance] = useState(null);
  const [formData, setFormData] = useState({
    ownerPhone: '09936639774',  // Pet owner's phone
    petName: 'Brownie',
    adopterName: 'Test Adopter',
    adopterPhone: '09171234567',
    adoptionId: 'ADOPT-TEST-001'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestAdoption = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 Testing Adoption SMS with data:', formData);
      
      const response = await smsService.sendAdoptionNotification({
        ownerPhone: formData.ownerPhone,
        petName: formData.petName,
        adopterName: formData.adopterName,
        adopterContact: formData.adopterPhone,
        adoptionId: formData.adoptionId
      });

      console.log('📱 SMS Response:', response);
      setResult(response);
    } catch (error) {
      console.error('❌ Error:', error);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTestApproval = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 Testing Approval SMS...');
      
      const response = await smsService.sendApprovalNotification({
        adopterPhone: formData.adopterPhone,
        petName: formData.petName,
        ownerName: 'Pet Owner',
        ownerContact: formData.ownerPhone
      });

      console.log('📱 SMS Response:', response);
      setResult(response);
    } catch (error) {
      console.error('❌ Error:', error);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckBalance = async () => {
    try {
      console.log('💰 Checking balance...');
      const response = await smsService.checkBalance();
      setBalance(response);
    } catch (error) {
      console.error('❌ Error:', error);
      setBalance({ error: error.message });
    }
  };

  return (
    <div style={{
      maxWidth: '700px',
      margin: '50px auto',
      padding: '30px',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '10px', color: '#333' }}>
        🧪 iProg SMS Service Test
      </h2>
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
        Test your iProg SMS integration for TAARA Pet Adoption App
      </p>

      {/* Balance Check */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#fff',
        borderRadius: '5px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <strong>💰 SMS Credits:</strong> {balance ? (balance.balance || 'Error') : 'Click to check'}
        </div>
        <button
          onClick={handleCheckBalance}
          style={{
            padding: '8px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Check Balance
        </button>
      </div>

      {/* Form Fields */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          🏠 Pet Owner's Phone (receives adoption request):
        </label>
        <input
          type="text"
          name="ownerPhone"
          value={formData.ownerPhone}
          onChange={handleInputChange}
          placeholder="09936639774"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          🐾 Pet Name:
        </label>
        <input
          type="text"
          name="petName"
          value={formData.petName}
          onChange={handleInputChange}
          placeholder="Brownie"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          👤 Adopter Name:
        </label>
        <input
          type="text"
          name="adopterName"
          value={formData.adopterName}
          onChange={handleInputChange}
          placeholder="Juan Dela Cruz"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          📱 Adopter's Phone (receives approval/rejection):
        </label>
        <input
          type="text"
          name="adopterPhone"
          value={formData.adopterPhone}
          onChange={handleInputChange}
          placeholder="09171234567"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          🆔 Adoption ID:
        </label>
        <input
          type="text"
          name="adoptionId"
          value={formData.adoptionId}
          onChange={handleInputChange}
          placeholder="ADOPT-001"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '14px'
          }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '10px',
        marginBottom: '20px'
      }}>
        <button
          onClick={handleTestAdoption}
          disabled={loading}
          style={{
            padding: '12px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {loading ? '📱 Sending...' : '🔔 Test Adoption Request'}
        </button>

        <button
          onClick={handleTestApproval}
          disabled={loading}
          style={{
            padding: '12px',
            backgroundColor: loading ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {loading ? '📱 Sending...' : '✅ Test Approval'}
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px',
          color: result.success ? '#155724' : '#721c24'
        }}>
          <h3 style={{ marginTop: 0 }}>
            {result.success ? '✅ Success!' : '❌ Failed'}
          </h3>
          {result.mock && (
            <p style={{ 
              backgroundColor: '#fff3cd', 
              padding: '10px', 
              borderRadius: '5px',
              color: '#856404'
            }}>
              ⚠️ Running in MOCK mode - SMS not actually sent
            </p>
          )}
          <pre style={{
            backgroundColor: 'rgba(0,0,0,0.05)',
            padding: '10px',
            borderRadius: '5px',
            overflow: 'auto',
            fontSize: '12px',
            marginTop: '10px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e7f3ff',
        borderLeft: '4px solid #007bff',
        borderRadius: '5px',
        fontSize: '13px'
      }}>
        <strong>📝 Instructions:</strong>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li><strong>Adoption Request</strong>: Sends SMS to owner's phone (09936639774)</li>
          <li><strong>Approval</strong>: Sends SMS to adopter's phone (09171234567)</li>
          <li>Each SMS costs ₱1.00 from your iProg credits</li>
          <li>Check console logs for detailed information</li>
        </ul>
      </div>
    </div>
  );
};

export default TestSMS;