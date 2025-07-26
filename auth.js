const firebaseConfig = {
    apiKey: "AIzaSyAMVP0J1mH4WF-ESxi_PbQvDmydFXcuJe0",
    authDomain: "convertwiz.firebaseapp.com", 
    projectId: "convertwiz",
    storageBucket: "convertwiz.firebasestorage.app",
    messagingSenderId: "777853314366",
    appId: "1:777853314366:web:69a7ad8155381e5f51386f"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    // Google Sign-In
    document.getElementById('google-signin-btn').addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then((result) => {
                console.log('Google sign-in successful');
                window.location.href = '/dashboard.html';
            })
            .catch((error) => {
                console.error('Google sign-in error:', error);
                alert('Sign-in failed: ' + error.message);
            });
    });

    // Email/Password Sign-In
    const emailForm = document.getElementById('email-auth-form');
    if (emailForm) {
        emailForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log('Email sign-in successful');
                    window.location.href = '/dashboard.html';
                })
                .catch((error) => {
                    console.error('Email sign-in error:', error);
                    alert('Sign-in failed: ' + error.message);
                });
        });
    }

    // Forgot Password
    const forgotPassword = document.getElementById('forgot-password');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            const email = prompt('Enter your email address:');
            if (email) {
                auth.sendPasswordResetEmail(email)
                    .then(() => {
                        alert('Password reset email sent!');
                    })
                    .catch((error) => {
                        alert('Error: ' + error.message);
                    });
            }
        });
    }

    // Create Account
    const createAccount = document.getElementById('create-account');
    if (createAccount) {
        createAccount.addEventListener('click', (e) => {
            e.preventDefault();
            const email = prompt('Enter your email address:');
            const password = prompt('Enter a password (min 6 characters):');
            
            if (email && password) {
                auth.createUserWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        console.log('Account created successfully');
                        window.location.href = '/dashboard.html';
                    })
                    .catch((error) => {
                        alert('Account creation failed: ' + error.message);
                    });
            }
        });
    }
} else {
    console.warn('Firebase SDK not loaded');
    document.body.innerHTML = '<div style="text-align:center;margin-top:50px;"><h2>Authentication Service Unavailable</h2><p>Please try again later.</p></div>';
}