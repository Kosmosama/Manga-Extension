/**
 * IIFE to load initial theme before body element is created to prevent blinking.
 */
(function applyInitialTheme() {
    loadTheme().then((theme) => {
        applyTheme(theme);
    }).catch(console.error);
})();

/**
 * Loads the theme preference from Chrome storage or defaults to "system".
 * 
 * @returns {Promise<string>} - The selected theme ("light", "dark", or "system").
 */
async function loadTheme() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("theme", (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result.theme || "system");
            }
        });
    });
}

/**
 * Applies the selected theme by toggling the "dark" class.
 * 
 * @param {string} theme - The selected theme ("light", "dark", or "system").
 */
function applyTheme(theme) {
    const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDarkMode);
}
