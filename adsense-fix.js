// Enhanced AdSense Initialization Fix
// Fixes "No slot size for availableWidth=0" errors

function initializeAdSenseWithDelay() {
    // Wait for page layout to complete
    setTimeout(function() {
        if (typeof adsbygoogle !== 'undefined' && window.innerWidth > 0) {
            try {
                // Check if ads are already initialized
                if (window.adsbygoogle && window.adsbygoogle.loaded) {
                    console.log('AdSense already initialized');
                    return;
                }
                
                // Initialize ads with proper error handling
                (adsbygoogle = window.adsbygoogle || []).push({});
                console.log('✅ AdSense initialized successfully');
                
                // Mark as loaded
                if (window.adsbygoogle) {
                    window.adsbygoogle.loaded = true;
                }
                
            } catch (error) {
                console.warn('AdSense initialization delayed:', error.message);
                
                // Retry after additional delay
                setTimeout(function() {
                    try {
                        (adsbygoogle = window.adsbygoogle || []).push({});
                        console.log('✅ AdSense initialized on retry');
                    } catch (retryError) {
                        console.warn('AdSense initialization failed on retry:', retryError.message);
                    }
                }, 3000);
            }
        } else {
            console.warn('AdSense not ready, window width:', window.innerWidth);
        }
    }, 2500); // Increased delay to 2.5 seconds
}

// Initialize when DOM is ready and page is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdSenseWithDelay);
} else {
    initializeAdSenseWithDelay();
}

// Also initialize on window load as fallback
window.addEventListener('load', function() {
    setTimeout(initializeAdSenseWithDelay, 1000);
});