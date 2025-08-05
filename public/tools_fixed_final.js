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

// Copy output text to clipboard
function copyOutputText() {
    const outputText = document.getElementById('case-output-text');
    
    if (!outputText || !outputText.value.trim()) {
        alert('No text to copy. Please convert some text first.');
        return;
    }
    
    navigator.clipboard.writeText(outputText.value).then(() => {
        // Show success feedback
        const button = event.target.closest('button');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
        button.classList.remove('bg-gradient-to-r', 'from-violet-500', 'to-purple-600');
        button.classList.add('bg-green-500');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('bg-green-500');
            button.classList.add('bg-gradient-to-r', 'from-violet-500', 'to-purple-600');
        }, 2000);
    }).catch(() => {
        alert('Failed to copy text. Please try again.');
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

console.log('✅ Component functions loaded and ready');