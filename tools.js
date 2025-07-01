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
        
        if (this.unitSelect) {
            this.initEventListeners();
        }
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
                if (element) element.textContent = '0';
            });
            return;
        }
        
        // Convert input value to square feet first
        const sqftValue = value * this.conversionRates[unit];
        
        // Convert square feet to all other units
        if (this.results.acres) this.results.acres.textContent = (sqftValue / this.conversionRates.acres).toFixed(4);
        if (this.results.gunta) this.results.gunta.textContent = (sqftValue / this.conversionRates.gunta).toFixed(4);
        if (this.results.sqft) this.results.sqft.textContent = sqftValue.toFixed(2);
        if (this.results.bigha) this.results.bigha.textContent = (sqftValue / this.conversionRates.bigha).toFixed(4);
    }
    
    destroy() {
        // Clean up
        this.results = {};
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