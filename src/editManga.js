let editIndex = -1;

function openEditForm(index){
    editIndex = index;
    const manga = mangaList[index];

    document.getElementById("editTitle").value = manga.title;
    document.getElementById("editImage").value = manga.image;
    document.getElementById("editLink").value = manga.link;
    document.getElementById("editReadChapters").value = manga.readChapters;
    document.getElementById("editTotalChapters").value = manga.totalChapters;
    document.getElementById("editFormContainer").style.display = "flex";
}

document.getElementById('editForm').addEventListener('submit', function(event){
    event.preventDefault();
    const title = document.getElementById("editTitle").value;
    const image = document.getElementById("editImage").value;
    const link = document.getElementById("editLink").value;
    const readChapters = document.getElementById("editReadChapters").value;
    const totalChapters = document.getElementById("editTotalChapters").value;
    if (editIndex > -1 && !isNaN(readChapters)) {
        mangaList[editIndex] = {
           favorite: favorite,
           title: title,
           image: image,
           link: link,
           readChapters: readChapters,
           dayAdded: dayAdded,
           totalChapters: totalChapters
        };
        cargarMangas(mangaList);
        chrome.storage.local.set({ mangaList: mangaList }, function() {
            console.log('Manga list updated and saved to local storage.');
        })
        document.getElementById("editFormContainer").style.display = "none";
    } else {
        alert("Todos los campos son necesarios y el número de capítulos debe ser un número válido.");
    }
})

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
