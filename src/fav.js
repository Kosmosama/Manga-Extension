let favorite = false;

function updateFavoriteUI(favo, isFavorite) {
    const parentDiv = favo.parentElement;
    if (isFavorite) {
        parentDiv.classList.remove('group-hover:flex', 'hidden');
        parentDiv.classList.add('flex');
    } else {
        parentDiv.classList.add('group-hover:flex', 'hidden');
        parentDiv.classList.remove('flex');
    }
}

function changeFavorite(favo, manga) {
    const isFavorite = !manga.favorite;
    manga.favorite = isFavorite;

    updateFavoriteUI(favo, isFavorite);

    saveMangas();
   
}