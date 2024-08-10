let favorite = false;
let listenersAdded = false;

function updateFavoriteUI(favo, isFavorite) {
    const parentDiv = favo.parentElement;
    if (isFavorite) {
        parentDiv.classList.remove('group-hover:flex');
        parentDiv.classList.remove('hidden');
        parentDiv.classList.add('flex');
    } else {
        parentDiv.classList.add('group-hover:flex');
        parentDiv.classList.add('hidden');
        parentDiv.classList.remove('flex');
    }
}

function changeFavorite(favo) {
    const index = favo.getAttribute('data-index');

    chrome.storage.local.get('mangaList', function(result) {
        const mangaList = result.mangaList || [];
        if (mangaList[index]) {
            const isFavorite = !mangaList[index].favorite;
            mangaList[index].favorite = isFavorite;

            updateFavoriteUI(favo, isFavorite);
            
            saveManga();
        }
    });
}

function addClickEventToFavElements() {
    const favSpans = document.querySelectorAll('span#fav');
    favSpans.forEach(favo => {
        favo.addEventListener('click', function() {
            favorite = true;
            changeFavorite(this);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (!listenersAdded) {
        addClickEventToFavElements();
        listenersAdded = true;
    }

    const favObserver = new MutationObserver(function(mutationsList, observer) {
        addClickEventToFavElements();
    });

    favObserver.observe(document.body, { childList: true, subtree: true });
});
