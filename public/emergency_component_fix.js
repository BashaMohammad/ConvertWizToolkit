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
        
        // Production URL mapping - Only established tools for immediate deployment
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
            'png-to-jpg-section': '/png-to-jpg',
            'text-case-converter-section': '/text-case-converter',
            'bmi-calculator-section': '/bmi-calculator',
            'pdf-to-word-section': '/pdf-to-word',
            'pdf-to-powerpoint-section': '/pdf-to-powerpoint',
            'pdf-to-excel-section': '/pdf-to-excel',
            'pdf-split-section': '/pdf-split',
            'pdf-merge-section': '/pdf-merge',
            'wifi-scanner-section': '/wifi-scanner',
            'signal-strength-section': '/signal-strength',
            'landing-section': '/'
        };
        
        // Saturday components are handled separately and hidden from users
        // TEMPORARILY DISABLED FOR PDF TOOLS TESTING
        var saturdayComponents = [
            // 'pdf-to-word-section', 'pdf-to-powerpoint-section', 'pdf-to-excel-section',
            // 'pdf-split-section', 'pdf-merge-section'
        ];
        
        // Check if component is Saturday release and should be hidden
        if (saturdayComponents.includes(sectionId)) {
            var today = new Date();
            var isSaturday = today.getDay() === 6;
            if (!isSaturday) {
                console.log('🔒 Saturday component blocked from user access:', sectionId);
                showSectionById('landing-section');
                return;
            }
        }
        
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
        console.log('🔧 INITIALIZING: Component functionality for =', sectionId);
        
        // Ensure tools.js is loaded
        if (!window.toolsLoaded) {
            console.warn('⚠️ INIT: tools.js not loaded yet, retrying...');
            setTimeout(() => initializeComponent(sectionId), 100);
            return;
        }
        
        switch(sectionId) {
            case 'jpg-to-png-section':
                if (typeof initJPGtoPNG === 'function') {
                    initJPGtoPNG();
                    console.log('✅ INIT: JPG to PNG Converter initialized successfully');
                } else {
                    console.warn('⚠️ INIT: initJPGtoPNG function not found');
                }
                break;
                
            case 'currency-converter-section':
                if (typeof initCurrencyConverter === 'function') {
                    initCurrencyConverter();
                    console.log('✅ INIT: Currency Converter initialized');
                } else {
                    console.warn('⚠️ INIT: initCurrencyConverter function not found');
                }
                break;
                
            case 'land-converter-section':
                if (typeof initLandConverter === 'function') {
                    initLandConverter();
                    console.log('✅ INIT: Land Converter initialized');
                } else {
                    console.warn('⚠️ INIT: initLandConverter function not found');
                }
                break;
                
            case 'dp-resizer-section':
                if (typeof initDPResizer === 'function') {
                    initDPResizer();
                    console.log('✅ INIT: DP Resizer initialized');
                } else {
                    console.warn('⚠️ INIT: initDPResizer function not found');
                }
                break;
                
            case 'word-counter-section':
                if (typeof initWordCounter === 'function') {
                    initWordCounter();
                    console.log('✅ INIT: Word Counter initialized');
                } else {
                    console.warn('⚠️ INIT: initWordCounter function not found');
                }
                break;
                
            case 'distance-converter-section':
                if (typeof initDistanceConverter === 'function') {
                    initDistanceConverter();
                    console.log('✅ INIT: Distance Converter initialized');
                } else {
                    console.warn('⚠️ INIT: initDistanceConverter function not found');
                }
                break;
                
            case 'weight-converter-section':
                if (typeof initWeightConverter === 'function') {
                    initWeightConverter();
                    console.log('✅ INIT: Weight Converter initialized');
                } else {
                    console.warn('⚠️ INIT: initWeightConverter function not found');
                }
                break;
                
            case 'height-converter-section':
                if (typeof initHeightConverter === 'function') {
                    initHeightConverter();
                    console.log('✅ INIT: Height Converter initialized');
                } else {
                    console.warn('⚠️ INIT: initHeightConverter function not found');
                }
                break;
                
            case 'ip-extractor-section':
                if (typeof initIPExtractor === 'function') {
                    initIPExtractor();
                    console.log('✅ INIT: IP Extractor initialized');
                } else {
                    console.warn('⚠️ INIT: initIPExtractor function not found');
                }
                break;
                
            case 'qr-generator-section':
                if (typeof initQRGenerator === 'function') {
                    initQRGenerator();
                    console.log('✅ INIT: QR Generator initialized');
                } else {
                    console.warn('⚠️ INIT: initQRGenerator function not found');
                }
                break;
                
            case 'percentage-calculator-section':
                if (typeof initPercentageCalculator === 'function') {
                    initPercentageCalculator();
                    console.log('✅ INIT: Percentage Calculator initialized');
                } else {
                    console.warn('⚠️ INIT: initPercentageCalculator function not found');
                }
                break;
                
            case 'temperature-converter-section':
                if (typeof initTemperatureConverter === 'function') {
                    initTemperatureConverter();
                    console.log('✅ INIT: Temperature Converter initialized');
                } else {
                    console.warn('⚠️ INIT: initTemperatureConverter function not found');
                }
                break;
                
            case 'color-converter-section':
                if (typeof initColorConverter === 'function') {
                    initColorConverter();
                    console.log('✅ INIT: Color Converter initialized');
                } else {
                    console.warn('⚠️ INIT: initColorConverter function not found');
                }
                break;
                
            case 'image-compressor-section':
                if (typeof initImageCompressor === 'function') {
                    initImageCompressor();
                    console.log('✅ INIT: Image Compressor initialized');
                } else {
                    console.warn('⚠️ INIT: initImageCompressor function not found');
                }
                break;
                
            case 'text-to-speech-section':
                if (typeof initTextToSpeech === 'function') {
                    initTextToSpeech();
                    console.log('✅ INIT: Text to Speech initialized');
                } else {
                    console.warn('⚠️ INIT: initTextToSpeech function not found');
                }
                break;
                
            case 'url-shortener-section':
                if (typeof initURLShortener === 'function') {
                    initURLShortener();
                    console.log('✅ INIT: URL Shortener initialized');
                } else {
                    console.warn('⚠️ INIT: initURLShortener function not found');
                }
                break;
                
            case 'backlink-checker-section':
                if (typeof initBacklinkChecker === 'function') {
                    initBacklinkChecker();
                    console.log('✅ INIT: Backlink Checker initialized');
                } else {
                    console.warn('⚠️ INIT: initBacklinkChecker function not found');
                }
                break;
                
            case 'meta-tag-generator-section':
                if (typeof initMetaTagGenerator === 'function') {
                    initMetaTagGenerator();
                    console.log('✅ INIT: Meta Tag Generator initialized');
                } else {
                    console.warn('⚠️ INIT: initMetaTagGenerator function not found');
                }
                break;
                
            case 'dpi-checker-section':
                if (typeof initDPIChecker === 'function') {
                    initDPIChecker();
                    console.log('✅ INIT: DPI Checker initialized');
                } else {
                    console.warn('⚠️ INIT: initDPIChecker function not found');
                }
                break;
                
            case 'global-land-units-section':
                if (typeof initGlobalLandUnits === 'function') {
                    initGlobalLandUnits();
                    console.log('✅ INIT: Global Land Units initialized');
                } else {
                    console.warn('⚠️ INIT: initGlobalLandUnits function not found');
                }
                break;
                
            case 'png-to-jpg-section':
                if (typeof initSaturdayPngToJpg === 'function') {
                    initSaturdayPngToJpg();
                    console.log('✅ INIT: PNG to JPG Converter initialized');
                } else {
                    console.warn('⚠️ INIT: initSaturdayPngToJpg function not found');
                }
                break;
                
            case 'text-case-converter-section':
                if (typeof initSaturdayTextCaseConverter === 'function') {
                    initSaturdayTextCaseConverter();
                    console.log('✅ INIT: Text Case Converter initialized');
                } else {
                    console.warn('⚠️ INIT: initSaturdayTextCaseConverter function not found');
                }
                break;
                
            case 'bmi-calculator-section':
                if (typeof initBMICalculator === 'function') {
                    initBMICalculator();
                    console.log('✅ INIT: BMI Calculator initialized');
                } else {
                    console.warn('⚠️ INIT: initBMICalculator function not found');
                }
                break;
                
            case 'pdf-to-word-section':
                // PDF to Word initialization is handled in tools.js with duplicate prevention
                console.log('✅ INIT: PDF to Word handled by tools.js');
                break;
                break;
                
            case 'pdf-to-powerpoint-section':
                if (typeof initPDFToPowerPoint === 'function') {
                    initPDFToPowerPoint();
                    console.log('✅ INIT: PDF to PowerPoint initialized');
                } else {
                    console.warn('⚠️ INIT: initPDFToPowerPoint function not found');
                }
                break;
                
            case 'pdf-to-excel-section':
                if (typeof initPDFToExcel === 'function') {
                    initPDFToExcel();
                    console.log('✅ INIT: PDF to Excel initialized');
                } else {
                    console.warn('⚠️ INIT: initPDFToExcel function not found');
                }
                break;
                break;
                
            case 'pdf-split-section':
                if (typeof initPDFSplit === 'function') {
                    initPDFSplit();
                    console.log('✅ INIT: PDF Split initialized');
                } else {
                    console.warn('⚠️ INIT: initPDFSplit function not found');
                }
                break;
                break;
                
            case 'pdf-merge-section':
                if (typeof initPDFMerge === 'function') {
                    initPDFMerge();
                    console.log('✅ INIT: PDF Merge initialized');
                } else {
                    console.warn('⚠️ INIT: initPDFMerge function not found');
                }
                break;
                
            case 'pdf-to-powerpoint-section':
                if (typeof initPDFToPowerPoint === 'function') {
                    initPDFToPowerPoint();
                    console.log('✅ INIT: PDF to PowerPoint initialized');
                } else {
                    console.warn('⚠️ INIT: initPDFToPowerPoint function not found');
                }
                break;
                break;
                
            case 'landing-section':
                console.log('ℹ️ INIT: No specific initialization needed for', sectionId);
                break;
                
            default:
                console.log('ℹ️ INIT: Default initialization attempted for', sectionId);
                // Try to initialize anyway if the function exists
                var initFunctionName = 'init' + sectionId.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join('').replace('Section', '');
                
                if (typeof window[initFunctionName] === 'function') {
                    window[initFunctionName]();
                    console.log('✅ INIT: Dynamic initialization successful for', sectionId);
                }
        }
    } catch (error) {
        console.error('❌ INIT: Error initializing', sectionId, ':', error.message);
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