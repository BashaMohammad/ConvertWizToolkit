// ✅ ConvertWiz Firebase Authentication System (Fixed Version)
// Enhanced Firebase Integration for Homepage Authentication State Management

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
    // Update desktop auth button - Show as dropdown with logout option
    const authBtn = document.getElementById('auth-btn');
    const userInfo = document.getElementById('user-info');
    const userGreeting = document.getElementById('user-greeting');
    
    if (authBtn && userInfo) {
        authBtn.innerHTML = `
            <div class="relative group">
                <button class="flex items-center space-x-2 bg-white border-2 border-purple-200 hover:border-purple-400 text-purple-700 px-4 py-2 rounded-full transition-all font-medium shadow-sm hover:shadow-md">
                    <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        ${(user.displayName || user.email).charAt(0).toUpperCase()}
                    </div>
                    <span class="text-sm font-medium">${user.displayName || user.email.split('@')[0]}</span>
                    <i class="fas fa-chevron-down text-xs"></i>
                </button>
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <a href="dashboard.html" class="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-t-lg border-b border-gray-100">
                        <i class="fas fa-tachometer-alt mr-2 text-purple-600"></i>Dashboard
                    </a>
                    <button onclick="signOutUser()" class="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-b-lg">
                        <i class="fas fa-sign-out-alt mr-2"></i>Sign Out
                    </button>
                </div>
            </div>
        `;
        
        // Show admin button instead of "Loading usage..." for admin users
        const adminEmails = [
            'iqbalaiwork@gmail.com',
            'iqbalbashasi@gmail.com', 
            'sajoshaikh@gmail.com',
            'support@convertwiz.in'
        ];
        
        const isAdmin = adminEmails.includes(user.email);
        
        if (userGreeting) {
            userGreeting.textContent = `Welcome, ${user.displayName || user.email.split('@')[0]}!`;
        }
        
        // Update usage info to show admin status or plan info
        const usageInfo = document.getElementById('usage-info');
        if (usageInfo) {
            if (isAdmin) {
                usageInfo.innerHTML = `<i class="fas fa-crown mr-1 text-yellow-400"></i>Admin`;
            } else {
                usageInfo.textContent = 'Free Plan';
            }
        }
        
        userInfo.classList.remove('hidden');
    }
    
    // Update mobile auth button
    const mobileAuthBtn = document.getElementById('mobile-auth-btn');
    const mobileUserInfo = document.getElementById('mobile-user-info');
    const mobileUserGreeting = document.getElementById('mobile-user-greeting');
    
    if (mobileAuthBtn && mobileUserInfo) {
        mobileAuthBtn.innerHTML = `
            <div class="w-full">
                <div class="flex items-center justify-between w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-sm"></i>
                        </div>
                        <span>${user.displayName || user.email.split('@')[0]}</span>
                    </div>
                    <i class="fas fa-chevron-down text-xs"></i>
                </div>
                <div class="mt-3 space-y-1 bg-gray-50 rounded-xl p-2">
                    <a href="dashboard.html" class="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all">
                        <i class="fas fa-tachometer-alt mr-3 text-purple-500 w-4"></i>Dashboard
                    </a>
                    ${isAdmin ? `<a href="admin.html" class="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all">
                        <i class="fas fa-crown mr-3 text-yellow-500 w-4"></i>Admin Access
                    </a>` : ''}
                    <button onclick="signOutUser()" class="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-white hover:shadow-sm rounded-lg transition-all">
                        <i class="fas fa-sign-out-alt mr-3 text-red-500 w-4"></i>Sign Out
                    </button>
                </div>
            </div>
        `;
        
        mobileUserInfo.classList.remove('hidden');
        if (mobileUserGreeting) {
            mobileUserGreeting.textContent = `Welcome, ${user.displayName || user.email.split('@')[0]}!`;
        }
    }
    
    // Show/hide admin and dashboard navigation items
    showNavigationForAuthenticatedUser(user);
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
        authBtn.className = 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2.5 rounded-xl transition-all flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl';
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
        mobileAuthBtn.className = 'w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl transition-all flex items-center justify-center space-x-2 font-medium shadow-lg';
        mobileAuthBtn.onclick = () => window.location.href = '/auth.html';
    }
    
    if (mobileUserInfo) {
        mobileUserInfo.classList.add('hidden');
    }
    
    // Hide admin and dashboard navigation for guests
    hideNavigationForGuests();
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
    console.log('🚪 SignOut initiated from firebase-auth.js');
    
    try {
        // Clear auth state immediately (don't wait for Firebase)
        localStorage.removeItem('convertWizUser');
        localStorage.removeItem('convertWizAuthToken');
        sessionStorage.clear();
        
        // Update UI immediately
        updateUIForGuestUser();
        
        // Try Firebase signOut (but don't depend on it)
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().signOut().then(() => {
                console.log('✅ Firebase signOut successful');
            }).catch((error) => {
                console.warn('⚠️ Firebase signOut error (but continuing):', error);
            });
        } else {
            console.log('Firebase auth not available, using localStorage clear only');
        }
        
        console.log('✅ SignOut completed successfully');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = '/';
        }, 100);
        
    } catch (error) {
        console.error('❌ SignOut error:', error);
        
        // Emergency fallback
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
    }
}

// Update usage display function (placeholder)
function updateUsageDisplay() {
    // This will be implemented with subscription system
    console.log('Usage display updated');
}

// Show/hide navigation items based on user authentication and admin status
function showNavigationForAuthenticatedUser(user) {
    // Admin users list
    const adminEmails = [
        'iqbalaiwork@gmail.com',
        'iqbalbashasi@gmail.com', 
        'sajoshaikh@gmail.com',
        'support@convertwiz.in'
    ];
    
    const isAdmin = adminEmails.includes(user.email);
    
    // Show dashboard navigation for all authenticated users
    const dashboardNavItems = document.querySelectorAll('#dashboard-nav-item, #mobile-dashboard-nav-item');
    dashboardNavItems.forEach(item => {
        if (item) item.style.display = 'block';
    });
    
    // Show admin navigation only for admin users
    const adminNavItems = document.querySelectorAll('.admin-nav-item, #mobile-admin-link');
    adminNavItems.forEach(item => {
        if (item) {
            item.style.display = isAdmin ? 'block' : 'none';
        }
    });
    
    console.log(`User ${user.email} - Admin access: ${isAdmin}`);
}

// Hide navigation items for guest users
function hideNavigationForGuests() {
    // Hide dashboard navigation
    const dashboardNavItems = document.querySelectorAll('#dashboard-nav-item, #mobile-dashboard-nav-item');
    dashboardNavItems.forEach(item => {
        if (item) item.style.display = 'none';
    });
    
    // Hide admin navigation
    const adminNavItems = document.querySelectorAll('.admin-nav-item, #mobile-admin-link');
    adminNavItems.forEach(item => {
        if (item) item.style.display = 'none';
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

// Make signOutUser globally available for button onclick handlers
window.signOutUser = signOutUser;

// Export functions for use in other scripts
window.ConvertWizAuth = {
    initializeFirebaseAuth,
    setupAuthStateListener,
    signOutUser,
    updateUIForAuthenticatedUser,
    updateUIForGuestUser
};