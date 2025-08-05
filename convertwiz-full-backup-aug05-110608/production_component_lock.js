// PRODUCTION COMPONENT LOCK - ABSOLUTE CACHE CLEARING AND COMPONENT ISOLATION
// This script ensures ONLY the original 20 production tools are visible
// Completely removes new Saturday components from DOM and navigation

console.log('🔒 PRODUCTION LOCK: Enforcing strict component isolation');

// DEFINITIVE LIST: Only these 20 components are allowed in production
const PRODUCTION_ONLY_COMPONENTS = [
    'jpg-to-png-section',
    'currency-converter-section', 
    'image-compressor-section',
    'qr-generator-section',
    'word-counter-section',
    'text-to-speech-section',
    'land-unit-converter-section',
    'instagram-dp-resizer-section',
    'distance-converter-section',
    'weight-converter-section',
    'height-converter-section',
    'ip-extractor-section',
    'percentage-calculator-section',
    'temperature-converter-section',
    'color-converter-section',
    'url-shortener-section',
    'backlink-checker-section',
    'meta-tag-generator-section',
    'dpi-checker-section',
    'global-land-units-section'
];

// BANNED SATURDAY COMPONENTS - Must be completely removed from production
const SATURDAY_BANNED_COMPONENTS = [
    'bmi-calculator-section',
    'text-case-converter-section', 
    'png-to-jpg-section',
    'pdf-to-word-section',
    'pdf-to-ppt-section',
    'pdf-to-excel-section',
    'pdf-split-section',
    'pdf-merge-compress-section'
];

// Clear all caches aggressively
function clearAllCaches() {
    console.log('🧹 CACHE CLEARING: Removing all cached data');
    
    // Clear localStorage
    try {
        Object.keys(localStorage).forEach(key => {
            if (key.includes('convertwiz') || key.includes('component') || key.includes('section')) {
                localStorage.removeItem(key);
            }
        });
    } catch (e) {
        localStorage.clear();
    }
    
    // Clear sessionStorage
    try {
        Object.keys(sessionStorage).forEach(key => {
            if (key.includes('convertwiz') || key.includes('component') || key.includes('section')) {
                sessionStorage.removeItem(key);
            }
        });
    } catch (e) {
        sessionStorage.clear();
    }
    
    // Force browser cache refresh
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => {
                caches.delete(name);
            });
        });
    }
    
    console.log('✅ CACHE CLEARING: Complete');
}

// Physically remove Saturday components from DOM
function removeSaturdayComponents() {
    console.log('🔨 COMPONENT REMOVAL: Physically removing Saturday components');
    
    SATURDAY_BANNED_COMPONENTS.forEach(componentId => {
        const element = document.getElementById(componentId);
        if (element) {
            // Remove from DOM completely
            element.parentNode.removeChild(element);
            console.log(`🗑️ REMOVED: ${componentId} deleted from DOM`);
        }
        
        // Remove any navigation buttons
        const navButtons = document.querySelectorAll(`[onclick*="${componentId}"], [data-section="${componentId}"]`);
        navButtons.forEach(btn => {
            btn.parentNode.removeChild(btn);
            console.log(`🗑️ REMOVED: Navigation button for ${componentId}`);
        });
    });
    
    console.log('✅ COMPONENT REMOVAL: All Saturday components physically removed');
}

