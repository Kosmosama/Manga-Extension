var mangaList = []; // Global variable for mangas

// Load mangas from storage.local
function loadMangas() {
    chrome.storage.local.get('mangas', function(result) {
        if (chrome.runtime.lastError) {
            console.error('Error loading mangas:', chrome.runtime.lastError);
            return;
        }
        if (result.mangas && result.mangas.length > 0) {
            mangaList = result.mangas;
            console.log(`Loaded ${result.mangas.length} mangas:`, mangaList);
        } else {
            console.log('No mangas found in storage.');
        }
        // #LOADCONTENT actualizarLista();
    });
}

// Save mangas to storage.local
function saveMangas() {
    chrome.storage.local.set({ 'mangas': mangaList }, function() {
        if (chrome.runtime.lastError) {
            console.error('Error saving mangas:', chrome.runtime.lastError);
            return;
        }
        console.log('Mangas saved to storage.');
    });
}

document.addEventListener("DOMContentLoaded", loadMangas);
window.addEventListener("beforeunload", saveMangas);
