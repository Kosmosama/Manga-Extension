// Utility function to toggle dialog visibility
function toggleDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    dialog.classList.toggle('translate-x-full');
    dialog.classList.toggle('translate-x-0');
    toggleOverlay();
}

// Function to close all dialogs
function closeAllDialogs() {
    const dialogs = ['radix-dialog', 'filtersDialog'];
    dialogs.forEach(dialogId => {
        const dialog = document.getElementById(dialogId);
        dialog.classList.add('translate-x-full');
        dialog.classList.remove('translate-x-0');
    });
    toggleOverlay();
}

// Function to toggle overlay based on dialog visibility
function toggleOverlay() {
    const overlay = document.getElementById('overlay');
    const dialogs = ['radix-dialog', 'filtersDialog'];
    const isAnyDialogOpen = dialogs.some(dialogId => {
        const dialog = document.getElementById(dialogId);
        return !dialog.classList.contains('translate-x-full');
    });

    if (isAnyDialogOpen) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
    } else {
        overlay.classList.remove('flex');
        overlay.classList.add('hidden');
    }
}

// Event listeners for dialog toggle buttons
document.getElementById('open-dialog').addEventListener('click', () => toggleDialog('radix-dialog'));
document.getElementById('close-dialog').addEventListener('click', () => toggleDialog('radix-dialog'));
document.getElementById('menuBtn').addEventListener('click', () => toggleDialog('filtersDialog'));
document.getElementById('closeFiltersDialog').addEventListener('click', () => toggleDialog('filtersDialog'));

// Event listener for overlay click
document.getElementById('overlay').addEventListener('click', (event) => {
    event.stopPropagation();
    closeAllDialogs();
});
