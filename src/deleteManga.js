function handleMangaDelete(manga) {
    const confirmDiv = document.getElementById('confirmationDialog');
    confirmDiv.style.display = 'flex';

    const cancelConfirm = document.getElementById('cancelConfirm');
    const confirm = document.getElementById('confirm');

    cancelConfirm.onclick = function() {
        confirmDiv.style.display = 'none';
    };

    confirm.onclick = function() {
        eliminarManga(manga);
        confirmDiv.style.display = 'none';
    };
}

function eliminarManga(manga) {
    // Remove manga from mangaList
    mangaList = mangaList.filter(m => m !== manga);

    // Update the display
    cargarMangas(mangaList);

    // Save the updated mangaList
    saveMangas();
}