// Firebase Authentication Module for ConvertWiz
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { 
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

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
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Plan limits configuration
const PLAN_LIMITS = {
    free: 5,
    standard: 20,
    premium: Infinity
};

// Authentication Class
class ConvertWizAuth {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.userPlan = null;
        this.dailyUsage = 0;
        this.init();
    }

    init() {
        // Listen for authentication state changes
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.currentUser = user;
                this.isLoggedIn = true;
                await this.initializeUserPlan(user);
                this.updateUI(true);
                this.saveUserSession(user);
                console.log('User signed in:', user.email);
            } else {
                this.currentUser = null;
                this.isLoggedIn = false;
                this.userPlan = null;
                this.dailyUsage = 0;
                this.updateUI(false);
                this.clearUserSession();
                console.log('User signed out');
            }
        });

        // Initialize UI
        this.initializeAuthUI();
        this.loadUserSession();
        
        // Log Firebase configuration (without sensitive data)
        console.log('Firebase initialized for project:', firebaseConfig.projectId);
        console.log('Auth domain:', firebaseConfig.authDomain);
    }

    // Initialize Authentication UI
    initializeAuthUI() {
        // Create login modal
        this.createLoginModal();
        
        // Bind event listeners
        this.bindEventListeners();
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
        // Desktop auth button click
        document.getElementById('auth-btn')?.addEventListener('click', () => {
            if (this.isLoggedIn) {
                this.signOut();
            } else {
                this.showModal();
            }
        });

        // Mobile auth button click
        document.getElementById('mobile-auth-btn')?.addEventListener('click', () => {
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
            console.log('Attempting Google sign-in...');
            
            // Configure Google provider
            googleProvider.setCustomParameters({
                prompt: 'select_account'
            });
            
            const result = await signInWithPopup(auth, googleProvider);
            console.log('Google sign-in successful:', result.user.email);
            
            this.showSuccess('Successfully signed in with Google!');
            setTimeout(() => this.hideModal(), 1500);
        } catch (error) {
            console.error('Google sign-in error:', error.code, error.message);
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
        const mobileAuthBtn = document.getElementById('mobile-auth-btn');
        const userInfo = document.getElementById('user-info');
        const mobileUserInfo = document.getElementById('mobile-user-info');
        const userGreeting = document.getElementById('user-greeting');
        const mobileUserGreeting = document.getElementById('mobile-user-greeting');

        if (isLoggedIn && this.currentUser) {
            // Update desktop auth button to logout
            if (authBtn) {
                authBtn.innerHTML = `
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                `;
                authBtn.className = 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2 font-medium';
            }

            // Update mobile auth button to logout
            if (mobileAuthBtn) {
                mobileAuthBtn.innerHTML = `
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                `;
                mobileAuthBtn.className = 'w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center space-x-2 font-medium';
            }

            // Show user info
            const displayName = this.currentUser.displayName || this.currentUser.email.split('@')[0];
            if (userGreeting) {
                userGreeting.textContent = `Welcome, ${displayName}!`;
                userInfo?.classList.remove('hidden');
            }
            if (mobileUserGreeting) {
                mobileUserGreeting.textContent = `Welcome, ${displayName}!`;
                mobileUserInfo?.classList.remove('hidden');
            }

            // Update ad visibility based on user plan
            this.updateAdVisibility();
            
            // Check for admin access and show admin link
            this.checkAdminAccess();
            
            // Show dashboard link for logged-in users
            this.showDashboardLink(true);
        } else {
            // Update desktop auth button to login
            if (authBtn) {
                authBtn.innerHTML = `
                    <i class="fas fa-sign-in-alt"></i>
                    <span>Login</span>
                `;
                authBtn.className = 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2 font-medium';
            }

            // Update mobile auth button to login
            if (mobileAuthBtn) {
                mobileAuthBtn.innerHTML = `
                    <i class="fas fa-sign-in-alt"></i>
                    <span>Login</span>
                `;
                mobileAuthBtn.className = 'w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center space-x-2 font-medium';
            }

            // Hide user info
            userInfo?.classList.add('hidden');
            mobileUserInfo?.classList.add('hidden');
            
            // Hide dashboard link for logged-out users
            this.showDashboardLink(false);
            
            // Remove plan data attribute for logged out users (show ads)
            document.body.removeAttribute('data-user-plan');
            
            // Hide admin dashboard links for logged out users
            const adminLinks = document.querySelectorAll('a[href*="admin"]');
            const adminNavItems = document.querySelectorAll('.admin-nav-item');
            adminLinks.forEach(link => link.style.display = 'none');
            adminNavItems.forEach(item => item.style.display = 'none');
        }
    }

    // Update ad visibility based on user subscription plan
    async updateAdVisibility() {
        if (!this.currentUser) {
            // User not logged in - show ads (remove any plan attribute)
            document.body.removeAttribute('data-user-plan');
            return;
        }

        try {
            // Get user plan from Firestore
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            const userData = userDoc.exists ? userDoc.data() : null;
            const userPlan = userData?.plan || 'free';
            
            // Set data attribute for CSS targeting
            if (userPlan !== 'free') {
                // Premium users - hide all ads
                document.body.setAttribute('data-user-plan', userPlan);
                console.log(`Premium user detected (${userPlan}) - ads hidden`);
            } else {
                // Free users - show ads
                document.body.removeAttribute('data-user-plan');
                console.log('Free user - ads visible');
            }
        } catch (error) {
            console.error('Error checking user plan for ad visibility:', error);
            // On error, assume free user (show ads)
            document.body.removeAttribute('data-user-plan');
        }
    }

    // Check admin access and show/hide admin dashboard link
    checkAdminAccess() {
        const adminEmails = [
            'iqbalaiwork@gmail.com',
            'iqbalbashasi@gmail.com',
            'sajoshaikh@gmail.com',
            'support@convertwiz.in'
        ];
        
        const isAdmin = this.currentUser && adminEmails.includes(this.currentUser.email);
        
        // Find admin links in navigation
        const adminLinks = document.querySelectorAll('a[href*="admin"]');
        const adminNavItems = document.querySelectorAll('.admin-nav-item');
        
        if (isAdmin) {
            // Show admin links for authorized users
            adminLinks.forEach(link => {
                link.style.display = 'inline-flex';
            });
            adminNavItems.forEach(item => {
                item.style.display = 'block';
            });
            
            // Add admin link to user dropdown if not exists
            this.addAdminLinkToDropdown();
        } else {
            // Hide admin links for non-admin users
            adminLinks.forEach(link => {
                link.style.display = 'none';
            });
            adminNavItems.forEach(item => {
                item.style.display = 'none';
            });
        }
    }
    
    // Add admin dashboard link to user dropdown
    addAdminLinkToDropdown() {
        const userInfo = document.getElementById('user-info');
        if (userInfo && !document.getElementById('admin-dashboard-link')) {
            const adminLink = document.createElement('a');
            adminLink.id = 'admin-dashboard-link';
            adminLink.href = 'admin.html';
            adminLink.className = 'block px-2 py-1 text-xs text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors mt-1';
            adminLink.innerHTML = '<i class="fas fa-chart-line mr-1"></i>Admin Dashboard';
            
            // Insert after usage info
            const usageInfo = document.getElementById('usage-info');
            if (usageInfo) {
                usageInfo.parentNode.insertBefore(adminLink, usageInfo.nextSibling);
            }
        }
        
        // Also add to mobile user info if it exists
        const mobileUserInfo = document.getElementById('mobile-user-info');
        if (mobileUserInfo && !document.getElementById('mobile-admin-dashboard-link')) {
            const mobileAdminLink = document.createElement('a');
            mobileAdminLink.id = 'mobile-admin-dashboard-link';
            mobileAdminLink.href = 'admin.html';
            mobileAdminLink.className = 'block px-2 py-1 text-xs text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors mt-1';
            mobileAdminLink.innerHTML = '<i class="fas fa-chart-line mr-1"></i>Admin Dashboard';
            
            // Insert after mobile usage info
            const mobileUsageInfo = document.getElementById('mobile-usage-info');
            if (mobileUsageInfo) {
                mobileUsageInfo.parentNode.insertBefore(mobileAdminLink, mobileUsageInfo.nextSibling);
            }
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
            'auth/invalid-credential': 'Invalid email or password',
            'auth/unauthorized-domain': 'This domain is not authorized for Google sign-in. Please contact support.',
            'auth/operation-not-allowed': 'Google sign-in is not enabled. Please contact support.',
            'auth/invalid-api-key': 'Invalid API configuration. Please contact support.',
            'auth/app-not-authorized': 'App not authorized for this Firebase project.',
            'auth/invalid-user-token': 'User token is invalid. Please sign in again.',
            'auth/user-token-expired': 'User token has expired. Please sign in again.',
            'auth/null-user': 'User account is null. Please try signing in again.',
            'auth/invalid-provider-id': 'Invalid provider configuration.',
            'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in method.'
        };

        return errorMessages[errorCode] || `Authentication error (${errorCode}). Please try again or contact support.`;
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

    // Initialize or fetch user plan data from Firestore
    async initializeUserPlan(user) {
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                this.userPlan = userData.plan || 'free';
                
                // Check if it's a new day and reset usage if needed
                const today = new Date().toDateString();
                const lastConversionDate = userData.lastConversionDate?.toDate?.()?.toDateString() || '';
                
                if (today !== lastConversionDate) {
                    // Reset daily usage for new day
                    this.dailyUsage = 0;
                    await updateDoc(userDocRef, {
                        dailyUsageCount: 0,
                        lastConversionDate: serverTimestamp()
                    });
                } else {
                    this.dailyUsage = userData.dailyUsageCount || 0;
                }
            } else {
                // First time user - create initial record
                this.userPlan = 'free';
                this.dailyUsage = 0;
                await setDoc(userDocRef, {
                    plan: 'free',
                    dailyUsageCount: 0,
                    lastConversionDate: serverTimestamp(),
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0]
                });
            }
            
            // Update usage display
            this.updateUsageDisplay();
            
        } catch (error) {
            console.error('Error initializing user plan:', error);
            // Fallback to local data
            this.userPlan = 'free';
            this.dailyUsage = 0;
        }
    }

    // Check if user can perform conversion
    async canPerformConversion() {
        if (!this.isLoggedIn) {
            // For non-logged users, use local storage limit
            const todayKey = `conversion_${new Date().toDateString()}`;
            const todayUsage = parseInt(localStorage.getItem(todayKey)) || 0;
            return todayUsage < 3; // Free tier limit for non-users
        }

        const limit = PLAN_LIMITS[this.userPlan] || PLAN_LIMITS.free;
        return this.dailyUsage < limit;
    }

    // Increment usage count after successful conversion
    async incrementUsage() {
        if (!this.isLoggedIn) {
            // For non-logged users, update local storage
            const todayKey = `conversion_${new Date().toDateString()}`;
            const todayUsage = parseInt(localStorage.getItem(todayKey)) || 0;
            localStorage.setItem(todayKey, (todayUsage + 1).toString());
            return;
        }

        try {
            this.dailyUsage++;
            const userDocRef = doc(db, 'users', this.currentUser.uid);
            await updateDoc(userDocRef, {
                dailyUsageCount: this.dailyUsage,
                lastConversionDate: serverTimestamp()
            });
            this.updateUsageDisplay();
        } catch (error) {
            console.error('Error updating usage count:', error);
        }
    }

    // Get remaining conversions for current user
    getRemainingConversions() {
        if (!this.isLoggedIn) {
            const todayKey = `conversion_${new Date().toDateString()}`;
            const todayUsage = parseInt(localStorage.getItem(todayKey)) || 0;
            return Math.max(0, 3 - todayUsage);
        }

        const limit = PLAN_LIMITS[this.userPlan] || PLAN_LIMITS.free;
        if (limit === Infinity) return 'Unlimited';
        return Math.max(0, limit - this.dailyUsage);
    }

    // Update usage display in UI
    updateUsageDisplay() {
        const usageInfo = document.getElementById('usage-info');
        const mobileUsageInfo = document.getElementById('mobile-usage-info');
        
        if (!this.isLoggedIn) {
            const todayKey = `conversion_${new Date().toDateString()}`;
            const todayUsage = parseInt(localStorage.getItem(todayKey)) || 0;
            const remaining = Math.max(0, 3 - todayUsage);
            const usageText = `${remaining}/3 conversions left today`;
            
            if (usageInfo) usageInfo.textContent = usageText;
            if (mobileUsageInfo) mobileUsageInfo.textContent = usageText;
            return;
        }

        const limit = PLAN_LIMITS[this.userPlan] || PLAN_LIMITS.free;
        const planText = this.userPlan.charAt(0).toUpperCase() + this.userPlan.slice(1);
        
        let usageText;
        if (limit === Infinity) {
            usageText = `${planText} Plan - Unlimited conversions`;
        } else {
            const remaining = Math.max(0, limit - this.dailyUsage);
            usageText = `${planText} Plan - ${remaining}/${limit} conversions left today`;
        }
        
        if (usageInfo) usageInfo.textContent = usageText;
        if (mobileUsageInfo) mobileUsageInfo.textContent = usageText;
    }

    // Show usage limit reached warning
    showUsageLimitWarning() {
        const planText = this.userPlan?.charAt(0).toUpperCase() + this.userPlan?.slice(1) || 'Free';
        let message;
        
        if (!this.isLoggedIn) {
            message = 'Daily limit reached! Sign up for unlimited access or try again tomorrow.';
        } else if (this.userPlan === 'free') {
            message = 'Free plan daily limit reached! Upgrade to Standard (20/day) or Premium (unlimited) for more conversions.';
        } else {
            message = `${planText} plan daily limit reached! Try again tomorrow or upgrade to Premium for unlimited conversions.`;
        }
        
        this.showNotification(message, 'warning');
    }

    // Admin-only function to manually change user plan for testing
    async changePlanForTesting(newPlan) {
        if (!this.isLoggedIn) {
            console.error('User must be logged in to change plan');
            return;
        }
        
        // Only allow admin users to change plans
        const adminEmails = [
            'iqbalaiwork@gmail.com',
            'iqbalbashasi@gmail.com',
            'sajoshaikh@gmail.com'
        ];
        
        if (!adminEmails.includes(this.currentUser.email)) {
            console.error('Only admin users can change plans');
            return;
        }
        
        try {
            const userDocRef = doc(db, 'users', this.currentUser.uid);
            await updateDoc(userDocRef, {
                plan: newPlan
            });
            
            this.userPlan = newPlan;
            this.updateUsageDisplay();
            this.showNotification(`Plan changed to ${newPlan} successfully!`, 'success');
        } catch (error) {
            console.error('Error changing plan:', error);
            this.showNotification('Error changing plan', 'error');
        }
    }

    // Admin-only function to reset daily usage for testing
    async resetUsageForTesting() {
        if (!this.isLoggedIn) {
            console.error('User must be logged in to reset usage');
            return;
        }
        
        // Only allow admin users to reset usage
        const adminEmails = [
            'iqbalaiwork@gmail.com',
            'iqbalbashasi@gmail.com',
            'sajoshaikh@gmail.com'
        ];
        
        if (!adminEmails.includes(this.currentUser.email)) {
            console.error('Only admin users can reset usage');
            return;
        }
        
        try {
            const userDocRef = doc(db, 'users', this.currentUser.uid);
            await updateDoc(userDocRef, {
                dailyUsageCount: 0,
                lastConversionDate: serverTimestamp()
            });
            
            this.dailyUsage = 0;
            this.updateUsageDisplay();
            this.showNotification('Daily usage reset successfully!', 'success');
        } catch (error) {
            console.error('Error resetting usage:', error);
            this.showNotification('Error resetting usage', 'error');
        }
    }

    // Test conversion limits function
    async testConversionLimits() {
        if (!this.isLoggedIn) {
            console.error('User must be logged in to test conversion limits');
            return;
        }
        
        // Only allow admin users to test
        const adminEmails = [
            'iqbalaiwork@gmail.com',
            'iqbalbashasi@gmail.com',
            'sajoshaikh@gmail.com'
        ];
        
        if (!adminEmails.includes(this.currentUser.email)) {
            console.error('Only admin users can test conversion limits');
            return;
        }
        
        console.log('=== TESTING CONVERSION LIMITS ===');
        console.log(`Current Plan: ${this.userPlan}`);
        console.log(`Current Usage: ${this.dailyUsage}`);
        console.log(`Plan Limit: ${PLAN_LIMITS[this.userPlan]}`);
        console.log(`Can Convert: ${await this.canPerformConversion()}`);
        console.log(`Remaining: ${this.getRemainingConversions()}`);
        
        // Test functions available in console:
        console.log('\n=== AVAILABLE TEST FUNCTIONS ===');
        console.log('convertWizAuth.changePlanForTesting("free")');
        console.log('convertWizAuth.changePlanForTesting("standard")');
        console.log('convertWizAuth.changePlanForTesting("premium")');
        console.log('convertWizAuth.resetUsageForTesting()');
        console.log('convertWizAuth.incrementUsage()');
        console.log('convertWizAuth.testConversionLimits()');
    }

    // Quick test for new user registration with free plan assignment
    async testNewUserRegistration() {
        console.log('=== NEW USER REGISTRATION TEST ===');
        if (!this.isLoggedIn) {
            console.log('❌ User not logged in - please sign up/login first');
            return;
        }
        
        console.log(`✅ User registered: ${this.currentUser.email}`);
        console.log(`✅ Plan assigned: ${this.userPlan}`);
        console.log(`✅ Daily usage: ${this.dailyUsage}`);
        console.log(`✅ Can convert: ${await this.canPerformConversion()}`);
        console.log(`✅ Remaining conversions: ${this.getRemainingConversions()}`);
        
        if (this.userPlan === 'free') {
            console.log('✅ Test PASSED: New user assigned free plan correctly');
        } else {
            console.log('❌ Test FAILED: New user should have free plan');
        }
    }

    // Complete test suite for subscription limits
    async runCompleteSubscriptionTest() {
        if (!this.isLoggedIn) {
            console.error('User must be logged in to run tests');
            return;
        }
        
        const adminEmails = [
            'iqbalaiwork@gmail.com',
            'iqbalbashasi@gmail.com', 
            'sajoshaikh@gmail.com'
        ];
        
        if (!adminEmails.includes(this.currentUser.email)) {
            console.error('Only admin users can run complete test suite');
            return;
        }
        
        console.log('🚀 STARTING COMPLETE SUBSCRIPTION TEST SUITE');
        console.log('================================================');
        
        // Test 1: Reset to free plan
        console.log('\n📝 TEST 1: Free Plan Limits (5 conversions/day)');
        await this.changePlanForTesting('free');
        await this.resetUsageForTesting();
        console.log(`Current plan: ${this.userPlan}, Usage: ${this.dailyUsage}`);
        
        // Test 2: Try 6 conversions on free plan
        console.log('\n📝 TEST 2: Attempting 6 conversions on free plan');
        for (let i = 1; i <= 6; i++) {
            const canConvert = await this.canPerformConversion();
            console.log(`Conversion ${i}: ${canConvert ? '✅ Allowed' : '❌ Blocked'}`);
            if (canConvert) {
                await this.incrementUsage();
            }
        }
        
        // Test 3: Standard plan test
        console.log('\n📝 TEST 3: Standard Plan Limits (20 conversions/day)');
        await this.changePlanForTesting('standard');
        await this.resetUsageForTesting();
        console.log(`Switched to: ${this.userPlan}, Usage reset: ${this.dailyUsage}`);
        
        // Test 4: Premium plan test
        console.log('\n📝 TEST 4: Premium Plan (Unlimited conversions)');
        await this.changePlanForTesting('premium');
        await this.resetUsageForTesting();
        const remaining = this.getRemainingConversions();
        console.log(`Premium plan remaining: ${remaining} (should be "Unlimited")`);
        
        console.log('\n🎉 TEST SUITE COMPLETED!');
        console.log('Check above results to verify subscription logic works correctly.');
    }

    // Show/hide dashboard link based on authentication state
    showDashboardLink(show) {
        const dashboardNavItem = document.getElementById('dashboard-nav-item');
        const mobileDashboardNavItem = document.getElementById('mobile-dashboard-nav-item');
        
        if (dashboardNavItem) {
            dashboardNavItem.style.display = show ? 'block' : 'none';
        }
        if (mobileDashboardNavItem) {
            mobileDashboardNavItem.style.display = show ? 'block' : 'none';
        }
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.convertWizAuth = new ConvertWizAuth();
});

// Export for external use
window.ConvertWizAuth = ConvertWizAuth;