// EMERGENCY COMPONENT FIX - Zero dependencies, pure vanilla JS
console.log('🚨 EMERGENCY FIX: Starting component system');

// Simple function to show sections based on URL
function emergencyShowSection() {
    var path = window.location.pathname;
    console.log('🚨 EMERGENCY: Current path =', path);
    
    // Get all tool sections
    var allSections = document.querySelectorAll('.tool-section, #landing-section');
    console.log('🚨 EMERGENCY: Found sections =', allSections.length);
    
    // Hide everything first
    allSections.forEach(function(section) {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    var targetSection = null;
    
    // Show appropriate section
    if (path === '/' || path === '' || path === '/index.html') {
        targetSection = document.getElementById('landing-section');
        console.log('🚨 EMERGENCY: Showing landing section');
    } else {
        // Extract section name from path: /jpg-to-png -> jpg-to-png-section
        var sectionName = path.replace('/', '') + '-section';
        targetSection = document.getElementById(sectionName);
        console.log('🚨 EMERGENCY: Looking for section =', sectionName);
    }
    
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.style.visibility = 'visible';
        targetSection.style.opacity = '1';
        targetSection.classList.add('active');
        console.log('🚨 EMERGENCY: SUCCESS - Section activated =', targetSection.id);
    } else {
        console.log('🚨 EMERGENCY: FAILED - Section not found');
        // Fallback to landing
        var landing = document.getElementById('landing-section');
        if (landing) {
            landing.style.display = 'block';
            landing.classList.add('active');
            console.log('🚨 EMERGENCY: Fallback to landing');
        }
    }
}

// Run immediately and on DOM ready
if (document.readyState !== 'loading') {
    emergencyShowSection();
} else {
    document.addEventListener('DOMContentLoaded', emergencyShowSection);
}

console.log('🚨 EMERGENCY FIX: System ready');