// PNG to JPG Converter initialization (Saturday Component)
function initSaturdayPngToJpg() {
    console.log('🔧 INIT: PNG to JPG Converter starting...');
    
    const fileInput = document.getElementById('png-input');
    const dropZone = document.getElementById('png-upload-area');
    const browseBtn = document.getElementById('png-browse-btn');
    const qualitySlider = document.getElementById('jpg-quality');
    const qualityValue = document.getElementById('jpg-quality-value');
    const resultsList = document.getElementById('png-results-list');
    
    if (!fileInput || !dropZone || !browseBtn || !qualitySlider || !qualityValue || !resultsList) {
        console.warn('⚠️ PNG to JPG: Required elements not found');
        return;
    }
    
    // Quality slider handler
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = this.value + '%';
    });
    
    // Browse button handler
    browseBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    // File input handler
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        processPngFiles(files);
    });
    
    // Drag and drop handlers
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('border-blue-500', 'bg-blue-50');
    });
    
    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('border-blue-500', 'bg-blue-50');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('border-blue-500', 'bg-blue-50');
        
        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.type === 'image/png'
        );
        
        if (files.length > 0) {
            processPngFiles(files);
        } else {
            alert('Please select PNG files only.');
        }
    });
    
    console.log('✅ PNG to JPG Converter initialized successfully');
}

// Text Case Converter initialization (Saturday Component)
function initSaturdayTextCaseConverter() {
    console.log('🔧 INIT: Text Case Converter starting...');
    
    const textInput = document.getElementById('case-input-text');
    const outputText = document.getElementById('case-output-text');
    
    if (!textInput || !outputText) {
        console.warn('⚠️ Text Case: Required elements not found');
        return;
    }
    
    // Clear output initially
    outputText.value = '';
    
    // Auto-convert on input
    textInput.addEventListener('input', function() {
        // Clear output when input is empty
        if (!this.value.trim()) {
            outputText.value = '';
        }
    });
    
    console.log('✅ Text Case Converter initialized successfully');
}

// Convert text to all cases
function convertAllCases(text) {
    const resultsDiv = document.getElementById('text-case-results');
    if (!resultsDiv) return;
    
    const cases = {
        'UPPERCASE': text.toUpperCase(),
        'lowercase': text.toLowerCase(),
        'Title Case': text.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        ),
        'Sentence case': text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    };
    
    resultsDiv.innerHTML = Object.entries(cases).map(([label, converted]) => `
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <h5 class="font-semibold text-gray-800 mb-2">${label}</h5>
                    <p class="text-gray-700 bg-white p-3 rounded border">${converted}</p>
                </div>
                <button onclick="copyToClipboard('${converted.replace(/'/g, "\\'")}', '${label}')" 
                        class="ml-4 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                    <i class="fas fa-copy mr-1"></i>Copy
                </button>
            </div>
        </div>
    `).join('');
}

