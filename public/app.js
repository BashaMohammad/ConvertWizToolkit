// ✅ UNIVERSAL SECTION NAVIGATION HANDLER FOR CONVERTWIZ

// Set production environment flag for live deployment
document.body.setAttribute('data-env', 'production');

// Hide all tool sections and show the one with the given ID
function showSection(sectionId) {
  // Force hide ALL tool sections first
  document.querySelectorAll('.tool-section').forEach(section => {
    section.style.display = 'none';
    section.classList.remove('active');
  });

  const target = document.getElementById(sectionId);
  if (target) {
    target.style.display = 'block';
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update URL and track pageview for AdSense and Analytics
    updateURLAndTrackPageview(sectionId);
    
    // Initialize tools based on section
    initializeTool(sectionId);
    
    // Update AdSense banner positioning for component pages
    updateAdSenseBannerPositioning(sectionId);
  }
}

// Update URL and trigger pageview tracking for components
function updateURLAndTrackPageview(sectionId) {
  // Map section IDs to URL paths
  const sectionToPath = {
    'landing-section': '/',
    'jpg-to-png-section': '/jpg-to-png',
    'currency-converter-section': '/currency',
    'land-converter-section': '/land',
    'dp-resizer-section': '/dp-resizer',
    'word-counter-section': '/word-counter',
    'distance-converter-section': '/distance',
    'weight-converter-section': '/weight',
    'height-converter-section': '/height',
    'ip-extractor-section': '/ip-extractor',
    'qr-generator-section': '/qr-generator',
    'percentage-calculator-section': '/percentage',
    'temperature-converter-section': '/temperature',
    'color-converter-section': '/color',
    'image-compressor-section': '/compress',
    'text-to-speech-section': '/text-to-speech',
    'backlink-checker-section': '/backlink-checker',
    'meta-tag-generator-section': '/meta-tag-generator',
    'dpi-checker-section': '/dpi-checker',
    'url-shortener-section': '/url-shortener'
  };
  
  const newPath = sectionToPath[sectionId] || '/';
  
  // Update URL without page reload using History API
  if (window.location.pathname !== newPath) {
    window.history.pushState({page: sectionId}, '', newPath);
  }
  
  // Track pageview in Google Analytics (if available)
  if (typeof gtag !== 'undefined') {
    gtag('config', 'G-7QJXHFPZVE', {
      'page_path': newPath,
      'page_title': getPageTitle(sectionId)
    });
  }
  
  // Force AdSense refresh for new "page"
  if (typeof adsbygoogle !== 'undefined' && adsbygoogle.loaded) {
    try {
      (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.log('AdSense refresh error:', e);
    }
  }
}

// Get page title for Google Analytics
function getPageTitle(sectionId) {
  const sectionTitles = {
    'landing-section': 'ConvertWiz - Free Online Conversion Tools',
    'jpg-to-png-section': 'JPG to PNG Converter - ConvertWiz',
    'currency-converter-section': 'Currency Converter - ConvertWiz',
    'land-converter-section': 'Land Unit Converter - ConvertWiz',
    'dp-resizer-section': 'Instagram DP Resizer - ConvertWiz',
    'word-counter-section': 'Word Counter Tool - ConvertWiz',
    'distance-converter-section': 'Distance Converter - ConvertWiz',
    'weight-converter-section': 'Weight Converter - ConvertWiz',
    'height-converter-section': 'Height Converter - ConvertWiz',
    'ip-extractor-section': 'IP Address Extractor - ConvertWiz',
    'qr-generator-section': 'QR Code Generator - ConvertWiz'
  };
  
  return sectionTitles[sectionId] || 'ConvertWiz - Conversion Tools';
}

// Update page layout based on current section (AdSense banners removed)
function updateAdSenseBannerPositioning(sectionId) {
  // Add component-page class to body for CSS targeting
  document.body.classList.remove('landing-page', 'component-page');
  
  if (sectionId === 'landing-section') {
    document.body.classList.add('landing-page');
  } else {
    document.body.classList.add('component-page');
  }
}

// Tool initialization
let currentTool = null;

function initializeTool(sectionId) {
    // Clean up previous tool
    if (currentTool && currentTool.destroy) {
        currentTool.destroy();
        currentTool = null;
    }
    
    // Initialize new tool based on section ID
    try {
        switch(sectionId) {
            case 'jpg-to-png-section':
                currentTool = new JPGtoPNGConverter();
                // Add GA4 event tracking for JPG to PNG converter
                const jpgToPngBtn = document.getElementById('convert-bulk-btn');
                if (jpgToPngBtn) {
                    jpgToPngBtn.addEventListener('click', () => {
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'convert_trigger', { 
                                tool: 'JPGtoPNG',
                                event_category: 'conversion',
                                event_label: 'bulk_convert'
                            });
                        }
                    });
                }
                break;
            case 'currency-converter-section':
                currentTool = new CurrencyConverter();
                break;
            case 'land-converter-section':
                currentTool = new LandUnitConverter();
                break;
            case 'dp-resizer-section':
                currentTool = new InstagramDPResizer();
                // Add GA4 event tracking for DP Resizer
                const resizeBtn = document.getElementById('process-dp-btn');
                if (resizeBtn) {
                    resizeBtn.addEventListener('click', () => {
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'resize_trigger', { 
                                tool: 'DPResizer',
                                event_category: 'image_processing',
                                event_label: 'resize_dp'
                            });
                        }
                    });
                }
                break;
            case 'word-counter-section':
                currentTool = new WordCounter();
                break;
            case 'distance-converter-section':
                currentTool = new DistanceConverter();
                break;
            case 'weight-converter-section':
                currentTool = new WeightConverter();
                break;
            case 'height-converter-section':
                currentTool = new HeightConverter();
                break;
            case 'ip-extractor-section':
                currentTool = new IPAddressExtractor();
                break;
            case 'qr-generator-section':
                currentTool = new QRCodeGenerator();
                break;
            case 'percentage-calculator-section':
                currentTool = new PercentageCalculator();
                break;
            case 'temperature-converter-section':
                currentTool = new TemperatureConverter();
                break;
            case 'color-converter-section':
                currentTool = new ColorConverter();
                break;
            case 'image-compressor-section':
                currentTool = new ImageCompressor();
                // Add GA4 event tracking for Image Compressor
                const compressBtn = document.getElementById('compress-image-btn');
                if (compressBtn) {
                    compressBtn.addEventListener('click', () => {
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'compress_trigger', { 
                                tool: 'ImageCompressor',
                                event_category: 'compression',
                                event_label: 'compress_image'
                            });
                        }
                    });
                }
                break;
            case 'text-to-speech-section':
                currentTool = new TextToSpeechConverter();
                break;
            case 'backlink-checker-section':
                currentTool = new BacklinkChecker();
                break;
            case 'meta-tag-generator-section':
                currentTool = new MetaTagGenerator();
                break;
            case 'dpi-checker-section':
                currentTool = new DPIChecker();
                break;
            case 'url-shortener-section':
                currentTool = new URLShortener();
                // Add GA4 event tracking for URL Shortener
                const shortenBtn = document.getElementById('shorten-url-btn');
                const bulkShortenBtn = document.getElementById('bulk-shorten-btn');
                if (shortenBtn) {
                    shortenBtn.addEventListener('click', () => {
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'shorten_trigger', { 
                                tool: 'URLShortener',
                                event_category: 'url_processing',
                                event_label: 'single_url'
                            });
                        }
                    });
                }
                if (bulkShortenBtn) {
                    bulkShortenBtn.addEventListener('click', () => {
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'bulk_shorten_trigger', { 
                                tool: 'URLShortener',
                                event_category: 'url_processing',
                                event_label: 'bulk_urls'
                            });
                        }
                    });
                }
                break;
        }
    } catch (error) {
        console.warn('Tool initialization failed:', error);
    }
}

