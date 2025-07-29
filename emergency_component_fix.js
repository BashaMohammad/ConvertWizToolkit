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
        target.style.display = 'block !important';
        target.style.visibility = 'visible';
        target.style.opacity = '1';
        target.classList.add('active');
        console.log('🚨 EMERGENCY: SUCCESS - Section switched to =', sectionId);
        console.log('🚨 EMERGENCY: Target element found with content length =', target.innerHTML.length);
        
        // Initialize component functionality based on section
        initializeComponentFunctionality(sectionId);
        
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

// Component initialization function
function initializeComponentFunctionality(sectionId) {
    console.log('🔧 INITIALIZING: Component functionality for =', sectionId);
    
    switch(sectionId) {
        case 'jpg-to-png-section':
            if (typeof JPGtoPNGConverter !== 'undefined') {
                setTimeout(() => {
                    try {
                        new JPGtoPNGConverter();
                        console.log('✅ INIT: JPG to PNG Converter initialized successfully');
                    } catch (e) {
                        console.error('❌ INIT ERROR: JPG to PNG Converter failed:', e.message);
                    }
                }, 100);
            } else {
                console.error('❌ INIT: JPGtoPNGConverter class not found');
            }
            break;
        case 'currency-converter-section':
            if (typeof CurrencyConverter !== 'undefined') {
                setTimeout(() => new CurrencyConverter(), 100);
                console.log('✅ INIT: Currency Converter initialized');
            }
            break;
        case 'land-converter-section':
            if (typeof LandUnitConverter !== 'undefined') {
                setTimeout(() => new LandUnitConverter(), 100);
                console.log('✅ INIT: Land Unit Converter initialized');
            }
            break;
        case 'dp-resizer-section':
            if (typeof InstagramDPResizer !== 'undefined') {
                setTimeout(() => {
                    try {
                        new InstagramDPResizer();
                        console.log('✅ INIT: DP Resizer initialized successfully');
                    } catch (e) {
                        console.error('❌ INIT ERROR: DP Resizer failed:', e.message);
                    }
                }, 100);
            } else {
                console.error('❌ INIT: InstagramDPResizer class not found');
            }
            break;
        case 'word-counter-section':
            if (typeof WordCounter !== 'undefined') {
                setTimeout(() => new WordCounter(), 100);
                console.log('✅ INIT: Word Counter initialized');
            }
            break;
        case 'distance-converter-section':
            if (typeof DistanceConverter !== 'undefined') {
                setTimeout(() => new DistanceConverter(), 100);
                console.log('✅ INIT: Distance Converter initialized');
            }
            break;
        case 'weight-converter-section':
            if (typeof WeightConverter !== 'undefined') {
                setTimeout(() => new WeightConverter(), 100);
                console.log('✅ INIT: Weight Converter initialized');
            }
            break;
        case 'height-converter-section':
            if (typeof HeightConverter !== 'undefined') {
                setTimeout(() => new HeightConverter(), 100);
                console.log('✅ INIT: Height Converter initialized');
            }
            break;
        case 'color-converter-section':
            if (typeof ColorConverter !== 'undefined') {
                setTimeout(() => new ColorConverter(), 100);
                console.log('✅ INIT: Color Converter initialized');
            }
            break;
        case 'percentage-calculator-section':
            if (typeof PercentageCalculator !== 'undefined') {
                setTimeout(() => new PercentageCalculator(), 100);
                console.log('✅ INIT: Percentage Calculator initialized');
            }
            break;
        case 'temperature-converter-section':
            if (typeof TemperatureConverter !== 'undefined') {
                setTimeout(() => new TemperatureConverter(), 100);
                console.log('✅ INIT: Temperature Converter initialized');
            }
            break;
        case 'image-compressor-section':
            if (typeof ImageCompressor !== 'undefined') {
                setTimeout(() => new ImageCompressor(), 100);
                console.log('✅ INIT: Image Compressor initialized');
            }
            break;
        case 'ip-extractor-section':
            if (typeof IPAddressExtractor !== 'undefined') {
                setTimeout(() => {
                    try {
                        new IPAddressExtractor();
                        console.log('✅ INIT: IP Address Extractor initialized successfully');
                    } catch (e) {
                        console.error('❌ INIT ERROR: IP Address Extractor failed:', e.message);
                    }
                }, 100);
            } else {
                console.error('❌ INIT: IPAddressExtractor class not found');
            }
            break;
        case 'qr-generator-section':
            if (typeof QRCodeGenerator !== 'undefined') {
                setTimeout(() => {
                    try {
                        new QRCodeGenerator();
                        console.log('✅ INIT: QR Code Generator initialized successfully');
                    } catch (e) {
                        console.error('❌ INIT ERROR: QR Code Generator failed:', e.message);
                    }
                }, 100);
            } else {
                console.error('❌ INIT: QRCodeGenerator class not found');
            }
            break;
        case 'text-to-speech-section':
            if (typeof TextToSpeechConverter !== 'undefined') {
                setTimeout(() => {
                    try {
                        new TextToSpeechConverter();
                        console.log('✅ INIT: Text to Speech Converter initialized successfully');
                    } catch (e) {
                        console.error('❌ INIT ERROR: Text to Speech Converter failed:', e.message);
                    }
                }, 100);
            } else {
                console.error('❌ INIT: TextToSpeechConverter class not found');
            }
            break;
        case 'dpi-checker-section':
            if (typeof DPIChecker !== 'undefined') {
                setTimeout(() => {
                    try {
                        new DPIChecker();
                        console.log('✅ INIT: DPI Checker initialized successfully');
                    } catch (e) {
                        console.error('❌ INIT ERROR: DPI Checker failed:', e.message);
                    }
                }, 100);
            } else {
                console.error('❌ INIT: DPIChecker class not found');
            }
            break;
        case 'url-shortener-section':
            if (typeof URLShortener !== 'undefined') {
                setTimeout(() => {
                    try {
                        new URLShortener();
                        console.log('✅ INIT: URL Shortener initialized successfully');
                    } catch (e) {
                        console.error('❌ INIT ERROR: URL Shortener failed:', e.message);
                    }
                }, 100);
            } else {
                console.error('❌ INIT: URLShortener class not found');
            }
            break;
        case 'meta-tag-generator-section':
            if (typeof MetaTagGenerator !== 'undefined') {
                setTimeout(() => {
                    try {
                        new MetaTagGenerator();
                        console.log('✅ INIT: Meta Tag Generator initialized successfully');
                    } catch (e) {
                        console.error('❌ INIT ERROR: Meta Tag Generator failed:', e.message);
                    }
                }, 100);
            } else {
                console.error('❌ INIT: MetaTagGenerator class not found');
            }
            break;
        case 'backlink-checker-section':
            if (typeof BacklinkChecker !== 'undefined') {
                setTimeout(() => {
                    try {
                        new BacklinkChecker();
                        console.log('✅ INIT: Backlink Checker initialized successfully');
                    } catch (e) {
                        console.error('❌ INIT ERROR: Backlink Checker failed:', e.message);
                    }
                }, 100);
            } else {
                console.error('❌ INIT: BacklinkChecker class not found');
            }
            break;
        default:
            console.log('ℹ️  INIT: No specific initialization needed for', sectionId);
    }
}

console.log('🚨 EMERGENCY FIX: System ready with navigation');