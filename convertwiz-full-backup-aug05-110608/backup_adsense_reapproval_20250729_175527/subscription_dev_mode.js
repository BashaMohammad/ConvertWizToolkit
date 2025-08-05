// ConvertWiz Subscription Development Mode Controller
// This script disables subscription functionality in production while keeping all other features active

console.log('🔧 ConvertWiz Subscription Development Mode Active');

// Development/Production Environment Detection
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname.includes('replit') ||
                     window.location.search.includes('dev=true');

const isProduction = !isDevelopment;

console.log(`Environment: ${isDevelopment ? 'Development' : 'Production'}`);

// Subscription System Controller
class SubscriptionController {
    constructor() {
        this.developmentMode = isDevelopment;
        this.init();
    }

    init() {
        if (isProduction) {
            this.disableSubscriptionFeatures();
            this.showProductionNotice();
        } else {
            console.log('✅ Subscription system active in development mode');
        }
    }

    disableSubscriptionFeatures() {
        console.log('🚫 Disabling subscription features for production');
        
        // Disable subscription buttons
        const subscribeButtons = document.querySelectorAll('[onclick*="initiatePayment"], .subscribe-btn, .upgrade-btn');
        subscribeButtons.forEach(button => {
            button.disabled = true;
            button.innerHTML = 'Coming Soon';
            button.onclick = () => this.showComingSoonMessage();
            button.classList.add('opacity-50', 'cursor-not-allowed');
        });

        // Hide pricing plans in production
        const pricingCards = document.querySelectorAll('.pricing-card:not(:first-child)');
        pricingCards.forEach(card => {
            const comingSoonBadge = document.createElement('div');
            comingSoonBadge.className = 'absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg';
            comingSoonBadge.innerHTML = '<span class="text-white font-bold text-lg">Coming Soon</span>';
            card.style.position = 'relative';
            card.appendChild(comingSoonBadge);
        });

        // Redirect subscription page to homepage in production
        if (window.location.pathname.includes('subscribe')) {
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
        }
    }

    showProductionNotice() {
        const notice = document.createElement('div');
        notice.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notice.innerHTML = `
            <div class="flex items-center space-x-2">
                <span>🔧</span>
                <span>Subscription features in development</span>
            </div>
        `;
        document.body.appendChild(notice);
        
        setTimeout(() => {
            notice.remove();
        }, 5000);
    }

    showComingSoonMessage() {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.innerHTML = 'Subscription features coming soon!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Allow development access
    enableDevelopmentAccess() {
        if (isDevelopment) {
            console.log('🔓 Development access enabled');
            return true;
        }
        return false;
    }
}

// Initialize subscription controller
document.addEventListener('DOMContentLoaded', () => {
    window.subscriptionController = new SubscriptionController();
});

// Export for other scripts
window.SubscriptionController = SubscriptionController;
window.isDevelopmentMode = isDevelopment;
window.isProductionMode = isProduction;