(function applyInitialTheme() {
    try {
        const raw = localStorage.getItem('app.settings');
        let themeMode = 'system';
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed.themeMode === 'string') {
                themeMode = parsed.themeMode;
            }
        }

        let isDark = false;
        if (themeMode === 'dark') {
            isDark = true;
        } else if (themeMode === 'light') {
            isDark = false;
        } else {
            isDark =
                window.matchMedia &&
                window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        const effective = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', effective);
        document.documentElement.classList.remove('theme-light', 'theme-dark');
        document.documentElement.classList.add(isDark ? 'theme-dark' : 'theme-light');
    } catch (e) {
        const sysDark =
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', sysDark ? 'dark' : 'light');
        document.documentElement.classList.remove('theme-light', 'theme-dark');
        document.documentElement.classList.add(sysDark ? 'theme-dark' : 'theme-light');
    }
})();
