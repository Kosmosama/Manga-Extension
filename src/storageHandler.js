var mangaList = []; // Variable global para la lista de mangas

// Load mangas from storage.local
function loadMangas() {
    chrome.storage.local.get('mangaList', function(result) {
        if (chrome.runtime.lastError) {
            console.error('Error loading mangas:', chrome.runtime.lastError);
            return;
        }
        if (result.mangaList.length > 0) {
            mangaList = result.mangaList;
            console.log(`Loaded ${result.mangaList.length} mangas:`, mangaList);
        } else {
            console.log('No mangas found in storage.');
        }
    });
}

// Save mangas to storage.local
function saveMangas() {
    chrome.storage.local.set({ mangaList: mangaList }, function() {
        if (chrome.runtime.lastError) {
            console.error('Error saving mangas:', chrome.runtime.lastError);
            return;
        }
        console.log('Mangas saved to storage.');
    });
}


document.addEventListener("DOMContentLoaded", loadMangas);
