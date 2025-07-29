// CRITICAL COMPONENT ISOLATION FIX
// This script completely isolates tool components
(function() {
    'use strict';
    
    console.log('🔧 CRITICAL FIX: Starting component isolation');
    
    // Component definitions with their actual functional interfaces
    const COMPONENT_SECTIONS = [
        'landing-section',
        'jpg-to-png-section',
        'currency-converter-section', 
        'land-converter-section',
        'dp-resizer-section',
        'word-counter-section',
        'distance-converter-section',
        'weight-converter-section',
        'height-converter-section',
        'ip-extractor-section',
        'qr-generator-section',
        'percentage-calculator-section',
        'temperature-converter-section',
        'color-converter-section',
        'image-compressor-section',
        'text-to-speech-section',
        'backlink-checker-section',
        'meta-tag-generator-section',
        'dpi-checker-section',
        'url-shortener-section'
    ];
    
    // Force isolation function
    function enforceComponentIsolation() {
        // Remove active class from ALL sections first
        COMPONENT_SECTIONS.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.remove('active');
            }
        });
        
        // Show only landing section by default
        const landingSection = document.getElementById('landing-section');
        if (landingSection) {
            landingSection.classList.add('active');
        }
        
        console.log('✅ Component isolation enforced - only landing visible');
    }
    
    // Enhanced showSection function
    function createShowSectionFunction() {
        window.showSection = function(targetSectionId) {
            console.log(`🔄 Switching to section: ${targetSectionId}`);
            
            // Remove active class from all sections
            COMPONENT_SECTIONS.forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) {
                    section.classList.remove('active');
                }
            });
            
            // Add active class to target section
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Update URL without page reload
                const path = getSectionPath(targetSectionId);
                if (path !== window.location.pathname) {
                    window.history.pushState({}, '', path);
                }
                
                // Update page title
                document.title = getSectionTitle(targetSectionId);
                
                console.log(`✅ Section ${targetSectionId} now active`);
            } else {
                console.error(`❌ Section ${targetSectionId} not found`);
            }
        };
        
        // Hash-based navigation
        window.showTool = function(toolId) {
            const sectionMap = {
                'jpg-to-png': 'jpg-to-png-section',
                'currency-converter': 'currency-converter-section',
                'land-converter': 'land-converter-section',
                'dp-resizer': 'dp-resizer-section',
                'word-counter': 'word-counter-section',
                'distance-converter': 'distance-converter-section',
                'weight-converter': 'weight-converter-section',
                'height-converter': 'height-converter-section',
                'ip-extractor': 'ip-extractor-section',
                'qr-generator': 'qr-generator-section',
                'percentage-calculator': 'percentage-calculator-section',
                'temperature-converter': 'temperature-converter-section',
                'color-converter': 'color-converter-section',
                'image-compressor': 'image-compressor-section',
                'text-to-speech': 'text-to-speech-section',
                'backlink-checker': 'backlink-checker-section',
                'meta-tag-generator': 'meta-tag-generator-section',
                'dpi-checker': 'dpi-checker-section',
                'url-shortener': 'url-shortener-section',
                'home': 'landing-section'
            };
            
            const sectionId = sectionMap[toolId] || 'landing-section';
            window.showSection(sectionId);
        };
    }
    
    // URL path mapping
    function getSectionPath(sectionId) {
        const pathMap = {
            'landing-section': '/',
            'jpg-to-png-section': '/jpg-to-png',
            'currency-converter-section': '/currency-converter',
            'land-converter-section': '/land-converter',
            'dp-resizer-section': '/dp-resizer',
            'word-counter-section': '/word-counter',
            'distance-converter-section': '/distance-converter',
            'weight-converter-section': '/weight-converter',
            'height-converter-section': '/height-converter',
            'ip-extractor-section': '/ip-extractor',
            'qr-generator-section': '/qr-generator',
            'percentage-calculator-section': '/percentage-calculator',
            'temperature-converter-section': '/temperature-converter',
            'color-converter-section': '/color-converter',
            'image-compressor-section': '/image-compressor',
            'text-to-speech-section': '/text-to-speech',
            'backlink-checker-section': '/backlink-checker',
            'meta-tag-generator-section': '/meta-tag-generator',
            'dpi-checker-section': '/dpi-checker',
            'url-shortener-section': '/url-shortener'
        };
        return pathMap[sectionId] || '/';
    }
    
    // Title mapping
    function getSectionTitle(sectionId) {
        const titleMap = {
            'landing-section': 'ConvertWiz - Free Online Conversion Tools',
            'jpg-to-png-section': 'JPG to PNG Converter - ConvertWiz',
            'currency-converter-section': 'Currency Converter - ConvertWiz',
            'land-converter-section': 'Land Unit Converter - ConvertWiz',
            'dp-resizer-section': 'Instagram DP Resizer - ConvertWiz',
            'word-counter-section': 'Word Counter - ConvertWiz',
            'distance-converter-section': 'Distance Converter - ConvertWiz',
            'weight-converter-section': 'Weight Converter - ConvertWiz',
            'height-converter-section': 'Height Converter - ConvertWiz',
            'ip-extractor-section': 'IP Address Extractor - ConvertWiz',
            'qr-generator-section': 'QR Code Generator - ConvertWiz',
            'percentage-calculator-section': 'Percentage Calculator - ConvertWiz',
            'temperature-converter-section': 'Temperature Converter - ConvertWiz',
            'color-converter-section': 'Color Converter - ConvertWiz',
            'image-compressor-section': 'Image Compressor - ConvertWiz',
            'text-to-speech-section': 'Text to Speech - ConvertWiz',
            'backlink-checker-section': 'Backlink Checker - ConvertWiz',
            'meta-tag-generator-section': 'Meta Tag Generator - ConvertWiz',
            'dpi-checker-section': 'DPI Checker - ConvertWiz',
            'url-shortener-section': 'URL Shortener - ConvertWiz'
        };
        return titleMap[sectionId] || 'ConvertWiz';
    }
    
    // Initialize routing
    function initializeRouting() {
        console.log(`🔍 Initializing routing for path: ${window.location.pathname}`);
        
        // Check for hash first
        const hash = location.hash.replace('#', '');
        if (hash) {
            console.log(`🔗 Hash detected: ${hash}`);
            window.showTool(hash);
            return;
        }
        
        // Then check path
        const currentPath = window.location.pathname;
        const sectionId = getPathSection(currentPath);
        console.log(`📍 Path: ${currentPath} -> Section: ${sectionId}`);
        
        // Force show the section even if showSection function isn't ready
        if (sectionId && sectionId !== 'landing-section') {
            console.log(`🔧 Force activating section: ${sectionId}`);
            // Remove active from all sections
            document.querySelectorAll('.tool-section, #landing-section').forEach(section => {
                section.classList.remove('active');
            });
            // Add active to target section
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                console.log(`✅ Activated section: ${sectionId}`);
            } else {
                console.log(`❌ Section not found: ${sectionId}`);
            }
        } else {
            window.showSection(sectionId);
        }
    }
    
    function getPathSection(path) {
        const sectionMap = {
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
        return sectionMap[path] || 'landing-section';
    }
    
    // Set up navigation handlers
    function setupNavigationHandlers() {
        // Handle data-target buttons
        document.addEventListener('click', function(e) {
            const target = e.target.closest('[data-target]');
            if (target) {
                e.preventDefault();
                const sectionId = target.getAttribute('data-target');
                window.showSection(sectionId);
            }
        });
        
        // Handle hash changes
        window.addEventListener('hashchange', function() {
            const hash = location.hash.replace('#', '');
            if (hash) {
                window.showTool(hash);
            } else {
                window.showSection('landing-section');
            }
        });
        
        // Handle browser back/forward
        window.addEventListener('popstate', function() {
            initializeRouting();
        });
    }
    
    // Main initialization
    function initialize() {
        enforceComponentIsolation();
        createShowSectionFunction();
        setupNavigationHandlers();
        
        // Run routing after DOM is ready with delay to ensure all elements are loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(initializeRouting, 200);
            });
        } else {
            setTimeout(initializeRouting, 200);
        }
        
        console.log('🎉 CRITICAL FIX: Component isolation complete');
    }
    
    // Run immediately and on DOM ready
    initialize();
    
    // Also make functions globally available
    window.enforceComponentIsolation = enforceComponentIsolation;
    window.initializeRouting = initializeRouting;
    
})();