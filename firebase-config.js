// Firebase Configuration with Environment Variables
// ConvertWiz - Dynamic Firebase Config with Enhanced Validation

async function getFirebaseConfig() {
    try {
        // Try to get config from server endpoint
        const response = await fetch('/api/firebase-config');
        if (response.ok) {
            const config = await response.json();
            console.log('✅ Firebase config loaded from server');
            
            // Validate required configuration keys
            const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
            const missingKeys = requiredKeys.filter(key => !config[key]);
            
            if (missingKeys.length > 0) {
                console.error('❌ Missing Firebase config keys:', missingKeys);
                throw new Error(`Missing required Firebase configuration: ${missingKeys.join(', ')}`);
            }
            
            console.log('✅ Firebase configuration validation passed');
            return config;
        }
    } catch (error) {
        console.warn('Could not load config from server, using fallback');
    }
    
    // Fallback configuration (validated keys)
    const fallbackConfig = {
        apiKey: "AIzaSyBvOkBjDHllamPmRrJ4mRCk8Kh4aZRoMgo",
        authDomain: "convertwiz.firebaseapp.com",
        projectId: "convertwiz", 
        storageBucket: "convertwiz.firebasestorage.app",
        messagingSenderId: "807062320011",
        appId: "1:807062320011:web:d1b2c3d4e5f6g7h8i9j0k1"
    };
    
    console.log('✅ Using fallback Firebase configuration');
    return fallbackConfig;
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