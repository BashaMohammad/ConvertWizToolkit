// ConvertWiz - Simple Navigation System

// Global navigation function
function navigateToPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('fade-in');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Initialize tools
        initializeToolForPage(pageId);
    }
}

// Initialize tool instances
let currentTool = null;

function initializeToolForPage(pageId) {
    // Clean up previous tool
    if (currentTool && currentTool.destroy) {
        currentTool.destroy();
        currentTool = null;
    }
    
    // Initialize new tool
    try {
        switch(pageId) {
            case 'jpg-png-converter':
                currentTool = new JPGtoPNGConverter();
                break;
            case 'currency-converter':
                currentTool = new CurrencyConverter();
                break;
            case 'land-converter':
                currentTool = new LandUnitConverter();
                break;
            case 'dp-resizer':
                currentTool = new InstagramDPResizer();
                break;
            case 'word-counter':
                currentTool = new WordCounter();
                break;
        }
    } catch (error) {
        console.error('Error initializing tool:', error);
    }
}

// Navigation mapping
const routeMap = {
    '': 'home',
    'home': 'home',
    'jpg-to-png': 'jpg-png-converter',
    'currency': 'currency-converter', 
    'land': 'land-converter',
    'dp-resizer': 'dp-resizer',
    'word-counter': 'word-counter'
};

// Main navigation handler
function handleNavigation(route) {
    const pageId = routeMap[route] || 'home';
    navigateToPage(pageId);
}

// App class for compatibility
class ConvertWizApp {
    constructor() {
        this.init();
    }
    
    init() {
        // Show home page by default
        navigateToPage('home');
    }
    
    navigateTo(route) {
        handleNavigation(route);
    }
    
    showPage(pageId) {
        navigateToPage(pageId);
    }
    
    initializeTool(pageId) {
        initializeToolForPage(pageId);
    }
}

// Simple event delegation for navigation
document.addEventListener('click', function(e) {
    const routeElement = e.target.closest('[data-route]');
    if (routeElement) {
        e.preventDefault();
        e.stopPropagation();
        const route = routeElement.getAttribute('data-route');
        handleNavigation(route);
        return false;
    }
});

// Initialize when DOM is ready
function initializeApp() {
    // Create app instance
    window.convertWizApp = new ConvertWizApp();
    
    // Add manual event listeners as backup
    const routeElements = document.querySelectorAll('[data-route]');
    routeElements.forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            const route = this.getAttribute('data-route');
            handleNavigation(route);
        });
    });
    
    console.log('ConvertWiz navigation initialized');
}

// Multiple initialization approaches
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Also initialize on window load as final fallback
window.addEventListener('load', function() {
    if (!window.convertWizApp) {
        initializeApp();
    }
});