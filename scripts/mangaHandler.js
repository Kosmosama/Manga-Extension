// Attach event listener for the form submission button in the manga addition/edition form
document.getElementById('chapterForm').addEventListener('submit', handleFormSubmission);

/**
 * Handles form submission to either add a new manga or update an existing one.
 * Processes any remaining bookmarks that have to be converted into mangas.
 * 
 * @param {Event} event - The form submission event. Prevents the default behavior and processes form data.
 * 
 * @throws {Error} Logs errors to the console if async operations fail.
 */
async function handleFormSubmission(event) {
    event.preventDefault();

    const form = document.getElementById('chapterForm');
    const isEditMode = !!form.dataset.editMode;
    const mangaTitle = form.dataset.mangaTitle;

    try {
        if (isEditMode && mangaTitle) {
            const manga = mangaList.find(m => m.title === mangaTitle);
            if (manga) {
                await updateMangaDetails(manga);
            } else {
                console.error('Manga not found for editing');
            }
        } else {
            await addNewManga();
            processRemainingBookmarks();
        }
    } catch (error) {
        console.error('An error occurred during form submission:', error);
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
async function addNewManga() {
    const mangaData = await getMangaFormData();
    const validationError = validateMangaData(mangaData);

    if (validationError) {
        showModal(validationError);
        return;
    }

    const date = new Date().toLocaleString();
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
async function updateMangaDetails(manga) {
    const mangaData = await getMangaFormData();
    const validationError = validateMangaData(mangaData, manga.title);

    if (validationError) {
        showModal(validationError);
        return;
    }

    Object.assign(manga, mangaData, { lastRead: new Date().toLocaleString() });

    resetFormValues();
    hideMangaForm();
    refreshAndSaveMangas();
}

/**
 * Fetches the URL of the current active tab.
 * 
 * @returns {Promise<string>} A promise that resolves to the current tab's URL.
 */
function getCurrentTabURL() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0 && tabs[0].url) {
                let currentUrl = new URL(tabs[0].url);
                resolve(currentUrl.href);
            } else {
                console.warn('No active tab found. Defaulting link to empty string.');
                resolve('');
            }
        });
    });
}

/**
 * Retrieves the manga data from the form.
 * 
 * @param {boolean} [isEditMode=false] - Indicates whether the form is in edit mode.
 * @returns {Promise<Object>} A promise that resolves to an object containing the manga data from the form.
 */
async function getMangaFormData() {
    const linkInput = document.getElementById('link').value.trim();
    const link = linkInput || await getCurrentTabURL();

    const readChaptersInput = document.getElementById('readChapters').value.trim();
    const readChapters = parseInt(readChaptersInput, 10);
    const validReadChapters = isNaN(readChapters) || readChapters < 0 ? 0 : readChapters;

    return {
        image: document.getElementById('image').value.trim(),
        title: document.getElementById('title').value.trim(),
        link: link,
        readChapters: validReadChapters,
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
    if (!mangaData.title) {
        return translate('requiredTitle');
    }
    if (mangaData.title !== originalTitle && isNameUsed(mangaData.title)) {
        return translate('uniqueTitlesWarning');
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
        if (manga.readChapters <= 0) {
            manga.readChapters = 0;
            //#TODO Add css feedback on clicking "-" to a 0 chapters manga, maybe red background animation
        } else {
            manga.readChapters = (parseInt(manga.readChapters, 10) || 0) - amount;
        }
        
    } else {
        throw new Error("Invalid operation. Use '+' or '-'.");
    }

    manga.lastRead = new Date().toLocaleString();
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

    document.getElementById('cancelConfirm').addEventListener('click', closeDialog, { once: true });
    document.getElementById('cancelConfirm2').addEventListener('click', closeDialog, { once: true });

    document.getElementById('confirm').addEventListener('click', () => {
        deleteManga(manga);
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