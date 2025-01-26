// Attach event listener for DOMContentLoaded to initialize the theme handlers after content is loaded
document.addEventListener("DOMContentLoaded", initializeThemeHandler);

/**
 * Initializes the theme handler by setting up event listeners and loading the saved theme.
 */
function initializeThemeHandler() {
    const themeSelector = document.getElementById("darkmode");
    if (!themeSelector) return;

    // Load and apply the saved theme preference
    loadThemePreference(themeSelector);

    // Set up event listener for theme changes
    themeSelector.addEventListener("change", changePreferredTheme);
}

/**
 * Loads the saved theme preference and applies it.
 * 
 * @param {HTMLSelectElement} themeSelector - The DOM element for the theme selector.
 */
async function loadThemePreference(themeSelector) {
    try {
        const theme = await loadTheme();
        themeSelector.value = theme;
        applyTheme(theme);
    } catch (error) {
        console.error("Failed to load theme preference:", error);
    }
}

/**
 * Event listener for theme changes. Saves the new preference and applies the theme.
 * 
 * @param {Event} event - The change event from the theme selector.
 */
function changePreferredTheme(event) {
    const selectedTheme = event.target.value;
    applyTheme(selectedTheme);
    saveThemePreference(selectedTheme);
    refreshAndSaveMangas();
}

/**
 * Saves the preferred theme in Chrome's local storage.
 * 
 * @param {string} theme - The selected theme ("light", "dark", or "system").
 */
function saveThemePreference(theme) {
    chrome.storage.local.set({ theme }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error saving theme preference:", chrome.runtime.lastError);
        }
    });
}