// Convert specific case (for individual buttons)
function convertCase(caseType) {
    const textInput = document.getElementById('case-input-text');
    const outputText = document.getElementById('case-output-text');
    
    if (!textInput || !textInput.value.trim()) {
        alert('Please enter some text first.');
        return;
    }
    
    const inputText = textInput.value;
    let convertedText = '';
    
    switch(caseType) {
        case 'upper':
            convertedText = inputText.toUpperCase();
            break;
        case 'lower':
            convertedText = inputText.toLowerCase();
            break;
        case 'title':
            convertedText = inputText.replace(/\w\S*/g, (txt) => 
                txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
            break;
        case 'sentence':
            convertedText = inputText.charAt(0).toUpperCase() + inputText.slice(1).toLowerCase();
            break;
        default:
            convertedText = inputText;
    }
    
    if (outputText) {
        outputText.value = convertedText;
    }
}

// Copy output text to clipboard (silent operation with button feedback)
function copyOutputText() {
    const outputText = document.getElementById('case-output-text');
    
    if (!outputText || !outputText.value.trim()) {
        return; // Silent return - no error message
    }
    
    const button = event.target.closest('button');
    if (!button) return;
    
    // Prevent multiple clicks by disabling button temporarily
    if (button.disabled) return;
    button.disabled = true;
    
    const originalText = button.innerHTML;
    const originalClasses = button.className;
    
    // Show copying state immediately
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Copying...';
    button.classList.remove('bg-gradient-to-r', 'from-violet-500', 'to-purple-600', 'hover:from-violet-600', 'hover:to-purple-700');
    button.classList.add('bg-gray-400', 'cursor-not-allowed');
    
    navigator.clipboard.writeText(outputText.value).then(() => {
        // Show success state
        button.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
        button.classList.remove('bg-gray-400', 'cursor-not-allowed');
        button.classList.add('bg-green-500');
        
        // Reset button after 7 seconds with smooth transition
        setTimeout(() => {
            button.innerHTML = originalText;
            button.className = originalClasses;
            button.disabled = false;
        }, 7000);
        
    }).catch(() => {
        // Silent fallback - try older method
        try {
            const textArea = document.createElement('textarea');
            textArea.value = outputText.value;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            // Show success state for fallback
            button.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
            button.classList.remove('bg-gray-400', 'cursor-not-allowed');
            button.classList.add('bg-green-500');
            
            // Reset button after 7 seconds
            setTimeout(() => {
                button.innerHTML = originalText;
                button.className = originalClasses;
                button.disabled = false;
            }, 7000);
            
        } catch (fallbackError) {
            console.log('Copy operation completed'); // Silent logging only
            
            // Reset button even if copy failed
            setTimeout(() => {
                button.innerHTML = originalText;
                button.className = originalClasses;
                button.disabled = false;
            }, 3000);
        }
    });
}

// Process PNG files for conversion
function processPngFiles(files) {
    const resultsList = document.getElementById('png-results-list');
    const qualitySlider = document.getElementById('jpg-quality');
    const resultsSection = document.getElementById('png-conversion-results');
    
    if (!resultsList) return;
    
    const quality = qualitySlider ? qualitySlider.value / 100 : 0.9;
    
    resultsList.innerHTML = '';
    
    // Show results section
    if (resultsSection) {
        resultsSection.classList.remove('hidden');
    }
    
    files.forEach((file, index) => {
        if (file.type !== 'image/png') {
            alert('Please select PNG files only.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob(function(blob) {
                    const jpgUrl = URL.createObjectURL(blob);
                    const originalSize = (file.size / 1024).toFixed(1);
                    const convertedSize = (blob.size / 1024).toFixed(1);
                    const compression = ((file.size - blob.size) / file.size * 100).toFixed(1);
                    
                    const resultDiv = document.createElement('div');
                    resultDiv.className = 'bg-green-50 border border-green-200 rounded-lg p-4';
                    resultDiv.innerHTML = `
                        <div class="flex items-center justify-between">
                            <div>
                                <h5 class="font-semibold text-gray-800">${file.name.replace('.png', '.jpg')}</h5>
                                <p class="text-sm text-gray-600">
                                    Original: ${originalSize} KB → Converted: ${convertedSize} KB
                                    <span class="text-green-600">(${compression}% compressed)</span>
                                </p>
                            </div>
                            <button onclick="downloadConvertedFile('${jpgUrl}', '${file.name.replace('.png', '.jpg')}')" 
                                    class="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all">
                                <i class="fas fa-download mr-1"></i>Download
                            </button>
                        </div>
                    `;
                    resultsList.appendChild(resultDiv);
                }, 'image/jpeg', quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Download function for converted files
function downloadConvertedFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// PDF to PowerPoint Converter
function initializePdfToPptConverter() {
    console.log('🔧 PDF to PowerPoint: Starting initialization...');
    
    const uploadArea = document.getElementById('pdf-powerpoint-upload-area');
    const fileInput = document.getElementById('pdf-powerpoint-input');
    const browseBtn = document.getElementById('pdf-powerpoint-browse-btn');
    const convertBtn = document.getElementById('pdf-powerpoint-convert-btn');
    
    if (!uploadArea || !fileInput || !browseBtn || !convertBtn) {
        console.warn('⚠️ PDF to PowerPoint: Required elements not found');
        return;
    }
    
    // Browse button functionality
    browseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
    });
    
    // MISSING CONVERT BUTTON EVENT LISTENER - ADDING NOW!
    convertBtn.addEventListener('click', () => {
        console.log('Convert to PowerPoint button clicked!');
        if (typeof convertPDFToPowerPoint === 'function') {
            convertPDFToPowerPoint();
        } else {
            console.error('convertPDFToPowerPoint function not found!');
        }
    });
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-orange-500', 'bg-orange-50');
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-orange-500', 'bg-orange-50');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-orange-500', 'bg-orange-50');
        const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
        if (files.length > 0) {
            processPdfToPowerpointFiles(files);
        }
    });
    
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change handler
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
        if (files.length > 0) {
            processPdfToPowerpointFiles(files);
        }
    });
    
    console.log('✅ PDF to PowerPoint initialized successfully');
}

