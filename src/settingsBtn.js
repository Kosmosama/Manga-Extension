const dialog = document.getElementById('radix-dialog');
const openDialogBtn = document.getElementById('open-dialog');
const closeDialogBtn = document.getElementById('close-dialog');

<<<<<<< HEAD
const openDialog = () => {
    dialog.classList.remove('translate-x-full');
    dialog.classList.add('translate-x-0');
  };
  
  const closeDialog = () => {
    dialog.classList.remove('translate-x-0');
    dialog.classList.add('translate-x-full');
=======
const openSettings = () => {
    // Hide everything
    noSettings.style.display = 'none';

    // Show settings
    settings.style.display = 'block';
};

const closeSettings = () => {
    // Show everything
    noSettings.style.display = 'block';

    // Hide settings
    settings.style.display = 'none';
>>>>>>> ca6baddfa25715df8fb6b7e2e6a651ea06a106d6
};

openDialogBtn.addEventListener('click', openDialog);
closeDialogBtn.addEventListener('click', closeDialog);
