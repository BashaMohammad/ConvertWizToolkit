// ConvertWiz Dashboard System with Enhanced Session Management
// Implements onAuthStateChanged listener and secure logout functionality

console.log('📊 ConvertWiz Dashboard System Loading...');

// Firebase app and auth references
let app = null;
let auth = null;
let currentUser = null;

// Initialize Firebase for dashboard
async function initializeFirebaseDashboard() {
    try {
        console.log('📡 Loading Firebase configuration for dashboard...');
        
        // Get Firebase config
        const firebaseConfig = await getFirebaseConfig();
        
        // Check if Firebase is available
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK not loaded');
        }
        
        // Initialize Firebase app
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase app initialized for dashboard');
        } else {
            app = firebase.app();
            console.log('✅ Firebase app already initialized');
        }
        
        // Get auth instance
        auth = firebase.auth();
        console.log('✅ Firebase auth initialized for dashboard');
        
        // Set up auth state listener with session validation
        setupDashboardAuthStateListener();
        
        return true;
    } catch (error) {
        console.error('❌ Firebase dashboard initialization failed:', error);
        redirectToLogin('Firebase initialization failed');
        return false;
    }
}

// Enhanced auth state listener for dashboard with session validation
function setupDashboardAuthStateListener() {
    if (!auth) {
        console.error('❌ Auth not initialized');
        redirectToLogin('Authentication not available');
        return;
    }
    
    // Set up auth state change listener
    auth.onAuthStateChanged((user) => {
        console.log('🔄 Dashboard auth state changed:', user ? `User: ${user.email}` : 'No user');
        
        if (user) {
            console.log('✅ User authenticated, loading dashboard');
            currentUser = user;
            
            // Validate session and update UI
            validateSession(user);
            updateDashboardUI(user);
            
        } else {
            console.log('❌ No authenticated user, redirecting to login');
            redirectToLogin('Please log in to access the dashboard');
        }
    });
    
    // Additional session validation with timeout
    setTimeout(() => {
        if (!currentUser) {
            console.log('⏰ Auth state timeout - no user found after 8 seconds');
            validateLocalStorageSession();
        }
    }, 8000);
}

// Validate session with localStorage backup
function validateSession(user) {
    try {
        // Update localStorage with current session
        const authData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
            timestamp: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        
        localStorage.setItem('convertWizUser', JSON.stringify(authData));
        localStorage.setItem('convertWizAuthToken', 'authenticated');
        
        console.log('✅ Session validated and updated');
        return true;
    } catch (error) {
        console.error('❌ Session validation failed:', error);
        return false;
    }
}

// Validate localStorage session as fallback
function validateLocalStorageSession() {
    try {
        const authData = localStorage.getItem('convertWizUser');
        const authToken = localStorage.getItem('convertWizAuthToken');
        
        if (!authData || !authToken) {
            console.log('❌ No valid localStorage session found');
            redirectToLogin('Session expired');
            return false;
        }
        
        const userData = JSON.parse(authData);
        const now = Date.now();
        
        // Check if session has expired
        if (userData.expiresAt && now > userData.expiresAt) {
            console.log('❌ Session expired');
            clearAuthState();
            redirectToLogin('Session expired, please log in again');
            return false;
        }
        
        console.log('✅ Valid localStorage session found for:', userData.email);
        
        // Update UI with stored user data
        updateDashboardUIFromStorage(userData);
        
        return true;
    } catch (error) {
        console.error('❌ localStorage session validation failed:', error);
        redirectToLogin('Invalid session');
        return false;
    }
}

// Update dashboard UI for authenticated user
function updateDashboardUI(user) {
    try {
        // Update welcome message
        const userWelcome = document.getElementById('user-welcome');
        if (userWelcome) {
            userWelcome.textContent = `Welcome, ${user.displayName || user.email.split('@')[0]}!`;
        }
        
        // Update user name
        const userName = document.getElementById('user-name');
        if (userName) {
            userName.textContent = `Welcome Back, ${user.displayName || user.email.split('@')[0]}!`;
        }
        
        // Update user email
        const userEmail = document.getElementById('user-email');
        if (userEmail) {
            userEmail.textContent = user.email;
        }
        
        // Update member since
        const memberSince = document.getElementById('member-since');
        if (memberSince && user.metadata && user.metadata.creationTime) {
            const creationDate = new Date(user.metadata.creationTime);
            memberSince.textContent = creationDate.toLocaleDateString();
        }
        
        console.log('✅ Dashboard UI updated for user:', user.email);
        
        // Load user-specific data
        loadUserData(user);
        
    } catch (error) {
        console.error('❌ Failed to update dashboard UI:', error);
    }
}

// Update dashboard UI from localStorage data
function updateDashboardUIFromStorage(userData) {
    try {
        // Update welcome message
        const userWelcome = document.getElementById('user-welcome');
        if (userWelcome) {
            userWelcome.textContent = `Welcome, ${userData.displayName || userData.email.split('@')[0]}!`;
        }
        
        // Update user name
        const userName = document.getElementById('user-name');
        if (userName) {
            userName.textContent = `Welcome Back, ${userData.displayName || userData.email.split('@')[0]}!`;
        }
        
        // Update user email
        const userEmail = document.getElementById('user-email');
        if (userEmail) {
            userEmail.textContent = userData.email;
        }
        
        console.log('✅ Dashboard UI updated from localStorage for:', userData.email);
        
    } catch (error) {
        console.error('❌ Failed to update dashboard UI from storage:', error);
    }
}

