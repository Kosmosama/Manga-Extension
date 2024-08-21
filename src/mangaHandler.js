// Helper function to refresh and save mangas
function refreshAndSaveMangas() {
    cargarMangas(mangaList);
    saveMangas();
}

// Function to toggle favourite state for a certain manga
function handleFavoriteToggle(manga) {
    manga.favorite = !manga.favorite;
    refreshAndSaveMangas()
}

// Function to +1 a chapter to a certain manga
function handleAddChapter(manga) {
    manga.readChapters = (parseInt(manga.readChapters, 10) || 0) + 1;
    refreshAndSaveMangas()
}

// Functions to delete a certain manga with a confirmation dialog
function deleteManga(manga) {
    mangaList = mangaList.filter(m => m !== manga);
    refreshAndSaveMangas()
}

function handleMangaDeletion(manga) {
    const confirmDiv = document.getElementById('confirmationDialog');
    confirmDiv.style.display = 'flex';

    const closeDialog = () => confirmDiv.style.display = 'none';

    document.getElementById('cancelConfirm').addEventListener('click', closeDialog, { once: true });

    document.getElementById('confirm').addEventListener('click', () => {
        deleteManga(manga);
        closeDialog();
    }, { once: true });
}