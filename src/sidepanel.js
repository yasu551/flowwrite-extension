import { CreateExtensionServiceWorkerMLCEngine } from "@mlc-ai/web-llm";

const initProgressCallback = (report) => {
  console.log(report);
};

const engine = await CreateExtensionServiceWorkerMLCEngine(
  "Qwen2-0.5B-Instruct-q4f16_1-MLC",
  { initProgressCallback: initProgressCallback }
);

async function polishText(text) {
  const messages = [
    {
      role: "system",
      content:
        "あなたは、難しい文章を誰にでも理解しやすい言葉に言い換えるアシスタントです。簡潔で明確な表現を用い、専門用語はできる限り日常的な言葉に置き換えてください。",
    },
    {
      role: "user",
      content:
        "以下の文章を、わかりやすい表現に書き換えてください。\n\n入力: 『人工知能は、膨大なデータセットを解析し、学習することで、予測や意思決定の精度を向上させる能力を有する。』",
    },
    {
      role: "assistant",
      content:
        "人工知能は、大量のデータを分析して学び、その結果を使ってより正確な予測や判断ができるようになります。",
    },
    {
      role: "user",
      content:
        "入力: 『クラウドコンピューティングは、リモートサーバーを利用してデータ処理やストレージを提供する技術である。』",
    },
    {
      role: "assistant",
      content:
        "クラウドコンピューティングとは、インターネットを通じて遠くのコンピュータを使い、データの保存や計算をする技術のことです。",
    },
    {
      role: "user",
      content: text
    }
  ];
  const completion = await engine.chat.completions.create({
    messages,
  });
  const { content } = completion.choices[0].message;
  console.log(content);
  return content;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "polished_text") {
    (async () => {
      const textArea = document.getElementById("polishedText");
      if (textArea) {
        const text = await polishText(message.text);
        textArea.textContent = text;
      }
      sendResponse({ success: true });
    })();
    return true;
  }
  return true;
});

// (function() {
//   // Simulate fetching 校正例 from WebLLM API
//   function fetchCorrectionExample() {
//     return new Promise((resolve) => {
//       // Simulated API call delay
//       setTimeout(() => {
//         resolve("【校正例】これは修正された文章のサンプルです。");
//       }, 1000);
//     });
//   }

//   fetchCorrectionExample().then((exampleText) => {
//     const exampleDiv = document.getElementById('exampleText');
//     if (exampleDiv) {
//       exampleDiv.textContent = exampleText;
//       // Store the example text globally for later use
//       window.correctionExample = exampleText;
//     }
//   });

//   // Add click event listener to "追記" button
//   document.getElementById('appendButton').addEventListener('click', function() {
//     if (window.correctionExample) {
//       chrome.runtime.sendMessage({ type: 'APPEND_TEXT', text: window.correctionExample }, function(response) {
//         if (response && response.success) {
//           alert("校正例が追記されました。");
//         } else {
//           alert("追記に失敗しました。");
//         }
//       });
//     }
//   });
// })();
