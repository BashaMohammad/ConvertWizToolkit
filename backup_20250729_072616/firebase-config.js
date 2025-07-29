// ConvertWiz Free Mode - No Firebase Required
// All tools are now freely accessible without authentication

console.log('✅ ConvertWiz Free Mode: All conversion tools available without authentication');

// Placeholder for legacy compatibility - Firebase not used in free mode
function getFirebaseConfig() {
    console.log('ℹ️ Firebase authentication disabled - All tools freely accessible');
    return null;
}

// Validate Firebase environment
function validateFirebaseEnvironment() {
    const requiredEnvVars = [
        'FIREBASE_API_KEY',
        'FIREBASE_AUTH_DOMAIN', 
        'FIREBASE_PROJECT_ID',
        'FIREBASE_STORAGE_BUCKET',
        'FIREBASE_APP_ID',
        'FIREBASE_MESSAGING_SENDER_ID'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.warn('⚠️ Missing Firebase environment variables:', missingVars);
        return false;
    }
    
    console.log('✅ Firebase environment variables validated');
    return true;
}

// Export for use in other files
window.getFirebaseConfig = getFirebaseConfig;
window.validateFirebaseEnvironment = validateFirebaseEnvironment;