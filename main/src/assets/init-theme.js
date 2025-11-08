(function applyInitialTheme() {
    try {
        const raw = localStorage.getItem("theme");
        const theme = raw ? JSON.parse(raw) : "system";
        let isDark = false;

        if (theme === "dark") {
            isDark = true;
        } else if (theme === "light") {
            isDark = false;
        } else {
            isDark =
                window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: dark)").matches;
        }

        document.documentElement.setAttribute(
            "data-theme",
            isDark ? "dark" : "light"
        );
    } catch (e) {
        const sysDark =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.setAttribute(
            "data-theme",
            sysDark ? "dark" : "light"
        );
    }
})();
