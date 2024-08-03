let editIndex = -1;

// Función para agregar los event listeners a los botones
function addEventListeners() {
     var mangaEditButton = document.querySelectorAll("button[id=edit]");
     mangaEditButton.forEach(function(mangaBtn, index){
       mangaBtn.addEventListener('click', function() {
         openEditForm(index);
       });
     });
}

function openEditForm(index){
    editIndex = index;
    const manga = mangaList[index];

    document.getElementById("editTitle").value = manga.title;
    document.getElementById("editImage").value = manga.image;
    document.getElementById("editReadChapters").value = manga.readChapters;
    document.getElementById("editTotalChapters").value = manga.totalChapters;
    document.getElementById("editFormContainer").style.display = "flex";
}

document.getElementById('editForm').addEventListener('submit', function(event){
    event.preventDefault();
    const title = document.getElementById("editTitle").value;
    const image = document.getElementById("editImage").value;
    const readChapters = document.getElementById("editReadChapters").value;
    const totalChapters = document.getElementById("editTotalChapters").value;
    if (editIndex > -1 && !isNaN(readChapters)) {
        mangaList[editIndex] = {
           title: title,
           image: image,
           readChapters: readChapters,
           totalChapters, totalChapters
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


// Observador de mutaciones para detectar cambios en el DOM
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
        addEventListeners();
        }
    });
});

// Configuración del observador para observar todos los cambios en el DOM
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Llamada inicial para agregar event listeners a los botones que ya están presentes en el DOM
document.addEventListener('DOMContentLoaded', function () {
     addEventListeners();
});
