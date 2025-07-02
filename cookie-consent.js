// Cookie Consent Banner functionality
class CookieConsent {
    constructor() {
        this.consentKey = 'convertwiz_cookie_consent';
        this.init();
    }

    init() {
        // Check if consent has already been given
        if (!this.hasConsent()) {
            this.showBanner();
        }
    }

    hasConsent() {
        return localStorage.getItem(this.consentKey) === 'true';
    }

    showBanner() {
        // Create banner HTML
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'fixed bottom-0 left-0 right-0 bg-purple-600 text-white p-4 shadow-2xl z-50 transform translate-y-full transition-transform duration-300';
        
        banner.innerHTML = `
            <div class="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex items-start sm:items-center gap-3">
                    <i class="fas fa-cookie-bite text-xl flex-shrink-0 mt-1 sm:mt-0"></i>
                    <p class="text-sm sm:text-base">
                        We use cookies to ensure the best browsing experience. By using ConvertWiz, you accept our cookie policy.
                    </p>
                </div>
                <button id="accept-cookies" class="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex-shrink-0">
                    Accept
                </button>
            </div>
        `;

        // Add banner to page
        document.body.appendChild(banner);

        // Show banner with animation
        setTimeout(() => {
            banner.classList.remove('translate-y-full');
        }, 100);

        // Add click handler for accept button
        const acceptButton = document.getElementById('accept-cookies');
        acceptButton.addEventListener('click', () => this.acceptCookies());
    }

    acceptCookies() {
        // Store consent in localStorage
        localStorage.setItem(this.consentKey, 'true');
        
        // Hide banner with animation
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.add('translate-y-full');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }
}

// Initialize cookie consent when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CookieConsent();
});