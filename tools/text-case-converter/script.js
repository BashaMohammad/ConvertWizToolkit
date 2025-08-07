(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // Existing button bindings...
    document.getElementById("copyBtn")?.addEventListener("click", function () {
      const textToCopy = document.getElementById("result").value;
      if (!textToCopy) {
        alert("Nothing to copy.");
        return;
      }

      // Clipboard API
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Copied to clipboard ✅");
      }).catch(err => {
        console.error("Copy failed", err);
        alert("❗ Failed to copy text. Please try again.");
      });
    });
  });
})();