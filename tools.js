// ConvertWiz - Individual Tool Classes

// JPG to PNG Converter
class JPGtoPNGConverter {
    constructor() {
        this.dailyLimit = 3;
        this.currentFiles = [];
        this.processedCount = 0;
        this.skippedCount = 0;
        
        this.initElements();
        this.initEventListeners();
        this.updateDailyCounter();
        this.setupDragAndDrop();
    }
    
    initElements() {
        // UI Elements
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('jpg-input');
        this.browseBtn = document.getElementById('browse-btn');
        this.watermarkToggle = document.getElementById('watermark-toggle');
        
        // Section Elements
        this.progressSection = document.getElementById('progress-section');
        this.resultsContainer = document.getElementById('results-container');
        this.resultsList = document.getElementById('results-list');
        this.limitSection = document.getElementById('limit-reached');
        
        // Progress Elements
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text');
        
        // Button Elements
        this.convertAnotherBtn = document.getElementById('convert-another');
        
        // Counter Elements
        this.conversionsLeft = document.getElementById('conversions-left');
        this.limitCounter = document.getElementById('limit-counter');
    }
    
    initEventListeners() {
        if (!this.fileInput) return;
        
        // File input events
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.browseBtn?.addEventListener('click', () => this.fileInput.click());
        
        // Button events
        this.convertAnotherBtn?.addEventListener('click', () => this.resetConverter());
        
        // Watermark toggle
        this.watermarkToggle?.addEventListener('change', () => this.toggleWatermark());
    }
    
