// ConvertWiz Login System with Enhanced Authentication
// Implements signInWithEmailAndPassword with comprehensive error handling

console.log('🔐 ConvertWiz Login System Loading...');

// Firebase app and auth references
let app = null;
let auth = null;

// Initialize Firebase for login page
async function initializeFirebaseLogin() {
    try {
        console.log('📡 Loading Firebase configuration...');
        
        // Get Firebase config
        const firebaseConfig = await getFirebaseConfig();
        
        // Check if Firebase is available
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK not loaded');
        }
        
        // Initialize Firebase app
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase app initialized for login');
        } else {
            app = firebase.app();
            console.log('✅ Firebase app already initialized');
        }
        
        // Get auth instance
        auth = firebase.auth();
        console.log('✅ Firebase auth initialized');
        
        // Set up auth state listener
        setupAuthStateListener();
        
        return true;
    } catch (error) {
        console.error('❌ Firebase login initialization failed:', error);
        showError('Firebase initialization failed. Please refresh the page.');
        return false;
    }
}

// Enhanced auth state listener for login page
function setupAuthStateListener() {
    if (!auth) {
        console.error('❌ Auth not initialized');
        return;
    }
    
    auth.onAuthStateChanged((user) => {
        console.log('🔄 Auth state changed:', user ? `User: ${user.email}` : 'No user');
        
        if (user) {
            console.log('✅ User already authenticated, redirecting to dashboard');
            // Save auth state and redirect
            saveAuthState(user);
            window.location.href = 'dashboard.html';
        } else {
            console.log('ℹ️ No authenticated user, staying on login page');
        }
    });
}

// Login function with signInWithEmailAndPassword
async function signInWithEmailAndPassword(email, password) {
    try {
        console.log('🔐 Attempting login for:', email);
        
        if (!auth) {
            throw new Error('Firebase auth not initialized');
        }
        
        // Clear any previous error messages
        clearError();
        showLoading(true);
        
        // Validate inputs
        if (!email || !password) {
            throw new Error('Email and password are required');
        }
        
        if (!isValidEmail(email)) {
            throw new Error('Please enter a valid email address');
        }
        
        // Attempt sign in
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('✅ Login successful for:', user.email);
        
        // Save auth state
        saveAuthState(user);
        
        // Show success message briefly
        showSuccess('Login successful! Redirecting...');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
        return user;
        
    } catch (error) {
        console.error('❌ Login failed:', error);
        
        // Handle specific Firebase auth errors
        let errorMessage = 'Login failed. Please try again.';
        
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
                errorMessage = 'Invalid email or password. Please check your credentials.';
                break;
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email address.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled. Contact support.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many login attempts. Please try again later.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your internet connection.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            default:
                errorMessage = error.message || 'An unexpected error occurred.';
        }
        
        showError(errorMessage);
        showLoading(false);
        
        throw error;
    }
}

// Save authentication state to localStorage
function saveAuthState(user) {
    try {
        const authData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
            timestamp: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        
        localStorage.setItem('convertWizUser', JSON.stringify(authData));
        localStorage.setItem('convertWizAuthToken', user.accessToken || 'authenticated');
        
        console.log('✅ Auth state saved to localStorage');
    } catch (error) {
        console.error('❌ Failed to save auth state:', error);
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// UI Helper Functions
function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        errorElement.classList.add('text-red-600', 'bg-red-50', 'border', 'border-red-200', 'rounded-lg', 'p-3', 'mb-4');
    } else {
        console.error('Error element not found:', message);
        alert(message); // Fallback
    }
}

function showSuccess(message) {
    const successElement = document.getElementById('success-message');
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.remove('hidden');
        successElement.classList.add('text-green-600', 'bg-green-50', 'border', 'border-green-200', 'rounded-lg', 'p-3', 'mb-4');
    } else {
        console.log('Success:', message);
    }
}

function clearError() {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.classList.add('hidden');
        errorElement.textContent = '';
    }
    
    const successElement = document.getElementById('success-message');
    if (successElement) {
        successElement.classList.add('hidden');
        successElement.textContent = '';
    }
}

function showLoading(show) {
    const loginButton = document.getElementById('login-button');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    if (loginButton) {
        loginButton.disabled = show;
        loginButton.textContent = show ? 'Signing in...' : 'Sign In';
    }
    
    if (loadingSpinner) {
        loadingSpinner.classList.toggle('hidden', !show);
    }
}

// Form submission handler
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';
            
            try {
                await signInWithEmailAndPassword(email, password);
            } catch (error) {
                // Error already handled in signInWithEmailAndPassword
                console.log('Login form submission failed');
            }
        });
        
        console.log('✅ Login form handler attached');
    } else {
        console.warn('⚠️ Login form not found');
    }
}

// Initialize login system when page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 Login page DOM loaded');
    
    // Initialize Firebase
    const firebaseReady = await initializeFirebaseLogin();
    
    if (firebaseReady) {
        // Setup form handlers
        setupLoginForm();
        console.log('✅ Login system initialized successfully');
    } else {
        showError('Failed to initialize login system. Please refresh the page.');
    }
});

// Export functions for external use
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.saveAuthState = saveAuthState;