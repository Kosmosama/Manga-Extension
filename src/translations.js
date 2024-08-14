// Load the language preference from storage or navigator
function loadPreferredLanguage(translations) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['preferredLanguage'], function(result) {
            let lang = result.preferredLanguage || navigator.language.split('-')[0];
            if (!translations[lang]) {
                console.warn(`Language '${lang}' not found in translations, defaulting to 'en'.`);
                lang = 'en';
            }
            resolve(lang);
        });
    });
}

// Save the preferred language to storage
function savePreferredLanguage(language) {
    chrome.storage.local.set({ preferredLanguage: language });
}

// Translate elements on the page
function translatePage(language, translations) {
    document.querySelectorAll('[data-translate-key]').forEach(element => {
        const key = element.getAttribute('data-translate-key');
        
        if (translations[language] && translations[language][key]) {
            // Special case for 'chapters'
            if (key === 'chapters' && element.hasAttribute('data-read')) {
                const read = element.getAttribute('data-read');
                element.textContent = translations[language][key].replace('{read}', read);
            } else {
                element.textContent = translations[language][key];
            }
        } else if (translations['en'] && translations['en'][key]) {
            element.textContent = translations['en'][key];
        } else {
            console.warn(`Translation key '${key}' not found.`);
        }
    });
}

// Initialize translation and event listeners
function initializeTranslations(translations) {
    loadPreferredLanguage(translations).then((language) => {
        translatePage(language, translations);
        document.getElementById('languageSelect').value = language;
        document.getElementById('languageSelect').addEventListener('change', function() {
            const selectedLanguage = this.value;
            savePreferredLanguage(selectedLanguage);
            translatePage(selectedLanguage, translations);
        });
    });
}

// Fetch translations and initialize
fetch('translations.json')
    .then(response => response.json())
    .then(translations => initializeTranslations(translations))
    .catch(error => {
        console.error('Error loading translations:', error);
        // Fallback to English in case of error
        fetch('translations.json')
            .then(response => response.json())
            .then(translations => initializeTranslations(translations));
    });