    setupDragAndDrop() {
        if (!this.uploadArea) return;
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });
        
        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => this.highlight(), false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => this.unhighlight(), false);
        });
        
        // Handle dropped files
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e), false);
    }
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    highlight() {
        this.uploadArea.classList.add('dragover');
    }
    
    unhighlight() {
        this.uploadArea.classList.remove('dragover');
    }
    
    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = Array.from(dt.files);
        
        if (files.length > 0) {
            this.handleFiles(files);
        }
    }
    
    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            this.handleFiles(files);
        }
    }
    
    async handleFiles(files) {
        // Filter valid files
        const validFiles = files.filter(file => this.validateFile(file, false));
        
        if (validFiles.length === 0) {
            this.showNotification('No valid JPG files found. Please select JPG or JPEG files.', 'error');
            return;
        }
        
        // Check usage limit before processing
        const canConvert = await this.checkDailyLimit();
        if (!canConvert) {
            this.showLimitReached();
            return;
        }
        
        // Check how many we can process based on daily limit
        const remainingLimit = this.getRemainingLimit();
        
        if (remainingLimit === 0) {
            this.showLimitReached();
            return;
        }
        
        // Limit files to remaining quota
        this.currentFiles = validFiles.slice(0, remainingLimit);
        this.skippedCount = validFiles.length - this.currentFiles.length;
        
        // Start bulk conversion
        this.startBulkConversion();
    }
    
    validateFile(file, showError = true) {
        // Check file type
        if (!file.type.match('image/jpeg') && !file.type.match('image/jpg')) {
            if (showError) {
                this.showNotification('Please select a JPG or JPEG file.', 'error');
            }
            return false;
        }
        
        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            if (showError) {
                this.showNotification('File size must be less than 10MB.', 'error');
            }
            return false;
        }
        
        return true;
    }
    
    getRemainingLimit() {
        // Use the Firebase authentication system for usage tracking
        if (window.convertWizAuth) {
            const remaining = window.convertWizAuth.getRemainingConversions();
            return remaining === 'Unlimited' ? 999 : remaining;
        }
        
        // Fallback to local storage if Firebase not available
        const today = new Date().toDateString();
        const usage = JSON.parse(localStorage.getItem('convertWizUsage') || '{}');
        
        if (usage.date !== today) {
            return this.dailyLimit; // New day, full limit available
        }
        
        return Math.max(0, this.dailyLimit - usage.count);
    }
    
    async startBulkConversion() {
        // Hide upload area and show progress
        this.uploadArea.parentElement.style.display = 'none';
        this.progressSection.classList.remove('hidden');
        
        // Clear previous results
        this.resultsList.innerHTML = '';
        this.processedCount = 0;
        
        // Process each file
        for (let i = 0; i < this.currentFiles.length; i++) {
            const file = this.currentFiles[i];
            
            // Update progress for current file
            this.updateBulkProgress(i + 1, this.currentFiles.length, file.name);
            
            // Convert the file
            await this.convertSingleFile(file, i);
            
            // Update daily usage
            this.updateDailyUsage();
            this.processedCount++;
        }
        
        // Show completion message and results
        this.showBulkResults();
    }
    
    updateBulkProgress(current, total, fileName) {
        const percentage = (current / total) * 100;
        this.progressBar.style.width = `${percentage}%`;
        this.progressText.textContent = `Converting ${current} of ${total}: ${fileName}`;
    }
    
    async convertSingleFile(file, index) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Create canvas
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Set canvas dimensions
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    
                    // Enable high-quality rendering
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    // Draw image
                    ctx.drawImage(img, 0, 0);
                    
                    // Add watermark if enabled
                    if (this.watermarkToggle && this.watermarkToggle.checked) {
                        this.addWatermark(ctx, canvas.width, canvas.height);
                    }
                    
                    // Convert to PNG
                    canvas.toBlob((blob) => {
                        // Create result card for this conversion
                        this.createResultCard(file, e.target.result, blob, index);
                        resolve();
                    }, 'image/png', 1.0);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
    
    createResultCard(originalFile, originalDataUrl, convertedBlob, index) {
        const resultCard = document.createElement('div');
        resultCard.className = 'converter-card bg-white rounded-2xl shadow-2xl p-6 fade-in';
        
        const convertedUrl = URL.createObjectURL(convertedBlob);
        const fileName = originalFile.name.replace(/\.(jpg|jpeg)$/i, '.png');
        
        resultCard.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Original -->
                <div class="text-center">
                    <h4 class="text-lg font-semibold text-gray-700 mb-4">Original JPG</h4>
                    <div class="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                        <img src="${originalDataUrl}" class="max-w-full h-48 object-contain mx-auto rounded-lg">
                        <div class="mt-3 text-sm text-gray-600">
                            <p>Format: <span class="font-medium">JPG</span></p>
                            <p>Size: <span class="font-medium">${this.formatFileSize(originalFile.size)}</span></p>
                            <p>Name: <span class="font-medium">${originalFile.name}</span></p>
                        </div>
                    </div>
                </div>
                
                <!-- Converted -->
                <div class="text-center">
                    <h4 class="text-lg font-semibold text-gray-700 mb-4">Converted PNG</h4>
                    <div class="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                        <img src="${convertedUrl}" class="max-w-full h-48 object-contain mx-auto rounded-lg">
                        <div class="mt-3 text-sm text-gray-600">
                            <p>Format: <span class="font-medium text-green-600">PNG</span></p>
                            <p>Size: <span class="font-medium">${this.formatFileSize(convertedBlob.size)}</span></p>
                            <p>Name: <span class="font-medium">${fileName}</span></p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Download Button -->
            <div class="text-center mt-6">
                <button class="download-btn bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105" data-blob-url="${convertedUrl}" data-filename="${fileName}">
                    <i class="fas fa-download mr-2"></i>Download PNG
                </button>
            </div>
        `;
        
        // Add download event listener
        const downloadBtn = resultCard.querySelector('.download-btn');
        downloadBtn.addEventListener('click', () => {
            this.downloadFile(convertedUrl, fileName);
        });
        
        // Append to results list
        this.resultsList.appendChild(resultCard);
    }
    
    addWatermark(ctx, width, height) {
        // Set watermark style
        ctx.font = `${Math.max(width, height) / 20}px Arial`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add watermark text
        ctx.fillText('ConvertWiz.com', width / 2, height - 50);
    }
    
    showBulkResults() {
        this.progressSection.classList.add('hidden');
        this.resultsContainer.classList.remove('hidden');
        
        // Show completion notification
        let message = `Successfully converted ${this.processedCount} image${this.processedCount !== 1 ? 's' : ''}!`;
        if (this.skippedCount > 0) {
            message += ` ${this.skippedCount} file${this.skippedCount !== 1 ? 's' : ''} skipped due to daily limit.`;
        }
        
        this.showNotification(message, 'success');
    }
    
    downloadFile(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        this.showNotification('PNG file downloaded successfully!', 'success');
    }
    
    resetConverter() {
        // Reset all sections
        this.progressSection.classList.add('hidden');
        this.resultsContainer.classList.add('hidden');
        this.uploadArea.parentElement.style.display = 'block';
        
        // Reset progress bar
        this.progressBar.style.width = '0%';
        this.progressText.textContent = 'Processing images...';
        
        // Clear file input and data
        this.fileInput.value = '';
        this.currentFiles = [];
        this.processedCount = 0;
        this.skippedCount = 0;
        
        // Clear results list
        this.resultsList.innerHTML = '';
        
        // Remove dragover class
        this.unhighlight();
    }
    
    async checkDailyLimit() {
        // Use the Firebase authentication system for usage tracking
        if (window.convertWizAuth) {
            return await window.convertWizAuth.canPerformConversion();
        }
        
        // Fallback to local storage if Firebase not available
        const today = new Date().toDateString();
        const usage = JSON.parse(localStorage.getItem('convertWizUsage') || '{}');
        
        if (usage.date !== today) {
            return true; // New day, reset limit
        }
        
        return usage.count < this.dailyLimit;
    }
    
    updateDailyUsage() {
        // Use the Firebase authentication system for usage tracking
        if (window.convertWizAuth) {
            window.convertWizAuth.incrementUsage();
        } else {
            // Fallback to local storage if Firebase not available
            const today = new Date().toDateString();
            let usage = JSON.parse(localStorage.getItem('convertWizUsage') || '{}');
            
            if (usage.date !== today) {
                usage = { date: today, count: 0 };
            }
            
            usage.count += 1;
            localStorage.setItem('convertWizUsage', JSON.stringify(usage));
        }
        
        this.updateDailyCounter();
    }
    
    updateDailyCounter() {
        const today = new Date().toDateString();
        const usage = JSON.parse(localStorage.getItem('convertWizUsage') || '{}');
        
        let remaining = this.dailyLimit;
        if (usage.date === today) {
            remaining = Math.max(0, this.dailyLimit - usage.count);
        }
        
        if (this.conversionsLeft) {
            this.conversionsLeft.textContent = remaining;
        }
        
        if (remaining === 0 && this.limitCounter) {
            this.limitCounter.innerHTML = '<i class="fas fa-hourglass-end mr-2"></i>No free conversions left today';
            this.limitCounter.className = 'inline-block bg-red-500/20 backdrop-blur-md rounded-full px-6 py-2 text-white font-medium';
        }
    }
    
    showLimitReached() {
        // Use Firebase warning system if available
        if (window.convertWizAuth) {
            window.convertWizAuth.showUsageLimitWarning();
        } else {
            this.showNotification('Daily conversion limit reached! Sign up for unlimited access or try again tomorrow.', 'warning');
        }
        
        this.uploadArea.parentElement.style.display = 'none';
        this.limitSection.classList.remove('hidden');
    }
    
    toggleWatermark() {
        // Visual feedback for toggle
        const toggleDiv = this.watermarkToggle.nextElementSibling;
        if (this.watermarkToggle.checked) {
            toggleDiv.style.backgroundColor = '#8b5cf6';
        } else {
            toggleDiv.style.backgroundColor = '#d1d5db';
        }
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : (type === 'error' ? 'exclamation-circle' : 'info-circle')} mr-2"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    destroy() {
        // Clean up event listeners and data
        this.currentFiles = [];
        this.processedCount = 0;
        this.skippedCount = 0;
    }
}

// Currency Converter
class CurrencyConverter {
    constructor() {
        this.fromCurrency = document.getElementById('from-currency');
        this.toCurrency = document.getElementById('to-currency');
        this.amountInput = document.getElementById('currency-amount');
        this.convertBtn = document.getElementById('convert-currency');
        this.swapBtn = document.getElementById('swap-currencies');
        this.result = document.getElementById('currency-result');
        this.resultText = document.getElementById('currency-result-text');
        this.rateText = document.getElementById('currency-rate-text');
        this.currencies = {};
        
        if (this.fromCurrency) {
            this.initEventListeners();
            this.loadCurrencies();
        }
    }
    
    async loadCurrencies() {
        try {
            // Get exchange rates which includes all available currencies
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            
            if (data.rates) {
                // Convert rates object to currencies format
                this.currencies = {};
                const currencyNames = {
                    'USD': 'US Dollar', 'EUR': 'Euro', 'GBP': 'British Pound', 'JPY': 'Japanese Yen',
                    'AUD': 'Australian Dollar', 'CAD': 'Canadian Dollar', 'CHF': 'Swiss Franc', 'CNY': 'Chinese Yuan',
                    'SEK': 'Swedish Krona', 'NZD': 'New Zealand Dollar', 'MXN': 'Mexican Peso', 'SGD': 'Singapore Dollar',
                    'HKD': 'Hong Kong Dollar', 'NOK': 'Norwegian Krone', 'KRW': 'South Korean Won', 'TRY': 'Turkish Lira',
                    'RUB': 'Russian Ruble', 'INR': 'Indian Rupee', 'BRL': 'Brazilian Real', 'ZAR': 'South African Rand',
                    'PLN': 'Polish Zloty', 'THB': 'Thai Baht', 'IDR': 'Indonesian Rupiah', 'HUF': 'Hungarian Forint',
                    'CZK': 'Czech Koruna', 'ILS': 'Israeli Shekel', 'CLP': 'Chilean Peso', 'PHP': 'Philippine Peso',
                    'AED': 'UAE Dirham', 'COP': 'Colombian Peso', 'SAR': 'Saudi Riyal', 'MYR': 'Malaysian Ringgit',
                    'RON': 'Romanian Leu', 'BGN': 'Bulgarian Lev', 'HRK': 'Croatian Kuna', 'DKK': 'Danish Krone',
                    'ISK': 'Icelandic Krona', 'EGP': 'Egyptian Pound', 'QAR': 'Qatari Riyal', 'KWD': 'Kuwaiti Dinar',
                    'BHD': 'Bahraini Dinar', 'OMR': 'Omani Rial', 'JOD': 'Jordanian Dinar', 'LBP': 'Lebanese Pound',
                    'PKR': 'Pakistani Rupee', 'LKR': 'Sri Lankan Rupee', 'BDT': 'Bangladeshi Taka', 'VND': 'Vietnamese Dong',
                    'KZT': 'Kazakhstani Tenge', 'UZS': 'Uzbekistani Som', 'GEL': 'Georgian Lari', 'AMD': 'Armenian Dram',
                    'AZN': 'Azerbaijani Manat', 'BYN': 'Belarusian Ruble', 'UAH': 'Ukrainian Hryvnia', 'MDL': 'Moldovan Leu'
                };
                
                // Only include currencies we have names for
                Object.keys(data.rates).forEach(code => {
                    if (currencyNames[code]) {
                        this.currencies[code] = { description: currencyNames[code] };
                    }
                });
                
                this.populateCurrencyDropdowns();
            } else {
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
        
        // Add swap functionality
        if (this.swapBtn) {
            this.swapBtn.addEventListener('click', () => this.swapCurrencies());
        }
    }
    
    swapCurrencies() {
        const fromValue = this.fromCurrency.value;
        const toValue = this.toCurrency.value;
        
        // Swap the values
        this.fromCurrency.value = toValue;
        this.toCurrency.value = fromValue;
        
        // Trigger conversion if amount is entered
        if (this.amountInput.value) {
            this.convertCurrency();
        }
        
        // Add visual feedback
        this.swapBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.swapBtn.style.transform = 'scale(1)';
        }, 150);
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
            
            // Get latest rates from the base currency
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
            const data = await response.json();
            
            if (data.rates && data.rates[to]) {
                const rate = data.rates[to];
                const convertedAmount = amount * rate;
                this.showResult(amount, convertedAmount, rate, from, to);
            } else {
                throw new Error('Currency not found');
            }
        } catch (error) {
            console.error('Currency conversion error:', error);
            this.showNotification('Error converting currency. Please check your internet connection.', 'error');
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
        
        // Show ad section when results are displayed
        const adSection = document.getElementById('currency-ad-section');
        if (adSection) {
            adSection.classList.remove('hidden');
        }
    }
    
    showNotification(message, type = 'error') {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg bg-red-500 text-white transition-all duration-300';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
    
    destroy() {
        // Clean up
        this.currencies = {};
    }
}

// Global Land Unit Converter
class LandUnitConverter {
    constructor() {
        this.setupGlobalUnits();
        this.initEventListeners();
        this.populateUnitDropdown();
        
        // Make instance globally accessible for toggle functionality
        window.landConverter = this;
    }
    
    setupGlobalUnits() {
        // Global land units with conversion rates to square feet
        this.globalLandUnits = [
            { code: 'sqft', name: 'Square Feet', rate: 1, region: 'Global' },
            { code: 'sqm', name: 'Square Meters', rate: 10.7639, region: 'Global' },
            { code: 'sqyd', name: 'Square Yards', rate: 9, region: 'Global' },
            { code: 'acres', name: 'Acres', rate: 43560, region: 'Global' },
            { code: 'hectares', name: 'Hectares', rate: 107639, region: 'Global' },
            { code: 'bigha', name: 'Bigha (India)', rate: 27225, region: 'India' },
            { code: 'gunta', name: 'Gunta (India)', rate: 1089, region: 'India' },
            { code: 'katha', name: 'Katha (Nepal)', rate: 3645, region: 'Nepal' },
            { code: 'ping', name: 'Ping (Taiwan)', rate: 35.583, region: 'Taiwan' },
            { code: 'tsubo', name: 'Tsubo (Japan)', rate: 35.583, region: 'Japan' },
            { code: 'mu', name: 'Mu (China)', rate: 666.667, region: 'China' },
            { code: 'dunam', name: 'Dunam (Middle East)', rate: 10763.9, region: 'Middle East' },
            { code: 'cuerda', name: 'Cuerda (Latin America)', rate: 39304, region: 'Latin America' }
        ];
    }
    
    populateUnitDropdown() {
        const fromUnit = document.getElementById('landInput') ? document.getElementById('fromUnit') : document.getElementById('land-unit');
        if (!fromUnit) return;
        
        // Clear existing options
        fromUnit.innerHTML = '';
        
        // Group units by region
        const regions = {};
        this.globalLandUnits.forEach(unit => {
            if (!regions[unit.region]) regions[unit.region] = [];
            regions[unit.region].push(unit);
        });
        
        // Add options grouped by region
        Object.keys(regions).forEach(region => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = region;
            
            regions[region].forEach(unit => {
                const option = document.createElement('option');
                option.value = unit.code;
                option.textContent = unit.name;
                optgroup.appendChild(option);
            });
            
            fromUnit.appendChild(optgroup);
        });
        
        // Set default to acres
        fromUnit.value = 'acres';
    }
    
    initEventListeners() {
        // Support both new and legacy element IDs
        const inputField = document.getElementById('landInput') || document.getElementById('land-value');
        const fromUnit = document.getElementById('fromUnit') || document.getElementById('land-unit');
        
        if (inputField && fromUnit) {
            inputField.addEventListener('input', () => this.convertUnits());
            fromUnit.addEventListener('change', () => this.convertUnits());
        }
    }
    
    convertUnits() {
        // Support both new and legacy element IDs
        const inputField = document.getElementById('landInput') || document.getElementById('land-value');
        const fromUnit = document.getElementById('fromUnit') || document.getElementById('land-unit');
        const resultsContainer = document.getElementById('landResults');
        
        if (!inputField || !fromUnit) return;
        
        const value = parseFloat(inputField.value);
        const fromUnitCode = fromUnit.value;
        
        if (!value || value <= 0) {
            if (resultsContainer) {
                resultsContainer.innerHTML = '';
            } else {
                // Legacy support - reset individual result elements
                const legacyResults = {
                    acres: document.getElementById('result-acres'),
                    gunta: document.getElementById('result-gunta'),
                    sqft: document.getElementById('result-sqft'),
                    bigha: document.getElementById('result-bigha')
                };
                Object.values(legacyResults).forEach(element => {
                    if (element) element.textContent = '0';
                });
            }
            return;
        }
        
        // Find the selected unit
        const selectedUnit = this.globalLandUnits.find(unit => unit.code === fromUnitCode);
        if (!selectedUnit) return;
        
        // Convert to base unit (square feet)
        const baseSqFt = value * selectedUnit.rate;
        
        if (resultsContainer) {
            // New display format with grouped results
            const results = this.globalLandUnits.map(unit => ({
                name: unit.name,
                region: unit.region,
                value: baseSqFt / unit.rate
            }));
            this.displayResults(results, selectedUnit.name, value);
        } else {
            // Legacy support for old HTML structure
            this.displayLegacyResults(baseSqFt);
        }
    }
    
    displayResults(results, fromUnitName, inputValue) {
        const resultsContainer = document.getElementById('landResults');
        if (!resultsContainer) return;
        
        // Group results by region
        const regions = {};
        results.forEach(result => {
            if (!regions[result.region]) regions[result.region] = [];
            regions[result.region].push(result);
        });
        
        // Load expanded state from localStorage
        const expandedState = JSON.parse(localStorage.getItem('landConverter_expandedRegions') || '{"Global": true}');
        
        let html = `
            <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div class="text-center">
                    <div class="text-lg font-semibold text-blue-800">Converting ${inputValue} ${fromUnitName}</div>
                    <div class="text-sm text-blue-600 mt-1">Results across global land measurement units</div>
                </div>
            </div>
        `;
        
        // Display results grouped by region with collapsible sections
        Object.keys(regions).forEach((region, index) => {
            const isExpanded = expandedState[region] || false;
            const chevronIcon = isExpanded ? '▾' : '▸';
            const contentClass = isExpanded ? 'expanded' : 'collapsed';
            
            html += `
                <div class="mb-4 region-section" data-region="${region}">
                    <button class="region-toggle w-full text-left p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-lg border border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500" onclick="landConverter.toggleRegion('${region}')">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                                <span class="inline-block w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></span>
                                ${region}
                                <span class="ml-2 text-sm text-gray-500">(${regions[region].length} units)</span>
                            </h3>
                            <span class="chevron text-xl text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-0' : 'rotate-90'}">${chevronIcon}</span>
                        </div>
                    </button>
                    <div class="region-content overflow-hidden transition-all duration-300 ease-in-out ${contentClass}" style="max-height: ${isExpanded ? 'none' : '0'}; opacity: ${isExpanded ? '1' : '0'};">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            `;
            
            regions[region].forEach(result => {
                const isLarge = result.value >= 1000000;
                const displayValue = isLarge ? 
                    (result.value / 1000000).toFixed(2) + 'M' : 
                    result.value.toFixed(4);
                
                html += `
                    <div class="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 hover:scale-105">
                        <div class="text-sm text-gray-600 mb-1">${result.name}</div>
                        <div class="text-xl font-bold text-purple-600">${displayValue}</div>
                        ${isLarge ? '<div class="text-xs text-gray-500">Million units</div>' : ''}
                    </div>
                `;
            });
            
            html += '</div></div></div>';
        });
        
        resultsContainer.innerHTML = html;
        
        // Apply smooth animations after rendering
        setTimeout(() => {
            this.initializeCollapsibleAnimations();
        }, 10);
    }
    
    toggleRegion(region) {
        const regionSection = document.querySelector(`[data-region="${region}"]`);
        if (!regionSection) return;
        
        const content = regionSection.querySelector('.region-content');
        const chevron = regionSection.querySelector('.chevron');
        const isExpanded = content.classList.contains('expanded');
        
        // Load current state
        const expandedState = JSON.parse(localStorage.getItem('landConverter_expandedRegions') || '{}');
        
        if (isExpanded) {
            // Collapse
            content.style.maxHeight = content.scrollHeight + 'px';
            content.offsetHeight; // Force reflow
            content.style.maxHeight = '0';
            content.style.opacity = '0';
            content.classList.remove('expanded');
            content.classList.add('collapsed');
            chevron.style.transform = 'rotate(90deg)';
            chevron.textContent = '▸';
            expandedState[region] = false;
        } else {
            // Expand
            content.classList.remove('collapsed');
            content.classList.add('expanded');
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.opacity = '1';
            chevron.style.transform = 'rotate(0deg)';
            chevron.textContent = '▾';
            expandedState[region] = true;
            
            // After animation completes, remove max-height for responsive behavior
            setTimeout(() => {
                if (content.classList.contains('expanded')) {
                    content.style.maxHeight = 'none';
                }
            }, 300);
        }
        
        // Save state to localStorage
        localStorage.setItem('landConverter_expandedRegions', JSON.stringify(expandedState));
    }
    
    initializeCollapsibleAnimations() {
        // Set initial heights for collapsed sections
        document.querySelectorAll('.region-content.collapsed').forEach(content => {
            content.style.maxHeight = '0';
            content.style.opacity = '0';
        });
        
        // Set expanded sections to proper height
        document.querySelectorAll('.region-content.expanded').forEach(content => {
            content.style.maxHeight = 'none';
            content.style.opacity = '1';
        });
    }
    
    displayLegacyResults(baseSqFt) {
        // Legacy support for old HTML structure
        const legacyResults = {
            acres: document.getElementById('result-acres'),
            gunta: document.getElementById('result-gunta'),
            sqft: document.getElementById('result-sqft'),
            bigha: document.getElementById('result-bigha')
        };
        
        const legacyRates = {
            acres: 43560,
            gunta: 1089,
            sqft: 1,
            bigha: 27225
        };
        
        if (legacyResults.acres) legacyResults.acres.textContent = (baseSqFt / legacyRates.acres).toFixed(4);
        if (legacyResults.gunta) legacyResults.gunta.textContent = (baseSqFt / legacyRates.gunta).toFixed(4);
        if (legacyResults.sqft) legacyResults.sqft.textContent = baseSqFt.toFixed(2);
        if (legacyResults.bigha) legacyResults.bigha.textContent = (baseSqFt / legacyRates.bigha).toFixed(4);
    }
    
    destroy() {
        // Clean up
    }
}

// Enhanced Instagram DP Resizer
class InstagramDPResizer {
    constructor() {
        this.dpInput = document.getElementById('dp-input');
        this.uploadArea = document.getElementById('dp-upload-area');
        this.dpPreview = document.getElementById('dp-preview');
        this.dpOriginal = document.getElementById('dp-original');
        this.resizeBtn = document.getElementById('resize-dp');
        this.dpResult = document.getElementById('dp-result');
        this.dpCanvas = document.getElementById('dp-canvas');
        this.downloadBtn = document.getElementById('download-dp');
        this.backgroundOption = document.getElementById('background-option');
        
        this.dpSize = 320;
        this.currentFile = null;
        this.processedBlob = null;
        
        if (this.dpInput || this.uploadArea) {
            this.initEventListeners();
            this.setupDragAndDrop();
        }
    }
    
    initEventListeners() {
        if (this.dpInput) {
            this.dpInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        if (this.uploadArea) {
            this.uploadArea.addEventListener('click', () => {
                if (this.dpInput) this.dpInput.click();
            });
        }
        
        if (this.resizeBtn) {
            this.resizeBtn.addEventListener('click', () => this.processImage());
        }
        
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.downloadResizedImage());
        }
        
        if (this.backgroundOption) {
            this.backgroundOption.addEventListener('change', () => {
                if (this.currentFile) {
                    this.processImage();
                }
            });
        }
        
        // Reset button functionality
        const resetBtn = document.getElementById('reset-dp');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }
    }
    
    setupDragAndDrop() {
        if (!this.uploadArea) return;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => this.highlight(), false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => this.unhighlight(), false);
        });
        
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e), false);
    }
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    highlight() {
        if (this.uploadArea) {
            this.uploadArea.classList.add('dragover');
        }
    }
    
    unhighlight() {
        if (this.uploadArea) {
            this.uploadArea.classList.remove('dragover');
        }
    }
    
    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }
    
    handleFile(file) {
        if (!this.validateFile(file)) return;
        
        this.currentFile = file;
        this.showPreview(file);
    }
    
    validateFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!validTypes.includes(file.type)) {
            this.showNotification('Please select a valid image file (JPG, PNG, or WebP)', 'error');
            return false;
        }
        
        if (file.size > maxSize) {
            this.showNotification('File size must be less than 10MB', 'error');
            return false;
        }
        
        return true;
    }
    
    showPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.dpOriginal) {
                this.dpOriginal.src = e.target.result;
                this.dpOriginal.onload = () => {
                    this.updateImageInfo();
                    this.processImage(); // Auto-process on upload
                };
            }
            
            if (this.dpPreview) {
                this.dpPreview.classList.remove('hidden');
                this.dpPreview.classList.add('fade-in');
            }
        };
        reader.readAsDataURL(file);
    }
    
    updateImageInfo() {
        if (!this.dpOriginal) return;
        
        const infoElement = document.getElementById('dp-image-info');
        if (infoElement) {
            const { naturalWidth, naturalHeight } = this.dpOriginal;
            infoElement.innerHTML = `
                <div class="text-sm text-gray-600 mb-2">
                    Original: ${naturalWidth} × ${naturalHeight}px | 
                    Target: ${this.dpSize} × ${this.dpSize}px
                </div>
            `;
        }
    }
    
    async processImage() {
        if (!this.currentFile || !this.dpOriginal) return;
        
        try {
            const result = await this.resizeToSquareDP(this.currentFile);
            this.processedBlob = result.blob;
            
            if (this.dpCanvas) {
                const ctx = this.dpCanvas.getContext('2d');
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, this.dpSize, this.dpSize);
                    ctx.drawImage(img, 0, 0);
                };
                img.src = result.preview;
            }
            
            if (this.dpResult) {
                this.dpResult.classList.remove('hidden');
                this.dpResult.classList.add('fade-in');
            }
            
            this.showNotification('Image processed successfully!', 'success');
            
        } catch (error) {
            console.error('Error processing image:', error);
            this.showNotification('Error processing image. Please try again.', 'error');
        }
    }
    
    resizeToSquareDP(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    canvas.width = this.dpSize;
                    canvas.height = this.dpSize;
                    
                    // Background fill option
                    const useBackground = this.backgroundOption ? this.backgroundOption.checked : true;
                    if (useBackground) {
                        // Enhanced Instagram-style gradient background
                        const gradient = ctx.createLinearGradient(0, 0, this.dpSize, this.dpSize);
                        gradient.addColorStop(0, '#ff7e5f');
                        gradient.addColorStop(1, '#feb47b');
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, 0, this.dpSize, this.dpSize);
                    }
                    
                    // Calculate aspect-fit size (fit image within square)
                    const ratio = Math.min(this.dpSize / img.width, this.dpSize / img.height);
                    const newWidth = img.width * ratio;
                    const newHeight = img.height * ratio;
                    
                    const xOffset = (this.dpSize - newWidth) / 2;
                    const yOffset = (this.dpSize - newHeight) / 2;
                    
                    // Draw image centered
                    ctx.drawImage(img, xOffset, yOffset, newWidth, newHeight);
                    
                    canvas.toBlob(blob => {
                        resolve({
                            blob,
                            preview: canvas.toDataURL('image/png')
                        });
                    }, 'image/png', 0.9);
                };
                img.onerror = reject;
                img.src = reader.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });
    }
    
    downloadResizedImage() {
        if (!this.processedBlob) {
            this.showNotification('No processed image to download', 'error');
            return;
        }
        
        const url = URL.createObjectURL(this.processedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Instagram-DP-${this.dpSize}x${this.dpSize}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Image downloaded successfully!', 'success');
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'success' ? 'bg-green-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    reset() {
        this.currentFile = null;
        this.processedBlob = null;
        
        if (this.dpInput) this.dpInput.value = '';
        if (this.dpPreview) this.dpPreview.classList.add('hidden');
        if (this.dpResult) this.dpResult.classList.add('hidden');
        if (this.dpCanvas) {
            const ctx = this.dpCanvas.getContext('2d');
            ctx.clearRect(0, 0, this.dpSize, this.dpSize);
        }
    }
    
    destroy() {
        this.reset();
    }
}

// Word Counter Tool
class WordCounter {
    constructor() {
        this.wordInput = document.getElementById('word-input');
        this.wordCount = document.getElementById('word-count');
        this.charCount = document.getElementById('char-count');
        this.charCountNoSpaces = document.getElementById('char-count-no-spaces');
        this.readTime = document.getElementById('read-time');
        this.sentenceCount = document.getElementById('sentence-count');
        this.paragraphCount = document.getElementById('paragraph-count');
        
        if (this.wordInput) {
            this.initEventListeners();
            this.updateStats(); // Initialize with empty stats
        }
    }
    
    initEventListeners() {
        this.wordInput.addEventListener('input', () => this.updateStats());
        this.wordInput.addEventListener('paste', () => {
            // Update stats after paste completes
            setTimeout(() => this.updateStats(), 10);
        });
        
        // Clear button
        const clearBtn = document.getElementById('clear-text');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearText());
        }
        
        // Copy button
        const copyBtn = document.getElementById('copy-text');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyText());
        }
        
        // Sample text button
        const sampleBtn = document.getElementById('sample-text');
        if (sampleBtn) {
            sampleBtn.addEventListener('click', () => this.loadSampleText());
        }
    }
    
    updateStats() {
        const text = this.wordInput ? this.wordInput.value : '';
        
        // Word count
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = text.trim() === '' ? 0 : words.length;
        
        // Character counts
        const charCount = text.length;
        const charCountNoSpaces = text.replace(/\s/g, '').length;
        
        // Sentence count
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        const sentenceCount = sentences.length;
        
        // Paragraph count
        const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
        const paragraphCount = paragraphs.length;
        
        // Reading time (average 200 WPM)
        const readingTime = Math.ceil(wordCount / 200);
        const readTimeText = readingTime === 0 ? '0 min' : 
                            readingTime === 1 ? '1 min' : 
                            `${readingTime} min`;
        
        // Update display
        if (this.wordCount) this.wordCount.textContent = wordCount.toLocaleString();
        if (this.charCount) this.charCount.textContent = charCount.toLocaleString();
        if (this.charCountNoSpaces) this.charCountNoSpaces.textContent = charCountNoSpaces.toLocaleString();
        if (this.readTime) this.readTime.textContent = readTimeText;
        if (this.sentenceCount) this.sentenceCount.textContent = sentenceCount.toLocaleString();
        if (this.paragraphCount) this.paragraphCount.textContent = paragraphCount.toLocaleString();
        
        // Update progress indicators
        this.updateProgressIndicators(wordCount, charCount);
    }
    
    updateProgressIndicators(wordCount, charCount) {
        // Word count milestones
        const wordMilestones = [100, 500, 1000, 2000, 5000];
        const wordProgress = document.getElementById('word-progress');
        
        if (wordProgress) {
            let currentMilestone = wordMilestones.find(milestone => wordCount < milestone) || 10000;
            let progress = Math.min((wordCount / currentMilestone) * 100, 100);
            
            wordProgress.style.width = `${progress}%`;
            wordProgress.className = `h-2 rounded-full transition-all duration-300 ${
                progress < 25 ? 'bg-red-400' :
                progress < 50 ? 'bg-yellow-400' :
                progress < 75 ? 'bg-blue-400' : 'bg-green-400'
            }`;
        }
        
        // Character limit indicators (common limits)
        const twitterLimit = 280;
        const linkedinLimit = 3000;
        const charProgress = document.getElementById('char-progress');
        
        if (charProgress) {
            let limit = charCount <= twitterLimit ? twitterLimit : linkedinLimit;
            let progress = Math.min((charCount / limit) * 100, 100);
            
            charProgress.style.width = `${progress}%`;
            charProgress.className = `h-2 rounded-full transition-all duration-300 ${
                progress < 50 ? 'bg-green-400' :
                progress < 80 ? 'bg-yellow-400' :
                progress < 100 ? 'bg-orange-400' : 'bg-red-400'
            }`;
        }
    }
    
    clearText() {
        if (this.wordInput) {
            this.wordInput.value = '';
            this.updateStats();
            this.wordInput.focus();
            this.showNotification('Text cleared', 'info');
        }
    }
    
    async copyText() {
        if (!this.wordInput || !this.wordInput.value.trim()) {
            this.showNotification('No text to copy', 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(this.wordInput.value);
            this.showNotification('Text copied to clipboard', 'success');
        } catch (err) {
            // Fallback for older browsers
            this.wordInput.select();
            document.execCommand('copy');
            this.showNotification('Text copied to clipboard', 'success');
        }
    }
    
    loadSampleText() {
        const sampleTexts = [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            
            "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once. It's commonly used to test typewriters, keyboards, and fonts. The phrase has been used since the late 1800s and remains popular today for its brevity and completeness.",
            
            "In the digital age, effective communication has become more important than ever. Whether you're writing emails, social media posts, or important documents, knowing your word count, character limits, and reading time helps you craft better content. This tool helps writers, students, and professionals optimize their text for various platforms and purposes."
        ];
        
        const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
        if (this.wordInput) {
            this.wordInput.value = randomText;
            this.updateStats();
            this.showNotification('Sample text loaded', 'success');
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'success' ? 'bg-green-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }
    
    destroy() {
        // Clean up
        if (this.wordInput) {
            this.wordInput.value = '';
            this.updateStats();
        }
    }
}

class DistanceConverter {
    constructor() {
        this.distanceFactors = {
            meters: 1,
            kilometers: 0.001,
            miles: 0.000621371,
            feet: 3.28084,
            yards: 1.09361,
            inches: 39.3701,
            centimeters: 100,
            millimeters: 1000,
            nautical_miles: 0.000539957,
        };
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.inputField = document.getElementById('distance-input');
        this.fromUnit = document.getElementById('from-unit');
        this.toUnit = document.getElementById('to-unit');
        this.resultField = document.getElementById('converted-distance');
        this.clearBtn = document.getElementById('clear-distance');

        if (this.inputField) {
            this.inputField.addEventListener('input', () => this.updateResult());
        }
        
        if (this.fromUnit) {
            this.fromUnit.addEventListener('change', () => this.updateResult());
        }
        
        if (this.toUnit) {
            this.toUnit.addEventListener('change', () => this.updateResult());
        }

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearDistance());
        }

        // Initial update
        this.updateResult();
    }

    convertDistance(value, fromUnit, toUnit) {
        const baseValue = parseFloat(value) / this.distanceFactors[fromUnit];
        const convertedValue = baseValue * this.distanceFactors[toUnit];
        return convertedValue;
    }

    updateResult() {
        if (!this.inputField || !this.fromUnit || !this.toUnit || !this.resultField) return;

        const val = this.inputField.value;
        if (!val || isNaN(val) || val === '') {
            this.resultField.textContent = 'Enter a distance to see the conversion';
            return;
        }

        const result = this.convertDistance(val, this.fromUnit.value, this.toUnit.value);
        const formattedResult = this.formatResult(result);
        
        const fromUnitName = this.getUnitDisplayName(this.fromUnit.value);
        const toUnitName = this.getUnitDisplayName(this.toUnit.value);
        
        this.resultField.textContent = `${val} ${fromUnitName} = ${formattedResult} ${toUnitName}`;
    }

    formatResult(value) {
        if (value === 0) return '0';
        
        // For very small numbers, use scientific notation
        if (Math.abs(value) < 0.0001) {
            return value.toExponential(3);
        }
        
        // For large numbers, use comma separation
        if (Math.abs(value) >= 1000000) {
            return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
        
        // For normal numbers, show appropriate decimal places
        if (Math.abs(value) >= 100) {
            return value.toFixed(2);
        } else if (Math.abs(value) >= 10) {
            return value.toFixed(3);
        } else {
            return value.toFixed(4);
        }
    }

    getUnitDisplayName(unit) {
        const displayNames = {
            meters: 'meters',
            kilometers: 'kilometers',
            miles: 'miles',
            feet: 'feet',
            yards: 'yards',
            inches: 'inches',
            centimeters: 'centimeters',
            millimeters: 'millimeters',
            nautical_miles: 'nautical miles'
        };
        return displayNames[unit] || unit;
    }

    clearDistance() {
        if (this.inputField) {
            this.inputField.value = '';
        }
        if (this.resultField) {
            this.resultField.textContent = 'Enter a distance to see the conversion';
        }
        this.showNotification('Distance cleared!', 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium z-50 transition-all duration-300 transform translate-x-full`;
        
        // Set colors based on type
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500');
                break;
            case 'error':
                notification.classList.add('bg-red-500');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500');
                break;
            default:
                notification.classList.add('bg-cyan-500');
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    destroy() {
        // Clean up event listeners
        if (this.inputField) {
            this.inputField.removeEventListener('input', this.updateResult);
        }
        if (this.fromUnit) {
            this.fromUnit.removeEventListener('change', this.updateResult);
        }
        if (this.toUnit) {
            this.toUnit.removeEventListener('change', this.updateResult);
        }
        if (this.clearBtn) {
            this.clearBtn.removeEventListener('click', this.clearDistance);
        }
    }
}

