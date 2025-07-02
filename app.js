// ConvertWiz - Multi-tool SaaS Application with Simple Navigation

class ConvertWizApp {
    constructor() {
        this.currentTool = null;
        this.init();
    }
    
    init() {
        // Handle navigation clicks using data-route attributes
        document.addEventListener('click', (e) => {
            const element = e.target.closest('[data-route]');
            if (element) {
                e.preventDefault();
                e.stopPropagation();
                const route = element.getAttribute('data-route');
                this.navigateTo(route);
                return false;
            }
        });
        
        // Show home page by default
        this.showPage('home');
    }
    
    navigateTo(route) {
        const pageMap = {
            '': 'home',
            'home': 'home',
            'jpg-to-png': 'jpg-png-converter',
            'currency': 'currency-converter', 
            'land': 'land-converter',
            'dp-resizer': 'dp-resizer',
            'word-counter': 'word-counter'
        };
        
        const page = pageMap[route] || 'home';
        this.showPage(page);
    }
    
    showPage(page) {
        // Clear previous tool instance
        if (this.currentTool && this.currentTool.destroy) {
            this.currentTool.destroy();
            this.currentTool = null;
        }
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.add('hidden');
        });
        
        // Show requested page
        const pageElement = document.getElementById(page);
        if (pageElement) {
            pageElement.classList.remove('hidden');
            pageElement.classList.add('fade-in');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Initialize tool if needed
            this.initializeTool(page);
        }
    }
    
    initializeTool(page) {
        try {
            switch(page) {
                case 'jpg-png-converter':
                    this.currentTool = new JPGtoPNGConverter();
                    break;
                case 'currency-converter':
                    this.currentTool = new CurrencyConverter();
                    break;
                case 'land-converter':
                    this.currentTool = new LandUnitConverter();
                    break;
                case 'dp-resizer':
                    this.currentTool = new InstagramDPResizer();
                    break;
                case 'word-counter':
                    this.currentTool = new WordCounter();
                    break;
            }
        } catch (error) {
            console.error('Error initializing tool:', error);
        }
    }
}

// Utility function to show section by ID and hide others
function showSection(sectionId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('fade-in');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Initialize tool if needed
        if (window.convertWizApp) {
            window.convertWizApp.initializeTool(sectionId);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.convertWizApp = new ConvertWizApp();
    
    // Additional navigation helpers for fallback
    document.querySelectorAll('[data-route]').forEach(element => {
        element.addEventListener('click', function(e) {
            if (!e.defaultPrevented) {
                e.preventDefault();
                const route = this.getAttribute('data-route');
                if (window.convertWizApp) {
                    window.convertWizApp.navigateTo(route);
                }
            }
        });
    });
});

// Backup initialization for immediate script execution
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (!window.convertWizApp) {
            window.convertWizApp = new ConvertWizApp();
        }
    });
} else {
    window.convertWizApp = new ConvertWizApp();
}