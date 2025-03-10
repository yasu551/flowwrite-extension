import { CreateExtensionServiceWorkerMLCEngine } from "@mlc-ai/web-llm";

document.addEventListener("focusin", (event) => {
  const target = event.target;
  if (
    target &&
    (target.nodeName === "TEXTAREA" ||
      (target.nodeName === "INPUT" && target.type === "text"))
  ) {
    // テキスト入力の監視を開始
    addInputListeners(target);
    addPolishExampleShowButton(target);
  }
});

document.addEventListener("focusout", (event) => {
  const target = event.target;
  if (
    target &&
    (target.nodeName === "TEXTAREA" ||
      (target.nodeName === "INPUT" && target.type === "text"))
  ) {
    // テキスト入力の監視を停止
    target.removeEventListener("input", addInputListeners);
  }
});

const initProgressCallback = (report) => {
  console.log(report);
};

const engine = await CreateExtensionServiceWorkerMLCEngine(
  "Qwen2-0.5B-Instruct-q4f16_1-MLC",
  { initProgressCallback: initProgressCallback }
);

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

async function nextWordSuggestion(text) {
  const messages = [
    {
      role: "system",
      content:
        "あなたは、ユーザーが入力している途中のテキストをもとに、次に入力される可能性が高いテキストを予測して表示するツールの一部です。ユーザーの入力を自然かつ的確に補完するテキストを生成してください。",
    },
    {
      role: "user",
      content:
        "以下のテキストに続いて入力される可能性が高いテキストを、自然に補完してください。\n\n入力中のテキスト:\n人工知能の発展により、社会は",
    },
    {
      role: "assistant",
      content:
        "ますます自動化が進み、さまざまな分野で生産性が向上することが期待されています。",
    },
    {
      role: "user",
      content: "入力中のテキスト:\nクラウドコンピューティングの普及によって",
    },
    {
      role: "assistant",
      content:
        "企業のITインフラが柔軟になり、コスト削減やスケーラビリティの向上が実現されました。",
    },
    {
      role: "user",
      content: `入力中のテキスト: ${text}`,
    },
  ];
  const completion = await engine.chat.completions.create({
    messages,
  });
  const { content } = completion.choices[0].message;
  console.log(content);
  return content;
}

function addInputListeners(textArea) {
  const debouncedRequest = debounce((value) => {
    requestLLMSuggestions(value, textArea);
  }, 300);

  textArea.addEventListener("input", (e) => {
    debouncedRequest(e.target.value);
  });
}

async function requestLLMSuggestions(currentText, textArea) {
  try {
    const content = await nextWordSuggestion(currentText);
    showSuggestionOverlay(textArea, content);
  } catch (err) {
    console.error("LLM suggestion error:", err);
  }
}

