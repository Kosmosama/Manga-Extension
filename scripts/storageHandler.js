let mangaList = []; // Global var for manga list

// Attach event listener for DOMContentLoaded to retrieve manga list from Chrome's local storage when the page loads
document.addEventListener("DOMContentLoaded", ()=>{
    retrieveMangas();
    allImagesWorking();

});

/**
 * Retrieves the manga list from Chrome's local storage and populates
 * the global `mangaList` variable.
 */
function retrieveMangas() {
    chrome.storage.local.get('mangaList', function (result) {
        if (chrome.runtime.lastError) {
            console.error('Error loading mangas:', chrome.runtime.lastError);
            return;
        }
        if (Array.isArray(result.mangaList) && result.mangaList.length > 0) {
            mangaList = result.mangaList;
        } else {
            console.log('No mangas found in storage.');
        }
    });
}

function allImagesWorking(){
    mangaList.forEach(manga => {
        manga.isImageWorking = true;
    });
}

/**
 * Saves the current manga list to Chrome's local storage.
 */
function saveMangas() {
    chrome.storage.local.set({ mangaList: mangaList }, function () {
        if (chrome.runtime.lastError) {
            console.error('Error saving mangas:', chrome.runtime.lastError);
            return;
        }
    });
}
