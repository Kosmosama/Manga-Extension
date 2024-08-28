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
    // Use the same form used for adding a new manga
    const formContainer = document.getElementById('formContainer');

    // Fill the form with the existing manga data
    document.getElementById('image').value = manga.image || '';
    document.getElementById('title').value = manga.title || '';
    document.getElementById('link').value = manga.link || '';
    document.getElementById('readChapters').value = manga.readChapters || 0;
    document.getElementById('favorite').checked = manga.favorite || false;

    // Show the form
    formContainer.classList.remove('translate-x-full');
    formContainer.classList.add('translate-x-0');

    // Replace the form submission behavior with update logic
    const form = document.getElementById('chapterForm');
    
    function updateMangaDetails(event) {
        event.preventDefault();

        const title = document.getElementById('title').value.trim();
        const link = document.getElementById('link').value.trim();
        const image = document.getElementById('image').value.trim();
        const readChapters = parseInt(document.getElementById('readChapters').value.trim(), 10);
        const favorite = document.getElementById('favorite').checked;

        // Data verification
        if (manga.title !== title && isNameUsed(title)) {
            showModal(translate('uniqueTitlesWarning'));
            return;
        }
        if (!title || !link || isNaN(readChapters) || readChapters < 0) {
            showModal(translate('required'));
            return;
        }

        // Update the manga details
        manga.title = title;
        manga.link = link;
        manga.image = image;
        manga.readChapters = readChapters;
        manga.favorite = favorite;
        manga.lastRead = new Date().toISOString();

        // Save and refresh the manga list
        refreshAndSaveMangas();
        resetFormValues(); // Clear the form for future use
        hideAddForm();     // Hide the form after saving
    }

    // Remove any previous submit handlers and add the update handler
    form.removeEventListener('submit', addNewManga);
    form.addEventListener('submit', updateMangaDetails, { once: true });

    // Replace the cancel button behavior to reset the form and hide it
    document.getElementById('cancelButton').removeEventListener('click', resetAddForm);
    document.getElementById('cancelButton').addEventListener('click', function() {
        resetFormValues();
        hideAddForm();
        form.removeEventListener('submit', updateMangaDetails); // Clean up event listener
        form.addEventListener('submit', addNewManga); // Re-add add manga handler
    }, { once: true });
}
