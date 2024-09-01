// Attach event listeners to dialog toggle buttons
document.querySelectorAll('[data-dialog-target]').forEach(button => {
    const targetDialog = document.getElementById(button.getAttribute('data-dialog-target'));
    button.addEventListener('click', () => toggleDialog(targetDialog));
});

// Attach event listener for the overlay click to close all dialogs
document.getElementById('overlay').addEventListener('click', (event) => {
    event.stopPropagation();
    const dialogs = document.querySelectorAll('.dialog');
    closeAllDialogs(dialogs);
});

// Attach event listener for the cancel button in the manga form
document.getElementById('cancelButton').addEventListener('click', hideMangaForm);

// Attach event listener for the cross/cancel button in the manga form
document.getElementById('cross-cancel-mangaForm').addEventListener('click', hideMangaForm);

/**
 * Utility function to toggle the visibility of a dialog.
 * 
 * @param {HTMLElement} dialog - The dialog element to toggle.
 */
function toggleDialog(dialog) {
    dialog.classList.toggle('translate-x-full');
    dialog.classList.toggle('translate-x-0');
    toggleOverlay();
}

/**
 * Function to close all dialogs.
 * 
 * @param {NodeList} dialogs - A list of dialog elements to be closed.
 */
function closeAllDialogs(dialogs) {
    dialogs.forEach(dialog => {
        dialog.classList.add('translate-x-full');
        dialog.classList.remove('translate-x-0');
    });
    toggleOverlay();
}

/**
 * Function to toggle the visibility of the overlay based on dialog visibility.
 */
function toggleOverlay() {
    const overlay = document.getElementById('overlay');
    overlay.classList.toggle('hidden');
    setTimeout(() => {
        overlay.classList.toggle('opacity-0');
        overlay.classList.toggle('opacity-50');
    }, 10);
}

/**
 * Specific function to open the manga form dialog.
 */
function showMangaForm() {
    const mangaFormDialog = document.getElementById('formContainer');
    toggleDialog(mangaFormDialog);
}

/**
 * Specific function to close the manga form dialog.
 */
function hideMangaForm() {
    const mangaFormDialog = document.getElementById('formContainer');
    if (!mangaFormDialog.classList.contains('translate-x-full')) {
        toggleDialog(mangaFormDialog);
    }
}

/**
 * Function to close all dialogs, including the manga form dialog.
 */
function closeAllDialogsIncludingMangaForm() {
    const dialogs = document.querySelectorAll('.dialog');
    closeAllDialogs(dialogs);
}
