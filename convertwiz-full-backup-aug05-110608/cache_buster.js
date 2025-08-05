// AGGRESSIVE CACHE BUSTER FOR PRODUCTION DEPLOYMENT
// Forces complete cache refresh to remove Saturday components

console.log('💥 CACHE BUSTER: Starting aggressive cache clearing');

// Force hard refresh to bypass all caches
function forceHardRefresh() {
    // Clear all possible caches
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => registration.unregister());
        });
    }
    
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }
    
    // Clear browser storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear IndexedDB
    if (window.indexedDB) {
        indexedDB.databases().then(databases => {
            databases.forEach(db => {
                indexedDB.deleteDatabase(db.name);
            });
        });
    }
    
    // Force page reload with cache bypass
    setTimeout(() => {
        window.location.reload(true);
    }, 1000);
}

// Auto-execute on Saturday component detection
document.addEventListener('DOMContentLoaded', function() {
    const saturdayComponents = [
        'bmi-calculator-section',
        'text-case-converter-section', 
        'png-to-jpg-section',
        'pdf-to-word-section',
        'pdf-to-excel-section',
        'pdf-split-section'
    ];
    
    let foundSaturdayComponents = 0;
    saturdayComponents.forEach(id => {
        if (document.getElementById(id)) {
            foundSaturdayComponents++;
        }
    });
    
    if (foundSaturdayComponents > 0) {
        console.log(`💥 CACHE BUSTER: Found ${foundSaturdayComponents} Saturday components - triggering cache clear`);
        forceHardRefresh();
    } else {
        console.log('💥 CACHE BUSTER: No Saturday components detected - cache is clean');
    }
});

// Manual trigger function
window.clearAllCaches = forceHardRefresh;