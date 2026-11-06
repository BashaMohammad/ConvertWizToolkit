(function () {
  document.getElementById("convertBtn").addEventListener("click", function () {
    const file = document.getElementById("upload").files[0];
    if (!file) return alert("Please upload a PDF file.");
    const result = document.getElementById("result");
    result.innerHTML = "🔄 Simulating DOCX download...";
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(file);
      link.download = "converted.docx";
      link.click();
      result.innerHTML = "✅ DOCX ready for download.";
    }, 1500);
  });
})();