class WeightConverter {
    constructor() {
        this.weightFactors = {
            grams: 1,
            kilograms: 0.001,
            milligrams: 1000,
            pounds: 0.00220462,
            ounces: 0.035274,
            tons: 0.000001,
            stones: 0.000157473
        };
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.inputField = document.getElementById('weight-input');
        this.fromUnit = document.getElementById('weight-from');
        this.toUnit = document.getElementById('weight-to');
        this.resultField = document.getElementById('weight-result');
        this.clearBtn = document.getElementById('weight-clear');

        if (this.inputField) {
            this.inputField.addEventListener('input', () => this.updateResult());
        }
        
        if (this.fromUnit) {
            this.fromUnit.addEventListener('change', () => this.updateResult());
        }
        
        if (this.toUnit) {
            this.toUnit.addEventListener('change', () => this.updateResult());
        }

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearWeight());
        }

        // Initial update
        this.updateResult();
    }

    convertWeight(value, fromUnit, toUnit) {
        const baseValue = parseFloat(value) / this.weightFactors[fromUnit];
        const convertedValue = baseValue * this.weightFactors[toUnit];
        return convertedValue;
    }

    updateResult() {
        if (!this.inputField || !this.fromUnit || !this.toUnit || !this.resultField) return;

        const val = this.inputField.value;
        if (!val || isNaN(val) || val === '') {
            this.resultField.textContent = 'Enter a weight to see the conversion';
            return;
        }

        const result = this.convertWeight(val, this.fromUnit.value, this.toUnit.value);
        const formattedResult = this.formatResult(result);
        
        const fromUnitName = this.getUnitDisplayName(this.fromUnit.value);
        const toUnitName = this.getUnitDisplayName(this.toUnit.value);
        
        this.resultField.textContent = `${val} ${fromUnitName} = ${formattedResult} ${toUnitName}`;
    }

    formatResult(value) {
        if (value === 0) return '0';
        
        // For very small numbers, use scientific notation
        if (Math.abs(value) < 0.0001) {
            return value.toExponential(3);
        }
        
        // For large numbers, use comma separation
        if (Math.abs(value) >= 1000000) {
            return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
        
        // For normal numbers, show appropriate decimal places
        if (Math.abs(value) >= 100) {
            return value.toFixed(2);
        } else if (Math.abs(value) >= 10) {
            return value.toFixed(3);
        } else {
            return value.toFixed(4);
        }
    }

    getUnitDisplayName(unit) {
        const displayNames = {
            grams: 'grams',
            kilograms: 'kilograms',
            milligrams: 'milligrams',
            pounds: 'pounds',
            ounces: 'ounces',
            tons: 'tons',
            stones: 'stones'
        };
        return displayNames[unit] || unit;
    }

    clearWeight() {
        if (this.inputField) {
            this.inputField.value = '';
        }
        if (this.resultField) {
            this.resultField.textContent = 'Enter a weight to see the conversion';
        }
        this.showNotification('Weight cleared!', 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium z-50 transition-all duration-300 transform translate-x-full`;
        
        // Set colors based on type
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500');
                break;
            case 'error':
                notification.classList.add('bg-red-500');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500');
                break;
            default:
                notification.classList.add('bg-purple-500');
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    destroy() {
        // Clean up event listeners
        if (this.inputField) {
            this.inputField.removeEventListener('input', this.updateResult);
        }
        if (this.fromUnit) {
            this.fromUnit.removeEventListener('change', this.updateResult);
        }
        if (this.toUnit) {
            this.toUnit.removeEventListener('change', this.updateResult);
        }
        if (this.clearBtn) {
            this.clearBtn.removeEventListener('click', this.clearWeight);
        }
    }
}

class HeightConverter {
    constructor() {
        this.heightFactors = {
            feet: 30.48,
            inches: 2.54,
            centimeters: 1,
            meters: 100
        };
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.inputField = document.getElementById('height-input');
        this.fromUnit = document.getElementById('height-from');
        this.toUnit = document.getElementById('height-to');
        this.resultField = document.getElementById('height-result');
        this.clearBtn = document.getElementById('height-clear');

        if (this.inputField) {
            this.inputField.addEventListener('input', () => this.updateResult());
        }
        
        if (this.fromUnit) {
            this.fromUnit.addEventListener('change', () => this.updateResult());
        }
        
        if (this.toUnit) {
            this.toUnit.addEventListener('change', () => this.updateResult());
        }

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearHeight());
        }

        // Initial update
        this.updateResult();
    }

    convertHeight(value, fromUnit, toUnit) {
        const cmValue = parseFloat(value) * this.heightFactors[fromUnit];
        const converted = cmValue / this.heightFactors[toUnit];
        return converted;
    }

    updateResult() {
        if (!this.inputField || !this.fromUnit || !this.toUnit || !this.resultField) return;

        const val = this.inputField.value;
        if (!val || isNaN(val) || val === '') {
            this.resultField.textContent = 'Enter a height to see the conversion';
            return;
        }

        const result = this.convertHeight(val, this.fromUnit.value, this.toUnit.value);
        const formattedResult = this.formatResult(result);
        
        const fromUnitName = this.getUnitDisplayName(this.fromUnit.value);
        const toUnitName = this.getUnitDisplayName(this.toUnit.value);
        
        this.resultField.textContent = `${val} ${fromUnitName} = ${formattedResult} ${toUnitName}`;
    }

    formatResult(value) {
        if (value === 0) return '0';
        
        // For very small numbers, use scientific notation
        if (Math.abs(value) < 0.0001) {
            return value.toExponential(3);
        }
        
        // For large numbers, use comma separation
        if (Math.abs(value) >= 1000000) {
            return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
        
        // For normal numbers, show appropriate decimal places
        if (Math.abs(value) >= 100) {
            return value.toFixed(2);
        } else if (Math.abs(value) >= 10) {
            return value.toFixed(2);
        } else {
            return value.toFixed(3);
        }
    }

    getUnitDisplayName(unit) {
        const displayNames = {
            feet: 'feet',
            inches: 'inches',
            centimeters: 'centimeters',
            meters: 'meters'
        };
        return displayNames[unit] || unit;
    }

    clearHeight() {
        if (this.inputField) {
            this.inputField.value = '';
        }
        if (this.resultField) {
            this.resultField.textContent = 'Enter a height to see the conversion';
        }
        this.showNotification('Height cleared!', 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium z-50 transition-all duration-300 transform translate-x-full`;
        
        // Set colors based on type
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500');
                break;
            case 'error':
                notification.classList.add('bg-red-500');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500');
                break;
            default:
                notification.classList.add('bg-indigo-500');
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    destroy() {
        // Clean up event listeners
        if (this.inputField) {
            this.inputField.removeEventListener('input', this.updateResult);
        }
        if (this.fromUnit) {
            this.fromUnit.removeEventListener('change', this.updateResult);
        }
        if (this.toUnit) {
            this.toUnit.removeEventListener('change', this.updateResult);
        }
        if (this.clearBtn) {
            this.clearBtn.removeEventListener('click', this.clearHeight);
        }
    }
}

class IPAddressExtractor {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        this.inputArea = document.getElementById('ip-input');
        this.resultArea = document.getElementById('ip-results');
        this.extractBtn = document.getElementById('extract-ip');
        this.clearBtn = document.getElementById('ip-clear');
        this.copyBtn = document.getElementById('copy-ip');
        this.getMyIpBtn = document.getElementById('get-my-ip');

        if (this.extractBtn) {
            this.extractBtn.addEventListener('click', () => this.extractIPs());
        }

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearAll());
        }

        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => this.copyResults());
        }

        if (this.getMyIpBtn) {
            this.getMyIpBtn.addEventListener('click', () => this.getMyIPAddress());
        }
    }

    extractIPAddresses(text) {
        // Improved IPv4 regex with validation
        const ipv4Pattern = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
        
        // IPv6 regex pattern (simplified but covers most common formats)
        const ipv6Pattern = /\b(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}\b|\b(?:[a-fA-F0-9]{1,4}:){1,7}:\b|\b(?:[a-fA-F0-9]{1,4}:){1,6}:[a-fA-F0-9]{1,4}\b|\b(?:[a-fA-F0-9]{1,4}:){1,5}(?::[a-fA-F0-9]{1,4}){1,2}\b|\b(?:[a-fA-F0-9]{1,4}:){1,4}(?::[a-fA-F0-9]{1,4}){1,3}\b|\b(?:[a-fA-F0-9]{1,4}:){1,3}(?::[a-fA-F0-9]{1,4}){1,4}\b|\b(?:[a-fA-F0-9]{1,4}:){1,2}(?::[a-fA-F0-9]{1,4}){1,5}\b|\b[a-fA-F0-9]{1,4}:(?::[a-fA-F0-9]{1,4}){1,6}\b|\b:(?::[a-fA-F0-9]{1,4}){1,7}\b|\b::(?:[a-fA-F0-9]{1,4}:){0,6}[a-fA-F0-9]{1,4}\b|\b(?:[a-fA-F0-9]{1,4}:){1,7}:\b/g;

        const ipv4Matches = text.match(ipv4Pattern) || [];
        const ipv6Matches = text.match(ipv6Pattern) || [];

        // Filter out invalid IPv4 addresses (e.g., 999.999.999.999)
        const validIPv4 = ipv4Matches.filter(ip => {
            const parts = ip.split('.');
            return parts.every(part => parseInt(part) <= 255);
        });

        return [...new Set([...validIPv4, ...ipv6Matches])]; // Unique list
    }

    extractIPs() {
        if (!this.inputArea || !this.resultArea) return;

        const text = this.inputArea.value.trim();
        if (!text) {
            this.resultArea.innerHTML = '<p class="text-amber-600 font-medium">Please enter some text or logs to extract IP addresses from.</p>';
            return;
        }

        const ips = this.extractIPAddresses(text);

        if (ips.length === 0) {
            this.resultArea.innerHTML = '<p class="text-red-500 font-medium">No valid IP addresses found in the provided text.</p>';
        } else {
            // Group by type
            const ipv4s = ips.filter(ip => ip.includes('.'));
            const ipv6s = ips.filter(ip => ip.includes(':'));

            let html = `<div class="space-y-4">`;
            
            if (ipv4s.length > 0) {
                html += `
                    <div>
                        <h4 class="text-lg font-semibold text-emerald-700 mb-2">IPv4 Addresses (${ipv4s.length})</h4>
                        <ul class="list-disc list-inside space-y-1 text-gray-700">
                            ${ipv4s.map(ip => `<li class="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block mr-2 mb-1">${ip}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            if (ipv6s.length > 0) {
                html += `
                    <div>
                        <h4 class="text-lg font-semibold text-blue-700 mb-2">IPv6 Addresses (${ipv6s.length})</h4>
                        <ul class="list-disc list-inside space-y-1 text-gray-700">
                            ${ipv6s.map(ip => `<li class="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block mr-2 mb-1">${ip}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            html += `
                <div class="mt-4 p-3 bg-emerald-100 rounded-lg">
                    <p class="text-emerald-800 font-medium">Total: ${ips.length} unique IP address${ips.length !== 1 ? 'es' : ''} found</p>
                </div>
            </div>`;

            this.resultArea.innerHTML = html;
        }

        this.showNotification(`Found ${ips.length} IP address${ips.length !== 1 ? 'es' : ''}`, ips.length > 0 ? 'success' : 'info');
    }

    async getMyIPAddress() {
        if (!this.inputArea) return;

        try {
            this.showNotification('Fetching your IP address...', 'info');
            
            const response = await fetch('https://api.ipify.org?format=json');
            if (!response.ok) {
                throw new Error('Failed to fetch IP address');
            }
            
            const data = await response.json();
            const ipText = `My current IP address is ${data.ip}\nDetected from: ${window.location.hostname}\nTimestamp: ${new Date().toISOString()}`;
            
            this.inputArea.value = ipText;
            this.showNotification('IP address added! Click "Extract IPs" to analyze it.', 'success');
            
            // Auto-trigger extraction for better UX
            setTimeout(() => {
                if (this.extractBtn) {
                    this.extractBtn.click();
                }
            }, 500);
            
        } catch (error) {
            console.error('Error fetching IP address:', error);
            this.showNotification('Unable to fetch IP address. Please check your internet connection.', 'error');
        }
    }

    async copyResults() {
        if (!this.resultArea) return;

        const text = this.resultArea.innerText;
        if (!text || text.includes('Click "Extract IPs"')) {
            this.showNotification('No IP addresses to copy. Extract some first!', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('IP addresses copied to clipboard!', 'success');
        } catch (err) {
            this.showNotification('Failed to copy to clipboard', 'error');
        }
    }

    clearAll() {
        if (this.inputArea) {
            this.inputArea.value = '';
        }
        if (this.resultArea) {
            this.resultArea.innerHTML = 'Click "Extract IPs" to find all IPv4 and IPv6 addresses in your text.';
        }
        this.showNotification('Cleared input and results', 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium z-50 transition-all duration-300 transform translate-x-full`;
        
        // Set colors based on type
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500');
                break;
            case 'error':
                notification.classList.add('bg-red-500');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500');
                break;
            default:
                notification.classList.add('bg-emerald-500');
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    destroy() {
        // Clean up event listeners
        if (this.extractBtn) {
            this.extractBtn.removeEventListener('click', this.extractIPs);
        }
        if (this.clearBtn) {
            this.clearBtn.removeEventListener('click', this.clearAll);
        }
        if (this.copyBtn) {
            this.copyBtn.removeEventListener('click', this.copyResults);
        }
        if (this.getMyIpBtn) {
            this.getMyIpBtn.removeEventListener('click', this.getMyIPAddress);
        }
    }
}

class QRCodeGenerator {
    constructor() {
        this.initEventListeners();
        this.currentQR = null;
    }

    initEventListeners() {
        this.qrInput = document.getElementById('qr-input');
        this.qrCanvas = document.getElementById('qr-canvas');
        this.qrPlaceholder = document.getElementById('qr-placeholder');
        this.generateBtn = document.getElementById('qr-generate');
        this.clearBtn = document.getElementById('qr-clear');
        this.downloadBtn = document.getElementById('qr-download');
        this.copyBtn = document.getElementById('qr-copy-image');
        this.downloadSection = document.getElementById('qr-download-section');

        // Template buttons
        this.urlTemplateBtn = document.getElementById('qr-template-url');
        this.phoneTemplateBtn = document.getElementById('qr-template-phone');
        this.emailTemplateBtn = document.getElementById('qr-template-email');
        this.wifiTemplateBtn = document.getElementById('qr-template-wifi');

        if (this.qrInput) {
            this.qrInput.addEventListener('input', () => this.onInputChange());
        }

        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => this.generateQR());
        }

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearAll());
        }

        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        }

        // Template button events
        if (this.urlTemplateBtn) {
            this.urlTemplateBtn.addEventListener('click', () => this.setTemplate('url'));
        }
        if (this.phoneTemplateBtn) {
            this.phoneTemplateBtn.addEventListener('click', () => this.setTemplate('phone'));
        }
        if (this.emailTemplateBtn) {
            this.emailTemplateBtn.addEventListener('click', () => this.setTemplate('email'));
        }
        if (this.wifiTemplateBtn) {
            this.wifiTemplateBtn.addEventListener('click', () => this.setTemplate('wifi'));
        }
    }

    onInputChange() {
        const text = this.qrInput?.value.trim();
        if (text && text.length > 0) {
            // Auto-generate on input for instant preview
            this.generateQR();
        } else {
            this.hideQR();
        }
    }

    generateQR() {
        if (!this.qrInput || !this.qrCanvas) return;

        const text = this.qrInput.value.trim();
        if (!text) {
            this.showNotification('Please enter some content to generate a QR code', 'warning');
            return;
        }

        try {
            // Check if QRious library is available
            if (typeof QRious === 'undefined') {
                this.showNotification('QR library not loaded. Please refresh the page.', 'error');
                return;
            }

            this.currentQR = new QRious({
                element: this.qrCanvas,
                value: text,
                size: 250,
                background: '#ffffff',
                foreground: '#000000',
                level: 'M' // Error correction level
            });

            this.showQR();
            this.setupDownload();
            this.showNotification('QR code generated successfully!', 'success');

        } catch (error) {
            console.error('Error generating QR code:', error);
            this.showNotification('Failed to generate QR code. Please try again.', 'error');
        }
    }

    showQR() {
        if (this.qrCanvas && this.qrPlaceholder) {
            this.qrCanvas.style.display = 'block';
            this.qrPlaceholder.style.display = 'none';
        }
        if (this.downloadSection) {
            this.downloadSection.classList.remove('hidden');
        }
    }

    hideQR() {
        if (this.qrCanvas && this.qrPlaceholder) {
            this.qrCanvas.style.display = 'none';
            this.qrPlaceholder.style.display = 'block';
        }
        if (this.downloadSection) {
            this.downloadSection.classList.add('hidden');
        }
    }

    setupDownload() {
        if (!this.downloadBtn || !this.currentQR) return;

        try {
            const dataURL = this.currentQR.toDataURL('image/png');
            this.downloadBtn.href = dataURL;
            this.downloadBtn.download = `qrcode-${Date.now()}.png`;
        } catch (error) {
            console.error('Error setting up download:', error);
        }
    }

    async copyToClipboard() {
        if (!this.currentQR) {
            this.showNotification('Generate a QR code first before copying', 'warning');
            return;
        }

        try {
            // Convert canvas to blob
            const canvas = this.qrCanvas;
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });

            if (blob) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                this.showNotification('QR code copied to clipboard!', 'success');
            } else {
                throw new Error('Failed to create image blob');
            }
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.showNotification('Failed to copy QR code to clipboard', 'error');
        }
    }

    setTemplate(type) {
        if (!this.qrInput) return;

        let template = '';
        switch (type) {
            case 'url':
                template = 'https://example.com';
                break;
            case 'phone':
                template = 'tel:+1234567890';
                break;
            case 'email':
                template = 'mailto:hello@example.com';
                break;
            case 'wifi':
                template = 'WIFI:T:WPA;S:NetworkName;P:password;;';
                break;
        }

        this.qrInput.value = template;
        this.qrInput.focus();
        
        // Auto-generate after setting template
        setTimeout(() => this.generateQR(), 100);
        
        this.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} template applied`, 'info');
    }

    clearAll() {
        if (this.qrInput) {
            this.qrInput.value = '';
        }
        this.hideQR();
        this.currentQR = null;
        this.showNotification('Cleared input and QR code', 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium z-50 transition-all duration-300 transform translate-x-full`;
        
        // Set colors based on type
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500');
                break;
            case 'error':
                notification.classList.add('bg-red-500');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500');
                break;
            default:
                notification.classList.add('bg-violet-500');
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    destroy() {
        // Clean up event listeners
        if (this.qrInput) {
            this.qrInput.removeEventListener('input', this.onInputChange);
        }
        if (this.generateBtn) {
            this.generateBtn.removeEventListener('click', this.generateQR);
        }
        if (this.clearBtn) {
            this.clearBtn.removeEventListener('click', this.clearAll);
        }
        if (this.copyBtn) {
            this.copyBtn.removeEventListener('click', this.copyToClipboard);
        }
        if (this.urlTemplateBtn) {
            this.urlTemplateBtn.removeEventListener('click', () => this.setTemplate('url'));
        }
        if (this.phoneTemplateBtn) {
            this.phoneTemplateBtn.removeEventListener('click', () => this.setTemplate('phone'));
        }
        if (this.emailTemplateBtn) {
            this.emailTemplateBtn.removeEventListener('click', () => this.setTemplate('email'));
        }
        if (this.wifiTemplateBtn) {
            this.wifiTemplateBtn.removeEventListener('click', () => this.setTemplate('wifi'));
        }
    }
}

class PercentageCalculator {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        const valueInput = document.getElementById('percentage-value');
        const percentageInput = document.getElementById('percentage-percent');
        const operationSelect = document.getElementById('percentage-operation');
        const calculateBtn = document.getElementById('calculate-percentage');
        const clearBtn = document.getElementById('clear-percentage');

        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculate());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clear());
        }

        // Auto-calculate on input change
        [valueInput, percentageInput, operationSelect].forEach(element => {
            if (element) {
                element.addEventListener('input', () => this.calculate());
            }
        });
    }

    async calculate() {
        const value = parseFloat(document.getElementById('percentage-value')?.value);
        const percentage = parseFloat(document.getElementById('percentage-percent')?.value);
        const operation = document.getElementById('percentage-operation')?.value || 'find_percentage';

        if (isNaN(value) || isNaN(percentage)) {
            this.showResult('Please enter valid numbers', 'error');
            return;
        }

        try {
            // Use backend API if available, fallback to client-side calculation
            const response = await fetch('/api/percentage-calculator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ value, percentage, operation })
            });

            if (response.ok) {
                const data = await response.json();
                this.showResult(data.message, 'success', data.result);
            } else {
                // Fallback to client-side calculation
                this.calculateClientSide(value, percentage, operation);
            }
        } catch (error) {
            // Fallback to client-side calculation
            this.calculateClientSide(value, percentage, operation);
        }
    }

    calculateClientSide(value, percentage, operation) {
        let result;
        let message;

        switch (operation) {
            case 'find_percentage':
                result = (value * percentage) / 100;
                message = `${percentage}% of ${value} is ${result}`;
                break;
            case 'find_percent_change':
                result = ((percentage - value) / value) * 100;
                message = `Percentage change from ${value} to ${percentage} is ${result.toFixed(2)}%`;
                break;
            case 'find_total':
                result = (value * 100) / percentage;
                message = `If ${value} is ${percentage}%, then the total is ${result}`;
                break;
            default:
                result = (value * percentage) / 100;
                message = `${percentage}% of ${value} is ${result}`;
        }

        this.showResult(message, 'success', parseFloat(result.toFixed(2)));
    }

    showResult(message, type = 'info', result = null) {
        const resultDiv = document.getElementById('percentage-result');
        if (!resultDiv) return;

        resultDiv.className = `mt-4 p-4 rounded-lg ${
            type === 'error' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
        }`;
        
        resultDiv.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-semibold">${message}</p>
                    ${result !== null ? `<p class="text-lg font-bold mt-1">Result: ${result}</p>` : ''}
                </div>
                ${result !== null ? `
                    <button onclick="navigator.clipboard.writeText('${result}')" 
                            class="ml-4 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                        Copy
                    </button>
                ` : ''}
            </div>
        `;
        resultDiv.classList.remove('hidden');
    }

    clear() {
        document.getElementById('percentage-value').value = '';
        document.getElementById('percentage-percent').value = '';
        document.getElementById('percentage-operation').selectedIndex = 0;
        document.getElementById('percentage-result').classList.add('hidden');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    destroy() {
        // Clean up event listeners
    }
}

// Temperature Converter Tool
class TemperatureConverter {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        const convertBtn = document.getElementById('convert-temperature-btn');
        const clearBtn = document.getElementById('clear-temperature-btn');
        const temperatureInput = document.getElementById('temperature-input');
        const fromUnitSelect = document.getElementById('from-unit-select');

        convertBtn?.addEventListener('click', () => this.convertTemperature());
        clearBtn?.addEventListener('click', () => this.clearTemperature());
        
        // Real-time conversion on input change
        temperatureInput?.addEventListener('input', () => this.convertTemperature());
        fromUnitSelect?.addEventListener('change', () => this.convertTemperature());
    }

    async convertTemperature() {
        const temperatureInput = document.getElementById('temperature-input');
        const fromUnitSelect = document.getElementById('from-unit-select');
        const resultsContainer = document.getElementById('temperature-results');

        const value = parseFloat(temperatureInput.value);
        const fromUnit = fromUnitSelect.value;

        if (isNaN(value)) {
            resultsContainer.innerHTML = '<p class="text-gray-500">Enter a temperature value to see conversions</p>';
            return;
        }

        try {
            // Try backend API first
            const response = await fetch('/api/temperature-converter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value, fromUnit })
            });

            let result;
            if (response.ok) {
                result = await response.json();
            } else {
                // Fallback to client-side calculation
                result = this.calculateClientSide(value, fromUnit);
            }

            this.displayResults(result);
        } catch (error) {
            // Fallback to client-side calculation
            const result = this.calculateClientSide(value, fromUnit);
            this.displayResults(result);
        }
    }

    calculateClientSide(value, fromUnit) {
        let celsius, fahrenheit, kelvin;
        
        switch (fromUnit) {
            case 'C':
                celsius = value;
                fahrenheit = (value * 9/5) + 32;
                kelvin = value + 273.15;
                break;
            case 'F':
                celsius = (value - 32) * 5/9;
                fahrenheit = value;
                kelvin = celsius + 273.15;
                break;
            case 'K':
                celsius = value - 273.15;
                fahrenheit = (celsius * 9/5) + 32;
                kelvin = value;
                break;
        }

        return {
            celsius: parseFloat(celsius.toFixed(2)),
            fahrenheit: parseFloat(fahrenheit.toFixed(2)),
            kelvin: parseFloat(kelvin.toFixed(2)),
            fromUnit,
            originalValue: value
        };
    }

    displayResults(result) {
        const resultsContainer = document.getElementById('temperature-results');
        
        resultsContainer.innerHTML = `
            <div class="grid md:grid-cols-3 gap-4">
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div class="text-blue-600 font-semibold mb-1">Celsius</div>
                    <div class="text-2xl font-bold text-blue-800">${result.celsius}°C</div>
                </div>
                <div class="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div class="text-red-600 font-semibold mb-1">Fahrenheit</div>
                    <div class="text-2xl font-bold text-red-800">${result.fahrenheit}°F</div>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div class="text-purple-600 font-semibold mb-1">Kelvin</div>
                    <div class="text-2xl font-bold text-purple-800">${result.kelvin}K</div>
                </div>
            </div>
        `;
    }

    clearTemperature() {
        document.getElementById('temperature-input').value = '';
        document.getElementById('temperature-results').innerHTML = '<p class="text-gray-500">Enter a temperature value to see conversions</p>';
    }

    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 transform translate-x-full transition-transform duration-300 ${
            type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.remove('translate-x-full'), 100);
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    destroy() {
        // Clean up event listeners if needed
    }
}

// Image Compressor Tool
class ImageCompressor {
    constructor() {
        this.selectedFile = null;
        this.compressedBlob = null;
        this.initEventListeners();
    }

    initEventListeners() {
        const dropZone = document.getElementById('image-drop-zone');
        const fileInput = document.getElementById('image-file-input');
        const qualitySlider = document.getElementById('quality-slider');
        const qualityValue = document.getElementById('quality-value');
        const compressBtn = document.getElementById('compress-image-btn');
        const resetBtn = document.getElementById('reset-compressor-btn');
        const downloadBtn = document.getElementById('download-compressed-btn');

        dropZone?.addEventListener('click', () => fileInput?.click());
        fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));
        
        dropZone?.addEventListener('dragover', (e) => this.preventDefaults(e));
        dropZone?.addEventListener('dragenter', (e) => this.preventDefaults(e));
        dropZone?.addEventListener('dragleave', (e) => this.preventDefaults(e));
        dropZone?.addEventListener('drop', (e) => this.handleDrop(e));

        qualitySlider?.addEventListener('input', (e) => {
            qualityValue.textContent = e.target.value + '%';
        });

        compressBtn?.addEventListener('click', () => this.compressImage());
        resetBtn?.addEventListener('click', () => this.reset());
        downloadBtn?.addEventListener('click', () => this.downloadCompressed());
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        this.preventDefaults(e);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }

    handleFile(file) {
        if (!this.validateFile(file)) return;
        
        this.selectedFile = file;
        this.showFileInfo();
        document.getElementById('compress-image-btn').disabled = false;
    }

    validateFile(file) {
        const validTypes = ['image/jpeg', 'image/png'];
        const maxSize = 10 * 1024 * 1024;

        if (!validTypes.includes(file.type)) {
            this.showNotification('Please select a JPG or PNG image file', 'error');
            return false;
        }

        if (file.size > maxSize) {
            this.showNotification('File size must be less than 10MB', 'error');
            return false;
        }

        return true;
    }

    showFileInfo() {
        const dropZone = document.getElementById('image-drop-zone');
        const fileSize = this.formatFileSize(this.selectedFile.size);
        
        dropZone.innerHTML = '<div class="flex flex-col items-center">' +
            '<i class="fas fa-check-circle text-emerald-500 text-4xl mb-4"></i>' +
            '<p class="text-lg font-semibold text-gray-700 mb-2">' + this.selectedFile.name + '</p>' +
            '<p class="text-sm text-gray-500">Size: ' + fileSize + '</p>' +
            '<p class="text-xs text-gray-400 mt-2">Click to select a different file</p>' +
            '</div>';
    }

    async compressImage() {
        if (!this.selectedFile) {
            this.showNotification('Please select an image first', 'error');
            return;
        }

        const compressBtn = document.getElementById('compress-image-btn');
        const originalText = compressBtn.innerHTML;
        
        try {
            compressBtn.disabled = true;
            compressBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Compressing...';

            const quality = document.getElementById('quality-slider').value;
            const formData = new FormData();
            formData.append('image', this.selectedFile);

            const response = await fetch('/api/image-compressor?quality=' + quality, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Compression failed');
            }

            const result = await response.json();
            
            // Convert base64 to blob for JPEG
            const binary = atob(result.data);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            this.compressedBlob = new Blob([bytes], { type: 'image/jpeg' });
            
            this.showResults();
            this.showNotification('Image compressed successfully!', 'success');

        } catch (error) {
            console.error('Compression error:', error);
            this.showNotification('Failed to compress image: ' + error.message, 'error');
        } finally {
            compressBtn.disabled = false;
            compressBtn.innerHTML = originalText;
        }
    }

    showResults() {
        const resultsSection = document.getElementById('compression-results');
        const originalPreview = document.getElementById('original-preview');
        const compressedPreview = document.getElementById('compressed-preview');
        const originalSize = document.getElementById('original-size');
        const compressedSize = document.getElementById('compressed-size');
        const compressionRatio = document.getElementById('compression-ratio');
        const downloadBtn = document.getElementById('download-compressed-btn');

        const originalReader = new FileReader();
        originalReader.onload = (e) => {
            originalPreview.innerHTML = '<img src="' + e.target.result + '" alt="Original" class="max-w-full max-h-48 mx-auto rounded">';
        };
        originalReader.readAsDataURL(this.selectedFile);

        const compressedUrl = URL.createObjectURL(this.compressedBlob);
        compressedPreview.innerHTML = '<img src="' + compressedUrl + '" alt="Compressed" class="max-w-full max-h-48 mx-auto rounded">';

        originalSize.textContent = this.formatFileSize(this.selectedFile.size);
        compressedSize.textContent = this.formatFileSize(this.compressedBlob.size);

        const savings = ((this.selectedFile.size - this.compressedBlob.size) / this.selectedFile.size * 100).toFixed(1);
        compressionRatio.textContent = savings + '% smaller';

        downloadBtn.disabled = false;
        resultsSection.classList.remove('hidden');
    }

    downloadCompressed() {
        if (!this.compressedBlob) return;

        const url = URL.createObjectURL(this.compressedBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'compressed_' + this.selectedFile.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Download started!', 'success');
    }

    reset() {
        this.selectedFile = null;
        this.compressedBlob = null;

        const dropZone = document.getElementById('image-drop-zone');
        dropZone.innerHTML = '<div class="flex flex-col items-center">' +
            '<i class="fas fa-cloud-upload-alt text-emerald-500 text-4xl mb-4"></i>' +
            '<p class="text-lg font-semibold text-gray-700 mb-2">Drop image here or click to upload</p>' +
            '<p class="text-sm text-gray-500">Supports JPG and PNG files up to 10MB</p>' +
            '</div>';

        document.getElementById('compress-image-btn').disabled = true;
        document.getElementById('download-compressed-btn').disabled = true;
        document.getElementById('compression-results').classList.add('hidden');
        document.getElementById('quality-slider').value = 60;
        document.getElementById('quality-value').textContent = '60%';
        document.getElementById('image-file-input').value = '';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 transform translate-x-full transition-transform duration-300 ' + 
            (type === 'error' ? 'bg-red-500' : 'bg-green-500');
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.remove('translate-x-full'), 100);
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    destroy() {
        if (this.compressedBlob) {
            URL.revokeObjectURL(URL.createObjectURL(this.compressedBlob));
        }
    }
}

// Color Converter Tool
class ColorConverter {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        const hexInput = document.getElementById('hex-input');
        const convertBtn = document.getElementById('convert-color-btn');
        const clearBtn = document.getElementById('clear-color-btn');
        const colorPicker = document.getElementById('color-picker');

        convertBtn?.addEventListener('click', () => this.convertColor());
        clearBtn?.addEventListener('click', () => this.clearColor());
        hexInput?.addEventListener('input', () => this.convertColor());
        
        // Real-time color picker updates
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                const hexValue = e.target.value;
                if (hexInput) hexInput.value = hexValue;
                this.convertColorFromHex(hexValue);
            });
        }
    }

    convertColorFromHex(hex) {
        if (!/^#[0-9A-F]{6}$/i.test(hex)) return;
        
        try {
            const result = this.calculateClientSide(hex);
            this.displayResults(result);
        } catch (error) {
            console.error('Color conversion error:', error);
        }
    }

    async convertColor() {
        const hexInput = document.getElementById('hex-input');
        let hex = hexInput.value.trim();
        
        if (!hex) {
            this.clearResults();
            return;
        }

        // Add # if not present
        if (!hex.startsWith('#')) {
            hex = '#' + hex;
            hexInput.value = hex;
        }

        // Validate hex format
        if (!/^#[0-9A-F]{6}$/i.test(hex)) {
            this.showError('Please enter a valid 6-digit hex color (e.g., #FF5733)');
            return;
        }

        try {
            // Try backend API first
            const response = await fetch('/api/color-converter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hex })
            });

            let result;
            if (response.ok) {
                result = await response.json();
            } else {
                // Fallback to client-side calculation
                result = this.calculateClientSide(hex);
            }

            this.displayResults(result);
        } catch (error) {
            // Fallback to client-side calculation
            const result = this.calculateClientSide(hex);
            this.displayResults(result);
        }
    }

    calculateClientSide(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        const rgb = `rgb(${r}, ${g}, ${b})`;

        // Convert to HSL
        const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
        const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
                case gNorm: h = (bNorm - rNorm) / d + 2; break;
                case bNorm: h = (rNorm - gNorm) / d + 4; break;
            }
            h /= 6;
        }

        const hsl = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

        return {
            hex: hex.toUpperCase(),
            rgb,
            hsl,
            values: {
                r, g, b,
                h: Math.round(h * 360),
                s: Math.round(s * 100),
                l: Math.round(l * 100)
            }
        };
    }

    displayResults(result) {
        const resultsContainer = document.getElementById('color-results');
        
        resultsContainer.innerHTML = `
            <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-semibold text-gray-700">HEX</span>
                            <button class="copy-color-btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm" data-value="${result.hex}">
                                <i class="fas fa-copy mr-1"></i>Copy
                            </button>
                        </div>
                        <div class="text-xl font-mono font-bold">${result.hex}</div>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-semibold text-gray-700">RGB</span>
                            <button class="copy-color-btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm" data-value="${result.rgb}">
                                <i class="fas fa-copy mr-1"></i>Copy
                            </button>
                        </div>
                        <div class="font-mono">${result.rgb}</div>
                        <div class="text-sm text-gray-600 mt-1">R:${result.values.r} G:${result.values.g} B:${result.values.b}</div>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-semibold text-gray-700">HSL</span>
                            <button class="copy-color-btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm" data-value="${result.hsl}">
                                <i class="fas fa-copy mr-1"></i>Copy
                            </button>
                        </div>
                        <div class="font-mono">${result.hsl}</div>
                        <div class="text-sm text-gray-600 mt-1">H:${result.values.h}° S:${result.values.s}% L:${result.values.l}%</div>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="font-semibold text-gray-700 mb-4">Color Preview</div>
                    <div class="w-full h-32 rounded-lg border-2 border-gray-300" style="background-color: ${result.hex};"></div>
                    <div class="mt-4 text-center">
                        <div class="text-sm text-gray-600">Color: ${result.hex}</div>
                    </div>
                </div>
            </div>
        `;

        // Re-attach copy event listeners
        resultsContainer.querySelectorAll('.copy-color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.copyColorValue(e.target.closest('.copy-color-btn')));
        });
    }

    async copyColorValue(button) {
        const value = button.getAttribute('data-value');
        try {
            await navigator.clipboard.writeText(value);
            this.showNotification(`Copied ${value} to clipboard`, 'success');
        } catch (error) {
            this.showNotification('Failed to copy to clipboard', 'error');
        }
    }

    clearColor() {
        document.getElementById('hex-input').value = '';
        this.clearResults();
    }

    clearResults() {
        document.getElementById('color-results').innerHTML = '<p class="text-gray-500">Enter a hex color to see conversions</p>';
    }

    showError(message) {
        const resultsContainer = document.getElementById('color-results');
        resultsContainer.innerHTML = `<div class="text-red-500 font-medium">${message}</div>`;
    }

    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 transform translate-x-full transition-transform duration-300 ${
            type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.remove('translate-x-full'), 100);
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    destroy() {
        // Clean up event listeners if needed
    }
}


