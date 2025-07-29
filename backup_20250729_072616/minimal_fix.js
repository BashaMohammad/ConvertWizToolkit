// MINIMAL COMPONENT FIX - No dependencies, just direct DOM manipulation
(function() {
    function showComponent() {
        // Get clean path
        var path = window.location.pathname;
        if (path.startsWith('/')) path = path.substring(1);
        if (path.endsWith('/')) path = path.substring(0, path.length - 1);
        
        console.log('Minimal fix - path:', path);
        
        // Hide all tool sections
        var sections = document.querySelectorAll('.tool-section');
        for (var i = 0; i < sections.length; i++) {
            sections[i].style.display = 'none';
            sections[i].classList.remove('active');
        }
        
        // Show landing or component
        if (path === '' || path === 'index.html') {
            var landing = document.getElementById('landing-section');
            if (landing) {
                landing.style.display = 'block';
                landing.classList.add('active');
                console.log('Minimal fix - showing landing');
            }
        } else {
            // Map path to section ID
            var sectionId = path + '-section';
            var target = document.getElementById(sectionId);
            if (target) {
                target.style.display = 'block';
                target.classList.add('active');
                console.log('Minimal fix - showing:', sectionId);
            } else {
                console.log('Minimal fix - section not found:', sectionId);
            }
        }
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showComponent);
    } else {
        showComponent();
    }
})();