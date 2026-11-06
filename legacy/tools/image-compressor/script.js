/**
 * Image Compressor - Isolated Tool Implementation
 * Part of ConvertWiz Multi-Tool Suite
 */

(function() {
    'use strict';
    
    // Tool configuration
    const TOOL_CONFIG = {
        name: 'Image Compressor',
        section: 'image-compressor-section',
        category: 'image-tools',
        Saturday: false
    };
    
    // Initialize tool when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log(`🔧 Initializing ${TOOL_CONFIG.name}...`);
        initializeTool();
    });
    
    function initializeTool() {
        // Load tool content from main application
        loadToolContent();
        
        // Set up error handling
        window.addEventListener('error', handleError);
    }
    
    function loadToolContent() {
        // Fetch tool content from main app
        fetch('/api/tool-content/' + 'image-compressor-section')
            .then(response => response.text())
            .then(html => {
                const contentContainer = document.getElementById('tool-content');
                if (contentContainer) {
                    contentContainer.innerHTML = html;
                    
                    // Initialize tool-specific functionality
                    initializeToolFunctionality();
                }
            })
            .catch(error => {
                console.error('Error loading tool content:', error);
                showErrorMessage('Failed to load tool. Please try again.');
            });
    }
    
    function initializeToolFunctionality() {
        // Tool-specific initialization will be handled by main app
        const event = new CustomEvent('toolLoaded', {
            detail: { 
                section: TOOL_CONFIG.section,
                category: TOOL_CONFIG.category 
            }
        });
        document.dispatchEvent(event);
        
        console.log(`✅ ${TOOL_CONFIG.name} loaded successfully`);
    }
    
    function handleError(error) {
        console.error('Tool error:', error);
        showErrorMessage('An error occurred. Please refresh the page.');
    }
    
    function showErrorMessage(message) {
        const contentContainer = document.getElementById('tool-content');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 40px; color: #dc2626;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px;"></i>
                    <p style="font-size: 1.1rem; margin: 0;">${message}</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Try Again
                    </button>
                </div>
            `;
        }
    }
})();