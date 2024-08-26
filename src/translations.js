// Translate a certain key
function translate(key) {
    return (window.translations[window.language] && window.translations[window.language][key]) || 'TRANSLATE-ERROR';
}

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
function translatePage() {
    document.querySelectorAll('[data-translate-key]').forEach(element => {
        const key = element.getAttribute('data-translate-key');
        const translatedText = translate(key);
        
        element.textContent = translatedText;
    });
}

// Initialize translation and event listeners
function initializeTranslations(translations) {
    loadPreferredLanguage(translations).then((language) => {
        // Guardar el idioma en una variable global para usarlo en otras funciones
        window.language = language;
        window.translations = translations;
        
        translatePage();

        // Configurar el selector de idioma
        document.getElementById('languageSelect').value = language;
        document.getElementById('languageSelect').addEventListener('change', function() {
            const selectedLanguage = this.value;
            savePreferredLanguage(selectedLanguage);
            window.language = selectedLanguage; // Actualizar la variable global
            translatePage();
            loadFilteredMangas();
        });

        // Cargar las tarjetas de mangas traducidas
        loadFilteredMangas(); // Supongo que mangaList ya está disponible
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
