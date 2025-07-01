// ConvertWiz - All-in-One Utility Toolkit JavaScript

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// JPG to PNG Converter
class JPGToPNGConverter {
    constructor() {
        this.jpgInput = document.getElementById('jpg-input');
        this.jpgPreview = document.getElementById('jpg-preview');
        this.jpgPreviewImg = document.getElementById('jpg-preview-img');
        this.convertBtn = document.getElementById('convert-jpg-png');
        this.pngResult = document.getElementById('png-result');
        this.pngResultImg = document.getElementById('png-result-img');
        this.downloadBtn = document.getElementById('download-png');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.jpgInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.convertBtn.addEventListener('click', () => this.convertToPNG());
        this.downloadBtn.addEventListener('click', () => this.downloadPNG());
    }
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image/jpeg') && !file.type.match('image/jpg')) {
            alert('Please select a JPG file');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.jpgPreviewImg.src = e.target.result;
            this.jpgPreview.classList.remove('hidden');
            this.jpgPreview.classList.add('fade-in');
            this.pngResult.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
    
    convertToPNG() {
        const img = this.jpgPreviewImg;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            this.pngResultImg.src = url;
            this.pngBlob = blob;
            this.pngResult.classList.remove('hidden');
            this.pngResult.classList.add('fade-in');
        }, 'image/png');
    }
    
    downloadPNG() {
        if (!this.pngBlob) return;
        
        const url = URL.createObjectURL(this.pngBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted-image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Currency Converter
class CurrencyConverter {
    constructor() {
        this.fromCurrency = document.getElementById('from-currency');
        this.toCurrency = document.getElementById('to-currency');
        this.amountInput = document.getElementById('currency-amount');
        this.convertBtn = document.getElementById('convert-currency');
        this.result = document.getElementById('currency-result');
        this.resultText = document.getElementById('currency-result-text');
        this.rateText = document.getElementById('currency-rate-text');
        this.currencies = {};
        
        this.initEventListeners();
        this.loadCurrencies();
    }
    
    async loadCurrencies() {
        try {
            const response = await fetch('https://api.exchangerate.host/symbols');
            const data = await response.json();
            
            if (data.success) {
                this.currencies = data.symbols;
                this.populateCurrencyDropdowns();
            } else {
                // Fallback to manual list if API fails
                this.loadFallbackCurrencies();
            }
        } catch (error) {
            console.error('Error loading currencies:', error);
            this.loadFallbackCurrencies();
        }
    }
    
    loadFallbackCurrencies() {
        this.currencies = {
            'USD': { description: 'United States Dollar' },
            'EUR': { description: 'Euro' },
            'GBP': { description: 'British Pound Sterling' },
            'INR': { description: 'Indian Rupee' },
            'JPY': { description: 'Japanese Yen' },
            'AUD': { description: 'Australian Dollar' },
            'CAD': { description: 'Canadian Dollar' },
            'CHF': { description: 'Swiss Franc' },
            'CNY': { description: 'Chinese Yuan' },
            'SEK': { description: 'Swedish Krona' },
            'NZD': { description: 'New Zealand Dollar' },
            'MXN': { description: 'Mexican Peso' },
            'SGD': { description: 'Singapore Dollar' },
            'HKD': { description: 'Hong Kong Dollar' },
            'NOK': { description: 'Norwegian Krone' },
            'KRW': { description: 'South Korean Won' },
            'TRY': { description: 'Turkish Lira' },
            'RUB': { description: 'Russian Ruble' },
            'BRL': { description: 'Brazilian Real' },
            'ZAR': { description: 'South African Rand' }
        };
        this.populateCurrencyDropdowns();
    }
    
    populateCurrencyDropdowns() {
        // Clear existing options
        this.fromCurrency.innerHTML = '';
        this.toCurrency.innerHTML = '';
        
        // Sort currencies by code
        const sortedCurrencies = Object.keys(this.currencies).sort();
        
        sortedCurrencies.forEach(code => {
            const currency = this.currencies[code];
            const optionFrom = new Option(`${code} - ${currency.description}`, code);
            const optionTo = new Option(`${code} - ${currency.description}`, code);
            
            this.fromCurrency.appendChild(optionFrom);
            this.toCurrency.appendChild(optionTo);
        });
        
        // Set default values
        this.fromCurrency.value = 'USD';
        this.toCurrency.value = 'EUR';
    }
    
    initEventListeners() {
        this.convertBtn.addEventListener('click', () => this.convertCurrency());
        this.amountInput.addEventListener('input', () => {
            if (this.amountInput.value) {
                this.convertCurrency();
            }
        });
        this.fromCurrency.addEventListener('change', () => {
            if (this.amountInput.value) {
                this.convertCurrency();
            }
        });
        this.toCurrency.addEventListener('change', () => {
            if (this.amountInput.value) {
                this.convertCurrency();
            }
        });
    }
    
    async convertCurrency() {
        const amount = parseFloat(this.amountInput.value);
        const from = this.fromCurrency.value;
        const to = this.toCurrency.value;
        
        if (!amount || amount <= 0) {
            this.result.classList.add('hidden');
            return;
        }
        
        if (from === to) {
            this.showResult(amount, amount, 1, from, to);
            return;
        }
        
        try {
            this.convertBtn.textContent = 'Converting...';
            this.convertBtn.disabled = true;
            
            const response = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`);
            const data = await response.json();
            
            if (data.success) {
                this.showResult(amount, data.result, data.info.rate, from, to);
            } else {
                throw new Error('Conversion failed');
            }
        } catch (error) {
            console.error('Currency conversion error:', error);
            showNotification('Error converting currency. Please check your internet connection.', 'error');
        } finally {
            this.convertBtn.textContent = 'Convert Currency';
            this.convertBtn.disabled = false;
        }
    }
    
    showResult(originalAmount, convertedAmount, rate, fromCurrency, toCurrency) {
        this.resultText.textContent = `${originalAmount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
        this.rateText.textContent = `Live Rate • Updated now • 1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
        this.result.classList.remove('hidden');
        this.result.classList.add('fade-in');
    }
}

// Land Unit Converter
class LandUnitConverter {
    constructor() {
        this.unitSelect = document.getElementById('land-unit');
        this.valueInput = document.getElementById('land-value');
        this.results = {
            acres: document.getElementById('result-acres'),
            gunta: document.getElementById('result-gunta'),
            sqft: document.getElementById('result-sqft'),
            bigha: document.getElementById('result-bigha')
        };
        
        // Conversion rates to square feet
        this.conversionRates = {
            acres: 43560,      // 1 acre = 43,560 sq ft
            gunta: 1089,       // 1 gunta = 1,089 sq ft
            sqft: 1,           // 1 sq ft = 1 sq ft
            bigha: 26910       // 1 bigha = 26,910 sq ft (varies by region, using standard)
        };
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.valueInput.addEventListener('input', () => this.convertUnits());
        this.unitSelect.addEventListener('change', () => this.convertUnits());
    }
    
    convertUnits() {
        const value = parseFloat(this.valueInput.value);
        const unit = this.unitSelect.value;
        
        if (!value || value <= 0) {
            // Reset all results to 0
            Object.values(this.results).forEach(element => {
                element.textContent = '0';
            });
            return;
        }
        
        // Convert input value to square feet first
        const sqftValue = value * this.conversionRates[unit];
        
        // Convert square feet to all other units
        this.results.acres.textContent = (sqftValue / this.conversionRates.acres).toFixed(4);
        this.results.gunta.textContent = (sqftValue / this.conversionRates.gunta).toFixed(4);
        this.results.sqft.textContent = sqftValue.toFixed(2);
        this.results.bigha.textContent = (sqftValue / this.conversionRates.bigha).toFixed(4);
    }
}

// Instagram DP Resizer
class InstagramDPResizer {
    constructor() {
        this.dpInput = document.getElementById('dp-input');
        this.dpPreview = document.getElementById('dp-preview');
        this.dpOriginal = document.getElementById('dp-original');
        this.resizeBtn = document.getElementById('resize-dp');
        this.dpResult = document.getElementById('dp-result');
        this.dpCanvas = document.getElementById('dp-canvas');
        this.downloadBtn = document.getElementById('download-dp');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.dpInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.resizeBtn.addEventListener('click', () => this.resizeImage());
        this.downloadBtn.addEventListener('click', () => this.downloadResizedImage());
    }
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.dpOriginal.src = e.target.result;
            this.dpPreview.classList.remove('hidden');
            this.dpPreview.classList.add('fade-in');
            this.dpResult.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
    
    resizeImage() {
        const img = this.dpOriginal;
        const canvas = this.dpCanvas;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, 320, 320);
        
        // Calculate dimensions to maintain aspect ratio
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
        
        if (aspectRatio > 1) {
            // Landscape - fit height
            drawHeight = 320;
            drawWidth = 320 * aspectRatio;
            offsetX = (320 - drawWidth) / 2;
        } else {
            // Portrait or square - fit width
            drawWidth = 320;
            drawHeight = 320 / aspectRatio;
            offsetY = (320 - drawHeight) / 2;
        }
        
        // Draw image centered and cropped
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
        this.dpResult.classList.remove('hidden');
        this.dpResult.classList.add('fade-in');
    }
    
    downloadResizedImage() {
        this.dpCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'instagram-dp-320x320.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    }
}

// Initialize all converters when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new JPGToPNGConverter();
    new CurrencyConverter();
    new LandUnitConverter();
    new InstagramDPResizer();
    
    // Add loading animation to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.disabled) {
                this.classList.add('loading');
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 300);
            }
        });
    });
    
    // Add intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all tool cards
    document.querySelectorAll('.tool-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Service worker registration for PWA-like experience (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service worker can be added later for offline functionality
    });
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showNotification('An error occurred. Please try again.', 'error');
});

// Handle offline/online status
window.addEventListener('online', () => {
    showNotification('You are back online!', 'success');
});

window.addEventListener('offline', () => {
    showNotification('You are currently offline. Some features may not work.', 'error');
});