// ===== NEW SEO TOOLS =====

// Text-to-Speech Converter
class TextToSpeechConverter {
    constructor() {
        this.initEventListeners();
        this.loadVoices();
    }

    initEventListeners() {
        const speakBtn = document.getElementById("speak-btn");
        const stopBtn = document.getElementById("stop-btn");
        const rateSlider = document.getElementById("tts-rate");
        
        if (speakBtn) speakBtn.addEventListener("click", () => this.speak());
        if (stopBtn) stopBtn.addEventListener("click", () => this.stop());
        if (rateSlider) rateSlider.addEventListener("input", () => this.updateRateDisplay());
    }

    loadVoices() {
        const voiceSelect = document.getElementById("tts-voice");
        if (!voiceSelect) return;

        const voices = speechSynthesis.getVoices();
        voiceSelect.innerHTML = "<option value=\"\">Default Voice</option>";
        
        voices.forEach((voice, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
    }

    speak() {
        const text = document.getElementById("tts-text")?.value;
        if (!text) {
            this.showNotification("Please enter some text to speak", "warning");
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const voiceSelect = document.getElementById("tts-voice");
        const rate = document.getElementById("tts-rate")?.value || 1;
        
        if (voiceSelect && voiceSelect.value) {
            const voices = speechSynthesis.getVoices();
            utterance.voice = voices[voiceSelect.value];
        }
        
        utterance.rate = rate;
        speechSynthesis.speak(utterance);
        this.showNotification("Speaking...", "success");
    }

    stop() {
        speechSynthesis.cancel();
        this.showNotification("Speech stopped", "info");
    }

    updateRateDisplay() {
        const rate = document.getElementById("tts-rate")?.value;
        const rateValue = document.getElementById("rate-value");
        if (rateValue) rateValue.textContent = `${rate}x`;
    }

    showNotification(message, type = "info") {
        let notification = document.getElementById("tts-notification");
        if (!notification) {
            notification = document.createElement("div");
            notification.id = "tts-notification";
            notification.className = "fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform translate-x-full transition-transform duration-300";
            document.body.appendChild(notification);
        }

        const colors = {
            success: "bg-green-500",
            error: "bg-red-500",
            info: "bg-blue-500",
            warning: "bg-yellow-500"
        };

        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 ${colors[type] || colors.info}`;
        notification.textContent = message;
        notification.style.transform = "translateX(0)";

        setTimeout(() => {
            notification.style.transform = "translateX(100%)";
        }, 3000);
    }

    destroy() {
        speechSynthesis.cancel();
    }
}

// Backlink Checker
class BacklinkChecker {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        const checkBtn = document.getElementById("check-backlinks-btn");
        if (checkBtn) checkBtn.addEventListener("click", () => this.checkBacklinks());
    }

    async checkBacklinks() {
        const urlInput = document.getElementById("backlink-url");
        const resultsDiv = document.getElementById("backlink-results");
        
        if (!urlInput || !resultsDiv) return;
        
        const url = urlInput.value.trim();
        if (!url) {
            this.showNotification("Please enter a valid URL", "warning");
            return;
        }

        resultsDiv.innerHTML = "<div class=\"text-center\"><i class=\"fas fa-spinner fa-spin text-2xl text-teal-500\"></i><p class=\"mt-2\">Analyzing backlinks...</p></div>";

        setTimeout(() => {
            resultsDiv.innerHTML = `
                <div class="bg-gray-50 rounded-lg p-6">
                    <h4 class="font-bold text-lg mb-4">Backlink Analysis for ${url}</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-white p-4 rounded-lg shadow text-center">
                            <div class="text-2xl font-bold text-teal-600">24</div>
                            <div class="text-sm text-gray-600">Total Backlinks</div>
                        </div>
                        <div class="bg-white p-4 rounded-lg shadow text-center">
                            <div class="text-2xl font-bold text-green-600">18</div>
                            <div class="text-sm text-gray-600">Referring Domains</div>
                        </div>
                        <div class="bg-white p-4 rounded-lg shadow text-center">
                            <div class="text-2xl font-bold text-blue-600">65</div>
                            <div class="text-sm text-gray-600">Domain Authority</div>
                        </div>
                    </div>
                    <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p class="text-sm text-yellow-800">
                            <i class="fas fa-info-circle mr-2"></i>
                            This is a demo analysis. For real backlink data, integrate with SEO APIs like Ahrefs, SEMrush, or Moz.
                        </p>
                    </div>
                </div>
            `;
        }, 2000);
    }

    showNotification(message, type = "info") {
        let notification = document.getElementById("backlink-notification");
        if (!notification) {
            notification = document.createElement("div");
            notification.id = "backlink-notification";
            notification.className = "fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform translate-x-full transition-transform duration-300";
            document.body.appendChild(notification);
        }

        const colors = {
            success: "bg-green-500",
            error: "bg-red-500",
            info: "bg-blue-500",
            warning: "bg-yellow-500"
        };

        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 ${colors[type] || colors.info}`;
        notification.textContent = message;
        notification.style.transform = "translateX(0)";

        setTimeout(() => {
            notification.style.transform = "translateX(100%)";
        }, 3000);
    }

    destroy() {}
}

// Meta Tag Generator
class MetaTagGenerator {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        const generateBtn = document.getElementById("generate-meta-btn");
        if (generateBtn) generateBtn.addEventListener("click", () => this.generateMetaTags());
    }

    generateMetaTags() {
        const title = document.getElementById("meta-title")?.value || "";
        const description = document.getElementById("meta-description")?.value || "";
        const keywords = document.getElementById("meta-keywords")?.value || "";
        const resultsDiv = document.getElementById("meta-results");
        
        if (!resultsDiv) return;
        
        if (!title && !description && !keywords) {
            this.showNotification("Please fill in at least one field", "warning");
            return;
        }

        const metaTags = [];
        
        if (title) {
            metaTags.push(`<title>${title}</title>`);
        }
        
        if (description) {
            metaTags.push(`<meta name="description" content="${description}">`);
        }
        
        if (keywords) {
            metaTags.push(`<meta name="keywords" content="${keywords}">`);
        }

        const html = metaTags.join("\n");
        
        resultsDiv.innerHTML = `
            <div class="bg-gray-50 rounded-lg p-6">
                <h4 class="font-bold text-lg mb-4">Generated Meta Tags</h4>
                <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
                    <pre>${html}</pre>
                </div>
                <button onclick="navigator.clipboard.writeText(\`${html.replace(/\`/g, "\\`")}\`).then(() => alert(\"Copied to clipboard!\"))" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg">
                    <i class="fas fa-copy mr-2"></i>Copy to Clipboard
                </button>
            </div>
        `;
    }

    showNotification(message, type = "info") {
        let notification = document.getElementById("meta-notification");
        if (!notification) {
            notification = document.createElement("div");
            notification.id = "meta-notification";
            notification.className = "fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform translate-x-full transition-transform duration-300";
            document.body.appendChild(notification);
        }

        const colors = {
            success: "bg-green-500",
            error: "bg-red-500",
            info: "bg-blue-500",
            warning: "bg-yellow-500"
        };

        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 ${colors[type] || colors.info}`;
        notification.textContent = message;
        notification.style.transform = "translateX(0)";

        setTimeout(() => {
            notification.style.transform = "translateX(100%)";
        }, 3000);
    }

    destroy() {}
}

// DPI Checker
class DPIChecker {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        const fileInput = document.getElementById("dpi-file");
        if (fileInput) fileInput.addEventListener("change", (e) => this.handleFile(e.target.files[0]));
    }

    handleFile(file) {
        if (!file) return;
        
        const resultsDiv = document.getElementById("dpi-results");
        if (!resultsDiv) return;

        resultsDiv.innerHTML = "<div class=\"text-center\"><i class=\"fas fa-spinner fa-spin text-2xl text-amber-500\"></i><p class=\"mt-2\">Analyzing image...</p></div>";

        const img = new Image();
        img.onload = () => {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const megapixels = (img.width * img.height / 1000000).toFixed(1);
            const estimatedDPI = Math.round(Math.sqrt(img.width * img.height) / 10);

            resultsDiv.innerHTML = `
                <div class="bg-gray-50 rounded-lg p-6">
                    <h4 class="font-bold text-lg mb-4">Image Analysis Results</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-white p-4 rounded-lg shadow">
                            <div class="text-sm text-gray-600">Resolution</div>
                            <div class="text-xl font-bold text-amber-600">${img.width} × ${img.height}</div>
                        </div>
                        <div class="bg-white p-4 rounded-lg shadow">
                            <div class="text-sm text-gray-600">File Size</div>
                            <div class="text-xl font-bold text-amber-600">${fileSizeMB} MB</div>
                        </div>
                        <div class="bg-white p-4 rounded-lg shadow">
                            <div class="text-sm text-gray-600">Megapixels</div>
                            <div class="text-xl font-bold text-amber-600">${megapixels} MP</div>
                        </div>
                        <div class="bg-white p-4 rounded-lg shadow">
                            <div class="text-sm text-gray-600">Estimated DPI</div>
                            <div class="text-xl font-bold text-amber-600">${estimatedDPI}</div>
                        </div>
                    </div>
                    <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p class="text-sm text-blue-800">
                            <i class="fas fa-info-circle mr-2"></i>
                            DPI estimation based on image dimensions. For accurate DPI, check image metadata or source specifications.
                        </p>
                    </div>
                </div>
            `;
        };

        img.onerror = () => {
            resultsDiv.innerHTML = "<p class=\"text-red-500\">Error loading image. Please try a different file.</p>";
        };

        img.src = URL.createObjectURL(file);
    }

    destroy() {}
}

// URL Shortener
class URLShortener {
    constructor() {
        this.bulkResults = [];
        this.initEventListeners();
        this.initTabs();
    }

