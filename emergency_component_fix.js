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

// Add navigation button handlers
document.addEventListener('click', function(e) {
    // Handle "Try Now" buttons
    if (e.target.classList.contains('try-now-btn') || e.target.getAttribute('data-target')) {
        e.preventDefault();
        var targetSection = e.target.getAttribute('data-target');
        if (targetSection) {
            console.log('🚨 EMERGENCY: Button clicked for section =', targetSection);
            showSectionById(targetSection);
        }
    }
});

// Function to show section by ID
function showSectionById(sectionId) {
    console.log('🚨 EMERGENCY: Switching to section =', sectionId);
    
    // Hide all sections
    var allSections = document.querySelectorAll('.tool-section, #landing-section');
    allSections.forEach(function(section) {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // Show target section
    var target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
        target.style.visibility = 'visible';
        target.style.opacity = '1';
        target.classList.add('active');
        console.log('🚨 EMERGENCY: SUCCESS - Section switched to =', sectionId);
        
        // Update URL to match component
        var pathMap = {
            'jpg-to-png-section': '/jpg-to-png',
            'currency-converter-section': '/currency-converter',
            'land-converter-section': '/land-converter',
            'dp-resizer-section': '/dp-resizer',
            'word-counter-section': '/word-counter',
            'distance-converter-section': '/distance-converter',
            'weight-converter-section': '/weight-converter',
            'height-converter-section': '/height-converter',
            'ip-extractor-section': '/ip-extractor',
            'qr-generator-section': '/qr-generator',
            'percentage-calculator-section': '/percentage-calculator',
            'temperature-converter-section': '/temperature-converter',
            'color-converter-section': '/color-converter',
            'image-compressor-section': '/image-compressor',
            'landing-section': '/'
        };
        
        var newPath = pathMap[sectionId] || '/';
        if (window.history && window.history.pushState) {
            window.history.pushState({}, '', newPath);
        }
    } else {
        console.log('🚨 EMERGENCY: FAILED - Section not found =', sectionId);
    }
}

console.log('🚨 EMERGENCY FIX: System ready with navigation');