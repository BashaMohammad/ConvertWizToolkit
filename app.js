// ✅ UNIVERSAL SECTION NAVIGATION HANDLER FOR CONVERTWIZ

// Hide all tool sections and show the one with the given ID
function showSection(sectionId) {
  document.querySelectorAll('.tool-section').forEach(section => {
    section.style.display = 'none';
  });

  const target = document.getElementById(sectionId);
  if (target) {
    target.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Initialize tools based on section
    initializeTool(sectionId);
  }
}

// Tool initialization
let currentTool = null;

function initializeTool(sectionId) {
    // Clean up previous tool
    if (currentTool && currentTool.destroy) {
        currentTool.destroy();
        currentTool = null;
    }
    
    // Initialize new tool based on section ID
    try {
        switch(sectionId) {
            case 'jpg-to-png-section':
                currentTool = new JPGtoPNGConverter();
                break;
            case 'currency-converter-section':
                currentTool = new CurrencyConverter();
                break;
            case 'land-converter-section':
                currentTool = new LandUnitConverter();
                break;
            case 'dp-resizer-section':
                currentTool = new InstagramDPResizer();
                break;
            case 'word-counter-section':
                currentTool = new WordCounter();
                break;
            case 'distance-converter-section':
                currentTool = new DistanceConverter();
                break;
        }
    } catch (error) {
        console.warn('Tool initialization failed:', error);
    }
}

// Automatically bind all buttons with data-target attribute
document.addEventListener('DOMContentLoaded', () => {
    console.log('ConvertWiz navigation initialized');
    
    // Bind data-target buttons
    document.querySelectorAll('[data-target]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = button.getAttribute('data-target');
            showSection(targetId);
        });
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Show landing section on initial load
    showSection('landing-section');
});