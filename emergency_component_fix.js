// EMERGENCY COMPONENT FIX - Zero dependencies, pure vanilla JS with URL routing
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

console.log('🚨 EMERGENCY FIX: System ready with navigation');

// Add navigation button handlers
document.addEventListener('click', function(e) {
    // Handle "Try Now" buttons and "Back to Home" buttons
    if (e.target.classList.contains('try-now-btn') || e.target.getAttribute('data-target')) {
        e.preventDefault();
        var targetSection = e.target.getAttribute('data-target');
        if (targetSection) {
            console.log('🚨 EMERGENCY: Button clicked for section =', targetSection);
            showSectionById(targetSection);
        }
    }
    
    // Handle "Back to Home" buttons (check parent elements too)
    var clickedElement = e.target;
    var parentElement = clickedElement.parentElement;
    
    if ((clickedElement.getAttribute('data-target') === 'landing-section') || 
        (parentElement && parentElement.getAttribute('data-target') === 'landing-section')) {
        e.preventDefault();
        console.log('🚨 EMERGENCY: Back to Home clicked');
        showSectionById('landing-section');
    }
});

// Function to show section by ID with proper URL update
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
        console.log('🚨 EMERGENCY: Target element found with content length =', target.innerHTML.length);
        
        // COMPLETE URL mapping for all 26 tools - Updated for proper routing
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
            'text-to-speech-section': '/text-to-speech',
            'url-shortener-section': '/url-shortener',
            'backlink-checker-section': '/backlink-checker',
            'meta-tag-generator-section': '/meta-tag-generator',
            'dpi-checker-section': '/dpi-checker',
            'global-land-units-section': '/global-land-units',
            // New PDF and Utility Tools (Saturday release)
            'bmi-calculator-section': '/bmi-calculator',
            'text-case-converter-section': '/text-case-converter',
            'png-to-jpg-section': '/png-to-jpg',
            'pdf-to-word-section': '/pdf-to-word',
            'pdf-to-powerpoint-section': '/pdf-to-powerpoint',
            'pdf-to-excel-section': '/pdf-to-excel',
            'pdf-split-section': '/pdf-split',
            'pdf-merge-section': '/pdf-merge',
            'landing-section': '/'
        };
        
        var newPath = pathMap[sectionId] || '/';
        if (window.history && window.history.pushState) {
            window.history.pushState({}, '', newPath);
            console.log('🔗 URL updated to:', newPath);
        }
        
        // Initialize component functionality
        console.log('🔧 INITIALIZING: Component functionality for =', sectionId);
        initializeComponent(sectionId);
    } else {
        console.log('🚨 EMERGENCY: FAILED - Section not found, falling back to home');
        showSectionById('landing-section');
    }
}

// Initialize component functionality based on section
function initializeComponent(sectionId) {
    try {
        switch(sectionId) {
            case 'jpg-to-png-section':
                if (typeof initJPGtoPNG === 'function') {
                    initJPGtoPNG();
                    console.log('✅ INIT: JPG to PNG Converter initialized successfully');
                }
                break;
            case 'currency-converter-section':
                if (typeof initCurrencyConverter === 'function') {
                    initCurrencyConverter();
                    console.log('✅ INIT: Currency Converter initialized');
                }
                break;
            case 'image-compressor-section':
                if (typeof initImageCompressor === 'function') {
                    initImageCompressor();
                    console.log('✅ INIT: Image Compressor initialized');
                }
                break;
            case 'qr-generator-section':
                if (typeof initQRGenerator === 'function') {
                    initQRGenerator();
                    console.log('✅ INIT: QR Generator initialized');
                }
                break;
            case 'word-counter-section':
                if (typeof initWordCounter === 'function') {
                    initWordCounter();
                    console.log('✅ INIT: Word Counter initialized');
                }
                break;
            case 'text-to-speech-section':
                if (typeof initTextToSpeech === 'function') {
                    initTextToSpeech();
                    console.log('✅ INIT: Text to Speech initialized');
                }
                break;
            case 'landing-section':
                console.log('ℹ️  INIT: No specific initialization needed for', sectionId);
                break;
            default:
                console.log('ℹ️  INIT: Default initialization for', sectionId);
        }
    } catch (error) {
        console.warn('⚠️  INIT: Error initializing', sectionId, ':', error.message);
    }
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    console.log('🔄 BROWSER: Navigation event detected');
    emergencyShowSection();
});

// Initialize routing on load
function initializeRouting() {
    emergencyShowSection();
}

console.log('📦 DEPLOYMENT SEPARATION: Old components ready for production, new components scheduled for Saturday');