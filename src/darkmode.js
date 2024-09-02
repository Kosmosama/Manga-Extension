loadThemePreference();

document.getElementById("darkmode").addEventListener("change", function (event) {
        const selectedTheme = event.target.value;
        applyTheme(selectedTheme);
        savePreferedTheme(selectedTheme);
    });


function savePreferedTheme(theme) {
    chrome.storage.local.set({ theme });
}

function applyTheme(theme) {
    const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDarkMode);
}


function loadThemePreference() {
    const themeSelector = document.getElementById("darkmode");
    chrome.storage.local.get("theme", function (result) {
        const savedTheme = result.theme || "system";
        themeSelector.value = savedTheme ? savedTheme : "system";
        applyTheme(savedTheme);
    });
}
