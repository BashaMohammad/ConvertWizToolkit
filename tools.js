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
    
    handleFiles(files) {
        // Filter valid files
        const validFiles = files.filter(file => this.validateFile(file, false));
        
        if (validFiles.length === 0) {
            this.showNotification('No valid JPG files found. Please select JPG or JPEG files.', 'error');
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
    
    checkDailyLimit() {
        const today = new Date().toDateString();
        const usage = JSON.parse(localStorage.getItem('convertWizUsage') || '{}');
        
        if (usage.date !== today) {
            return true; // New day, reset limit
        }
        
        return usage.count < this.dailyLimit;
    }
    
    updateDailyUsage() {
        const today = new Date().toDateString();
        let usage = JSON.parse(localStorage.getItem('convertWizUsage') || '{}');
        
        if (usage.date !== today) {
            usage = { date: today, count: 0 };
        }
        
        usage.count += 1;
        localStorage.setItem('convertWizUsage', JSON.stringify(usage));
        
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
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
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
        
        let html = `
            <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div class="text-center">
                    <div class="text-lg font-semibold text-blue-800">Converting ${inputValue} ${fromUnitName}</div>
                    <div class="text-sm text-blue-600 mt-1">Results across global land measurement units</div>
                </div>
            </div>
        `;
        
        // Display results grouped by region
        Object.keys(regions).forEach(region => {
            html += `
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <span class="inline-block w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2"></span>
                        ${region}
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            `;
            
            regions[region].forEach(result => {
                const isLarge = result.value >= 1000000;
                const displayValue = isLarge ? 
                    (result.value / 1000000).toFixed(2) + 'M' : 
                    result.value.toFixed(4);
                
                html += `
                    <div class="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div class="text-sm text-gray-600 mb-1">${result.name}</div>
                        <div class="text-xl font-bold text-purple-600">${displayValue}</div>
                        ${isLarge ? '<div class="text-xs text-gray-500">Million units</div>' : ''}
                    </div>
                `;
            });
            
            html += '</div></div>';
        });
        
        resultsContainer.innerHTML = html;
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
        
        if (this.dpInput) {
            this.initEventListeners();
        }
    }
    
    initEventListeners() {
        this.dpInput.addEventListener('change', (e) => this.handleFileSelect(e));
        if (this.resizeBtn) this.resizeBtn.addEventListener('click', () => this.resizeImage());
        if (this.downloadBtn) this.downloadBtn.addEventListener('click', () => this.downloadResizedImage());
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
    
    destroy() {
        // Clean up
        if (this.dpInput) this.dpInput.value = '';
    }
}