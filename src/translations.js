/**
 * Translates a given key based on the current language setting.
 * 
 * @param {string} key - The key to translate.
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
 * Translates all elements on the page that have a 'data-translate-key' attribute.
 * Replaces the text content of each element with the corresponding translation.
 */
function translatePage() {
    document.querySelectorAll('[data-translate-key]').forEach(element => {
        const key = element.getAttribute('data-translate-key');
        const translatedText = translate(key);
        element.textContent = translatedText;
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
        // Store the language in a global variable for use in other functions
        window.language = language;
        window.translations = translations;

        // Translate the page content based on the selected language
        translatePage();

        // Set up the language selector dropdown
        //#INFO Might want this in the settings script
        document.getElementById('languageSelect').value = language;
        document.getElementById('languageSelect').addEventListener('change', function () {
            const selectedLanguage = this.value;
            savePreferredLanguage(selectedLanguage);
            window.language = selectedLanguage; // Update the global variable
            translatePage();
            loadFilteredMangas(); // Reload the translated manga cards
        });

        // Load the translated manga cards
        loadFilteredMangas(); // Assumes `mangaList` is already available
    });
}

// Default translations object to use in case of a loading error
const defaultTranslations = {
    en: {} //#TODO Default key-value pairs can be defined here
};

// Fetch translations from a JSON file and initialize the translation system
fetch('translations.json')
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