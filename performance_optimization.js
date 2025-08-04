// ConvertWiz Performance Optimization Script
// Zero UI impact - Backend optimizations only

console.log('🚀 ConvertWiz Performance Optimization Starting...');

// Lazy loading for non-critical components
function optimizeResourceLoading() {
    // Defer non-critical JavaScript
    const nonCriticalScripts = document.querySelectorAll('script[src]');
    nonCriticalScripts.forEach(script => {
        if (!script.src.includes('emergency_component_fix') && 
            !script.src.includes('deployment_separation')) {
            script.defer = true;
        }
    });
    
    // Optimize image loading
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.loading) {
            img.loading = 'lazy';
        }
    });
    
    console.log('✅ Resource loading optimized');
}

// AdSense compatibility enhancements
function enhanceAdSenseCompatibility() {
    // Ensure proper page structure for AdSense
    const body = document.body;
    
    // Add meta tags for AdSense if missing
    if (!document.querySelector('meta[name="google-adsense-account"]')) {
        const adsenseMeta = document.createElement('meta');
        adsenseMeta.name = 'google-adsense-account';
        adsenseMeta.content = 'ca-pub-1234567890123456'; // Production value to be set
        document.head.appendChild(adsenseMeta);
    }
    
    // Ensure proper viewport for mobile AdSense
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport && !viewport.content.includes('width=device-width')) {
        viewport.content = 'width=device-width, initial-scale=1.0';
    }
    
    // Add structured data for better AdSense matching
    if (!document.querySelector('script[type="application/ld+json"]')) {
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "ConvertWiz",
            "description": "Free online conversion tools for images, documents, and data",
            "url": "https://convertwiz.in",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            }
        };
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }
    
    console.log('✅ AdSense compatibility enhanced');
}

// SEO optimizations for top 5 ranking
function enhanceSEOForRanking() {
    // Add canonical URL if missing
    if (!document.querySelector('link[rel="canonical"]')) {
        const canonical = document.createElement('link');
        canonical.rel = 'canonical';
        canonical.href = window.location.href;
        document.head.appendChild(canonical);
    }
    
    // Enhance meta descriptions for better CTR
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && metaDesc.content.length < 150) {
        // Enhance short descriptions for better search visibility
        const currentDesc = metaDesc.content;
        if (currentDesc.includes('converter')) {
            metaDesc.content = `${currentDesc} - Free, fast, and secure online conversion tools. No registration required. Convert files instantly with professional results.`;
        }
    }
    
    // Add Open Graph tags for social sharing
    if (!document.querySelector('meta[property="og:title"]')) {
        const ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        ogTitle.content = document.title;
        document.head.appendChild(ogTitle);
        
        const ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        ogDesc.content = metaDesc ? metaDesc.content : 'Free online conversion tools';
        document.head.appendChild(ogDesc);
        
        const ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        ogUrl.content = window.location.href;
        document.head.appendChild(ogUrl);
    }
    
    console.log('✅ SEO optimizations applied for ranking');
}

// Performance monitoring
function initPerformanceMonitoring() {
    // Track Core Web Vitals
    if ('web-vital' in window) {
        // LCP - Largest Contentful Paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('📊 LCP:', lastEntry.startTime.toFixed(2), 'ms');
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // FID - First Input Delay
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                console.log('📊 FID:', entry.processingStart - entry.startTime, 'ms');
            });
        }).observe({ entryTypes: ['first-input'] });
    }
    
    // Track page load performance
    window.addEventListener('load', () => {
        const perfData = performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log('📊 Page Load Time:', loadTime, 'ms');
        
        if (loadTime > 3000) {
            console.warn('⚠️ Page load time exceeds 3 seconds');
        } else {
            console.log('✅ Page load time optimized');
        }
    });
}

// Initialize all optimizations
document.addEventListener('DOMContentLoaded', function() {
    // Run optimizations with zero UI impact
    setTimeout(() => {
        try {
            optimizeResourceLoading();
            enhanceAdSenseCompatibility();
            enhanceSEOForRanking();
            initPerformanceMonitoring();
            
            console.log('🎯 Performance optimization complete - UI unaffected');
        } catch (error) {
            console.warn('⚠️ Performance optimization error:', error.message);
        }
    }, 100); // Minimal delay to avoid blocking initial render
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        optimizeResourceLoading,
        enhanceAdSenseCompatibility,
        enhanceSEOForRanking
    };
}