let translations = {};

// Fetch translations from JSON file
fetch('translations.json')
    .then(response => response.json())
    .then(data => {
        translations = data;
        // Get the user's preferred language from localStorage or default to browser settings
        let userLang = localStorage.getItem('preferredLanguage') || navigator.language.slice(0, 2) || 'en';
        
        // Check if the detected language exists in translations, otherwise default to 'en'
        if (!translations[userLang]) {
            userLang = 'en';
        }

        // Set the default language based on user's preference
        changeLanguage(userLang);
        
        // Set the dropdown value to the user's preferred language
        document.getElementById('language-select').value = userLang;
    })
    .catch(error => console.error('Error loading translations:', error));

// Function to change language
function changeLanguage(lang) {
    document.querySelectorAll('[data-translate-key]').forEach(elem => {
        const key = elem.getAttribute('data-translate-key');
        elem.textContent = translations[lang][key];
    });

    // Save the preferred language in localStorage
    localStorage.setItem('preferredLanguage', lang);
}

// Event listener for language change
document.getElementById('language-select').addEventListener('change', (event) => {
    const selectedLang = event.target.value;
    changeLanguage(selectedLang);
});