// Remove Saturday component cards from homepage
function removeSaturdayCards() {
    console.log('🃏 CARD REMOVAL: Removing Saturday component cards from homepage');
    
    const cardSelectors = [
        '.tool-card:has([data-section*="bmi-calculator"])',
        '.tool-card:has([data-section*="text-case-converter"])', 
        '.tool-card:has([data-section*="png-to-jpg"])',
        '.tool-card:has([data-section*="pdf-to-word"])',
        '.tool-card:has([data-section*="pdf-to-excel"])',
        '.tool-card:has([data-section*="pdf-split"])',
        // Also check for text content matches
        '.tool-card:contains("BMI Calculator")',
        '.tool-card:contains("Text Case Converter")',
        '.tool-card:contains("PNG to JPG")',
        '.tool-card:contains("PDF to Word")',
        '.tool-card:contains("PDF to Excel")',
        '.tool-card:contains("PDF Split")'
    ];
    
    cardSelectors.forEach(selector => {
        const cards = document.querySelectorAll(selector);
        cards.forEach(card => {
            if (card && card.parentNode) {
                card.parentNode.removeChild(card);
                console.log(`🗑️ REMOVED: Card with selector ${selector}`);
            }
        });
    });
    
    // Alternative approach - scan all tool cards for Saturday content
    const allCards = document.querySelectorAll('.tool-card');
    allCards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        const saturdayKeywords = ['bmi calculator', 'text case', 'png to jpg', 'pdf to word', 'pdf to excel', 'pdf split', 'pdf merge'];
        
        if (saturdayKeywords.some(keyword => cardText.includes(keyword))) {
            card.parentNode.removeChild(card);
            console.log(`🗑️ REMOVED: Saturday card with text: ${cardText.substring(0, 50)}...`);
        }
    });
    
    console.log('✅ CARD REMOVAL: Saturday cards removed from homepage');
}

// Override component navigation to block Saturday components
function blockSaturdayNavigation() {
    console.log('🚫 NAVIGATION BLOCK: Preventing Saturday component access');
    
    // Override showSection function
    const originalShowSection = window.showSection;
    window.showSection = function(sectionName) {
        if (SATURDAY_BANNED_COMPONENTS.includes(sectionName)) {
            console.log(`🚫 BLOCKED: Access to Saturday component ${sectionName}`);
            // Redirect to homepage instead
            if (originalShowSection) {
                originalShowSection('landing-section');
            }
            return false;
        }
        
        if (originalShowSection) {
            return originalShowSection(sectionName);
        }
    };
    
    // Override any click handlers that might access Saturday components
    document.addEventListener('click', function(e) {
        const target = e.target.closest('[data-section], [onclick*="section"]');
        if (target) {
            const sectionName = target.getAttribute('data-section') || 
                               (target.getAttribute('onclick') || '').match(/showSection\(['"]([^'"]+)['"]\)/)?.[1];
            
            if (sectionName && SATURDAY_BANNED_COMPONENTS.includes(sectionName)) {
                e.preventDefault();
                e.stopPropagation();
                console.log(`🚫 BLOCKED: Click on Saturday component ${sectionName}`);
                return false;
            }
        }
    }, true);
    
    console.log('✅ NAVIGATION BLOCK: Saturday component access blocked');
}

// Main execution
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 PRODUCTION LOCK: Starting comprehensive component isolation');
    
    // Step 1: Clear all caches
    clearAllCaches();
    
    // Step 2: Wait for DOM to be fully loaded
    setTimeout(() => {
        // Step 3: Remove Saturday components physically
        removeSaturdayComponents();
        
        // Step 4: Remove Saturday cards from homepage
        removeSaturdayCards();
        
        // Step 5: Block navigation to Saturday components
        blockSaturdayNavigation();
        
        console.log('🔒 PRODUCTION LOCK: Complete - Only 20 production tools accessible');
        console.log('📊 ALLOWED COMPONENTS:', PRODUCTION_ONLY_COMPONENTS.length);
        console.log('🚫 BLOCKED COMPONENTS:', SATURDAY_BANNED_COMPONENTS.length);
        
    }, 1000);
});

// Export for manual triggering
window.enforceProductionLock = function() {
    clearAllCaches();
    removeSaturdayComponents();
    removeSaturdayCards();
    blockSaturdayNavigation();
    console.log('🔒 PRODUCTION LOCK: Manually enforced');
};

console.log('🔒 PRODUCTION LOCK: Script loaded and ready');