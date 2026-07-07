import admin from "firebase-admin";

let isFirebaseConfigured = false;

// Initialize Firebase Admin
const initFirebaseAdmin = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      console.log("Firebase Admin already initialized");
      isFirebaseConfigured = true;
      return;
    }

    // For production, use service account JSON from environment variable
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    const projectId = process.env.FIREBASE_PROJECT_ID || "devdualnew";

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId,
      });
      isFirebaseConfigured = true;
      console.log("✅ Firebase Admin initialized with service account");
      console.log(`✅ Firebase Admin ready (Project: ${projectId})`);
    } else {
      // Firebase authentication requires service account credentials
      console.warn("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.warn("⚠️  FIREBASE ADMIN: SERVICE ACCOUNT NOT CONFIGURED");
      console.warn("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.warn("");
      console.warn("❌ Google Sign-In will NOT work without Firebase configuration!");
      console.warn("");
      console.warn("📝 TO FIX THIS:");
      console.warn("   1. Read: backend/FIREBASE_SETUP.md (complete setup guide)");
      console.warn("   2. Get service account from Firebase Console");
      console.warn("   3. Add to .env: FIREBASE_SERVICE_ACCOUNT='{...json...}'");
      console.warn("");
      console.warn("🔗 Quick Start:");
      console.warn(`   • Firebase Console: https://console.firebase.google.com/project/${projectId}`);
      console.warn("   • Project Settings → Service Accounts → Generate New Private Key");
      console.warn("");
      console.warn("⚡ Normal email/password login will continue to work.");
      console.warn("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.warn("");
      isFirebaseConfigured = false;
    }
  } catch (error) {
    console.error("❌ Firebase Admin initialization error:", error.message);
    console.warn("⚠️  Google authentication will not work.");
    console.warn("⚡ Regular email/password login will still function.");
    isFirebaseConfigured = false;
  }
};

// Helper function to check if Firebase is properly configured
const isFirebaseReady = () => isFirebaseConfigured;

export { admin, initFirebaseAdmin, isFirebaseReady };

