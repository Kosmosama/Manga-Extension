// Utility function to toggle dialog visibility
function toggleDialog(dialog) {
    dialog.classList.toggle('translate-x-full');
    dialog.classList.toggle('translate-x-0');
    toggleOverlay();
}

// Function to close all dialogs
function closeAllDialogs(dialogs) {
    dialogs.forEach(dialog => {
        dialog.classList.add('translate-x-full');
        dialog.classList.remove('translate-x-0');
    });
    toggleOverlay();
}

// Function to toggle overlay based on dialog visibility
function toggleOverlay() {
    const overlay = document.getElementById('overlay');
    overlay.classList.toggle('hidden');
    setTimeout(() => {
        overlay.classList.toggle('opacity-0');
        overlay.classList.toggle('opacity-50');
    }, 10);
}


// Attach event listeners to dialog toggle buttons
document.querySelectorAll('[data-dialog-target]').forEach(button => {
    const targetDialog = document.getElementById(button.getAttribute('data-dialog-target'));
    button.addEventListener('click', () => toggleDialog(targetDialog));
});

// Event listener for overlay click
document.getElementById('overlay').addEventListener('click', (event) => {
    event.stopPropagation();
    const dialogs = document.querySelectorAll('.dialog');
    closeAllDialogs(dialogs);
});
