let originalFavoriteStatus = null;
let originalDayAdded = null;
let manga = null;

function handleMangaEdition(editManga) {

    if (editManga) {
        manga = editManga;
        originalDayAdded = manga.dayAdded;
        originalFavoriteStatus = manga.favorite;

        fillEditForm(editManga);
        document.getElementById("editFormContainer").style.display = "flex";
    }
}

function fillEditForm(manga) {
    document.getElementById("editTitle").value = manga.title;
    document.getElementById("editImage").value = manga.image;
    document.getElementById("editLink").value = manga.link;
    document.getElementById("editReadChapters").value = manga.readChapters;
    document.getElementById("editFavorite").checked = manga.favorite;
}

function updateMangaDetails() {
    const image = document.getElementById('editImage').value || "../public/logos/icon.png";
    const title = document.getElementById('editTitle').value;
    const link = document.getElementById('editLink').value;
    const readChapters = document.getElementById('editReadChapters').value;
    const favorite = document.getElementById('editFavorite').checked;

    if (title && link && !isNaN(readChapters)) {
        manga.image = image;
        manga.title = title;
        manga.link = link;
        manga.readChapters = readChapters;
        manga.favorite = favorite;
        manga.dayAdded = originalDayAdded; // Mantiene el valor original
        saveMangas();
        reloadMangas();
        resetEditForm();
    } else {
        alert("Todos los campos son necesarios y el número de capítulos debe ser un número válido.");
    }
}

function reloadMangas() {
    cargarMangas(mangaList);
}

function resetEditForm() {
    document.getElementById('editFormContainer').style.display = 'none';
}

document.getElementById('editForm').addEventListener('submit', function(event) {
    event.preventDefault();
    updateMangaDetails();
});

document.getElementById("cancelEdit").addEventListener('click', resetEditForm);
