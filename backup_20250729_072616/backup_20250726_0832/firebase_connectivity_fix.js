// Firebase Connectivity Enhancement for ConvertWiz
// Fixes "firebase is not defined" errors and offline handling

// Enhanced Firebase initialization with error handling
function initializeFirebaseWithFallback() {
    try {
        // Check if Firebase SDK is loaded
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK not loaded, running in offline mode');
            return false;
        }

        // Check if already initialized
        if (firebase.apps.length > 0) {
            console.log('Firebase already initialized');
            return true;
        }

        // Initialize with config
        const firebaseConfig = {
            apiKey: "AIzaSyAMVP0J1mH4WF-ESxi_PbQvDmydFXcuJe0",
            authDomain: "convertwiz.firebaseapp.com",
            projectId: "convertwiz",
            storageBucket: "convertwiz.firebasestorage.app",
            messagingSenderId: "777853314366",
            appId: "1:777853314366:web:69a7ad8155381e5f51386f"
        };

        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized successfully');
        return true;

    } catch (error) {
        console.error('Firebase initialization failed:', error);
        return false;
    }
}

// Enhanced offline handling
function setupOfflineHandling() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        
        // Monitor connection state
        firebase.database().ref('.info/connected').on('value', (snapshot) => {
            if (snapshot.val() === true) {
                console.log('✅ Firebase connected');
                document.body.classList.remove('firebase-offline');
                document.body.classList.add('firebase-online');
            } else {
                console.log('⚠️ Firebase offline');
                document.body.classList.remove('firebase-online');
                document.body.classList.add('firebase-offline');
            }
        });
    }
}

// Fix AdSense initialization timing
function fixAdSenseInitialization() {
    window.addEventListener('load', function() {
        setTimeout(function() {
            if (typeof adsbygoogle !== 'undefined' && window.innerWidth > 0) {
                try {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                    console.log('✅ AdSense initialized');
                } catch (e) {
                    console.warn('AdSense initialization delayed:', e.message);
                }
            }
        }, 2000); // Increased delay to 2 seconds
    });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    initializeFirebaseWithFallback();
    setupOfflineHandling();
    fixAdSenseInitialization();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeFirebaseWithFallback,
        setupOfflineHandling,
        fixAdSenseInitialization
    };
}