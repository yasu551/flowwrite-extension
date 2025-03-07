(function() {
  // Simulate fetching 校正例 from WebLLM API
  function fetchCorrectionExample() {
    return new Promise((resolve) => {
      // Simulated API call delay
      setTimeout(() => {
        resolve("【校正例】これは修正された文章のサンプルです。");
      }, 1000);
    });
  }

  fetchCorrectionExample().then((exampleText) => {
    const exampleDiv = document.getElementById('exampleText');
    if (exampleDiv) {
      exampleDiv.textContent = exampleText;
      // Store the example text globally for later use
      window.correctionExample = exampleText;
    }
  });

  // Add click event listener to "追記" button
  document.getElementById('appendButton').addEventListener('click', function() {
    if (window.correctionExample) {
      chrome.runtime.sendMessage({ type: 'APPEND_TEXT', text: window.correctionExample }, function(response) {
        if (response && response.success) {
          alert("校正例が追記されました。");
        } else {
          alert("追記に失敗しました。");
        }
      });
    }
  });
})();
