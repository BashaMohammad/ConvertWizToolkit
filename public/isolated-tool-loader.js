/**
 * Isolated Tool Loader for ConvertWiz
 * Manages loading and initialization of isolated tools
 */

class IsolatedToolLoader {
    constructor() {
        this.loadedTools = new Map();
        this.initEventListeners();
        console.log('🔧 Isolated Tool Loader initialized');
    }

    initEventListeners() {
        // Listen for tool load events from isolated tools
        document.addEventListener('toolLoaded', (event) => {
            const { section, category } = event.detail;
            this.initializeToolFromMainApp(section);
        });

        // Handle navigation to isolated tools
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href^="/tools/"]');
            if (link) {
                event.preventDefault();
                this.loadIsolatedTool(link.href);
            }
        });
    }

    async loadIsolatedTool(toolUrl) {
        try {
            // Extract tool ID from URL
            const toolId = toolUrl.split('/tools/')[1];
            
            if (this.loadedTools.has(toolId)) {
                console.log(`🔄 Tool ${toolId} already loaded`);
                return;
            }

            // Open tool in new tab/window for isolated environment
            window.open(toolUrl, '_blank');
            
            this.loadedTools.set(toolId, true);
            console.log(`✅ Opened isolated tool: ${toolId}`);
        } catch (error) {
            console.error('Error loading isolated tool:', error);
        }
    }

    initializeToolFromMainApp(section) {
        // Map section to initialization function
        const initFunctions = {
            'jpg-to-png-section': () => this.initJpgToPng(),
            'png-to-jpg-section': () => this.initPngToJpg(),
            'instagram-dp-section': () => this.initInstagramDP(),
            'image-compressor-section': () => this.initImageCompressor(),
            'currency-converter-section': () => this.initCurrencyConverter(),
            'land-unit-converter-section': () => this.initLandUnitConverter(),
            'percentage-calculator-section': () => this.initPercentageCalculator(),
            'temperature-converter-section': () => this.initTemperatureConverter(),
            'color-format-converter-section': () => this.initColorFormatConverter(),
            'get-my-ip-section': () => this.initGetMyIP(),
            'qr-code-generator-section': () => this.initQRCodeGenerator(),
            'lorem-ipsum-section': () => this.initLoremIpsum(),
            'text-to-speech-section': () => this.initTextToSpeech(),
            'backlink-checker-section': () => this.initBacklinkChecker(),
            'meta-tag-generator-section': () => this.initMetaTagGenerator(),
            'dpi-checker-section': () => this.initDPIChecker(),
            'bmi-calculator-section': () => this.initBMICalculator(),
            'text-case-converter-section': () => this.initTextCaseConverter(),
            'pdf-to-word-section': () => this.initPDFToWord(),
            'pdf-to-powerpoint-section': () => this.initPDFToPowerPoint(),
            'pdf-to-excel-section': () => this.initPDFToExcel(),
            'pdf-split-section': () => this.initPDFSplit(),
            'pdf-merge-compress-section': () => this.initPDFMergeCompress()
        };

        const initFunction = initFunctions[section];
        if (initFunction) {
            try {
                initFunction();
                console.log(`✅ Initialized tool for section: ${section}`);
            } catch (error) {
                console.error(`Error initializing ${section}:`, error);
            }
        } else {
            console.warn(`No initialization function found for section: ${section}`);
        }
    }

    // Isolated tool initialization methods
    initJpgToPng() {
        // Load existing JPG to PNG functionality if available
        if (typeof initJpgToPng === 'function') {
            initJpgToPng();
        }
    }

    initPngToJpg() {
        // Saturday component - isolated implementation
        if (typeof initSaturdayPngToJpg === 'function') {
            initSaturdayPngToJpg();
        }
    }

    initInstagramDP() {
        if (typeof initInstagramDP === 'function') {
            initInstagramDP();
        }
    }

    initImageCompressor() {
        if (typeof initImageCompressor === 'function') {
            initImageCompressor();
        }
    }

    initCurrencyConverter() {
        if (typeof initCurrencyConverter === 'function') {
            initCurrencyConverter();
        }
    }

    initLandUnitConverter() {
        if (typeof initGlobalLandUnits === 'function') {
            initGlobalLandUnits();
        }
    }

    initPercentageCalculator() {
        if (typeof initPercentageCalculator === 'function') {
            initPercentageCalculator();
        }
    }

    initTemperatureConverter() {
        if (typeof initTemperatureConverter === 'function') {
            initTemperatureConverter();
        }
    }

    initColorFormatConverter() {
        if (typeof initColorFormatConverter === 'function') {
            initColorFormatConverter();
        }
    }

    initGetMyIP() {
        if (typeof initGetMyIP === 'function') {
            initGetMyIP();
        }
    }

    initQRCodeGenerator() {
        if (typeof initQRCodeGenerator === 'function') {
            initQRCodeGenerator();
        }
    }

    initLoremIpsum() {
        if (typeof initLoremIpsum === 'function') {
            initLoremIpsum();
        }
    }

    initTextToSpeech() {
        if (typeof initTextToSpeech === 'function') {
            initTextToSpeech();
        }
    }

    initBacklinkChecker() {
        if (typeof initBacklinkChecker === 'function') {
            initBacklinkChecker();
        }
    }

    initMetaTagGenerator() {
        if (typeof initMetaTagGenerator === 'function') {
            initMetaTagGenerator();
        }
    }

    initDPIChecker() {
        if (typeof initDPIChecker === 'function') {
            initDPIChecker();
        }
    }

    initBMICalculator() {
        // Saturday component - isolated implementation
        if (typeof initSaturdayBMICalculator === 'function') {
            initSaturdayBMICalculator();
        }
    }

    initTextCaseConverter() {
        // Saturday component - isolated implementation  
        if (typeof initSaturdayTextCaseConverter === 'function') {
            initSaturdayTextCaseConverter();
        }
    }

    initPDFToWord() {
        // Saturday component - isolated implementation
        if (typeof initSaturdayPDFToWord === 'function') {
            initSaturdayPDFToWord();
        }
    }

    initPDFToPowerPoint() {
        // Saturday component - isolated implementation
        if (typeof initSaturdayPDFToPowerPoint === 'function') {
            initSaturdayPDFToPowerPoint();
        }
    }

    initPDFToExcel() {
        // Saturday component - isolated implementation
        if (typeof initSaturdayPDFToExcel === 'function') {
            initSaturdayPDFToExcel();
        }
    }

    initPDFSplit() {
        // Saturday component - isolated implementation
        if (typeof initSaturdayPDFSplit === 'function') {
            initSaturdayPDFSplit();
        }
    }

    initPDFMergeCompress() {
        // Saturday component - isolated implementation
        if (typeof initSaturdayPDFMergeCompress === 'function') {
            initSaturdayPDFMergeCompress();
        }
    }
}

// Initialize isolated tool loader when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.isolatedToolLoader = new IsolatedToolLoader();
});

console.log('🔧 Isolated Tool Loader script loaded');