function showSuggestionOverlay(textArea, suggestion) {
  // overlay要素を作成 or 取得
  let overlay = document.getElementById("flowwrite-suggestion-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "flowwrite-suggestion-overlay";
    // スタイルを適切に設定
    overlay.style.position = "absolute";
    overlay.style.zIndex = 9999;
    overlay.style.pointerEvents = "none";
    document.body.appendChild(overlay);
  }

  // テキストエリアの位置やサイズを計測
  const rect = textArea.getBoundingClientRect();
  const caretCoordinates = getCaretCoordinates(
    textArea,
    textArea.selectionStart
  );
  const caretX = rect.left + window.scrollX + caretCoordinates.left;
  const caretY =
    rect.top + window.scrollY + caretCoordinates.top + caretCoordinates.height;
  overlay.style.left = `${caretX}px`;
  overlay.style.top = `${caretY}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;

  // 内容の更新
  overlay.textContent = suggestion;
  overlay.style.color = "gray"; // 提示例。視認しやすいように調整
}

function getCaretCoordinates(element, position) {
  // ミラー要素を作成（画面に表示しないように隠す）
  const div = document.createElement("div");
  const style = window.getComputedStyle(element);

  // ミラー要素の基本スタイル設定
  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = element.nodeName === "INPUT" ? "pre" : "pre-wrap";
  div.style.wordWrap = "break-word"; // テキストエリアの場合

  // テキストエリアと同じフォントやパディングなど必要なCSSプロパティをコピー
  const propertiesToCopy = [
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "letter-spacing",
    "text-transform",
    "word-spacing",
    "text-indent",
    "padding",
    "border",
    "box-sizing",
    "line-height",
  ];
  propertiesToCopy.forEach((prop) => {
    div.style[prop] = style.getPropertyValue(prop);
  });

  // テキストエリアと同じ幅を設定
  div.style.width = style.width;

  // ミラー要素に、caretまでのテキストを設定
  div.textContent = element.value.substring(0, position);

  // caret位置のマーカーとして、span要素を追加
  const span = document.createElement("span");
  // caretが末尾の場合、spanが空にならないようダミー文字を入れる
  span.textContent = element.value.substring(position) || ".";
  div.appendChild(span);

  // ドキュメントに一時的に追加してレンダリングさせ、座標を計測
  document.body.appendChild(div);
  const coordinates = {
    left: span.offsetLeft,
    top: span.offsetTop,
    height: span.offsetHeight,
  };
  document.body.removeChild(div);

  return coordinates;
}

function addPolishExampleShowButton(textArea) {
  const overlayId = "flowwrite-polish-example-button-overlay";
  let overlay = document.getElementById(overlayId);
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = overlayId;
    overlay.style.position = "absolute";
    overlay.style.zIndex = 9999;
    document.body.appendChild(overlay);
  }

  const buttonId = "flowwrite-polish-example-button";
  let button = document.getElementById(buttonId);
  if (!button) {
    button = document.createElement("button");
    button.id = buttonId;
    button.textContent = "校正例を表示";
    button.style.width = "100px";
    button.style.height = "30px";
    button.style.backgroundColor = "#007bff";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = "12px";
    button.addEventListener("click", async () => {
      const currentText = textArea.value;
      chrome.runtime.sendMessage(
        { type: "open_side_panel", text: currentText },
        (response) => {
          console.log("Response from background:", response);
        }
      );
    });
    overlay.appendChild(button);
  }

  // テキストエリアの位置やサイズを計測
  const rect = textArea.getBoundingClientRect();
  overlay.style.left = `${rect.left + rect.width - 110}px`;
  overlay.style.top = `${rect.top + rect.height - 35}px`;
}

function removePolishExampleShowButton(textArea) {
  const overlayId = "flowwrite-polish-example-button-overlay";
  let overlay = document.getElementById(overlayId);
  if (overlay) {
    overlay.remove();
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    const overlay = document.getElementById("flowwrite-suggestion-overlay");
    if (overlay && overlay.textContent) {
      const textArea = document.activeElement;
      if (
        textArea &&
        (textArea.nodeName === "TEXTAREA" || textArea.nodeName === "INPUT")
      ) {
        // 補完反映
        textArea.value += overlay.textContent;
        // overlayをクリア
        overlay.textContent = "";
        // ブラウザのTab動作を防止
        event.preventDefault();
      }
    }
  }
});

document.addEventListener("keydown", async (event) => {
  const textArea = document.activeElement;
  if (
    textArea &&
    (textArea.nodeName === "TEXTAREA" || textArea.nodeName === "INPUT") &&
    event.key === "Tab" &&
    event.metaKey // macOS Commandキー
  ) {
    // 校正プロセスへ
    event.preventDefault();
    const currentText = textArea.value;
    const polished = await requestLLMPolish(currentText);
    showPolishPopup(textArea, polished);
  }
});

async function requestLLMPolish(text) {
  try {
    // 例：APIで文章を校正させる
    // const response = await fetch('https://YOUR_LLM_SERVER/polish', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ text })
    // });
    // const data = await response.json();
    // return data.polished;

    return "校正後の例文です。"; // デモ用のダミー
  } catch (err) {
    console.error("LLM polishing error:", err);
    return text; // エラー時は元の文章を返す
  }
}

function showPolishPopup(textArea, polishedText) {
  // ポップアップ要素を作成または取得
  let popup = document.getElementById("flowwrite-polish-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "flowwrite-polish-popup";
    // 適切なスタイルを設定
    popup.style.position = "absolute";
    popup.style.zIndex = 9999;
    popup.style.border = "1px solid #ccc";
    popup.style.backgroundColor = "#fff";
    // ...
    document.body.appendChild(popup);
  }

  // テキストエリア位置を取得
  const rect = textArea.getBoundingClientRect();
  popup.style.left = `${rect.left + window.scrollX}px`;
  popup.style.top = `${rect.top + window.scrollY + rect.height + 5}px`;

  // コンテンツを更新
  popup.innerText = polishedText;

  // 次の Command + Enter を待つ
  const listener = (event) => {
    if (event.key === "Tab" && event.metaKey) {
      // ポップアップを反映
      textArea.value = polishedText;
      // ポップアップを消す
      popup.remove();
      document.removeEventListener("keydown", listener);
      event.preventDefault();
    }
  };

  document.addEventListener("keydown", listener);
}

// (function () {
//   // Create "校正例" button
//   const correctionButton = document.createElement("button");
//   correctionButton.innerText = "校正例";
//   correctionButton.style.position = "fixed";
//   correctionButton.style.bottom = "20px";
//   correctionButton.style.right = "20px";
//   correctionButton.style.zIndex = "10000";
//   document.body.appendChild(correctionButton);

//   // Open side panel on button click
//   correctionButton.addEventListener("click", function () {
//     if (chrome.sidePanel && chrome.sidePanel.setOptions) {
//       chrome.sidePanel.setOptions(
//         { panel: { path: "sidepanel.html" } },
//         function () {
//           console.log("Side panel opened");
//         }
//       );
//     } else {
//       console.error("chrome.sidePanel API is not available.");
//     }
//   });

//   // Listen for messages from the side panel to append correction text
//   chrome.runtime.onMessage.addListener(function (
//     message,
//     sender,
//     sendResponse
//   ) {
//     if (message.type === "APPEND_TEXT" && message.text) {
//       // Identify the target textarea on the page (assumed to be the first found)
//       const targetTextArea = document.querySelector("textarea");
//       if (targetTextArea) {
//         targetTextArea.value += message.text;
//         sendResponse({ success: true });
//       } else {
//         sendResponse({ success: false, error: "Target textarea not found." });
//       }
//     }
//   });
// })();
