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

/**
 * Updates the number of read chapters for a given manga based on the specified operation.
 * 
 * @param {Object} manga - The manga object to be updated.
 * @param {string} operation - The operation to perform: '+' to add chapters or '-' to remove chapters.
 * @param {number} [amount=1] - The number of chapters to add or remove. Defaults to 1 if not provided or if the provided value is not a number.
 * 
 * @throws {Error} Throws an error if the operation parameter is not '+' or '-'.
 */
function handleChapterUpdate(manga, operation, amount = 1) {
    amount = parseInt(amount, 10) || 1;

    // Update readChapters based on operation type
    if (operation === "+") {
        manga.readChapters = (parseInt(manga.readChapters, 10) || 0) + amount;
    } else if (operation === "-") {
        manga.readChapters = (parseInt(manga.readChapters, 10) || 0) - amount;
    } else {
        throw new Error("Invalid operation. Use '+' or '-'.");
    }

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
    // Fill the form with the existing manga data
    document.getElementById('image').value = manga.image || '';
    document.getElementById('title').value = manga.title || '';
    document.getElementById('link').value = manga.link || '';
    document.getElementById('readChapters').value = manga.readChapters || 0;
    document.getElementById('favorite').checked = manga.favorite || false;

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
            handleMangaEdition(manga);
        }
        else if (!title || !link || isNaN(readChapters) || readChapters < 0) {
            showModal(translate('required'));
            handleMangaEdition(manga);
        }
        else {
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

            // Re-add the submit listener for adding a new manga
            addSubmitListener();
        }
    }

    // Show the form
    showAddForm();

    // Replace the form submission behavior with update logic
    const form = document.getElementById('chapterForm');

    // Remove any previous submit handlers to avoid conflicts
    form.removeEventListener('submit', addNewManga);
    form.removeEventListener('submit', updateMangaDetails);

    // Add the update manga details handler
    form.addEventListener('submit', updateMangaDetails, { once: true });

    // Replace the cancel button behavior to reset the form and hide it
    const cancelButton = document.getElementById('cancelButton');
    cancelButton.removeEventListener('click', resetAddForm);
    cancelButton.addEventListener('click', function() {
        resetFormValues();
        hideAddForm();
        form.removeEventListener('submit', updateMangaDetails); // Remove the update listener
        addSubmitListener(); // Re-add add manga handler
    }, { once: true });
}
