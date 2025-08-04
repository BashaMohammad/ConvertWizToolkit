// DEPLOYMENT SEPARATION LOGIC
// This file manages which components are deployed immediately vs Saturday

// OLD COMPONENTS (Deploy to production immediately)
const OLD_COMPONENTS = [
    'jpg-to-png-section',
    'currency-converter-section',
    'land-converter-section',
    'dp-resizer-section',
    'word-counter-section',
    'distance-converter-section',
    'weight-converter-section', 
    'height-converter-section',
    'ip-extractor-section',
    'qr-generator-section',
    'percentage-calculator-section',
    'temperature-converter-section',
    'color-converter-section',
    'image-compressor-section',
    'text-to-speech-section',
    'backlink-checker-section',
    'meta-tag-generator-section',
    'dpi-checker-section',
    'url-shortener-section'
];

// NEW COMPONENTS (Deploy on Saturday only)
const NEW_COMPONENTS = [
    'bmi-calculator-section',
    'text-case-converter-section', 
    'png-to-jpg-section',
    'pdf-to-word-section',
    'pdf-to-ppt-section',
    'pdf-to-excel-section', 
    'pdf-split-section',
    'pdf-merge-compress-section'
];

// Function to check if component should be visible in production
function isProductionReady(componentId) {
    // For immediate deployment - only show old components
    return OLD_COMPONENTS.includes(componentId);
}

// Function to hide new components in production
function hideNewComponentsForProduction() {
    if (window.location.hostname === 'convertwiz.in' && !window.location.search.includes('preview=true')) {
        NEW_COMPONENTS.forEach(componentId => {
            const element = document.getElementById(componentId);
            if (element) {
                element.style.display = 'none';
                // Also hide from navigation if exists
                const navButton = document.querySelector(`[data-target="${componentId}"]`);
                if (navButton) {
                    navButton.style.display = 'none';
                }
            }
        });
        
        // Hide new sections from homepage tool grid
        const newToolCards = [
            '.bmi-calculator-card',
            '.text-case-converter-card',
            '.png-to-jpg-card',
            '.pdf-tools-section'
        ];
        
        newToolCards.forEach(selector => {
            const cards = document.querySelectorAll(selector);
            cards.forEach(card => {
                if (card) card.style.display = 'none';
            });
        });
        
        console.log('🚀 PRODUCTION MODE: New components hidden until Saturday deployment');
    }
}

// Initialize separation on DOM load
document.addEventListener('DOMContentLoaded', function() {
    hideNewComponentsForProduction();
});

console.log('📦 DEPLOYMENT SEPARATION: Old components ready for production, new components scheduled for Saturday');