    initEventListeners() {
        const shortenBtn = document.getElementById("shorten-url-btn");
        const bulkShortenBtn = document.getElementById("bulk-shorten-btn");
        const downloadCsvBtn = document.getElementById("download-csv-btn");
        
        if (shortenBtn) shortenBtn.addEventListener("click", () => this.shortenURL());
        if (bulkShortenBtn) bulkShortenBtn.addEventListener("click", () => this.bulkShortenURLs());
        if (downloadCsvBtn) downloadCsvBtn.addEventListener("click", () => this.downloadCSV());
    }

    initTabs() {
        const singleTab = document.getElementById("single-url-tab");
        const bulkTab = document.getElementById("bulk-url-tab");
        const singlePanel = document.getElementById("single-url-panel");
        const bulkPanel = document.getElementById("bulk-url-panel");

        if (singleTab && bulkTab && singlePanel && bulkPanel) {
            singleTab.addEventListener("click", () => {
                this.switchTab("single");
            });

            bulkTab.addEventListener("click", () => {
                this.switchTab("bulk");
            });
        }
    }

    switchTab(tab) {
        const singleTab = document.getElementById("single-url-tab");
        const bulkTab = document.getElementById("bulk-url-tab");
        const singlePanel = document.getElementById("single-url-panel");
        const bulkPanel = document.getElementById("bulk-url-panel");
        const resultsDiv = document.getElementById("url-shortener-results");

        if (tab === "single") {
            singleTab.className = "px-6 py-3 font-semibold text-violet-600 border-b-2 border-violet-600";
            bulkTab.className = "px-6 py-3 font-semibold text-gray-500 hover:text-violet-600 transition-colors";
            singlePanel.classList.remove("hidden");
            bulkPanel.classList.add("hidden");
            resultsDiv.innerHTML = '<p class="text-gray-500">Enter a long URL to create a shortened version</p>';
        } else {
            bulkTab.className = "px-6 py-3 font-semibold text-violet-600 border-b-2 border-violet-600";
            singleTab.className = "px-6 py-3 font-semibold text-gray-500 hover:text-violet-600 transition-colors";
            bulkPanel.classList.remove("hidden");
            singlePanel.classList.add("hidden");
            resultsDiv.innerHTML = '<p class="text-gray-500">Enter multiple URLs to create shortened versions</p>';
        }
    }

