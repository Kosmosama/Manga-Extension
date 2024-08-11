function handleMangaDelete(event) {
    var index = event.target.getAttribute('data-index');
    console.log(index);
    confirmDelete(index);
}

function confirmDelete(index) {
    const confirmDiv = document.getElementById('confirmationDialog');
    confirmDiv.style.display = 'flex';

    const cancelConfirm = document.getElementById('cancelConfirm');
    const confirm = document.getElementById('confirm');

    cancelConfirm.onclick = function() {
        confirmDiv.style.display = 'none';
    };

    confirm.onclick = function() {
        eliminarManga(index);
        confirmDiv.style.display = 'none';
    };
}

function eliminarManga(index) {
    mangaList.splice(index, 1);
    saveManga();
    cargarMangas(mangaList);
    addEventListeners("button[id=delete]", 'click', handleMangaDelete);
}

document.addEventListener('DOMContentLoaded', function() {
    addEventListeners("button[id=delete]", 'click', handleMangaDelete);
    observeDOM(function() {
        addEventListeners("button[id=delete]", 'click', handleMangaDelete);
    });
});
