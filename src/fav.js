let favorite = false;
let listenersAdded = false;
let favObserver;

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

    if (mangaList[index]) {
        const isFavorite = !mangaList[index].favorite;
        mangaList[index].favorite = isFavorite;

        updateFavoriteUI(favo, isFavorite);

        // Guarda mangaList después de modificarlo
        saveMangas();
    } else {
        console.log(`No manga found at index ${index}`);
    }
}

function addClickEventToFavElements() {
    const favSpans = document.querySelectorAll('span#fav');

    favSpans.forEach(favo => {
        if (!favo.hasAttribute('data-clicked')) { // Verifica si ya se ha agregado el evento
            favo.addEventListener('click', function() {
                favorite = true;
                changeFavorite(this);
            });
            favo.setAttribute('data-clicked', 'true'); // Marca el elemento como procesado
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (!listenersAdded) {
        addClickEventToFavElements();
        listenersAdded = true;

        // Configura el MutationObserver solo después de añadir los eventos de clic
        favObserver = new MutationObserver(function(mutationsList, observer) {
            addClickEventToFavElements();
        });

        favObserver.observe(document.body, { childList: true, subtree: true });
    }
});
