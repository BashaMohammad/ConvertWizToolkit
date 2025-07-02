// Firebase Authentication Module for ConvertWiz
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAMVP0J1mH4WF-ESxi_PbQvDmydFXcuJe0",
    authDomain: "convertwiz.firebaseapp.com",
    projectId: "convertwiz",
    storageBucket: "convertwiz.firebasestorage.app",
    messagingSenderId: "777853314366",
    appId: "1:777853314366:web:69a7ad8155381e5f51386f",
    measurementId: "G-Q4L9FZPVPZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Authentication Class
class ConvertWizAuth {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.init();
    }

    init() {
        // Listen for authentication state changes
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.currentUser = user;
                this.isLoggedIn = true;
                this.updateUI(true);
                this.saveUserSession(user);
                console.log('User signed in:', user.email);
            } else {
                this.currentUser = null;
                this.isLoggedIn = false;
                this.updateUI(false);
                this.clearUserSession();
                console.log('User signed out');
            }
        });

        // Initialize UI
        this.initializeAuthUI();
        this.loadUserSession();
    }

    // Initialize Authentication UI
    initializeAuthUI() {
        // Create auth button in navbar
        this.createAuthButton();
        
        // Create login modal
        this.createLoginModal();
        
        // Bind event listeners
        this.bindEventListeners();
    }

    // Create authentication button in navbar
    createAuthButton() {
        const navbar = document.querySelector('nav .container > div');
        if (!navbar) return;

        // Create auth button container
        const authContainer = document.createElement('div');
        authContainer.className = 'flex items-center space-x-4';
        authContainer.innerHTML = `
            <div id="user-info" class="hidden text-white/90 text-sm">
                <span id="user-greeting">Welcome!</span>
            </div>
            <button id="auth-btn" class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2">
                <i class="fas fa-sign-in-alt"></i>
                <span>Login</span>
            </button>
        `;

        // Add to navbar (insert before existing elements or append)
        const existingButtons = navbar.querySelector('.hidden.md\\:flex');
        if (existingButtons) {
            existingButtons.parentNode.insertBefore(authContainer, existingButtons.nextSibling);
        } else {
            navbar.appendChild(authContainer);
        }
    }

    // Create login modal
    createLoginModal() {
        const modalHTML = `
            <div id="auth-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
                    <!-- Close Button -->
                    <button id="close-modal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <!-- Modal Header -->
                    <div class="p-6 border-b border-gray-200">
                        <h2 id="modal-title" class="text-2xl font-bold text-gray-800 flex items-center">
                            <i class="fas fa-magic text-purple-600 mr-3"></i>
                            Sign In to ConvertWiz
                        </h2>
                        <p class="text-gray-600 mt-2">Access your tools and save preferences</p>
                    </div>
                    
                    <!-- Modal Content -->
                    <div class="p-6">
                        <!-- Tab Buttons -->
                        <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
                            <button id="signin-tab" class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all bg-white text-purple-600 shadow-sm">
                                Sign In
                            </button>
                            <button id="signup-tab" class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all text-gray-600 hover:text-purple-600">
                                Sign Up
                            </button>
                        </div>
                        
                        <!-- Sign In Form -->
                        <div id="signin-form" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input type="email" id="signin-email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" placeholder="Enter your email">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input type="password" id="signin-password" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" placeholder="Enter your password">
                            </div>
                            <button id="signin-btn" class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2">
                                <i class="fas fa-sign-in-alt"></i>
                                <span>Sign In</span>
                            </button>
                        </div>
                        
                        <!-- Sign Up Form -->
                        <div id="signup-form" class="space-y-4 hidden">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input type="text" id="signup-name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" placeholder="Enter your full name">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input type="email" id="signup-email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" placeholder="Enter your email">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input type="password" id="signup-password" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" placeholder="Create a password (min 6 characters)">
                            </div>
                            <button id="signup-btn" class="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2">
                                <i class="fas fa-user-plus"></i>
                                <span>Create Account</span>
                            </button>
                        </div>
                        
                        <!-- Divider -->
                        <div class="my-6 flex items-center">
                            <div class="flex-1 border-t border-gray-300"></div>
                            <span class="px-4 text-sm text-gray-500">or</span>
                            <div class="flex-1 border-t border-gray-300"></div>
                        </div>
                        
                        <!-- Google Sign In -->
                        <button id="google-signin-btn" class="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-3">
                            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" class="w-5 h-5">
                            <span>Continue with Google</span>
                        </button>
                        
                        <!-- Error Message -->
                        <div id="auth-error" class="hidden mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"></div>
                        
                        <!-- Success Message -->
                        <div id="auth-success" class="hidden mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Bind event listeners
    bindEventListeners() {
        // Auth button click
        document.getElementById('auth-btn')?.addEventListener('click', () => {
            if (this.isLoggedIn) {
                this.signOut();
            } else {
                this.showModal();
            }
        });

        // Modal close
        document.getElementById('close-modal')?.addEventListener('click', () => {
            this.hideModal();
        });

        // Modal backdrop click
        document.getElementById('auth-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'auth-modal') {
                this.hideModal();
            }
        });

        // Tab switching
        document.getElementById('signin-tab')?.addEventListener('click', () => {
            this.switchTab('signin');
        });

        document.getElementById('signup-tab')?.addEventListener('click', () => {
            this.switchTab('signup');
        });

        // Form submissions
        document.getElementById('signin-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.signInWithEmail();
        });

        document.getElementById('signup-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.signUpWithEmail();
        });

        document.getElementById('google-signin-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.signInWithGoogle();
        });

        // Enter key handling
        document.getElementById('signin-password')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.signInWithEmail();
            }
        });

        document.getElementById('signup-password')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.signUpWithEmail();
            }
        });
    }

    // Show modal
    showModal() {
        document.getElementById('auth-modal').classList.remove('hidden');
        document.getElementById('auth-modal').classList.add('flex');
        document.body.style.overflow = 'hidden';
    }

    // Hide modal
    hideModal() {
        document.getElementById('auth-modal').classList.add('hidden');
        document.getElementById('auth-modal').classList.remove('flex');
        document.body.style.overflow = '';
        this.clearMessages();
        this.clearForms();
    }

    // Switch tabs
    switchTab(tab) {
        const signinTab = document.getElementById('signin-tab');
        const signupTab = document.getElementById('signup-tab');
        const signinForm = document.getElementById('signin-form');
        const signupForm = document.getElementById('signup-form');
        const modalTitle = document.getElementById('modal-title');

        if (tab === 'signin') {
            signinTab.className = 'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all bg-white text-purple-600 shadow-sm';
            signupTab.className = 'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all text-gray-600 hover:text-purple-600';
            signinForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
            modalTitle.innerHTML = '<i class="fas fa-magic text-purple-600 mr-3"></i>Sign In to ConvertWiz';
        } else {
            signupTab.className = 'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all bg-white text-purple-600 shadow-sm';
            signinTab.className = 'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all text-gray-600 hover:text-purple-600';
            signupForm.classList.remove('hidden');
            signinForm.classList.add('hidden');
            modalTitle.innerHTML = '<i class="fas fa-magic text-purple-600 mr-3"></i>Join ConvertWiz';
        }

        this.clearMessages();
    }

    // Sign in with email and password
    async signInWithEmail() {
        const email = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value;

        if (!email || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        try {
            this.showLoading('signin-btn', 'Signing in...');
            await signInWithEmailAndPassword(auth, email, password);
            this.showSuccess('Successfully signed in!');
            setTimeout(() => this.hideModal(), 1500);
        } catch (error) {
            this.showError(this.getErrorMessage(error.code));
        } finally {
            this.hideLoading('signin-btn', 'Sign In');
        }
    }

    // Sign up with email and password
    async signUpWithEmail() {
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;

        if (!name || !email || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return;
        }

        try {
            this.showLoading('signup-btn', 'Creating account...');
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Update user profile with name
            await updateProfile(userCredential.user, {
                displayName: name
            });

            this.showSuccess('Account created successfully!');
            setTimeout(() => this.hideModal(), 1500);
        } catch (error) {
            this.showError(this.getErrorMessage(error.code));
        } finally {
            this.hideLoading('signup-btn', 'Create Account');
        }
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            this.showLoading('google-signin-btn', 'Connecting to Google...');
            await signInWithPopup(auth, googleProvider);
            this.showSuccess('Successfully signed in with Google!');
            setTimeout(() => this.hideModal(), 1500);
        } catch (error) {
            if (error.code !== 'auth/popup-closed-by-user') {
                this.showError(this.getErrorMessage(error.code));
            }
        } finally {
            this.hideLoading('google-signin-btn', 'Continue with Google');
        }
    }

    // Sign out
    async signOut() {
        try {
            await signOut(auth);
            this.showNotification('Successfully signed out', 'info');
        } catch (error) {
            console.error('Error signing out:', error);
            this.showNotification('Error signing out', 'error');
        }
    }

    // Update UI based on authentication state
    updateUI(isLoggedIn) {
        const authBtn = document.getElementById('auth-btn');
        const userInfo = document.getElementById('user-info');
        const userGreeting = document.getElementById('user-greeting');

        if (isLoggedIn && this.currentUser) {
            // Update auth button to logout
            authBtn.innerHTML = `
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            `;
            authBtn.className = 'bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2';

            // Show user info
            const displayName = this.currentUser.displayName || this.currentUser.email.split('@')[0];
            userGreeting.textContent = `Welcome, ${displayName}!`;
            userInfo.classList.remove('hidden');
        } else {
            // Update auth button to login
            authBtn.innerHTML = `
                <i class="fas fa-sign-in-alt"></i>
                <span>Login</span>
            `;
            authBtn.className = 'bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2';

            // Hide user info
            userInfo.classList.add('hidden');
        }
    }

    // Save user session to localStorage
    saveUserSession(user) {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            isLoggedIn: true,
            loginTime: Date.now()
        };
        localStorage.setItem('convertWizUser', JSON.stringify(userData));
    }

    // Load user session from localStorage
    loadUserSession() {
        const userData = localStorage.getItem('convertWizUser');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                // Check if session is still valid (less than 30 days old)
                const thirtyDays = 30 * 24 * 60 * 60 * 1000;
                if (Date.now() - user.loginTime < thirtyDays) {
                    // Session is valid, wait for Firebase auth state
                    return;
                }
            } catch (error) {
                console.error('Error loading user session:', error);
            }
        }
        this.clearUserSession();
    }

    // Clear user session from localStorage
    clearUserSession() {
        localStorage.removeItem('convertWizUser');
    }

    // Show error message
    showError(message) {
        const errorEl = document.getElementById('auth-error');
        const successEl = document.getElementById('auth-success');
        
        successEl.classList.add('hidden');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }

    // Show success message
    showSuccess(message) {
        const errorEl = document.getElementById('auth-error');
        const successEl = document.getElementById('auth-success');
        
        errorEl.classList.add('hidden');
        successEl.textContent = message;
        successEl.classList.remove('hidden');
    }

    // Clear messages
    clearMessages() {
        document.getElementById('auth-error')?.classList.add('hidden');
        document.getElementById('auth-success')?.classList.add('hidden');
    }

    // Clear forms
    clearForms() {
        document.getElementById('signin-email').value = '';
        document.getElementById('signin-password').value = '';
        document.getElementById('signup-name').value = '';
        document.getElementById('signup-email').value = '';
        document.getElementById('signup-password').value = '';
    }

    // Show loading state
    showLoading(buttonId, text) {
        const button = document.getElementById(buttonId);
        button.disabled = true;
        button.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>${text}</span>
        `;
    }

    // Hide loading state
    hideLoading(buttonId, originalText) {
        const button = document.getElementById(buttonId);
        button.disabled = false;
        
        if (buttonId === 'signin-btn') {
            button.innerHTML = `<i class="fas fa-sign-in-alt"></i><span>${originalText}</span>`;
        } else if (buttonId === 'signup-btn') {
            button.innerHTML = `<i class="fas fa-user-plus"></i><span>${originalText}</span>`;
        } else if (buttonId === 'google-signin-btn') {
            button.innerHTML = `
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" class="w-5 h-5">
                <span>${originalText}</span>
            `;
        }
    }

    // Get user-friendly error messages
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address',
            'auth/wrong-password': 'Incorrect password',
            'auth/email-already-in-use': 'An account already exists with this email address',
            'auth/weak-password': 'Password should be at least 6 characters',
            'auth/invalid-email': 'Please enter a valid email address',
            'auth/user-disabled': 'This account has been disabled',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later',
            'auth/network-request-failed': 'Network error. Please check your connection',
            'auth/popup-blocked': 'Popup blocked. Please allow popups for this site',
            'auth/popup-closed-by-user': 'Sign-in cancelled',
            'auth/invalid-credential': 'Invalid email or password'
        };

        return errorMessages[errorCode] || 'An error occurred. Please try again';
    }

    // Show notification (reuse existing notification system)
    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('auth-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'auth-notification';
            notification.className = 'fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform translate-x-full transition-transform duration-300';
            document.body.appendChild(notification);
        }

        // Set notification style based on type
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500'
        };

        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 ${colors[type] || colors.info}`;
        notification.textContent = message;

        // Show notification
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
        }, 3000);
    }

    // Get current user info
    getCurrentUser() {
        return {
            user: this.currentUser,
            isLoggedIn: this.isLoggedIn
        };
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.convertWizAuth = new ConvertWizAuth();
});

// Export for external use
window.ConvertWizAuth = ConvertWizAuth;