const dialog = document.getElementById('radix-dialog');
const openDialogBtn = document.getElementById('open-dialog');
const closeDialogBtn = document.getElementById('close-dialog');

const openDialog = () => {
  dialog.classList.remove('translate-x-full');
  dialog.classList.add('translate-x-0');
};

const closeDialog = () => {
  dialog.classList.remove('translate-x-0');
  dialog.classList.add('translate-x-full');
};

openDialogBtn.addEventListener('click', openDialog);
closeDialogBtn.addEventListener('click', closeDialog);
