// ConvertWiz Component Visibility Control
// Hides new Saturday components from end users until release date

console.log('🔒 Component Visibility Control - Hiding Saturday components from users');

// Define Saturday release components that should be hidden
const SATURDAY_COMPONENTS = [
    'bmi-calculator-section',
    'text-case-converter-section', 
    'png-to-jpg-section',
    'pdf-to-word-section',
    'pdf-to-powerpoint-section',
    'pdf-to-excel-section',
    'pdf-split-section',
    'pdf-merge-section'
];

// Function to hide Saturday components from end users
function hideSaturdayComponents() {
    const today = new Date();
    const isSaturday = today.getDay() === 6; // Saturday = 6
    
    // Only hide components if it's NOT Saturday
    if (!isSaturday) {
        console.log('📅 Pre-Saturday: Hiding new components from end users');
        
        SATURDAY_COMPONENTS.forEach(componentId => {
            const component = document.getElementById(componentId);
            if (component) {
                // Hide the component completely from users
                component.style.display = 'none !important';
                component.style.visibility = 'hidden';
                component.setAttribute('data-saturday-release', 'true');
                console.log('🔒 Hidden component:', componentId);
            }
        });
        
        // Also hide corresponding tool cards in the main grid
        hideSaturdayToolCards();
        
        console.log('✅ All Saturday components hidden from end users');
    } else {
        console.log('🎯 Saturday detected: All components visible');
    }
}

// Hide tool cards for Saturday components from the main landing page
function hideSaturdayToolCards() {
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        const targetSection = card.getAttribute('data-target');
        
        if (SATURDAY_COMPONENTS.includes(targetSection)) {
            card.style.display = 'none !important';
            card.setAttribute('data-hidden-until-saturday', 'true');
            console.log('🔒 Hidden tool card for:', targetSection);
        }
    });
}

// Initialize visibility control on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure all components are loaded
    setTimeout(() => {
        hideSaturdayComponents();
    }, 100);
});

// Also run immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    setTimeout(() => {
        hideSaturdayComponents();
    }, 100);
}

console.log('🚀 Component visibility control ready - Saturday components will be hidden from users');