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
            // Only redirect if this is a fresh login, not a persisted session
            // Check if we're in the middle of a login process
            const isLoggingIn = sessionStorage.getItem('convertWizLoggingIn');
            
            if (isLoggingIn) {
                console.log('✅ Login successful, redirecting to landing page');
                sessionStorage.removeItem('convertWizLoggingIn');
                saveAuthState(user);
                window.location.href = '/';
            } else {
                console.log('ℹ️ User already authenticated from previous session, staying on auth page');
                // User can choose to continue to landing page or log out and use different account
                showAuthenticatedMessage(user);
            }
        } else {
            console.log('ℹ️ No authenticated user, showing login form');
            hideAuthenticatedMessage();
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
        
        // Mark that we're actively logging in
        sessionStorage.setItem('convertWizLoggingIn', 'true');
        
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
        
        // Redirect to landing page to show login details
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
        
        return user;
        
    } catch (error) {
        console.error('❌ Login failed:', error);
        
        // CRITICAL: Clear loading state FIRST before anything else
        showLoading(false);
        
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
        
        // Show error message
        showError(errorMessage);
        
        // Force clear any stuck states
        setTimeout(() => {
            showLoading(false);
            
            // Re-enable form inputs for retry
            const emailField = document.getElementById('email');
            const passwordField = document.getElementById('password');
            const loginButton = document.getElementById('login-button');
            
            if (emailField) {
                emailField.disabled = false;
                emailField.focus(); // Focus back to email field for retry
            }
            if (passwordField) {
                passwordField.disabled = false;
            }
            if (loginButton) {
                loginButton.disabled = false;
                loginButton.textContent = 'Sign In';
            }
        }, 100);
        
        // Don't throw error to prevent unhandled promise rejection
        return null;
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
    console.log('🔄 showLoading called with:', show);
    
    const loginButton = document.getElementById('login-button');
    const loadingSpinner = document.getElementById('loading-spinner');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    
    if (loginButton) {
        loginButton.disabled = show;
        loginButton.textContent = show ? 'Signing in...' : 'Sign In';
        
        // Ensure button is re-enabled and styles are restored
        if (!show) {
            loginButton.classList.remove('opacity-50', 'cursor-not-allowed');
            loginButton.classList.add('hover:bg-blue-700', 'focus:ring-2', 'focus:ring-blue-500');
            console.log('✅ Login button re-enabled');
        } else {
            loginButton.classList.add('opacity-50', 'cursor-not-allowed');
            loginButton.classList.remove('hover:bg-blue-700', 'focus:ring-2', 'focus:ring-blue-500');
            console.log('🔒 Login button disabled');
        }
    }
    
    if (loadingSpinner) {
        if (show) {
            loadingSpinner.classList.remove('hidden');
            console.log('🔄 Loading spinner shown');
        } else {
            loadingSpinner.classList.add('hidden');
            console.log('✅ Loading spinner hidden');
        }
    }
    
    // Force clear form field disabled states
    if (emailField) {
        emailField.disabled = show;
        if (!show) console.log('✅ Email field re-enabled');
    }
    if (passwordField) {
        passwordField.disabled = show;
        if (!show) console.log('✅ Password field re-enabled');
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
                const result = await signInWithEmailAndPassword(email, password);
                if (!result) {
                    // Login failed, form is ready for retry
                    console.log('Login failed, form ready for retry');
                }
            } catch (error) {
                // Ensure loading state is cleared even on unexpected errors
                showLoading(false);
                console.log('Login form submission failed:', error.message);
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

// Helper functions for authenticated state display
function showAuthenticatedMessage(user) {
    // Show a message that user is already logged in with option to continue or logout
    const authForm = document.querySelector('.auth-container');
    if (authForm) {
        const existingMessage = document.getElementById('already-authenticated-message');
        if (!existingMessage) {
            const messageDiv = document.createElement('div');
            messageDiv.id = 'already-authenticated-message';
            messageDiv.className = 'bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6';
            messageDiv.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <i class="fas fa-info-circle text-blue-500 mr-3"></i>
                        <div>
                            <p class="text-blue-800 font-medium">Already signed in as ${user.displayName || user.email}</p>
                            <p class="text-blue-600 text-sm">You can continue to ConvertWiz or sign in with a different account.</p>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="window.location.href='/'" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                            Continue to ConvertWiz
                        </button>
                        <button onclick="signOutAndStay()" class="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600">
                            Sign Out
                        </button>
                    </div>
                </div>
            `;
            authForm.insertBefore(messageDiv, authForm.firstChild);
        }
    }
}

function hideAuthenticatedMessage() {
    const existingMessage = document.getElementById('already-authenticated-message');
    if (existingMessage) {
        existingMessage.remove();
    }
}

// Sign out but stay on auth page
async function signOutAndStay() {
    try {
        if (auth) {
            await auth.signOut();
            console.log('✅ User signed out, staying on auth page');
            hideAuthenticatedMessage();
        }
    } catch (error) {
        console.error('❌ Sign out failed:', error);
        showError('Failed to sign out. Please try again.');
    }
}

// Export functions for external use
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.saveAuthState = saveAuthState;
window.signOutAndStay = signOutAndStay;