// Automatically bind all buttons with data-target attribute
document.addEventListener('DOMContentLoaded', () => {
    console.log('ConvertWiz navigation initialized');
    
    // Bind data-target buttons
    document.querySelectorAll('[data-target]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = button.getAttribute('data-target');
            showSection(targetId);
        });
    });
    
    // Enhanced mobile menu toggle with Android compatibility
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        // Remove any existing listeners to prevent duplicates
        mobileMenuBtn.replaceWith(mobileMenuBtn.cloneNode(true));
        const newMobileMenuBtn = document.getElementById('mobile-menu-btn');
        
        newMobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.remove('hidden');
                newMobileMenuBtn.innerHTML = '<i class="fas fa-times text-xl"></i>';
            } else {
                mobileMenu.classList.add('hidden');
                newMobileMenuBtn.innerHTML = '<i class="fas fa-bars text-xl"></i>';
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!newMobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                newMobileMenuBtn.innerHTML = '<i class="fas fa-bars text-xl"></i>';
            }
        });
    }
    
    // Initialize routing based on current URL
    initializeRouting();
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', function(event) {
        const sectionId = getSectionFromPath(window.location.pathname);
        showSection(sectionId);
    });
    
    // Initialize AdSense lazy loading for Core Web Vitals optimization
    initializeAdSenseLazyLoading();
    
    // Initialize mobile menu functionality
    setupMobileMenu();
});

