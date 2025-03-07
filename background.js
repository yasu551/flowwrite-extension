chrome.runtime.onInstalled.addListener(() => {
  console.log("FlowWrite installed.");
});

// 必要に応じてonMessageなどを受け取り、API呼び出しの代理など
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "POLISH_TEXT") {
    // 外部API呼び出しなどを行い、結果を送信
    // ...
    sendResponse({ success: true, data: "校正後の文章" });
  }
  return true;
});
