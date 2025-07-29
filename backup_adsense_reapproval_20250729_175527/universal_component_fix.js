/*
  UNIVERSAL COMPONENT FIX FOR CONVERTWIZ
  ======================================
  - Replaces all old activation scripts (critical_component_fix.js, direct_component_fix.js, etc.)
  - Automatically maps the URL path to the corresponding component section.
  - Keeps landing page logic intact.
  - Ensures no UI modifications beyond displaying correct sections.
*/

// Remove any old conflicting scripts
const oldScripts = [
  'critical_component_fix.js',
  'component_test_automated.js',
  'direct_component_fix.js'
];
oldScripts.forEach(name => {
  document.querySelectorAll(`script[src*="${name}"]`).forEach(script => script.remove());
});

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, ""); // Clean path
  const sections = document.querySelectorAll(".tool-section");

  // Hide all sections initially
  sections.forEach(sec => {
    sec.style.display = "none";
    sec.classList.remove("active");
  });

  if (path === "" || path === "index.html") {
    // Show landing page
    const landing = document.getElementById("landing-section");
    if (landing) {
      landing.style.display = "block";
      landing.classList.add("active");
    }
  } else {
    // Show correct tool page (e.g., /jpg-to-png => #jpg-to-png-section)
    const targetId = path.split("/").pop() + "-section";
    const target = document.getElementById(targetId);
    if (target) {
      target.style.display = "block";
      target.classList.add("active");
    } else {
      console.warn(`[ConvertWiz] No matching component found for: ${targetId}`);
    }
  }
});