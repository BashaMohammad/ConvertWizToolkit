// DIRECT COMPONENT FIX - Simplified activation system
(function() {
    'use strict';
    
    console.log('🎯 DIRECT FIX: Starting simplified component activation');
    
    // Wait for DOM to be ready
    function waitForDOM(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }
    
    // Simple component activation function
    function activateComponent() {
        const path = window.location.pathname;
        console.log('🔍 Current path:', path);
        
        // Map paths to section IDs
        const pathToSection = {
            '/': 'landing-section',
            '/jpg-to-png': 'jpg-to-png-section',
            '/currency-converter': 'currency-converter-section',
            '/land-converter': 'land-converter-section',
            '/dp-resizer': 'dp-resizer-section',
            '/word-counter': 'word-counter-section',
            '/distance-converter': 'distance-converter-section',
            '/weight-converter': 'weight-converter-section',
            '/height-converter': 'height-converter-section',
            '/ip-extractor': 'ip-extractor-section',
            '/qr-generator': 'qr-generator-section',
            '/percentage-calculator': 'percentage-calculator-section',
            '/temperature-converter': 'temperature-converter-section',
            '/color-converter': 'color-converter-section',
            '/image-compressor': 'image-compressor-section',
            '/text-to-speech': 'text-to-speech-section',
            '/backlink-checker': 'backlink-checker-section',
            '/meta-tag-generator': 'meta-tag-generator-section',
            '/dpi-checker': 'dpi-checker-section',
            '/url-shortener': 'url-shortener-section'
        };
        
        const targetSectionId = pathToSection[path] || 'landing-section';
        console.log('🎯 Target section:', targetSectionId);
        
        // Hide all sections first
        document.querySelectorAll('.tool-section, #landing-section').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(targetSectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.style.visibility = 'visible';
            targetSection.style.opacity = '1';
            targetSection.classList.add('active');
            console.log('✅ Activated section:', targetSectionId);
        } else {
            console.error('❌ Section not found:', targetSectionId);
        }
    }
    
    // Initialize on DOM ready
    waitForDOM(activateComponent);
    
    // Also run immediately if DOM is already ready
    if (document.readyState !== 'loading') {
        setTimeout(activateComponent, 100);
    }
    
    console.log('🎉 DIRECT FIX: Component activation system ready');
})();