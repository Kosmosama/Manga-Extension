// Default translations object to use in case of a loading error
const defaultTranslations = {
    "en": {
        "extension-title": "Manga Library",
        "filters-title": "Filters",
        "add-manga-button": "Add Manga",
        "settings-title": "Settings",
        "language-select-box-title": "Language Select",
        "theme-select-box-title": "Theme",
        "theme-select-option-light": "Light",
        "theme-select-option-dark": "Dark",
        "theme-select-option-system": "System",
        "import-export-box-title": "Import/Export",
        "upload-file-option": "Upload File",
        "export-library-option": "Export Manga Library",
        "import-bookmarks-option": "Import from bookmarks",
        "load-manga-title": "Load Manga",
        "image-field-label": "Image link (optional)",
        "title-field-label": "Title",
        "link-field-label": "Link",
        "read-chapters-field-label": "Chapters read",
        "favorite-checkbox-label": "Mark as favorite",
        "cancel-button": "Cancel",
        "save-button": "Save",
        "delete-button": "Delete",
        "import-selected-button": "Import Selected",
        "filter-method-box-title": "Sorting method",
        "favorites-first-option": "Favorites first",
        "alphabetically-option": "Alphabetically",
        "read-chapters-option": "Number of chapters read",
        "addition-date-option": "Addition date",
        "last-read-option": "Last read",
        "favorites-only-checkbox": "Show only favorites",
        "current-page-only-checkbox": "Show only current page mangas",
        "chapter-range-box-title": "Chapter Range",
        "minimum-chapters-range": "Minimum chapters",
        "maximum-chapters-range": "Maximum chapters",
        "other-options-box-title": "Other options",
        "random-manga-option": "Get Random Manga",
        "import-bookmarks-title": "Import bookmarks",
        "confirm-delete-warning": "Are you sure you want to delete it?",
        "modal-no-bookmarks-found": "No bookmarks found in chrome bookmark tree.",
        "modal-no-selected-bookmarks": "No bookmarks selected.",
        "modal-title-required": "The title field is required.",
        "modal-unique-title-required": "All titles must be unique.",
        "modal-invalid-file-type": "Invalid file type. Please upload a valid json file.",
        "modal-invalid-file": "Invalid file. Please upload a valid file.",
        "modal-parsing-error": "An error occurred while parsing the file. Please check the file and try again.",
        "import-from-json-subtitle": "Import from JSON",
        "placeholder-search-bar": "Search manga...",
        "placeholder-image-url": "Provide the image URL. (optional)",
        "placeholder-manga-title": "Must be unique. Leave in blank to use current page title.",
        "placeholder-manga-link": "Leave in blank to use the current page URL",
        "modal-not-all-mangas-valid": "Some manga entries in the JSON were invalid and were not added."
    }
};

// Fetch translations from a JSON file and initialize the translation system
fetch('data/translations.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(translations => initializeTranslations(translations))
    .catch(error => {
        console.error('Error loading translations:', error);
        // Use default translations in case of an error
        initializeTranslations(defaultTranslations);
    });

/**
 * Translates a given key based on the current language setting.
 * 
 * @param {string} key - The key to translate.
 * 
 * @returns {string} - The translated string, or the key itself if no translation is found.
 */
function translate(key) {
    const translation = window.translations[window.language] && window.translations[window.language][key];
    if (!translation) {
        console.error(`Translation key '${key}' not found for language '${window.language}'`);
        return key; // Fallback to the key itself
    }
    return translation;
}

/**
 * Loads the preferred language from local storage or browser settings.
 * If the language is not found in the provided translations, defaults to 'en'.
 * 
 * @param {Object} translations - The object containing translations for various languages.
 * 
 * @returns {Promise<string>} - A promise that resolves to the preferred language code.
 */
function loadPreferredLanguage(translations) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['preferredLanguage'], function (result) {
            let lang = result.preferredLanguage || navigator.language.split('-')[0];
            if (!translations[lang]) {
                console.warn(`Language '${lang}' not found in translations, defaulting to 'en'.`);
                lang = 'en';
            }
            resolve(lang);
        });
    });
}

/**
 * Saves the preferred language to local storage.
 * 
 * @param {string} language - The language code to save.
 */
function savePreferredLanguage(language) {
    chrome.storage.local.set({ preferredLanguage: language });
}

/**
 * Translates elements with a 'data-translate-key' attribute.
 * If it has a placeholder attribute, it translates that instead of the textContent.
 */
function translatePage() {
    document.querySelectorAll('[data-translate-key]').forEach(element => {
        const key = element.getAttribute('data-translate-key');
        const translatedText = translate(key);

        if (element.hasAttribute('placeholder')) {
            element.setAttribute('placeholder', translatedText);
        } else {
            element.textContent = translatedText;
        }
    });
}

/**
 * Initializes the translation functionality and sets up event listeners.
 * 
 * - Loads the preferred language.
 * - Sets up the global language and translations.
 * - Translates the page content based on the preferred language.
 * - Sets up a language selector to allow users to change languages.
 * 
 * @param {Object} translations - The object containing translations for various languages.
 */
function initializeTranslations(translations) {
    loadPreferredLanguage(translations).then((language) => {
        window.language = language;
        window.translations = translations;

        translatePage();

        document.getElementById('languageSelect').value = language;
        document.getElementById('languageSelect').addEventListener('change', function () {
            const selectedLanguage = this.value;
            savePreferredLanguage(selectedLanguage);
            window.language = selectedLanguage;
            translatePage();
            loadFilteredMangas();
        });

        loadFilteredMangas();
    });
}
