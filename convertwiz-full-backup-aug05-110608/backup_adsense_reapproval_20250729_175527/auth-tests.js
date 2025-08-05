#!/usr/bin/env node
// ConvertWiz Authentication System Automated Test Suite
// Tests login, dashboard access, session management, and UI functionality

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ConvertWizAuthTests {
    constructor() {
        this.browser = null;
        this.page = null;
        this.baseUrl = 'http://localhost:5000';
        this.testResults = [];
        this.testCredentials = {
            validEmail: 'test@convertwiz.in',
            validPassword: 'TestPassword123!',
            invalidPassword: 'wrongpassword'
        };
    }

    async setup() {
        console.log('🚀 Setting up ConvertWiz Authentication Test Suite');
        
        this.browser = await puppeteer.launch({
            headless: false, // Set to true for CI environments
            defaultViewport: { width: 1280, height: 720 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        this.page = await this.browser.newPage();
        
        // Enable console logging from page
        this.page.on('console', msg => {
            console.log(`PAGE: ${msg.text()}`);
        });
        
        // Enable error catching
        this.page.on('pageerror', error => {
            console.error(`PAGE ERROR: ${error.message}`);
        });
        
        console.log('✅ Test environment setup complete');
    }

    async teardown() {
        if (this.browser) {
            await this.browser.close();
            console.log('✅ Test environment cleaned up');
        }
    }

    logTest(testName, passed, details = '') {
        const result = {
            test: testName,
            status: passed ? 'PASS' : 'FAIL',
            passed: passed,
            details: details,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        console.log(`${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASS' : 'FAIL'}`);
        if (details) {
            console.log(`   Details: ${details}`);
        }
    }

    // Test 1: Login with valid credentials → Expect dashboard.html redirect
    async testValidLogin() {
        try {
            console.log('\n📝 Test 1: Valid Login Flow');
            
            // Navigate to login page
            await this.page.goto(`${this.baseUrl}/auth.html`, { waitUntil: 'networkidle0' });
            
            // Check if login form exists
            const loginForm = await this.page.$('#login-form');
            if (!loginForm) {
                this.logTest('Valid Login - Form Check', false, 'Login form not found');
                return;
            }
            
            // Fill in credentials
            await this.page.type('#email', this.testCredentials.validEmail);
            await this.page.type('#password', this.testCredentials.validPassword);
            
            // Submit form
            await this.page.click('#login-button');
            
            // Wait for navigation or error
            await this.page.waitForTimeout(3000);
            
            // Check if redirected to dashboard
            const currentUrl = this.page.url();
            if (currentUrl.includes('dashboard.html')) {
                this.logTest('Valid Login', true, 'Successfully redirected to dashboard');
            } else {
                this.logTest('Valid Login', false, `Not redirected to dashboard. Current URL: ${currentUrl}`);
            }
            
        } catch (error) {
            this.logTest('Valid Login', false, `Error: ${error.message}`);
        }
    }

    // Test 2: Login with invalid password → Expect error message
    async testInvalidLogin() {
        try {
            console.log('\n📝 Test 2: Invalid Login Flow');
            
            // Navigate to login page
            await this.page.goto(`${this.baseUrl}/auth.html`, { waitUntil: 'networkidle0' });
            
            // Clear any existing form data
            await this.page.evaluate(() => {
                const emailField = document.querySelector('#email');
                const passwordField = document.querySelector('#password');
                if (emailField) emailField.value = '';
                if (passwordField) passwordField.value = '';
            });
            
            // Fill in invalid credentials
            await this.page.type('#email', this.testCredentials.validEmail);
            await this.page.type('#password', this.testCredentials.invalidPassword);
            
            // Submit form
            await this.page.click('#login-button');
            
            // Wait for error message
            await this.page.waitForTimeout(2000);
            
            // Check for error message
            const errorMessage = await this.page.$('#error-message');
            const errorVisible = await this.page.evaluate(() => {
                const errorEl = document.querySelector('#error-message');
                return errorEl && !errorEl.classList.contains('hidden');
            });
            
            if (errorVisible) {
                const errorText = await this.page.$eval('#error-message', el => el.textContent);
                this.logTest('Invalid Login', true, `Error message displayed: ${errorText}`);
            } else {
                this.logTest('Invalid Login', false, 'No error message displayed for invalid credentials');
            }
            
        } catch (error) {
            this.logTest('Invalid Login', false, `Error: ${error.message}`);
        }
    }

    // Test 3: Direct dashboard access without login → Expect redirect to login
    async testDirectDashboardAccess() {
        try {
            console.log('\n📝 Test 3: Direct Dashboard Access (Unauthenticated)');
            
            // Clear any existing auth state
            await this.page.evaluate(() => {
                localStorage.clear();
                sessionStorage.clear();
            });
            
            // Try to access dashboard directly
            await this.page.goto(`${this.baseUrl}/dashboard.html`, { waitUntil: 'networkidle0' });
            
            // Wait for redirect logic
            await this.page.waitForTimeout(3000);
            
            // Check current URL
            const currentUrl = this.page.url();
            if (currentUrl.includes('login.html') || currentUrl.includes('auth.html')) {
                this.logTest('Direct Dashboard Access', true, 'Correctly redirected to login page');
            } else {
                this.logTest('Direct Dashboard Access', false, `Not redirected to login. Current URL: ${currentUrl}`);
            }
            
        } catch (error) {
            this.logTest('Direct Dashboard Access', false, `Error: ${error.message}`);
        }
    }

    // Test 4: Session persistence after page refresh
    async testSessionPersistence() {
        try {
            console.log('\n📝 Test 4: Session Persistence After Refresh');
            
            // First login (assuming Test 1 passed)
            await this.page.goto(`${this.baseUrl}/auth.html`, { waitUntil: 'networkidle0' });
            await this.page.type('#email', this.testCredentials.validEmail);
            await this.page.type('#password', this.testCredentials.validPassword);
            await this.page.click('#login-button');
            await this.page.waitForTimeout(3000);
            
            // Check if on dashboard
            let currentUrl = this.page.url();
            if (!currentUrl.includes('dashboard.html')) {
                this.logTest('Session Persistence', false, 'Could not establish initial login session');
                return;
            }
            
            // Refresh the dashboard page
            await this.page.reload({ waitUntil: 'networkidle0' });
            await this.page.waitForTimeout(3000);
            
            // Check if still on dashboard (not redirected to login)
            currentUrl = this.page.url();
            if (currentUrl.includes('dashboard.html')) {
                this.logTest('Session Persistence', true, 'Session persisted after page refresh');
            } else {
                this.logTest('Session Persistence', false, `Session lost after refresh. Current URL: ${currentUrl}`);
            }
            
        } catch (error) {
            this.logTest('Session Persistence', false, `Error: ${error.message}`);
        }
    }

    // Test 5: Logout functionality → Expect redirect to login
    async testLogoutFunctionality() {
        try {
            console.log('\n📝 Test 5: Logout Functionality');
            
            // Ensure we're on dashboard (from previous test)
            let currentUrl = this.page.url();
            if (!currentUrl.includes('dashboard.html')) {
                // Login first
                await this.page.goto(`${this.baseUrl}/auth.html`, { waitUntil: 'networkidle0' });
                await this.page.type('#email', this.testCredentials.validEmail);
                await this.page.type('#password', this.testCredentials.validPassword);
                await this.page.click('#login-button');
                await this.page.waitForTimeout(3000);
            }
            
            // Click logout button
            const logoutButton = await this.page.$('#logout-btn');
            if (!logoutButton) {
                this.logTest('Logout Functionality', false, 'Logout button not found');
                return;
            }
            
            await this.page.click('#logout-btn');
            await this.page.waitForTimeout(3000);
            
            // Check if redirected to login
            currentUrl = this.page.url();
            if (currentUrl.includes('login.html') || currentUrl.includes('auth.html')) {
                this.logTest('Logout Functionality', true, 'Successfully logged out and redirected to login');
            } else {
                this.logTest('Logout Functionality', false, `Not redirected after logout. Current URL: ${currentUrl}`);
            }
            
            // Verify auth state is cleared
            const authState = await this.page.evaluate(() => {
                return {
                    localStorage: localStorage.getItem('convertWizUser'),
                    sessionStorage: sessionStorage.getItem('convertWizUser')
                };
            });
            
            if (!authState.localStorage && !authState.sessionStorage) {
                this.logTest('Logout - Auth State Cleared', true, 'Auth state properly cleared from storage');
            } else {
                this.logTest('Logout - Auth State Cleared', false, 'Auth state not completely cleared');
            }
            
        } catch (error) {
            this.logTest('Logout Functionality', false, `Error: ${error.message}`);
        }
    }

    // Test 6: UI element visibility and functionality
    async testUIElements() {
        try {
            console.log('\n📝 Test 6: UI Elements Visibility');
            
            // Test login page UI
            await this.page.goto(`${this.baseUrl}/auth.html`, { waitUntil: 'networkidle0' });
            
            const loginElements = await this.page.evaluate(() => {
                return {
                    emailField: !!document.querySelector('#email'),
                    passwordField: !!document.querySelector('#password'),
                    loginButton: !!document.querySelector('#login-button'),
                    errorContainer: !!document.querySelector('#error-message')
                };
            });
            
            const loginUIValid = Object.values(loginElements).every(exists => exists);
            this.logTest('Login UI Elements', loginUIValid, `Elements found: ${JSON.stringify(loginElements)}`);
            
            // Test dashboard UI (need to login first)
            await this.page.type('#email', this.testCredentials.validEmail);
            await this.page.type('#password', this.testCredentials.validPassword);
            await this.page.click('#login-button');
            await this.page.waitForTimeout(3000);
            
            if (this.page.url().includes('dashboard.html')) {
                const dashboardElements = await this.page.evaluate(() => {
                    return {
                        userWelcome: !!document.querySelector('#user-welcome'),
                        logoutButton: !!document.querySelector('#logout-btn'),
                        userBadge: !!document.querySelector('#user-badge'),
                        currentPlan: !!document.querySelector('#current-plan'),
                        dailyUsage: !!document.querySelector('#daily-usage')
                    };
                });
                
                const dashboardUIValid = Object.values(dashboardElements).every(exists => exists);
                this.logTest('Dashboard UI Elements', dashboardUIValid, `Elements found: ${JSON.stringify(dashboardElements)}`);
            } else {
                this.logTest('Dashboard UI Elements', false, 'Could not access dashboard for UI testing');
            }
            
        } catch (error) {
            this.logTest('UI Elements', false, `Error: ${error.message}`);
        }
    }

    // Run all tests
    async runAllTests() {
        try {
            await this.setup();
            
            console.log('🧪 Starting ConvertWiz Authentication Test Suite');
            console.log('=' * 60);
            
            await this.testValidLogin();
            await this.testInvalidLogin();
            await this.testDirectDashboardAccess();
            await this.testSessionPersistence();
            await this.testLogoutFunctionality();
            await this.testUIElements();
            
            await this.generateReport();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        } finally {
            await this.teardown();
        }
    }

    // Generate test report
    async generateReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;
        
        console.log('\n' + '=' * 60);
        console.log('📊 AUTHENTICATION TEST RESULTS');
        console.log('=' * 60);
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${successRate}%`);
        
        console.log('\n📋 DETAILED RESULTS:');
        console.log('-' * 50);
        
        this.testResults.forEach(result => {
            console.log(`${result.status === 'PASS' ? '✅' : '❌'} ${result.test}: ${result.status}`);
            if (result.details) {
                console.log(`   ${result.details}`);
            }
        });
        
        // Save results to file
        const reportData = {
            summary: {
                totalTests,
                passedTests,
                failedTests,
                successRate: parseFloat(successRate),
                testDate: new Date().toISOString()
            },
            results: this.testResults
        };
        
        const reportFile = `auth_test_report_${Date.now()}.json`;
        fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
        
        console.log(`\n💾 Test report saved to: ${reportFile}`);
        
        if (passedTests === totalTests) {
            console.log('\n🎉 ALL TESTS PASSED! Authentication system is working perfectly.');
        } else {
            console.log(`\n⚠️ ${failedTests} test(s) failed. Please review the issues above.`);
        }
        
        return passedTests === totalTests;
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new ConvertWizAuthTests();
    tester.runAllTests()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = ConvertWizAuthTests;