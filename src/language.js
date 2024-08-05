// Objeto con las traducciones
const translations = {
    es: {
        mangaLibrary: "Biblioteca de Manga",
        settings: "Configuración",
        language: "Idioma",
        search: "Buscar...",
        addManga: "Agregar Manga",
        edit: "Editar",
        deleteManga: "Eliminar Manga",
        cancel: "Cancelar",
        save: "Guardar",
        confirmDelete: "¿Estás seguro de que deseas eliminar este manga?",
        delete: "Eliminar",
        confirmation: "Confirmación",
        loadManga: "Cargar Manga",
        imageLabel: "Imagen (opcional, solo links de imgur)",
        titleLabel: "Título",
        chapters: "Capítulo {read}/{total}",
        readChaptersLabel: "Capítulos leídos",
        totalChaptersLabel: "Capítulos totales",
        favoritesFirst: "Favoritos primero",
        alphabetically: "Alfabéticamente",
        chapterCount: "Número de capítulos leídos",
        dateAdded: "Fecha de adición",
        lastRead: "Última lectura",
        ascending: "Ascendente",
        descending: "Descendente",
        settingsOption1: "No tengo idea de qué poner en configuración xd",
        settingsOption2: "Cosas",
        settingsOption3: "Feliz",
        settingsOption4: "Sexo",
        settingsOption4Yes: "Sí",
        settingsOption4YesPlease: "Sí, por favor"
    },
    en: {
        mangaLibrary: "Manga Library",
        settings: "Settings",
        language: "Language",
        search: "Search...",
        addManga: "Add Manga",
        edit: "Edit",
        deleteManga: "Delete Manga",
        cancel: "Cancel",
        save: "Save",
        confirmDelete: "Are you sure you want to delete this manga?",
        delete: "Delete",
        confirmation: "Confirmation",
        loadManga: "Load Manga",
        imageLabel: "Image (optional, only imgur links)",
        titleLabel: "Title",
        chapters: "Chapter {read}/{total}",
        readChaptersLabel: "Read Chapters",
        totalChaptersLabel: "Total Chapters",
        favoritesFirst: "Favorites First",
        alphabetically: "Alphabetically",
        chapterCount: "Number of Read Chapters",
        dateAdded: "Date Added",
        lastRead: "Last Read",
        ascending: "Ascending",
        descending: "Descending",
        settingsOption1: "I have no idea what to put in settings lol",
        settingsOption2: "Things",
        settingsOption3: "Happy",
        settingsOption4: "Sex",
        settingsOption4Yes: "Yes",
        settingsOption4YesPlease: "Yes, please"
    }
};

// Función para cambiar el idioma
function changeLanguage(lang) {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translations[lang][key];
            } else if (key === 'chapters') {
                // Obtén los valores actuales de readChapters y totalChapters
                const read = element.getAttribute('data-read');
                const total = element.getAttribute('data-total');
                // Reemplaza los marcadores de posición en la cadena traducida
                element.textContent = translations[lang][key]
                    .replace('{read}', read)
                    .replace('{total}', total);
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });

    // Cambiar el placeholder del campo de búsqueda
    const searchBar = document.getElementById('searchBar');
    if (searchBar) {
        searchBar.placeholder = translations[lang].search;
    }

    // Actualizar las opciones de los selectores
    updateSelectOptions('sortOption', lang);
    updateSelectOptions('sortOrder', lang);

    // Actualizar los botones de editar y eliminar en cada manga
    document.querySelectorAll('button[id="edit"]').forEach(button => {
        button.textContent = translations[lang].edit;
    });
    document.querySelectorAll('button[id="delete"]').forEach(button => {
        button.textContent = translations[lang].delete;
    });

    // Guardar la preferencia de idioma
    chrome.storage.local.set({ language: lang }, function() {
        console.log('Language preference saved.');
    });

    // Actualizar la variable global del idioma actual
    currentLanguage = lang;
}

// Función para actualizar las opciones de los selectores
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

// Función para actualizar las opciones de los selectores
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

// Evento para cambiar el idioma cuando se selecciona una opción
document.getElementById('languageSelect').addEventListener('change', function() {
    changeLanguage(this.value);
});

// Cargar la preferencia de idioma al iniciar
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get('language', function(result) {
        const savedLanguage = result.language || 'es';
        document.getElementById('languageSelect').value = savedLanguage;
        changeLanguage(savedLanguage);
    });
});