// IMMEDIATE FIX: Hide all components except landing on page load
(function() {
    'use strict';
    
    // Run immediately when script loads
    function forceComponentIsolation() {
        console.log('🔧 IMMEDIATE FIX: Enforcing component isolation');
        
        // Hide ALL tool sections
        const allSections = document.querySelectorAll('.tool-section');
        allSections.forEach(section => {
            section.style.display = 'none';
            section.style.visibility = 'hidden';
        });
        
        // Show only landing section
        const landingSection = document.getElementById('landing-section');
        if (landingSection) {
            landingSection.style.display = 'block';
            landingSection.style.visibility = 'visible';
        }
        
        console.log(`✅ Fixed: ${allSections.length} sections processed, landing visible`);
    }
    
    // Run fix immediately
    forceComponentIsolation();
    
    // Run fix when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceComponentIsolation);
    } else {
        forceComponentIsolation();
    }
    
    // Run fix again after 100ms to catch any late loading
    setTimeout(forceComponentIsolation, 100);
    
    // Override any potential interference
    window.addEventListener('load', forceComponentIsolation);
})();