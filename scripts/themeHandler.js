// Attach event listener for DOMContentLoaded to load theme options when the page loads
document.addEventListener("DOMContentLoaded", handleTheme);

/**
 * Initializes the theme handler by adding an event listener to the theme selector.
 * The event listener detects changes in the user's theme preference and loads the current theme.
 */
function handleTheme() {
    const themeSelector = document.getElementById("darkmode");
    themeSelector.addEventListener("change", changePreferredTheme);

    loadThemePreference(themeSelector);
}

/**
 * Event listener for theme change. Applies the selected theme and saves the preference.
 * 
 * @param {Event} event - The event object from the theme selector change.
 */
function changePreferredTheme(event) {
    const selectedTheme = event.target.value;
    applyTheme(selectedTheme);
    savePreferredTheme(selectedTheme);
}

/**
 * Saves the preferred theme to Chrome's local storage.
 * 
 * @param {string} theme - The selected theme ("light", "dark", or "system").
 */
function savePreferredTheme(theme) {
    chrome.storage.local.set({ theme }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error saving theme preference:", chrome.runtime.lastError);
        }
    });
}

/**
 * Determines if dark mode is enabled based on the user's theme selection or system preference.
 *
 * @returns {boolean} - Returns `true` if dark mode is enabled.
 */
function isDarkMode() {
    const themeSelected = document.getElementById("darkmode").value;
    return themeSelected === "dark" || (themeSelected === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

/**
 * Applies the selected theme by toggling the "dark" class on the document element.
 * 
 * @param {string} theme - The selected theme ("light", "dark", or "system").
 */
function applyTheme(theme) {
    const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDarkMode !== document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.toggle("dark", isDarkMode);
        loadFilteredMangas();
    }
}

/**
 * Loads the saved theme preference from Chrome's local storage and applies it.
 * 
 * @param {HTMLSelectElement} themeSelector - The DOM element for the theme selector.
 */
function loadThemePreference(themeSelector) {
    chrome.storage.local.get("theme", (result) => {
        const savedTheme = result.theme || "system";
        themeSelector.value = savedTheme;
        applyTheme(savedTheme);
    });
}
