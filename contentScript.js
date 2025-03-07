document.addEventListener("focusin", (event) => {
  const target = event.target;
  if (
    target &&
    (target.nodeName === "TEXTAREA" ||
      (target.nodeName === "INPUT" && target.type === "text"))
  ) {
    // テキスト入力の監視を開始
    addInputListeners(target);
  }
});

function addInputListeners(textArea) {
  textArea.addEventListener("input", (e) => {
    const currentText = e.target.value;
    // WebLLMに問い合わせる or Web Workerで推論する処理を呼び出す
    requestLLMSuggestions(currentText, textArea);
  });
}

async function requestLLMSuggestions(currentText, textArea) {
  try {
    // ここでローカル推論 or 外部APIを呼び出して候補を取得する
    // 例：外部APIを呼ぶ場合
    // const response = await fetch('https://YOUR_LLM_SERVER/suggest', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ prompt: currentText })
    // });
    // const data = await response.json();
    // const suggestion = data.suggestion;

    const suggestion = "サンプルの入力候補"; // デモ用のダミーデータ

    showSuggestionOverlay(textArea, suggestion);
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
  overlay.style.left = `${rect.left + window.scrollX}px`;
  overlay.style.top = `${rect.top + window.scrollY}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;

  // 内容の更新
  overlay.textContent = suggestion;
  overlay.style.color = "gray"; // 提示例。視認しやすいように調整
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
