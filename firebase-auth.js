// Enhanced Firebase Authentication with Offline Handling
// ConvertWiz Firebase Integration - Enhanced Version

console.log("Loading Firebase authentication...");

// Enhanced Firebase configuration (Updated for production compatibility)
const firebaseConfig = {
    apiKey: "AIzaSyBvOkBjDHllamPmRrJ4mRCk8Kh4aZRoMgo",
    authDomain: "convertwiz.firebaseapp.com",
    projectId: "convertwiz",
    storageBucket: "convertwiz.firebasestorage.app",
    messagingSenderId: "807062320011",
    appId: "1:807062320011:web:d1b2c3d4e5f6g7h8i9j0k1"
};

// Enhanced initialization with error handling
function initializeFirebaseAuth() {
    try {
        // Check if Firebase is available - use compat version check
        if (typeof firebase === 'undefined' || !firebase.apps) {
            console.warn('Firebase SDK not available, running in offline mode');
            return false;
        }

        // Check if already initialized
        if (firebase.apps.length > 0) {
            console.log('Firebase already initialized');
            return true;
        }

        // Initialize Firebase with compat version
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully for project:', firebaseConfig.projectId);
        
        return true;
    } catch (error) {
        console.error('Firebase initialization failed:', error);
        return false;
    }
}

// Enhanced authentication state management
function setupAuthStateListener() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.log('Firebase auth not available, running in offline mode');
        return;
    }

    const auth = firebase.auth();
    
    auth.onAuthStateChanged((user) => {
        try {
            if (user) {
                console.log('User signed in:', user.email);
                
                // Update UI for authenticated user
                updateUIForAuthenticatedUser(user);
                
                // Initialize user plan if needed
                initializeUserPlan(user).catch(error => {
                    console.log('Error initializing user plan:', error);
                    // Continue in offline mode
                });
                
            } else {
                console.log('User signed out');
                updateUIForGuestUser();
            }
        } catch (error) {
            console.error('Auth state change error:', error);
            updateUIForGuestUser(); // Fallback to guest mode
        }
    });
}

// Enhanced UI update functions
function updateUIForAuthenticatedUser(user) {
    const authButton = document.getElementById('auth-button');
    const userGreeting = document.getElementById('user-greeting');
    
    if (authButton) {
        authButton.innerHTML = `
            <span class="user-name">${user.displayName || user.email}</span>
            <button onclick="signOutUser()" class="sign-out-btn">Sign Out</button>
        `;
    }
    
    if (userGreeting) {
        userGreeting.textContent = `Welcome, ${user.displayName || user.email}!`;
        userGreeting.style.display = 'block';
    }
}

function updateUIForGuestUser() {
    const authButton = document.getElementById('auth-button');
    const userGreeting = document.getElementById('user-greeting');
    
    if (authButton) {
        authButton.innerHTML = `
            <button onclick="showLoginModal()" class="login-btn">Sign In</button>
        `;
    }
    
    if (userGreeting) {
        userGreeting.style.display = 'none';
    }
}

// Enhanced user plan initialization with error handling
async function initializeUserPlan(user) {
    try {
        if (typeof db === 'undefined') {
            console.log('Firestore not available, skipping plan initialization');
            return;
        }

        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // Create new user document
            await db.collection('users').doc(user.uid).set({
                email: user.email,
                displayName: user.displayName || user.email,
                plan: 'free',
                dailyUsageCount: 0,
                lastConversionDate: firebase.firestore.Timestamp.now(),
                createdAt: firebase.firestore.Timestamp.now()
            });
            console.log('New user plan created: free');
        } else {
            console.log('Existing user plan loaded:', userDoc.data().plan);
        }
        
        updateUsageDisplay();
    } catch (error) {
        console.error('Error initializing user plan:', error);
        // Continue without plan tracking
    }
}

// Sign out function
function signOutUser() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signOut().then(() => {
            console.log('User signed out successfully');
            window.location.reload();
        }).catch((error) => {
            console.error('Sign out error:', error);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (initializeFirebaseAuth()) {
        setupAuthStateListener();
    } else {
        console.log('Running in offline mode');
        updateUIForGuestUser();
    }
});

// Export functions for use in other scripts
window.ConvertWizAuth = {
    initializeFirebaseAuth,
    setupAuthStateListener,
    signOutUser,
    updateUIForAuthenticatedUser,
    updateUIForGuestUser
};