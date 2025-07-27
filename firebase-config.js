// Firebase Configuration with Environment Variables
// ConvertWiz - Dynamic Firebase Config

async function getFirebaseConfig() {
    try {
        // Try to get config from server endpoint
        const response = await fetch('/api/firebase-config');
        if (response.ok) {
            const config = await response.json();
            console.log('✅ Firebase config loaded from server');
            return config;
        }
    } catch (error) {
        console.warn('Could not load config from server, using fallback');
    }
    
    // Fallback configuration (will be updated by server)
    return {
        apiKey: "AIzaSyBvOkBjDHllamPmRrJ4mRCk8Kh4aZRoMgo",
        authDomain: "convertwiz.firebaseapp.com",
        projectId: "convertwiz", 
        storageBucket: "convertwiz.firebasestorage.app",
        messagingSenderId: "807062320011",
        appId: "1:807062320011:web:d1b2c3d4e5f6g7h8i9j0k1"
    };
}

// Export for use in other files
window.getFirebaseConfig = getFirebaseConfig;