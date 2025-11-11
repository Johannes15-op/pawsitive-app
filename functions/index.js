const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();

// Get API key from environment variable
const IPROG_API_KEY = process.env.IPROG_API_KEY;

exports.sendAdoptionSMS = functions.https.onCall(async (data, context) => {
  const {to, message} = data;

  console.log("🔔 Cloud Function called with:",
      {to, messageLength: message?.length});

  // Validate input
  if (!to || !message) {
    console.error("❌ Missing required fields:",
        {to: !!to, message: !!message});
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Phone number and message are required",
    );
  }

  if (!IPROG_API_KEY) {
    console.error("❌ iProg API key not configured in environment");
    throw new functions.https.HttpsError(
        "failed-precondition",
        "SMS service not configured",
    );
  }

  try {
    // Clean phone number (remove +63 or +)
    const cleanNumber = to.replace(/^\+?63/, "0").replace(/^\+/, "");

    console.log("📤 Sending SMS to:", cleanNumber);

    // Call iProg API
    const apiUrl = `https://sms.iprogtech.com/api/v1/sms_messages?` +
        `api_token=${IPROG_API_KEY}&` +
        `message=${encodeURIComponent(message)}&` +
        `phone_number=${cleanNumber}`;

    console.log("🌐 Calling iProg API...");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
      },
    });

    const result = await response.json();

    console.log("📨 iProg API Response:", JSON.stringify(result, null, 2));
    console.log("📊 Response Status:", response.status);

    if (!response.ok) {
      const errorMsg = result.message || result.error ||
          `HTTP error! status: ${response.status}`;
      console.error("❌ iProg API Error:", errorMsg);
      throw new Error(errorMsg);
    }

    // Log to Firestore
    await admin.firestore().collection("smsLogs").add({
      recipientPhone: cleanNumber,
      message: message,
      status: "sent",
      provider: "iProg",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      response: result,
    });

    console.log("✅ SMS sent successfully and logged to Firestore");

    return {success: true, result};
  } catch (error) {
    console.error("❌ SMS Error:", error.message);
    console.error("❌ Stack:", error.stack);

    // Log error to Firestore
    try {
      await admin.firestore().collection("smsLogs").add({
        recipientPhone: to,
        message: message,
        status: "failed",
        provider: "iProg",
        errorMessage: error.message,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (logError) {
      console.error("⚠️ Failed to log error:", logError.message);
    }

    throw new functions.https.HttpsError("internal", error.message);
  }
});