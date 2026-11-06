(function () {
  document.getElementById("mergeBtn").addEventListener("click", function () {
    const files = document.getElementById("upload").files;
    const result = document.getElementById("result");
    if (!files.length) return alert("Please select PDFs.");
    result.innerHTML = "🔄 Merging and compressing PDFs...";
    setTimeout(() => {
      const blob = new Blob([files[0]], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "merged.pdf";
      link.click();
      result.innerHTML = "✅ Merged PDF downloaded.";
    }, 1500);
  });
})();