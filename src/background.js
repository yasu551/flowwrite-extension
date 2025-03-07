import { ExtensionServiceWorkerMLCEngineHandler } from "@mlc-ai/web-llm";
let handler;
chrome.runtime.onConnect.addListener(function (port) {
  console.assert(port.name === "web_llm_service_worker");
  if (handler === undefined) {
    handler = new ExtensionServiceWorkerMLCEngineHandler(port);
  } else {
    handler.setPort(port);
  }
  port.onMessage.addListener(handler.onmessage.bind(handler));
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "open_side_panel") {
    (async () => {
      console.log("Opening side panel");
      await chrome.sidePanel.open({ tabId: sender.tab.id });
      await chrome.sidePanel.setOptions({
        tabId: sender.tab.id,
        path: "sidepanel.html",
        enabled: true,
      });
      sendResponse({ success: true });
    })();
    return true; // 非同期応答があることを示す
  }
});

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === "chat") {
//     (async () => {
//       const messages = [
//         { role: "system", content: "You are a helpful AI assistant." },
//         { role: "user", content: "Hello!" },
//       ];
//       const reply = await engine.chat.completions.create({
//         messages,
//       });
//       const { content } = reply.choices[0].message;
//       console.log(answer);
//       console.log(reply.usage);
//       sendResponse({ success: true, content });
//     })();
//     return true;
//   }
// });
