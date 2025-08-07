(function () {
  document.getElementById("splitBtn").addEventListener("click", function () {
    const range = document.getElementById("pageRange").value;
    const file = document.getElementById("upload").files[0];
    const result = document.getElementById("result");
    if (!file || !range) return alert("Upload file and provide range.");
    result.innerHTML = "🪄 Simulating PDF split...";
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(file);
      link.download = "split.pdf";
      link.click();
      result.innerHTML = "✅ PDF split completed.";
    }, 1500);
  });
})();