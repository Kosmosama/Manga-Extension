let translations = {};
let currentLanguage = 'es';

function loadTranslations() {
    return fetch('translations.json')
        .then(response => response.json())
        .then(data => {
          translations = data;
        })
        .catch(error => {
            console.error('Error loading translations:', error);
        });
}

function changeLanguage(lang) {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translations[lang][key];
            } else if (key === 'chapters') {
                const read = element.getAttribute('data-read');
                element.textContent = translations[lang][key]
                    .replace('{read}', read)
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });

    const searchBar = document.getElementById('searchBar');
    if (searchBar) {
        searchBar.placeholder = translations[lang].search;
    }

    updateSelectOptions('sortOption', lang);
    updateSelectOptions('sortOrder', lang);

    document.querySelectorAll('button[id="edit"]').forEach(button => {
        button.textContent = translations[lang].edit;
    });
    document.querySelectorAll('button[id="delete"]').forEach(button => {
        button.textContent = translations[lang].delete;
    });

    chrome.storage.local.set({ language: lang }, function() {
        console.log('Language preference saved.');
    });

    currentLanguage = lang;
}

function updateSelectOptions(selectId, lang) {
    const select = document.getElementById(selectId);
    if (select) {
        Array.from(select.options).forEach(option => {
            const key = option.getAttribute('data-translate');
            if (key && translations[lang][key]) {
                option.text = translations[lang][key];
            }
        });
    }
}

document.getElementById('languageSelect').addEventListener('change', function() {
    changeLanguage(this.value);
});

document.addEventListener('DOMContentLoaded', function() {
    loadTranslations().then(() => {
        chrome.storage.local.get('language', function(result) {
            const savedLanguage = result.language || 'es';
            document.getElementById('languageSelect').value = savedLanguage;
            changeLanguage(savedLanguage);
        });
    });
});
