// Handles form submission for both adding and editing manga.
document.getElementById('chapterForm').addEventListener('submit', handleFormSubmission);

/**
 * Handles the form submission by either adding a new manga or updating an existing one.
 * 
 * @param {Event} event - The form submission event.
 */
function handleFormSubmission(event) {
    event.preventDefault();

    const form = document.getElementById('chapterForm');
    const isEditMode = !!form.dataset.editMode;
    const mangaTitle = form.dataset.mangaTitle;

    if (isEditMode && mangaTitle) {
        const manga = mangaList.find(m => m.title === mangaTitle);
        updateMangaDetails(manga);
    } else {
        addNewManga();
    }
}

/**
 * Fills the manga form with the details of the manga to be edited.
 * 
 * @param {Object} manga - The manga object to be edited.
 */
function handleMangaEdition(manga) {
    fillMangaForm(manga);

    const form = document.getElementById('chapterForm');
    form.dataset.editMode = 'true';
    form.dataset.mangaTitle = manga.title;

    showMangaForm();
}

/**
 * Adds a new manga to the manga list.
 */
function addNewManga() {
    const mangaData = getMangaFormData();
    const validationError = validateMangaData(mangaData);

    if (validationError) {
        showModal(validationError);
        return;
    }

    const date = new Date().toISOString();
    const newManga = {
        ...mangaData,
        dayAdded: date,
        lastRead: date
    };

    mangaList.push(newManga);

    resetFormValues();
    hideMangaForm();
    refreshAndSaveMangas();
}

/**
 * Updates the details of an existing manga.
 * 
 * @param {Object} manga - The manga object to be updated.
 */
function updateMangaDetails(manga) {
    const mangaData = getMangaFormData();
    const validationError = validateMangaData(mangaData, manga.title);

    if (validationError) {
        showModal(validationError);
        return;
    }

    Object.assign(manga, mangaData, { lastRead: new Date().toISOString() });

    resetFormValues();
    hideMangaForm();
    refreshAndSaveMangas();
}

/**
 * Retrieves the manga data from the form.
 * 
 * @returns {Object} An object containing the manga data from the form.
 */
function getMangaFormData() {
    return {
        image: document.getElementById('image').value.trim(),
        title: document.getElementById('title').value.trim(),
        link: document.getElementById('link').value.trim(),
        readChapters: parseInt(document.getElementById('readChapters').value.trim(), 10),
        favorite: document.getElementById('favorite').checked
    };
}

/**
 * Validates the manga data.
 * 
 * @param {Object} mangaData - The manga data to be validated.
 * @param {string} [originalTitle=''] - The original title of the manga (used for edit mode).
 * @returns {string|null} Validation error message or null if data is valid.
 */
function validateMangaData(mangaData, originalTitle = '') {
    if (mangaData.title !== originalTitle && isNameUsed(mangaData.title)) {
        return translate('uniqueTitlesWarning');
    }
    if (!mangaData.title || !mangaData.link || isNaN(mangaData.readChapters) || mangaData.readChapters < 0) {
        return translate('required');
    }
    return null;
}

/**
 * Fills the form with the data of the manga to be edited.
 * 
 * @param {Object} manga - The manga object to fill the form with.
 */
function fillMangaForm(manga) {
    document.getElementById('image').value = manga.image || '';
    document.getElementById('title').value = manga.title || '';
    document.getElementById('link').value = manga.link || '';
    document.getElementById('readChapters').value = manga.readChapters || 0;
    document.getElementById('favorite').checked = manga.favorite || false;
}

/**
 * Resets the form values to their default state.
 */
function resetFormValues() {
    const form = document.getElementById('chapterForm');
    form.reset();
    delete form.dataset.editMode;
    delete form.dataset.mangaTitle;
}

/**
 * Helper function to refresh the manga list and save the current state.
 */
function refreshAndSaveMangas() {
    loadFilteredMangas();
    saveMangas();
}

/**
 * Checks if a manga title is already used in the manga list.
 * 
 * @param {string} title - The manga title to check.
 * @returns {boolean} True if the title is already used, false otherwise.
 */
function isNameUsed(title) {
    return mangaList.some(manga => manga.title === title);
}

/**
 * Displays a modal with a given message.
 * 
 * @param {string} message - The message to display in the modal.
 */
function showModal(message) {
    const modal = document.getElementById('alertModal');
    modal.querySelector('.modal-body').textContent = message;
    modal.style.display = 'block';

    document.getElementById('closeModal').addEventListener('click', function () {
        modal.style.display = 'none';
    });
}

/**
 * Toggles the favorite status of a manga.
 * 
 * @param {Object} manga - The manga object to toggle favorite status for.
 */
function handleFavoriteToggle(manga) {
    manga.favorite = !manga.favorite;
    refreshAndSaveMangas();
}

/**
 * Updates the number of read chapters for a manga.
 * 
 * @param {Object} manga - The manga object to update.
 * @param {string} operation - The operation to perform ('+' to add, '-' to subtract).
 * @param {number} [amount=1] - The number of chapters to add or subtract.
 * @throws {Error} If the operation is not '+' or '-'.
 */
function handleChapterUpdate(manga, operation, amount = 1) {
    amount = parseInt(amount, 10) || 1;

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

/**
 * Handles the deletion of a manga after a confirmation dialog.
 * 
 * @param {Object} manga - The manga object to delete.
 */
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

/**
 * Deletes a manga from the manga list.
 * 
 * @param {Object} manga - The manga object to delete.
 */
function deleteManga(manga) {
    mangaList = mangaList.filter(m => m !== manga);
    refreshAndSaveMangas();
}
