// AUTOMATED COMPONENT ISOLATION TESTS
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('🧪 Running Automated Component Tests...');
        
        const results = {
            timestamp: new Date().toISOString(),
            tests: {},
            overall: 'UNKNOWN'
        };
        
        // Test 1: Only landing section visible on load
        const landingSection = document.getElementById('landing-section');
        const isLandingVisible = landingSection && 
            landingSection.style.display !== 'none' && 
            landingSection.style.visibility !== 'hidden';
        
        results.tests.test1_landing_only = {
            status: isLandingVisible ? "PASS" : "FAIL",
            description: "Landing section visible on load",
            details: `Landing display: ${landingSection ? landingSection.style.display || 'default' : 'not found'}`
        };
        
        // Test 2: All tool sections hidden by default
        const toolSections = [
            'jpg-to-png-section', 'currency-converter-section', 'land-converter-section',
            'dp-resizer-section', 'word-counter-section', 'distance-converter-section',
            'weight-converter-section', 'height-converter-section', 'ip-extractor-section',
            'qr-generator-section', 'percentage-calculator-section', 'temperature-converter-section',
            'color-converter-section', 'image-compressor-section', 'text-to-speech-section',
            'backlink-checker-section', 'meta-tag-generator-section', 'dpi-checker-section',
            'url-shortener-section'
        ];
        
        let hiddenCount = 0;
        let visibleTools = [];
        
        toolSections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const isHidden = section.style.display === 'none' || section.style.visibility === 'hidden';
                if (isHidden) {
                    hiddenCount++;
                } else {
                    visibleTools.push(sectionId);
                }
            }
        });
        
        const allToolsHidden = hiddenCount === toolSections.length;
        results.tests.test2_tools_hidden = {
            status: allToolsHidden ? "PASS" : "FAIL",
            description: "All tool sections hidden by default",
            details: `${hiddenCount}/${toolSections.length} hidden. Visible: ${visibleTools.join(', ') || 'none'}`
        };
        
        // Test 3: showSection function exists
        const showSectionExists = typeof window.showSection === 'function';
        results.tests.test3_navigation = {
            status: showSectionExists ? "PASS" : "FAIL",
            description: "Navigation function available",
            details: showSectionExists ? "showSection function found" : "showSection function missing"
        };
        
        // Test 4: Navigation buttons present
        const navButtons = document.querySelectorAll('[data-target]');
        const hasNavButtons = navButtons.length >= 15; // Should have many navigation buttons
        results.tests.test4_nav_buttons = {
            status: hasNavButtons ? "PASS" : "FAIL",
            description: "Navigation buttons present",
            details: `${navButtons.length} navigation buttons found`
        };
        
        // Test 5: Test component switching (if showSection exists)
        let switchingWorks = false;
        if (showSectionExists) {
            try {
                // Test switching to JPG section
                window.showSection('jpg-to-png-section');
                const jpgSection = document.getElementById('jpg-to-png-section');
                const jpgVisible = jpgSection && jpgSection.style.display !== 'none';
                const landingHidden = landingSection.style.display === 'none';
                
                // Switch back to landing
                window.showSection('landing-section');
                const landingBackVisible = landingSection.style.display !== 'none';
                
                switchingWorks = jpgVisible && landingHidden && landingBackVisible;
            } catch (error) {
                console.error('Component switching test error:', error);
            }
        }
        
        results.tests.test5_switching = {
            status: switchingWorks ? "PASS" : "FAIL",
            description: "Component switching works",
            details: switchingWorks ? "Component isolation working" : "Component switching failed"
        };
        
        // Calculate overall result
        const passedTests = Object.values(results.tests).filter(test => test.status === "PASS").length;
        const totalTests = Object.keys(results.tests).length;
        results.overall = passedTests === totalTests ? "ALL_PASS" : "SOME_FAIL";
        
        // Log results
        console.log(`\n🎯 Component Isolation Test Results: ${results.overall}`);
        console.log(`   Passed: ${passedTests}/${totalTests} tests`);
        
        Object.entries(results.tests).forEach(([testName, result]) => {
            const icon = result.status === "PASS" ? "✅" : "❌";
            console.log(`   ${icon} ${result.description}: ${result.status}`);
            if (result.status === "FAIL") {
                console.log(`      Details: ${result.details}`);
            }
        });
        
        if (results.overall === "ALL_PASS") {
            console.log("🎉 All component isolation tests PASSED!");
        } else {
            console.log("⚠️ Some component isolation tests FAILED");
        }
        
        // Store results globally
        window.componentTestResults = results;
        
        return results;
    }, 1000); // Wait for initialization
});