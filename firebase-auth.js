// Enhanced Firebase Authentication with Offline Handling
// ConvertWiz Firebase Integration - Enhanced Version

console.log("Loading Firebase authentication...");

// Enhanced Firebase configuration (Dynamic loading from server)
let firebaseConfig = null;

// Enhanced initialization with error handling
async function initializeFirebaseAuth() {
    try {
        // Check if Firebase is available - use compat version check
        if (typeof firebase === 'undefined' || !firebase.apps) {
            console.warn('Firebase SDK not available, running in offline mode');
            return false;
        }

        // Get Firebase config from server
        if (!firebaseConfig) {
            firebaseConfig = await getFirebaseConfig();
            console.log('Firebase config loaded for project:', firebaseConfig.projectId);
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
    // Update desktop auth button
    const authBtn = document.getElementById('auth-btn');
    const userInfo = document.getElementById('user-info');
    const userGreeting = document.getElementById('user-greeting');
    
    if (authBtn && userInfo) {
        authBtn.innerHTML = `
            <i class="fas fa-user"></i>
            <span>${user.displayName || user.email.split('@')[0]}</span>
        `;
        authBtn.onclick = () => signOutUser();
        
        userInfo.classList.remove('hidden');
        if (userGreeting) {
            userGreeting.textContent = `Welcome, ${user.displayName || user.email.split('@')[0]}!`;
        }
    }
    
    // Update mobile auth button
    const mobileAuthBtn = document.getElementById('mobile-auth-btn');
    const mobileUserInfo = document.getElementById('mobile-user-info');
    const mobileUserGreeting = document.getElementById('mobile-user-greeting');
    
    if (mobileAuthBtn && mobileUserInfo) {
        mobileAuthBtn.innerHTML = `
            <i class="fas fa-user"></i>
            <span>${user.displayName || user.email.split('@')[0]}</span>
        `;
        mobileAuthBtn.onclick = () => signOutUser();
        
        mobileUserInfo.classList.remove('hidden');
        if (mobileUserGreeting) {
            mobileUserGreeting.textContent = `Welcome, ${user.displayName || user.email.split('@')[0]}!`;
        }
    }
}

function updateUIForGuestUser() {
    // Update desktop auth button
    const authBtn = document.getElementById('auth-btn');
    const userInfo = document.getElementById('user-info');
    
    if (authBtn) {
        authBtn.innerHTML = `
            <i class="fas fa-sign-in-alt"></i>
            <span>Login</span>
        `;
        authBtn.onclick = () => window.location.href = '/auth.html';
    }
    
    if (userInfo) {
        userInfo.classList.add('hidden');
    }
    
    // Update mobile auth button
    const mobileAuthBtn = document.getElementById('mobile-auth-btn');
    const mobileUserInfo = document.getElementById('mobile-user-info');
    
    if (mobileAuthBtn) {
        mobileAuthBtn.innerHTML = `
            <i class="fas fa-sign-in-alt"></i>
            <span>Login</span>
        `;
        mobileAuthBtn.onclick = () => window.location.href = '/auth.html';
    }
    
    if (mobileUserInfo) {
        mobileUserInfo.classList.add('hidden');
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
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.log('Firebase auth not available');
        return;
    }
    
    firebase.auth().signOut().then(() => {
        console.log('User signed out successfully');
        // Update UI immediately
        updateUIForGuestUser();
        // Optionally redirect to home
        window.location.reload();
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}

// Initialize authentication when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('ConvertWiz navigation initialized');
    
    // Initialize Firebase authentication
    const initialized = await initializeFirebaseAuth();
    
    if (initialized) {
        // Set up auth state listener
        setupAuthStateListener();
    } else {
        // Fallback to guest mode
        updateUIForGuestUser();
    }
});
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