// Helper function to refresh and save mangas
function refreshAndSaveMangas() {
    loadFilteredMangas();
    saveMangas();
}

// Helper function to check if a name already exists
function isNameUsed(title){
    return mangaList.some(manga => manga.title === title) ? true : false;
}

// Helper function to create a modal with a message
function showModal(message) {
    const modal = document.getElementById('alertModal');
    modal.querySelector('.modal-body').textContent = message;
    modal.style.display = 'block';

    document.getElementById('closeModal').addEventListener('click', function() {
        modal.style.display = 'none';
    });
}

// Function to toggle favourite state for a certain manga
function handleFavoriteToggle(manga) {
    manga.favorite = !manga.favorite;
    refreshAndSaveMangas();
}

// Function to +1 a chapter to a certain manga
function handleAddChapter(manga) {
    manga.readChapters = (parseInt(manga.readChapters, 10) || 0) + 1;
    manga.lastRead = new Date().toISOString();
    refreshAndSaveMangas();
}
function handleRemoveCap(manga) {
    manga.readChapters = (parseInt(manga.readChapters, 10) || 0) - 1;
    manga.lastRead = new Date().toISOString();
    refreshAndSaveMangas();
}

// Function to delete a certain manga with a confirmation dialog
function handleMangaDeletion(manga) {
    const confirmDiv = document.getElementById('confirmationDialog');
    confirmDiv.style.display = 'flex';

    function closeDialog() {
        confirmDiv.style.display = 'none';
    }

    function deleteManga() {
        mangaList = mangaList.filter(m => m !== manga);
        refreshAndSaveMangas();
    }

    document.getElementById('cancelConfirm').addEventListener('click', closeDialog, { once: true });
    document.getElementById('cancelConfirm2').addEventListener('click', closeDialog, { once: true });

    document.getElementById('confirm').addEventListener('click', () => {
        deleteManga();
        closeDialog();
    }, { once: true });
}

function deleteManga(manga) {
    mangaList = mangaList.filter(m => m !== manga);
    refreshAndSaveMangas()
}

// Function to edit a certain manga
function handleMangaEdition(manga) {
    fillEditForm(manga);

    const formContainer = document.getElementById('editFormContainer');
    formContainer.style.display = 'flex';

    function fillEditForm(manga) {
        document.getElementById('editTitle').value = manga.title || '';
        document.getElementById('editLink').value = manga.link || '';
        document.getElementById('editImage').value = manga.image || ''; 
        document.getElementById('editReadChapters').value = manga.readChapters || 0;
        document.getElementById('editFavorite').checked = manga.favorite || false;
    }

    function resetEditForm() {
        formContainer.style.display = 'none';
    }

    function updateMangaDetails() {

        const title = document.getElementById('editTitle').value.trim();
        const link = document.getElementById('editLink').value.trim();
        const image = document.getElementById('editImage').value.trim();
        const readChapters = parseInt(document.getElementById('editReadChapters').value.trim(), 10);
        const favorite = document.getElementById('editFavorite').checked;

        // Data verification
        if (manga.title !== title && isNameUsed(title)) {
            showModal(translate('uniqueTitlesWarning'));
            return;
        }
        if (!title || !link || isNaN(readChapters) || readChapters < 0) {
            showModal(translate('required'));
            return;
        }

        manga.title = title;
        manga.link = link;
        manga.image = image;
        manga.readChapters = readChapters;
        manga.favorite = favorite;
        manga.dayAdded = manga.dayAdded;
        manga.lastRead = new Date().toISOString();

        refreshAndSaveMangas();
        resetEditForm();
    }

    document.getElementById('editForm').addEventListener('submit', function(event) {
        event.preventDefault();
        updateMangaDetails();
    }, { once: true });

    document.getElementById('cancelEdit').addEventListener('click', resetEditForm, { once: true });
}