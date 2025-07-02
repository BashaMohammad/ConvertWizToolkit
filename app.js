// ConvertWiz - Multi-tool SaaS Application Router

class ConvertWizApp {
    constructor() {
        this.routes = {
            '/': 'home',
            '/jpg-to-png': 'jpg-png-converter',
            '/currency': 'currency-converter', 
            '/land': 'land-converter',
            '/dp-resizer': 'dp-resizer',
            '/word-counter': 'word-counter'
        };
        
        this.currentTool = null;
        this.init();
    }
    
    init() {
        // Handle initial route
        this.handleRoute();
        
        // Listen for route changes
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-route]')) {
                e.preventDefault();
                const route = e.target.getAttribute('data-route');
                this.navigateTo(route);
            }
        });
    }
    
    navigateTo(route) {
        history.pushState(null, null, route);
        this.handleRoute();
    }
    
    handleRoute() {
        const path = window.location.pathname;
        const page = this.routes[path] || 'home';
        
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
    new ConvertWizApp();
});