// Load user-specific data (usage stats, plan info, etc.)
async function loadUserData(user) {
    try {
        console.log('📊 Loading user data for:', user.email);
        
        // Load plan information
        await loadUserPlan(user);
        
        // Load usage statistics
        await loadUsageStats(user);
        
        console.log('✅ User data loaded successfully');
        
    } catch (error) {
        console.error('❌ Failed to load user data:', error);
        // Continue with default values
    }
}

// Load user plan information
async function loadUserPlan(user) {
    try {
        // This would typically fetch from Firestore or your backend
        // For now, setting default values
        
        const currentPlan = document.getElementById('current-plan');
        const userBadge = document.getElementById('user-badge');
        
        if (currentPlan) {
            currentPlan.textContent = 'Free';
        }
        
        if (userBadge) {
            userBadge.innerHTML = '<i class="fas fa-star mr-2"></i>🆓 Free User';
            userBadge.className = 'badge inline-block px-6 py-3 rounded-full text-white font-bold text-lg mb-4 bg-gray-500';
        }
        
        console.log('✅ User plan loaded');
        
    } catch (error) {
        console.error('❌ Failed to load user plan:', error);
    }
}

// Load usage statistics
async function loadUsageStats(user) {
    try {
        // This would typically fetch from Firestore or your backend
        // For now, setting default values
        
        const dailyUsage = document.getElementById('daily-usage');
        const totalConversions = document.getElementById('total-conversions');
        
        if (dailyUsage) {
            dailyUsage.textContent = '0/5';
        }
        
        if (totalConversions) {
            totalConversions.textContent = '0';
        }
        
        console.log('✅ Usage stats loaded');
        
    } catch (error) {
        console.error('❌ Failed to load usage stats:', error);
    }
}

// Enhanced logout function
async function logout() {
    try {
        console.log('🚪 Logging out user...');
        
        // Show loading state
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.disabled = true;
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Logging out...';
        }
        
        // Sign out from Firebase
        if (auth && auth.currentUser) {
            await auth.signOut();
            console.log('✅ Firebase signOut successful');
        }
        
        // Clear localStorage and sessionStorage
        clearAuthState();
        
        console.log('✅ Logout completed successfully');
        
        // Redirect to login page
        window.location.href = 'login.html';
        
    } catch (error) {
        console.error('❌ Logout failed:', error);
        
        // Force clear auth state and redirect anyway
        clearAuthState();
        window.location.href = 'login.html';
    }
}

// Clear all authentication state
function clearAuthState() {
    try {
        // Clear localStorage
        localStorage.removeItem('convertWizUser');
        localStorage.removeItem('convertWizAuthToken');
        
        // Clear sessionStorage
        sessionStorage.removeItem('convertWizUser');
        sessionStorage.removeItem('convertWizAuthToken');
        
        console.log('✅ Auth state cleared');
        
    } catch (error) {
        console.error('❌ Failed to clear auth state:', error);
    }
}

// Redirect to login page
function redirectToLogin(message = 'Please log in to continue') {
    console.log('🔄 Redirecting to login:', message);
    
    // Clear auth state before redirect
    clearAuthState();
    
    // Store redirect message if needed
    sessionStorage.setItem('loginMessage', message);
    
    // Redirect to login
    window.location.href = 'login.html';
}

// Dashboard section navigation
function setupDashboardNavigation() {
    try {
        // Add event listeners for dashboard sections
        const dashboardSections = document.querySelectorAll('[data-section]');
        const navButtons = document.querySelectorAll('[data-nav]');
        
        // Section switching
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = button.getAttribute('data-nav');
                switchDashboardSection(targetSection);
            });
        });
        
        console.log('✅ Dashboard navigation setup complete');
        
    } catch (error) {
        console.error('❌ Dashboard navigation setup failed:', error);
    }
}

// Switch dashboard sections
function switchDashboardSection(sectionName) {
    try {
        // Hide all sections
        const allSections = document.querySelectorAll('[data-section]');
        allSections.forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show target section
        const targetSection = document.querySelector(`[data-section="${sectionName}"]`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            console.log('✅ Switched to section:', sectionName);
        } else {
            console.warn('⚠️ Section not found:', sectionName);
        }
        
        // Update navigation active states
        const navButtons = document.querySelectorAll('[data-nav]');
        navButtons.forEach(button => {
            button.classList.remove('active', 'bg-purple-600', 'text-white');
            button.classList.add('text-gray-600');
        });
        
        const activeButton = document.querySelector(`[data-nav="${sectionName}"]`);
        if (activeButton) {
            activeButton.classList.add('active', 'bg-purple-600', 'text-white');
            activeButton.classList.remove('text-gray-600');
        }
        
    } catch (error) {
        console.error('❌ Section switching failed:', error);
    }
}

// Setup logout button
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await logout();
        });
        console.log('✅ Logout button setup complete');
    } else {
        console.warn('⚠️ Logout button not found');
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 Dashboard page DOM loaded');
    
    // Initialize Firebase
    const firebaseReady = await initializeFirebaseDashboard();
    
    if (firebaseReady) {
        // Setup UI components
        setupDashboardNavigation();
        setupLogoutButton();
        
        console.log('✅ Dashboard system initialized successfully');
    } else {
        console.error('❌ Dashboard initialization failed');
    }
});

// Handle page refresh - validate session immediately
window.addEventListener('load', () => {
    console.log('🔄 Dashboard page refreshed, validating session...');
    
    // If no current user after page load, check localStorage
    setTimeout(() => {
        if (!currentUser) {
            validateLocalStorageSession();
        }
    }, 2000);
});

// Export functions for external use
window.logout = logout;
window.switchDashboardSection = switchDashboardSection;