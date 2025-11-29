chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "quickCapture") {
        chrome.runtime.sendMessage({
            type: "quickCaptureForward",
            payload: message.payload,
        });
        sendResponse({ ok: true });
    }
});
