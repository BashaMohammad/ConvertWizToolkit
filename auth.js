// ConvertWiz Authentication System - Clean & Modern
console.log('🔐 Loading ConvertWiz Authentication...');

const firebaseConfig = {
    apiKey: "AIzaSyBvOkBjDHllamPmRrJ4mRCk8Kh4aZRoMgo",
    authDomain: "convertwiz.firebaseapp.com", 
    projectId: "convertwiz",
    storageBucket: "convertwiz.firebasestorage.app",
    messagingSenderId: "807062320011",
    appId: "1:807062320011:web:d1b2c3d4e5f6g7h8i9j0k1"
};

// UI Helper Functions
function showLoading() {
    document.getElementById('loading-spinner').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-spinner').classList.add('hidden');
}

function showToast(message, type = 'error') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    
    // Set toast colors based on type
    const toastDiv = toast.querySelector('div');
    if (type === 'success') {
        toastDiv.className = 'bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
    } else if (type === 'info') {
        toastDiv.className = 'bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg';
    } else {
        toastDiv.className = 'bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
    }
    
    toast.classList.remove('translate-x-full');
    
    setTimeout(() => {
        toast.classList.add('translate-x-full');
    }, 3000);
}

function switchTab(activeTab) {
    const signinTab = document.getElementById('signin-tab');
    const signupTab = document.getElementById('signup-tab');
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    
    if (activeTab === 'signin') {
        signinTab.className = 'flex-1 py-4 px-6 text-center font-medium text-blue-600 border-b-2 border-blue-600 bg-blue-50';
        signupTab.className = 'flex-1 py-4 px-6 text-center font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700';
        signinForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        signupTab.className = 'flex-1 py-4 px-6 text-center font-medium text-blue-600 border-b-2 border-blue-600 bg-blue-50';
        signinTab.className = 'flex-1 py-4 px-6 text-center font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700';
        signupForm.classList.remove('hidden');
        signinForm.classList.add('hidden');
    }
}

// Initialize Firebase and Auth System
function initializeAuth() {
    if (typeof firebase === 'undefined') {
        console.warn('Firebase not available, showing offline message');
        showToast('Authentication service is temporarily unavailable', 'error');
        return;
    }

    try {
        // Initialize Firebase
        if (firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }
        
        const auth = firebase.auth();
        console.log('✅ Firebase Authentication initialized');

        // Tab switching
        document.getElementById('signin-tab').addEventListener('click', () => switchTab('signin'));
        document.getElementById('signup-tab').addEventListener('click', () => switchTab('signup'));

        // Google Sign-In (both buttons)
        [document.getElementById('google-signin-btn'), document.getElementById('google-signup-btn')].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    showLoading();
                    const provider = new firebase.auth.GoogleAuthProvider();
                    auth.signInWithPopup(provider)
                        .then((result) => {
                            console.log('✅ Google authentication successful');
                            showToast('Welcome to ConvertWiz!', 'success');
                            setTimeout(() => {
                                window.location.href = '/';
                            }, 1000);
                        })
                        .catch((error) => {
                            console.error('❌ Google authentication failed:', error);
                            showToast(error.message || 'Google sign-in failed');
                        })
                        .finally(() => {
                            hideLoading();
                        });
                });
            }
        });

        // Email Sign-In
        const signinForm = document.getElementById('signin-email-form');
        if (signinForm) {
            signinForm.addEventListener('submit', (e) => {
                e.preventDefault();
                showLoading();
                
                const email = document.getElementById('signin-email').value;
                const password = document.getElementById('signin-password').value;
                
                auth.signInWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        console.log('✅ Email sign-in successful');
                        showToast('Welcome back!', 'success');
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 1000);
                    })
                    .catch((error) => {
                        console.error('❌ Email sign-in failed:', error);
                        showToast(error.message || 'Sign-in failed');
                    })
                    .finally(() => {
                        hideLoading();
                    });
            });
        }

        // Email Sign-Up
        const signupForm = document.getElementById('signup-email-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                showLoading();
                
                const name = document.getElementById('signup-name').value;
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                
                auth.createUserWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        // Update user profile with name
                        return userCredential.user.updateProfile({
                            displayName: name
                        });
                    })
                    .then(() => {
                        console.log('✅ Account created successfully');
                        showToast('Account created successfully!', 'success');
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 1000);
                    })
                    .catch((error) => {
                        console.error('❌ Account creation failed:', error);
                        showToast(error.message || 'Account creation failed');
                    })
                    .finally(() => {
                        hideLoading();
                    });
            });
        }

        // Forgot Password
        const forgotPassword = document.getElementById('forgot-password');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                const email = document.getElementById('signin-email').value;
                
                if (!email) {
                    showToast('Please enter your email address first');
                    document.getElementById('signin-email').focus();
                    return;
                }
                
                showLoading();
                auth.sendPasswordResetEmail(email)
                    .then(() => {
                        showToast('Password reset email sent!', 'success');
                    })
                    .catch((error) => {
                        showToast(error.message || 'Failed to send reset email');
                    })
                    .finally(() => {
                        hideLoading();
                    });
            });
        }

        // Check if user is already logged in
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('User already logged in:', user.email);
                showToast('You are already signed in', 'info');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            }
        });

    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        showToast('Authentication service error', 'error');
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 ConvertWiz Auth Page Loaded');
    initializeAuth();
});