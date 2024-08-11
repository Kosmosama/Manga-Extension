let editIndex = -1;
let originalFavoriteStatus = null;
let originalDayAdded = null;
function openEditForm(index){
    editIndex = index;
    const manga = mangaList[index];

    originalDayAdded = manga.dayAdded;
    originalFavoriteStatus = manga.favorite;
    document.getElementById("editTitle").value = manga.title;
    document.getElementById("editImage").value = manga.image;
    document.getElementById("editLink").value = manga.link;
    document.getElementById("editReadChapters").value = manga.readChapters;
    document.getElementById("editFavorite").checked = manga.favorite; // Actualiza el estado del checkbox
    document.getElementById("editFormContainer").style.display = "flex";
}

document.getElementById('editForm').addEventListener('submit', function(event){
    event.preventDefault();
    const title = document.getElementById("editTitle").value;
    const dateAdded = originalDayAdded;
    const image = document.getElementById("editImage").value;
    const link = document.getElementById("editLink").value;
    const readChapters = document.getElementById("editReadChapters").value;
    const favorite = document.getElementById("editFavorite").checked; // Obtener el estado del checkbox

    if (editIndex > -1 && !isNaN(readChapters)) {
        mangaList[editIndex] = {
            favorite: favorite, // Actualiza el estado del manga como favorito
            title: title,
            image: image,
            link: link,
            dayAdded: dateAdded,
            readChapters: readChapters,
            lastRead: lastRead,
        };
        cargarMangas(mangaList);
        saveManga();
        document.getElementById("editFormContainer").style.display = "none";
    } else {
        alert("Todos los campos son necesarios y el número de capítulos debe ser un número válido.");
    }
});


document.getElementById("cancelEdit").onclick = function() {
    document.getElementById("editFormContainer").style.display = "none";
}

document.addEventListener('DOMContentLoaded', function() {
    addEventListeners("button[id=edit]", 'click', function() {
        openEditForm(this.getAttribute('data-index'));
    });
    observeDOM(function() {
        addEventListeners("button[id=edit]", 'click', function() {
            openEditForm(this.getAttribute('data-index'));
        });
    });
});