    async shortenURL() {
        const urlInput = document.getElementById("long-url");
        const resultsDiv = document.getElementById("url-shortener-results");
        
        if (!urlInput || !resultsDiv) return;
        
        const longUrl = urlInput.value.trim();
        if (!longUrl) {
            this.showNotification("Please enter a valid URL", "warning");
            return;
        }

        if (!this.isValidURL(longUrl)) {
            this.showNotification("Please enter a valid URL starting with http:// or https://", "error");
            return;
        }

        resultsDiv.innerHTML = "<div class=\"text-center\"><i class=\"fas fa-spinner fa-spin text-2xl text-violet-500\"></i><p class=\"mt-2\">Creating short URL...</p></div>";

        try {
            const response = await fetch("/api/shortener", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: longUrl })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                throw new Error(`Server returned HTML instead of JSON: ${text.substring(0, 100)}...`);
            }

            const data = await response.json();
            
            if (data.shortUrl) {
                // Generate QR code for the short URL
                const qrCanvas = document.createElement('canvas');
                const qr = new QRious({
                    element: qrCanvas,
                    value: data.shortUrl,
                    size: 200,
                    background: 'white',
                    foreground: '#7c3aed'
                });

                resultsDiv.innerHTML = `
                    <div class="bg-gray-50 rounded-lg p-6">
                        <h4 class="font-bold text-lg mb-4">✅ URL Shortened Successfully!</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div class="bg-white p-4 rounded-lg shadow mb-4">
                                    <div class="text-sm text-gray-600 mb-2">Original URL</div>
                                    <div class="text-sm text-gray-800 break-all">${data.originalUrl}</div>
                                </div>
                                <div class="bg-white p-4 rounded-lg shadow">
                                    <div class="text-sm text-gray-600 mb-2">Short URL (Click to Visit)</div>
                                    <div class="text-lg font-bold text-violet-600 break-all mb-3 bg-gray-50 p-3 rounded-lg">${data.shortUrl}</div>
                                    <div class="flex gap-2">
                                        <button id="copy-short-url-btn" data-url="${data.shortUrl}"
                                                class="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-lg text-sm transition-all flex-1">
                                            <i class="fas fa-copy"></i> Copy Short URL
                                        </button>
                                        <a href="${data.shortUrl}" target="_blank" 
                                           class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-all flex-1 text-center">
                                            <i class="fas fa-external-link-alt"></i> Open URL
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div class="bg-white p-4 rounded-lg shadow text-center">
                                    <div class="text-sm text-gray-600 mb-3">QR Code</div>
                                    <div id="qr-container" class="flex justify-center mb-4"></div>
                                    <button id="download-qr-btn" 
                                            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-all">
                                        <i class="fas fa-download"></i> Download QR Code
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                `;

                // Add QR code to container
                const qrContainer = document.getElementById('qr-container');
                if (qrContainer) {
                    qrContainer.appendChild(qrCanvas);
                }

                // Add copy functionality
                const copyBtn = document.getElementById('copy-short-url-btn');
                if (copyBtn) {
                    copyBtn.addEventListener('click', async () => {
                        const url = copyBtn.getAttribute('data-url');
                        try {
                            await navigator.clipboard.writeText(url);
                            const originalText = copyBtn.innerHTML;
                            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                            setTimeout(() => {
                                copyBtn.innerHTML = originalText;
                            }, 2000);
                            this.showNotification('URL copied to clipboard!', 'success');
                        } catch (err) {
                            this.showNotification('Failed to copy URL', 'error');
                        }
                    });
                }

                // Add download functionality
                const downloadBtn = document.getElementById('download-qr-btn');
                if (downloadBtn) {
                    downloadBtn.addEventListener('click', () => {
                        const link = document.createElement('a');
                        link.download = `qr-${data.shortCode}.png`;
                        link.href = qrCanvas.toDataURL();
                        link.click();
                        this.showNotification('QR Code downloaded successfully!', 'success');
                    });
                }

                this.showNotification('Short URL created successfully!', 'success');
            }
        } catch (error) {
            resultsDiv.innerHTML = "<p class=\"text-red-500\">Error creating short URL. Please try again.</p>";
            this.showNotification("Error creating short URL", "error");
        }
    }

    isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    showNotification(message, type = "info") {
        let notification = document.getElementById("url-notification");
        if (!notification) {
            notification = document.createElement("div");
            notification.id = "url-notification";
            notification.className = "fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform translate-x-full transition-transform duration-300";
            document.body.appendChild(notification);
        }

        const colors = {
            success: "bg-green-500",
            error: "bg-red-500",
            info: "bg-blue-500",
            warning: "bg-yellow-500"
        };

        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 ${colors[type] || colors.info}`;
        notification.textContent = message;
        notification.style.transform = "translateX(0)";

        setTimeout(() => {
            notification.style.transform = "translateX(100%)";
        }, 3000);
    }

    async bulkShortenURLs() {
        const bulkTextarea = document.getElementById("bulk-urls");
        const resultsDiv = document.getElementById("url-shortener-results");
        const bulkBtn = document.getElementById("bulk-shorten-btn");
        const downloadBtn = document.getElementById("download-csv-btn");
        
        if (!bulkTextarea || !resultsDiv || !bulkBtn) return;
        
        const urls = bulkTextarea.value.trim().split('\n').filter(url => url.trim().length > 0);
        
        if (urls.length === 0) {
            this.showNotification("Please enter at least one URL", "warning");
            return;
        }

        if (urls.length > 10) {
            this.showNotification("Free users can process up to 10 URLs at once. Upgrade to Premium for unlimited bulk processing.", "warning");
            return;
        }

        // Validate all URLs first
        const invalidUrls = urls.filter(url => !this.isValidURL(url.trim()));
        if (invalidUrls.length > 0) {
            this.showNotification(`Invalid URLs found: ${invalidUrls.slice(0, 3).join(', ')}`, "error");
            return;
        }

        bulkBtn.disabled = true;
        bulkBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing URLs...';
        
        resultsDiv.innerHTML = `
            <div class="text-center">
                <i class="fas fa-spinner fa-spin text-2xl text-violet-500"></i>
                <p class="mt-2">Processing ${urls.length} URLs...</p>
                <div class="mt-4 bg-gray-200 rounded-full h-2">
                    <div id="bulk-progress" class="bg-violet-500 h-2 rounded-full transition-all" style="width: 0%"></div>
                </div>
            </div>
        `;

        this.bulkResults = [];
        const progressBar = document.getElementById("bulk-progress");

        try {
            for (let i = 0; i < urls.length; i++) {
                const url = urls[i].trim();
                const progress = ((i + 1) / urls.length) * 100;
                
                try {
                    const response = await fetch("/api/shortener", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    const contentType = response.headers.get("content-type");
                    if (!contentType || !contentType.includes("application/json")) {
                        const text = await response.text();
                        throw new Error(`Server returned HTML instead of JSON: ${text.substring(0, 100)}...`);
                    }

                    const data = await response.json();
                    
                    if (data.shortUrl) {
                        this.bulkResults.push({
                            original: url,
                            short: data.shortUrl,
                            code: data.shortCode,
                            status: 'success'
                        });
                    } else {
                        this.bulkResults.push({
                            original: url,
                            status: 'error',
                            error: 'Failed to shorten'
                        });
                    }
                } catch (error) {
                    this.bulkResults.push({
                        original: url,
                        status: 'error',
                        error: error.message
                    });
                }

                if (progressBar) {
                    progressBar.style.width = progress + '%';
                }
                
                // Small delay to show progress
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            this.showBulkResults();
            downloadBtn.classList.remove('hidden');
            this.showNotification(`Successfully processed ${this.bulkResults.filter(r => r.status === 'success').length} out of ${urls.length} URLs`, 'success');

        } catch (error) {
            resultsDiv.innerHTML = `<p class="text-red-500">Error processing URLs: ${error.message}</p>`;
            this.showNotification("Error processing bulk URLs", "error");
        } finally {
            bulkBtn.disabled = false;
            bulkBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>Shorten All URLs';
        }
    }

    showBulkResults() {
        const resultsDiv = document.getElementById("url-shortener-results");
        const successCount = this.bulkResults.filter(r => r.status === 'success').length;
        const errorCount = this.bulkResults.filter(r => r.status === 'error').length;

        let resultsHTML = `
            <div class="bg-gray-50 rounded-lg p-6">
                <h4 class="font-bold text-lg mb-4">
                    ✅ Bulk Processing Complete! 
                    <span class="text-green-600">${successCount} success</span>
                    ${errorCount > 0 ? `<span class="text-red-600">, ${errorCount} failed</span>` : ''}
                </h4>
                <div class="space-y-4 max-h-96 overflow-y-auto">
        `;

        this.bulkResults.forEach((result, index) => {
            if (result.status === 'success') {
                resultsHTML += `
                    <div class="bg-white p-4 rounded-lg shadow border border-green-200">
                        <div class="flex items-start justify-between mb-2">
                            <span class="text-xs text-gray-500">#${index + 1}</span>
                            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Success</span>
                        </div>
                        <div class="text-sm text-gray-600 mb-2">Original: <span class="text-gray-800">${result.original}</span></div>
                        <div class="text-lg font-bold text-violet-600 mb-3">${result.short}</div>
                        <div class="flex gap-2">
                            <button class="copy-bulk-url-btn bg-violet-500 hover:bg-violet-600 text-white px-3 py-1 rounded text-sm transition-all" data-url="${result.short}">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                            <a href="${result.short}" target="_blank" 
                               class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-all">
                                <i class="fas fa-external-link-alt"></i> Test
                            </a>
                        </div>
                    </div>
                `;
            } else {
                resultsHTML += `
                    <div class="bg-white p-4 rounded-lg shadow border border-red-200">
                        <div class="flex items-start justify-between mb-2">
                            <span class="text-xs text-gray-500">#${index + 1}</span>
                            <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Failed</span>
                        </div>
                        <div class="text-sm text-gray-600 mb-2">URL: <span class="text-gray-800">${result.original}</span></div>
                        <div class="text-sm text-red-600">Error: ${result.error}</div>
                    </div>
                `;
            }
        });

        resultsHTML += `
                </div>
            </div>
        `;

        resultsDiv.innerHTML = resultsHTML;
        
        // Add event listeners for all copy buttons
        const copyBtns = resultsDiv.querySelectorAll('.copy-bulk-url-btn');
        copyBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const url = btn.getAttribute('data-url');
                try {
                    await navigator.clipboard.writeText(url);
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                    }, 2000);
                    this.showNotification('URL copied to clipboard!', 'success');
                } catch (err) {
                    this.showNotification('Failed to copy URL', 'error');
                }
            });
        });
    }

    downloadCSV() {
        if (this.bulkResults.length === 0) {
            this.showNotification("No results to download", "warning");
            return;
        }

        let csv = "Original URL,Short URL,Short Code,Status,Error\n";
        
        this.bulkResults.forEach(result => {
            const row = [
                `"${result.original}"`,
                result.short ? `"${result.short}"` : '""',
                result.code ? `"${result.code}"` : '""',
                `"${result.status}"`,
                result.error ? `"${result.error}"` : '""'
            ].join(',');
            csv += row + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `convertwiz-bulk-urls-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('CSV file downloaded successfully!', 'success');
    }

    destroy() {}
}
