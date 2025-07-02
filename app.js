// ConvertWiz - Multi-tool SaaS Application Router

class ConvertWizApp {
    constructor() {
        this.routes = {
            '': 'home',
            'home': 'home',
            'jpg-to-png': 'jpg-png-converter',
            'currency': 'currency-converter', 
            'land': 'land-converter',
            'dp-resizer': 'dp-resizer',
            'word-counter': 'word-counter'
        };
        
        this.currentTool = null;
        this.init();
    }
    
    init() {
        // Handle initial route
        this.handleRoute();
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Listen for route changes
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            // Handle any element with data-route attribute
            const element = e.target.closest('[data-route]');
            if (element) {
                e.preventDefault();
                e.stopPropagation();
                const route = element.getAttribute('data-route');
                this.navigateTo(route);
                return false;
            }
        });
    }
    
    navigateTo(route) {
        // Use hash-based routing for compatibility with simple servers
        if (route.startsWith('/')) {
            window.location.hash = route.substring(1);
        } else {
            window.location.hash = route;
        }
        this.handleRoute();
    }
    
    handleRoute() {
        // Get route from hash or pathname
        let route = window.location.hash.substring(1) || window.location.pathname.substring(1) || '';
        
        // Clean up route
        if (route.startsWith('/')) {
            route = route.substring(1);
        }
        
        const page = this.routes[route] || 'home';
        
        // Clear previous tool instance
        if (this.currentTool && this.currentTool.destroy) {
            this.currentTool.destroy();
        }
        
        this.showPage(page);
    }
    
    showPage(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.add('hidden');
        });
        
        // Show requested page
        const pageElement = document.getElementById(page);
        if (pageElement) {
            pageElement.classList.remove('hidden');
            pageElement.classList.add('fade-in');
            
            // Initialize tool if needed
            this.initializeTool(page);
        }
    }
    
    initializeTool(page) {
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
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.convertWizApp = new ConvertWizApp();
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