let favorite = false;
function addClickEventToFavElements() {
    const favSpans = document.querySelectorAll('span#fav');
    favSpans.forEach(favo => {
        favo.addEventListener('click', function() {
            favorite = true;
            changeFavorite(favo);
        });
    });
}
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM completamente cargado y analizado');
    
   

    addClickEventToFavElements();

    const favObserver = new MutationObserver(function(mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                addClickEventToFavElements();
            }
        }
    });

    favObserver.observe(document.body, { childList: true, subtree: true });
});

function changeFavorite(favo) {
    const parentDiv = favo.parentElement;
    const index = favo.getAttribute('data-index');

    chrome.storage.local.get('mangaList', function(result) {
        const mangaList = result.mangaList || [];

        if (mangaList[index]) {
            if (parentDiv.classList.contains('group-hover:flex')) {
                parentDiv.classList.remove('group-hover:flex');
                parentDiv.classList.remove('hidden');
                parentDiv.classList.add('flex');
                mangaList[index].favorite = true;
            } else {
                parentDiv.classList.remove('flex');
                parentDiv.classList.add('group-hover:flex');
                parentDiv.classList.add('hidden');
                mangaList[index].favorite = false;
            }

            chrome.storage.local.set({ mangaList: mangaList }, function() {
                console.log('Manga list updated and saved to local storage.');
            });
        } else {
            console.error(`No manga found at index ${index}`);
        }
    });
}
