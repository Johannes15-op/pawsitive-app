const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();

const IPROG_API_KEY = process.env.IPROG_API_KEY;


exports.notifyOwnerOnAdoptionRequest = functions.firestore
  .document('adoptionRequests/{requestId}')
  .onCreate(async (snap, context) => {
    try {
      const request = snap.data();
      const petId = request.petId;

      console.log('🔔 New adoption request created:', context.params.requestId);
      console.log('📦 Request data:', request);


      const petDoc = await admin.firestore().collection('pets').doc(petId).get();
      
      if (!petDoc.exists) {
        console.error('❌ Pet not found:', petId);
        return null;
      }

      const pet = petDoc.data();
      const ownerId = pet.ownerId;

      console.log('👤 Pet owner ID:', ownerId);

      if (!ownerId) {
        console.error('❌ Pet has no ownerId:', petId);
        return null;
      }


      const ownerDoc = await admin.firestore().collection('users').doc(ownerId).get();
      
      if (!ownerDoc.exists) {
        console.error('❌ Owner not found:', ownerId);
        return null;
      }

      const owner = ownerDoc.data();
      const ownerPhone = owner.phoneNumber;

      console.log('📱 Owner phone:', ownerPhone);

      if (!ownerPhone) {
        console.error('❌ Owner has no phone number:', ownerId);
        return null;
      }

      if (!IPROG_API_KEY) {
        console.error('❌ iProg API key not configured');
        return null;
      }


      const cleanNumber = ownerPhone.replace(/^\+?63/, "0").replace(/^\+/, "");

    
      const message = `🐾 TAARA Adoption Alert!\n\nNew request for ${pet.name}\n\nRequester: ${request.requesterName}\nPhone: ${request.requesterPhone}\n\nCheck your dashboard to respond.`;

      console.log('📤 Sending SMS to:', cleanNumber);

      const apiUrl = `https://sms.iprogtech.com/api/v1/sms_messages?` +
        `api_token=${IPROG_API_KEY}&` +
        `message=${encodeURIComponent(message)}&` +
        `phone_number=${cleanNumber}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Accept": "application/json",
        },
      });

      const result = await response.json();

      console.log('📨 iProg Response:', result);

      if (response.ok) {

        await admin.firestore().collection("smsLogs").add({
          recipientPhone: cleanNumber,
          recipientName: owner.fullName || owner.displayName,
          message: message,
          status: "sent",
          provider: "iProg",
          purpose: "adoption_notification",
          adoptionRequestId: context.params.requestId,
          petId: petId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          response: result,
        });

        console.log('✅ SMS sent successfully!');
      } else {
        throw new Error(result.message || 'SMS send failed');
      }

      return null;

    } catch (error) {
      console.error('❌ Error in notifyOwnerOnAdoptionRequest:', error.message);
      console.error('Stack:', error.stack);

 
      try {
        await admin.firestore().collection("smsLogs").add({
          status: "failed",
          provider: "iProg",
          purpose: "adoption_notification",
          errorMessage: error.message,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (logError) {
        console.error('⚠️ Failed to log error:', logError.message);
      }

      return null;
    }
  });

exports.sendAdoptionSMS = functions.https.onCall(async (data, context) => {
  const {to, message} = data;

  console.log("🔔 Manual SMS function called:", {to, messageLength: message?.length});

  if (!to || !message) {
    console.error("❌ Missing required fields:", {to: !!to, message: !!message});
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Phone number and message are required",
    );
  }

  if (!IPROG_API_KEY) {
    console.error("❌ iProg API key not configured");
    throw new functions.https.HttpsError(
        "failed-precondition",
        "SMS service not configured",
    );
  }

  try {
    const cleanNumber = to.replace(/^\+?63/, "0").replace(/^\+/, "");

    console.log("📤 Sending SMS to:", cleanNumber);

    const apiUrl = `https://sms.iprogtech.com/api/v1/sms_messages?` +
        `api_token=${IPROG_API_KEY}&` +
        `message=${encodeURIComponent(message)}&` +
        `phone_number=${cleanNumber}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
      },
    });

    const result = await response.json();

    console.log("📨 iProg Response:", result);

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    await admin.firestore().collection("smsLogs").add({
      recipientPhone: cleanNumber,
      message: message,
      status: "sent",
      provider: "iProg",
      purpose: "manual",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      response: result,
    });

    console.log("✅ SMS sent successfully");

    return {success: true, result};
  } catch (error) {
    console.error("❌ SMS Error:", error.message);

    try {
      await admin.firestore().collection("smsLogs").add({
        recipientPhone: to,
        message: message,
        status: "failed",
        provider: "iProg",
        purpose: "manual",
        errorMessage: error.message,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (logError) {
      console.error("⚠️ Failed to log error:", logError.message);
    }

    throw new functions.https.HttpsError("internal", error.message);
  }
});