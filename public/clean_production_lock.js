// CLEAN PRODUCTION LOCK - DISABLE SATURDAY COMPONENTS (NO INFINITE LOOPS)
// Makes Saturday components visible but disabled with "Coming Soon" badges

console.log('🔒 CLEAN PRODUCTION LOCK: Starting Saturday component disabling');

// Saturday components to disable (visible but not accessible)
const SATURDAY_COMPONENTS = [
    'bmi-calculator-section',
    'text-case-converter-section', 
    'png-to-jpg-section',
    'pdf-to-word-section',
    'pdf-to-excel-section',
    'pdf-split-section',
    'pdf-merge-compress-section'
];

// Disable Saturday components - keep visible but make non-functional
function disableSaturdayComponents() {
    console.log('🔒 DISABLING: Saturday components - visible but not accessible');
    
    SATURDAY_COMPONENTS.forEach(componentId => {
        const element = document.getElementById(componentId);
        if (element) {
            // Add disabled styling but keep visible
            element.style.opacity = '0.7';
            element.style.pointerEvents = 'none';
            element.style.filter = 'grayscale(30%)';
            element.setAttribute('data-coming-soon', 'true');
            
            // Add "Coming Soon" overlay
            const overlay = document.createElement('div');
            overlay.className = 'absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50';
            overlay.innerHTML = `
                <div class="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg">
                    🚧 Coming Soon - Under Development
                </div>
            `;
            element.style.position = 'relative';
            element.appendChild(overlay);
            
            console.log(`🔒 DISABLED: ${componentId}`);
        }
    });
}

// Disable Saturday component cards on homepage
function disableSaturdayCards() {
    console.log('🔒 DISABLING: Saturday component cards on homepage');
    
    const allCards = document.querySelectorAll('.tool-card');
    allCards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        const saturdayKeywords = [
            'bmi calculator', 'text case', 'png to jpg', 
            'pdf to word', 'pdf to excel', 'pdf split', 'pdf merge'
        ];
        
        if (saturdayKeywords.some(keyword => cardText.includes(keyword))) {
            // Add disabled styling but keep fully visible (no opacity/grayscale changes)
            card.style.position = 'relative';
            
            // Disable the button
            const button = card.querySelector('button');
            if (button && !button.disabled) {
                button.disabled = true;
                button.style.cursor = 'not-allowed';
                button.setAttribute('title', 'Coming Soon - Feature Under Development');
                
                // Prevent click events
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    alert('🚧 This feature is coming soon!\n\nWe are currently working on this tool and it will be available shortly.');
                    return false;
                });
            }
            
            console.log(`🔒 DISABLED: Card for ${saturdayKeywords.find(k => cardText.includes(k))}`);
        }
    });
}

// Block navigation to Saturday components
function blockSaturdayNavigation() {
    console.log('🚫 BLOCKING: Navigation to Saturday components');
    
    // Override showSection function if it exists
    if (window.showSection) {
        const originalShowSection = window.showSection;
        window.showSection = function(sectionName) {
            if (SATURDAY_COMPONENTS.includes(sectionName)) {
                console.log(`🚫 BLOCKED: Access to ${sectionName}`);
                alert('🚧 This feature is coming soon!\n\nWe are currently working on this tool and it will be available shortly.');
                return false;
            }
            return originalShowSection(sectionName);
        };
    }
    
    // Block clicks on disabled components
    document.addEventListener('click', function(e) {
        const target = e.target.closest('[data-target]');
        if (target) {
            const sectionName = target.getAttribute('data-target');
            if (SATURDAY_COMPONENTS.includes(sectionName)) {
                e.preventDefault();
                e.stopPropagation();
                alert('🚧 This feature is coming soon!\n\nWe are currently working on this tool and it will be available shortly.');
                return false;
            }
        }
    }, true);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        disableSaturdayComponents();
        disableSaturdayCards();
        blockSaturdayNavigation();
        
        console.log('✅ PRODUCTION LOCK: Saturday components disabled but visible');
        console.log('📊 COMPONENT STATUS: 20 production tools active, 8 Saturday tools disabled');
    }, 1500); // Delay to ensure all other scripts have loaded
});

console.log('🔒 CLEAN PRODUCTION LOCK: Script loaded and ready');