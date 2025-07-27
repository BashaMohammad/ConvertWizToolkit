// Test Authentication Flow for ConvertWiz
console.log('🧪 ConvertWiz Authentication Test Flow');

// Test credentials for end-to-end testing
const TEST_CREDENTIALS = {
    email: 'test@convertwiz.in',
    password: 'test123456',
    displayName: 'Test User'
};

// Create test account function
async function createTestAccount() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.error('Firebase not available');
        return false;
    }
    
    try {
        const auth = firebase.auth();
        
        // Create user with email and password
        const userCredential = await auth.createUserWithEmailAndPassword(
            TEST_CREDENTIALS.email, 
            TEST_CREDENTIALS.password
        );
        
        // Update profile
        await userCredential.user.updateProfile({
            displayName: TEST_CREDENTIALS.displayName
        });
        
        console.log('✅ Test account created successfully');
        return true;
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('✅ Test account already exists');
            return true;
        }
        console.error('❌ Test account creation failed:', error);
        return false;
    }
}

// Sign in with test credentials
async function signInWithTestCredentials() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.error('Firebase not available');
        return false;
    }
    
    try {
        const auth = firebase.auth();
        
        const userCredential = await auth.signInWithEmailAndPassword(
            TEST_CREDENTIALS.email, 
            TEST_CREDENTIALS.password
        );
        
        console.log('✅ Test sign-in successful:', userCredential.user.email);
        return true;
    } catch (error) {
        console.error('❌ Test sign-in failed:', error);
        return false;
    }
}

// Run authentication test flow
async function runAuthTestFlow() {
    console.log('🚀 Starting authentication test flow...');
    
    // Step 1: Ensure test account exists
    const accountReady = await createTestAccount();
    if (!accountReady) {
        console.error('❌ Test account setup failed');
        return false;
    }
    
    // Step 2: Sign out if currently signed in
    if (firebase.auth().currentUser) {
        await firebase.auth().signOut();
        console.log('✅ Signed out current user');
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Step 3: Sign in with test credentials
    const signInSuccess = await signInWithTestCredentials();
    if (!signInSuccess) {
        console.error('❌ Test sign-in failed');
        return false;
    }
    
    // Step 4: Verify UI updates
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const authBtn = document.getElementById('auth-btn');
    const userInfo = document.getElementById('user-info');
    
    if (authBtn && authBtn.textContent.includes('Test')) {
        console.log('✅ Desktop UI updated correctly');
    } else {
        console.log('❌ Desktop UI not updated');
    }
    
    if (userInfo && !userInfo.classList.contains('hidden')) {
        console.log('✅ User info displayed correctly');
    } else {
        console.log('❌ User info not displayed');
    }
    
    console.log('🎉 Authentication test flow completed');
    return true;
}

// Export functions for manual testing
window.createTestAccount = createTestAccount;
window.signInWithTestCredentials = signInWithTestCredentials;
window.runAuthTestFlow = runAuthTestFlow;
window.TEST_CREDENTIALS = TEST_CREDENTIALS;