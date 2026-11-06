// Real-time blog view tracking for individual articles
(function() {
    'use strict';
    
    // Get article ID from current page URL
    const articleId = window.location.pathname.split('/').pop();
    
    // Track view when page loads
    async function trackView() {
        try {
            // Increment view count on server
            const response = await fetch(`/api/blog/views/${articleId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`📈 View tracked for ${articleId}: ${data.views} total views`);
                
                // Update view count display if element exists
                const viewCountElement = document.querySelector('.view-count');
                if (viewCountElement) {
                    viewCountElement.textContent = `${data.views} views`;
                }
            }
        } catch (error) {
            console.log('View tracking offline - using fallback count');
        }
    }
    
    // Track view when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackView);
    } else {
        trackView();
    }
})();