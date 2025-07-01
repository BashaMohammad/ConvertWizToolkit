// ConvertWiz - JPG to PNG Converter JavaScript

class JPGtoPNGConverter {
    constructor() {
        this.dailyLimit = 3;
        this.currentFile = null;
        this.convertedBlob = null;
        
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
        this.resultSection = document.getElementById('result-section');
        this.limitSection = document.getElementById('limit-reached');
        
        // Progress Elements
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text');
        
        // Result Elements
        this.originalPreview = document.getElementById('original-preview');
        this.convertedPreview = document.getElementById('converted-preview');
        this.originalSize = document.getElementById('original-size');
        this.convertedSize = document.getElementById('converted-size');
        this.downloadBtn = document.getElementById('download-png');
        this.convertAnotherBtn = document.getElementById('convert-another');
        
        // Counter Elements
        this.conversionsLeft = document.getElementById('conversions-left');
        this.limitCounter = document.getElementById('limit-counter');
    }
    
    initEventListeners() {
        // File input events
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.browseBtn.addEventListener('click', () => this.fileInput.click());
        
        // Button events
        this.downloadBtn.addEventListener('click', () => this.downloadPNG());
        this.convertAnotherBtn.addEventListener('click', () => this.resetConverter());
        
        // Watermark toggle
        this.watermarkToggle.addEventListener('change', () => this.toggleWatermark());
    }
    
    setupDragAndDrop() {
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
        const files = dt.files;
        
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
        // Check daily limit
        if (!this.checkDailyLimit()) {
            this.showLimitReached();
            return;
        }
        
        // Validate file
        if (!this.validateFile(file)) {
            return;
        }
        
        this.currentFile = file;
        this.startConversion();
    }
    
    validateFile(file) {
        // Check file type
        if (!file.type.match('image/jpeg') && !file.type.match('image/jpg')) {
            this.showNotification('Please select a JPG or JPEG file.', 'error');
            return false;
        }
        
        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            this.showNotification('File size must be less than 10MB.', 'error');
            return false;
        }
        
        return true;
    }
    
    async startConversion() {
        // Hide upload area and show progress
        this.uploadArea.parentElement.style.display = 'none';
        this.progressSection.classList.remove('hidden');
        
        // Animate progress bar
        await this.animateProgress();
        
        // Convert the image
        await this.convertImage();
        
        // Show results
        this.showResults();
        
        // Update daily counter
        this.updateDailyUsage();
    }
    
    async animateProgress() {
        const steps = [
            { width: '20%', text: 'Reading image file...' },
            { width: '40%', text: 'Processing image data...' },
            { width: '60%', text: 'Converting to PNG format...' },
            { width: '80%', text: 'Optimizing quality...' },
            { width: '100%', text: 'Conversion complete!' }
        ];
        
        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => {
                setTimeout(() => {
                    this.progressBar.style.width = steps[i].width;
                    this.progressText.textContent = steps[i].text;
                    resolve();
                }, 400);
            });
        }
    }
    
    async convertImage() {
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
                    if (this.watermarkToggle.checked) {
                        this.addWatermark(ctx, canvas.width, canvas.height);
                    }
                    
                    // Convert to PNG
                    canvas.toBlob((blob) => {
                        this.convertedBlob = blob;
                        
                        // Set preview images
                        this.originalPreview.src = e.target.result;
                        this.convertedPreview.src = URL.createObjectURL(blob);
                        
                        // Set file sizes
                        this.originalSize.textContent = this.formatFileSize(this.currentFile.size);
                        this.convertedSize.textContent = this.formatFileSize(blob.size);
                        
                        resolve();
                    }, 'image/png', 1.0);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(this.currentFile);
        });
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
    
    showResults() {
        this.progressSection.classList.add('hidden');
        this.resultSection.classList.remove('hidden');
        this.resultSection.classList.add('fade-in');
    }
    
    downloadPNG() {
        if (!this.convertedBlob) return;
        
        const url = URL.createObjectURL(this.convertedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.currentFile.name.replace(/\.(jpg|jpeg)$/i, '.png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('PNG file downloaded successfully!', 'success');
    }
    
    resetConverter() {
        // Reset all sections
        this.progressSection.classList.add('hidden');
        this.resultSection.classList.add('hidden');
        this.uploadArea.parentElement.style.display = 'block';
        
        // Reset progress bar
        this.progressBar.style.width = '0%';
        this.progressText.textContent = 'Processing image...';
        
        // Clear file input
        this.fileInput.value = '';
        this.currentFile = null;
        this.convertedBlob = null;
        
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
        
        this.conversionsLeft.textContent = remaining;
        
        if (remaining === 0) {
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
}

// Initialize converter when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new JPGtoPNGConverter();
    
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Add intersection observer for animations
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
    
    // Observe all converter cards
    document.querySelectorAll('.converter-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// Handle offline/online status
window.addEventListener('online', () => {
    console.log('Back online');
});

window.addEventListener('offline', () => {
    console.log('Gone offline');
});