// Component Isolation Test Suite for ConvertWiz
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('🧪 Running Component Isolation Tests...');
        
        const results = {
            timestamp: new Date().toISOString(),
            tests: {}
        };
        
        // Test 1: Landing section visible on load
        const landingSection = document.getElementById('landing-section');
        const isLandingVisible = landingSection && landingSection.style.display !== 'none';
        results.tests.landing_visible = {
            status: isLandingVisible ? "PASS" : "FAIL",
            details: `Landing section display: ${landingSection ? landingSection.style.display || 'default' : 'not found'}`
        };
        console.log(`✅ Landing Visible: ${isLandingVisible ? 'PASS' : 'FAIL'}`);
        
        // Test 2: All tool sections hidden by default
        const toolSections = document.querySelectorAll('.tool-section:not(#landing-section)');
        let hiddenCount = 0;
        toolSections.forEach(section => {
            if (section.style.display === 'none') {
                hiddenCount++;
            } else {
                console.log(`❌ Section ${section.id} not hidden: ${section.style.display}`);
            }
        });
        const allHidden = hiddenCount === toolSections.length;
        results.tests.tool_sections_hidden = {
            status: allHidden ? "PASS" : "FAIL",
            details: `${hiddenCount}/${toolSections.length} tool sections properly hidden`
        };
        console.log(`✅ Tool Sections Hidden: ${allHidden ? 'PASS' : 'FAIL'} (${hiddenCount}/${toolSections.length})`);
        
        // Test 3: Navigation buttons present
        const navButtons = document.querySelectorAll('[data-target]');
        results.tests.navigation_buttons = {
            status: navButtons.length > 10 ? "PASS" : "FAIL",
            details: `${navButtons.length} navigation buttons found`
        };
        console.log(`✅ Navigation Buttons: ${navButtons.length > 10 ? 'PASS' : 'FAIL'} (${navButtons.length} found)`);
        
        // Test 4: showSection function available
        const showSectionExists = typeof window.showSection === 'function';
        results.tests.show_section_function = {
            status: showSectionExists ? "PASS" : "FAIL",
            details: showSectionExists ? "showSection function available" : "showSection function missing"
        };
        console.log(`✅ showSection Function: ${showSectionExists ? 'PASS' : 'FAIL'}`);
        
        // Test 5: Test component switching (JPG to PNG)
        let switchingWorks = false;
        try {
            if (typeof window.showSection === 'function') {
                // Test switching to JPG to PNG section
                window.showSection('jpg-to-png-section');
                const jpgSection = document.getElementById('jpg-to-png-section');
                const landingHidden = landingSection.style.display === 'none';
                const jpgVisible = jpgSection.style.display !== 'none';
                switchingWorks = landingHidden && jpgVisible;
                
                // Switch back to landing
                window.showSection('landing-section');
                console.log(`🔄 Component switching test: ${switchingWorks ? 'PASS' : 'FAIL'}`);
            }
        } catch (error) {
            console.log(`❌ Component switching error: ${error.message}`);
        }
        
        results.tests.component_switching = {
            status: switchingWorks ? "PASS" : "FAIL",
            details: switchingWorks ? "Component switching works correctly" : "Component switching failed"
        };
        
        // Overall result
        const passedTests = Object.values(results.tests).filter(test => test.status === "PASS").length;
        const totalTests = Object.keys(results.tests).length;
        const overallStatus = passedTests === totalTests ? "ALL_PASS" : "SOME_FAIL";
        
        console.log(`\n🎯 Component Isolation Test Results: ${overallStatus}`);
        console.log(`   Passed: ${passedTests}/${totalTests} tests`);
        
        // Store results globally for external access
        window.componentTestResults = results;
        
        if (overallStatus === "ALL_PASS") {
            console.log("🎉 Component isolation working correctly!");
        } else {
            console.log("⚠️ Some component isolation issues detected");
        }
        
        return results;
    }, 500); // Wait for app.js to initialize
});