// AdSense Lazy Loading for Core Web Vitals Optimization
function initializeAdSenseLazyLoading() {
    // Only load AdSense in production environment
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Development environment detected - AdSense placeholders active');
        return;
    }
    
    // Lazy load AdSense script with intersection observer
    const adElements = document.querySelectorAll('.adsense-banner');
    
    if (adElements.length === 0) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
    };
    
    const adObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadAdSenseScript();
                adObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all ad banners
    adElements.forEach(ad => adObserver.observe(ad));
}

// Load AdSense script dynamically
function loadAdSenseScript() {
    if (window.adsbygoogle || document.getElementById('adsense-script')) {
        return; // Already loaded
    }
    
    console.log('AdSense lazy loading initiated');
    
    const script = document.createElement('script');
    script.id = 'adsense-script';
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2287734666559045';
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
        console.log('AdSense script loaded successfully');
        // Initialize visible ads
        setTimeout(() => {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                console.log('AdSense initialization:', 'Ads pushed to queue');
            } catch (error) {
                console.log('AdSense initialization:', error.message);
            }
        }, 1000);
    };
    
    script.onerror = () => {
        console.warn('AdSense script failed to load');
    };
    
    document.head.appendChild(script);
}

// Optimize images with lazy loading
function optimizeImageLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize routing based on current URL path
function initializeRouting() {
    const currentPath = window.location.pathname;
    const sectionId = getSectionFromPath(currentPath);
    showSection(sectionId);
}

// Map URL paths back to section IDs
function getSectionFromPath(path) {
    const pathToSection = {
        '/': 'landing-section',
        '/jpg-to-png': 'jpg-to-png-section',
        '/currency': 'currency-converter-section',
        '/land': 'land-converter-section',
        '/dp-resizer': 'dp-resizer-section',
        '/word-counter': 'word-counter-section',
        '/distance': 'distance-converter-section',
        '/weight': 'weight-converter-section',
        '/height': 'height-converter-section',
        '/ip-extractor': 'ip-extractor-section',
        '/qr-generator': 'qr-generator-section',
        '/percentage': 'percentage-calculator-section',
        '/temperature': 'temperature-converter-section',
        '/color': 'color-converter-section',
        '/compress': 'image-compressor-section',
        '/text-to-speech': 'text-to-speech-section',
        '/backlink-checker': 'backlink-checker-section',
        '/meta-tag-generator': 'meta-tag-generator-section',
        '/dpi-checker': 'dpi-checker-section',
        '/url-shortener': 'url-shortener-section'
    };
    
    return pathToSection[path] || 'landing-section';
}

// Fix 2: Mobile menu functionality
function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  console.log('Setting up mobile menu - Button:', !!mobileMenuBtn, 'Menu:', !!mobileMenu);
  
  if (mobileMenuBtn && mobileMenu) {
    console.log('Mobile menu elements found, setting up event listeners');
    // Toggle mobile menu
    mobileMenuBtn.addEventListener('click', function(e) {
      console.log('Mobile menu button clicked');
      e.preventDefault();
      e.stopPropagation();
      mobileMenu.classList.toggle('hidden');
      
      // Change icon
      const icon = mobileMenuBtn.querySelector('i');
      if (mobileMenu.classList.contains('hidden')) {
        icon.className = 'fas fa-bars text-xl';
        console.log('Mobile menu closed');
      } else {
        icon.className = 'fas fa-times text-xl';
        console.log('Mobile menu opened');
      }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.add('hidden');
        const icon = mobileMenuBtn.querySelector('i');
        icon.className = 'fas fa-bars text-xl';
      }
    });
    
    // Close mobile menu when clicking nav links
    mobileMenu.querySelectorAll('a, button').forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
        const icon = mobileMenuBtn.querySelector('i');
        icon.className = 'fas fa-bars text-xl';
      });
    });
  } else {
    console.log('Mobile menu elements not found');
  }
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('ConvertWiz navigation initialized');
    
    // Initialize routing
    initializeRouting();
    
    // Initialize AdSense lazy loading
    initializeAdSenseLazyLoading();
    
    // Load and optimize images
    optimizeImageLoading();
    
    // Fix 2: Setup mobile menu
    setupMobileMenu();
});