// Attach event listeners to dialog toggle buttons
document.querySelectorAll('[data-dialog-target]').forEach(button => {
    const targetDialog = document.getElementById(button.getAttribute('data-dialog-target'));

    // #TODO remove data-dialog-target="filtersDialog" from "menuBtn"
    button.addEventListener('click', () => toggleDialog(targetDialog));
});

// Attach event listener for the overlay click to close all dialogs
document.getElementById('overlay').addEventListener('click', (event) => {
    event.stopPropagation();
    closeAllDialogs();
});

// Attach event listener for the cancel button in the manga form
document.getElementById('cancelButton').addEventListener('click', cancelManga);

// Attach event listener for the cross/cancel button in the manga form
document.getElementById('cross-cancel-mangaForm').addEventListener('click', cancelManga);

// Attach event listener for the cancel button in the import bookmarks dialog
document.getElementById('import-cancel-button').addEventListener('click', hideImportBookmarkDialog);

// Attach event listener for the filters button in the main page
document.getElementById('menuBtn').addEventListener('click', showFiltersDialog);

/**
 * Utility function to toggle the visibility of a dialog by adding or removing CSS classes.
 * 
 * @param {HTMLElement} dialog - The dialog element to toggle.
 */
function toggleDialog(dialog) {
    dialog.classList.toggle('translate-x-full');
    dialog.classList.toggle('translate-x-0');
    console.log("e?");

    // Update the overlay visibility after toggling the dialog
    updateOverlayVisibility();
}

/**
 * Function to close all dialogs.
 */
function closeAllDialogs() {
    const dialogs = document.querySelectorAll('.dialog');

    dialogs.forEach(dialog => {
        dialog.classList.add('translate-x-full');
        dialog.classList.remove('translate-x-0');
    });

    // Update the overlay visibility after closing all dialogs
    updateOverlayVisibility();

    // It will do it more times than needed, but this is the best place I found for this (at least for now)
    removeImportDatasets();
}

/**
 * Function to update the visibility of the overlay based on open dialogs.
 */
function updateOverlayVisibility() {
    const openDialogs = document.querySelectorAll('.dialog:not(.translate-x-full)');
    const overlay = document.getElementById('overlay');

    if (openDialogs.length > 0) {
        overlay.classList.remove('hidden');
        overlay.classList.add('opacity-50');
        overlay.classList.remove('opacity-0');
    } else {
        overlay.classList.add('hidden');
        overlay.classList.remove('opacity-50');
        overlay.classList.add('opacity-0');
    }
}

/**
 * Specific function to open the manga form dialog.
 */
function showMangaForm() {
    const mangaFormDialog = document.getElementById('formContainer');
    toggleDialog(mangaFormDialog);
}

/**
 * Specific function to cancel the addition/edition of the current manga.
 */
function cancelManga() {
    hideMangaForm();
    processRemainingBookmarks();
}

/**
 * Specific function to close the manga form dialog.
 */
function hideMangaForm() {
    const mangaFormDialog = document.getElementById('formContainer');
    if (!mangaFormDialog.classList.contains('translate-x-full')) {
        toggleDialog(mangaFormDialog);
    }

    // Update the overlay visibility after hiding the dialog
    updateOverlayVisibility();
}

/**
 * Specific function to open the filters dialog.
 */
function showFiltersDialog() {
    console.log("hola");
    const filtersDialog = document.getElementById('filtersDialog');

    const maxChapters = getMaxChapters();

    const minChaptersRange = document.getElementById('minChapters');
    const maxChaptersRange = document.getElementById('maxChapters');
    const minChaptersSpan = document.getElementById('minChapterValue');
    const maxChaptersSpan = document.getElementById('maxChapterValue');

    // Set maximum chapters found in only one manga and max for ranges
    minChaptersRange.max = maxChapters;
    maxChaptersRange.max = maxChapters;

    // Set values to 0 on min range input
    minChaptersRange.value = 0;
    minChaptersSpan.textContent = 0;

    // Set values to max on max range input
    maxChaptersRange.value = maxChapters;
    maxChaptersSpan.textContent = maxChapters;
    console.log("xd");

    toggleDialog(filtersDialog);
}

/**
 * Resets the content of the bookmark tree element by setting its inner HTML to an empty string.
 */
function resetBookmarkTreeContent() {
    document.getElementById('bookmark-tree').innerHTML = '';
}

/**
 * Specific function to open the import bookmark dialog.
 */
function showImportBookmarkDialog() {
    const bookmarkDialog = document.getElementById('import-bookmarks-dialog');
    toggleDialog(bookmarkDialog);
}

/**
 * Specific function to close the import bookmark dialog.
 */
function hideImportBookmarkDialog() {
    const bookmarkDialog = document.getElementById('import-bookmarks-dialog');
    if (!bookmarkDialog.classList.contains('translate-x-full')) {
        toggleDialog(bookmarkDialog);
        resetBookmarkTreeContent();
    }

    // Update the overlay visibility after hiding the dialog
    updateOverlayVisibility();
}
