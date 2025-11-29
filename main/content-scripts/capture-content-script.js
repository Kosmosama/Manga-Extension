(function () {
    const denylist = ["chrome://", "about:", "edge://"];

    const href = location.href;
    if (denylist.some((d) => href.startsWith(d))) {
        return;
    }

    const fab = document.createElement("button");
    fab.textContent = "＋";
    fab.style.position = "fixed";
    fab.style.bottom = "16px";
    fab.style.right = "16px";
    fab.style.zIndex = "999999";
    fab.style.width = "48px";
    fab.style.height = "48px";
    fab.style.borderRadius = "50%";
    fab.style.border = "none";
    fab.style.background = "#6366f1";
    fab.style.color = "#fff";
    fab.style.fontSize = "24px";
    fab.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    fab.style.cursor = "pointer";
    fab.setAttribute("aria-label", "Quick Capture");
    document.body.appendChild(fab);

    fab.addEventListener("click", () => sendQuickCapture());

    window.addEventListener("keydown", (e) => {
        if (e.shiftKey && e.key.toUpperCase() === "Q") {
            e.preventDefault();
            sendQuickCapture();
        }
    });

    function extractMetadata() {
        const title = document.title || "Untitled";
        return {
            title,
            link: location.href,
        };
    }

    function sendQuickCapture() {
        const meta = extractMetadata();
        try {
            chrome.runtime.sendMessage({
                type: "quickCapture",
                payload: meta,
            });
        } catch {
        }
    }
})();