function processPdfToPowerpointFiles(files) {
    const resultsContainer = document.getElementById('pdf-powerpoint-results');
    let resultsList = document.getElementById('pdf-powerpoint-list');
    
    // Create results list if it doesn't exist
    if (!resultsList) {
        resultsContainer.innerHTML = `
            <h4 class="text-xl font-bold text-gray-800 mb-6 text-center">Ready for Conversion</h4>
            <div id="pdf-powerpoint-list" class="space-y-4"></div>
        `;
        resultsList = document.getElementById('pdf-powerpoint-list');
    }
    
    resultsList.innerHTML = '';
    resultsContainer.classList.remove('hidden');
    
    // Store files globally for conversion function
    window.currentPdfFiles = files;
    
    files.forEach((file, index) => {
        displayRealPdfConversionResult(file, 'PowerPoint', 'pdf-powerpoint-list', 'orange', index);
    });
}

// Enhanced display function for real conversions
function displayRealPdfConversionResult(file, conversionType, containerId, colorTheme, index) {
    const resultsList = document.getElementById(containerId);
    
    const resultItem = document.createElement('div');
    resultItem.className = 'bg-gray-50 border border-gray-200 rounded-lg p-4';
    
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    
    resultItem.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex-1">
                <h5 class="font-semibold text-gray-800">${file.name}</h5>
                <p class="text-sm text-gray-600">
                    File size: ${fileSize} MB • Ready to convert to ${conversionType}
                </p>
            </div>
            <div class="flex space-x-2">
                <button onclick="realPdfConversion('${conversionType}', this, ${index})" class="bg-${colorTheme}-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-${colorTheme}-600 font-semibold transition-colors">
                    <i class="fas fa-download mr-1"></i>Convert & Download
                </button>
            </div>
        </div>
    `;
    
    resultsList.appendChild(resultItem);
}

// Real PDF conversion function that connects to backend API
function realPdfConversion(type, buttonElement, fileIndex) {
    // Get the file from global storage
    const files = window.currentPdfFiles || [];
    const file = files[fileIndex];
    
    if (!file) {
        console.error('File not found for conversion');
        return;
    }
    
    convertPdfToRealFormat(file, type, buttonElement);
}

// Enhanced PDF conversion with real backend API
function convertPdfToRealFormat(file, conversionType, buttonElement) {
    const formData = new FormData();
    formData.append('pdfFile', file);
    
    // Set button to processing state
    const originalText = buttonElement.innerHTML;
    buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Converting...';
    buttonElement.disabled = true;
    
    // Determine API endpoint based on conversion type
    let apiEndpoint;
    let fileExtension;
    
    switch(conversionType) {
        case 'Word':
            apiEndpoint = '/api/pdf-to-word';
            fileExtension = '.docx';
            break;
        case 'PowerPoint':
            apiEndpoint = '/api/pdf-to-powerpoint';
            fileExtension = '.pptx';
            break;
        case 'Excel':
            apiEndpoint = '/api/pdf-to-excel';
            fileExtension = '.xlsx';
            break;
        default:
            console.error('Unknown conversion type:', conversionType);
            buttonElement.innerHTML = originalText;
            buttonElement.disabled = false;
            return;
    }
    
    // Send to backend API
    fetch(apiEndpoint, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get filename from Content-Disposition header or create one
        const contentDisposition = response.headers.get('Content-Disposition');
        let downloadFilename = `converted_${file.name.replace('.pdf', '')}${fileExtension}`;
        
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match) {
                downloadFilename = match[1];
            }
        }
        
        return response.blob().then(blob => ({ blob, filename: downloadFilename }));
    })
    .then(({ blob, filename }) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        
        // Show success notification
        showRealPdfConversionSuccess(conversionType, filename);
        
        // Reset button
        buttonElement.innerHTML = originalText;
        buttonElement.disabled = false;
    })
    .catch(error => {
        console.error('Conversion failed:', error);
        
        // Show error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
        notification.innerHTML = `
            <i class="fas fa-exclamation-triangle mr-2"></i>
            Conversion failed. Please try again.
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        // Reset button
        buttonElement.innerHTML = originalText;
        buttonElement.disabled = false;
    });
}

function showRealPdfConversionSuccess(type, filename) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
    notification.innerHTML = `
        <i class="fas fa-check-circle mr-2"></i>
        ${filename} converted successfully!
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

console.log('✅ Component functions loaded and ready');