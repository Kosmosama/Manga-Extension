let editIndex = -1;
let originalFavoriteStatus = null;
let originalDayAdded = null;
let manga;
function openEditForm(index) {
    editIndex = index;
    if (isSearch) {
        manga = resultados[editIndex];
    } else if(random) {
        manga = mangaList[randomIndex];
    }else{
        manga = mangaList[editIndex];
    }

    originalDayAdded = manga.dayAdded;
    originalFavoriteStatus = manga.favorite;
    document.getElementById("editTitle").value = manga.title;
    document.getElementById("editImage").value = manga.image;
    document.getElementById("editLink").value = manga.link;
    document.getElementById("editReadChapters").value = manga.readChapters;
    document.getElementById("editFavorite").checked = manga.favorite;
    document.getElementById("editFormContainer").style.display = "flex";
}

document.getElementById('editForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Obtén los valores del formulario
    const image = document.getElementById('editImage').value || "../public/Logos/icon.jpg";
    const title = document.getElementById('editTitle').value;
    const link = document.getElementById('editLink').value;
    const readChapters = document.getElementById('editReadChapters').value;
    const favorite = document.getElementById('editFavorite').checked;

    // Verifica que los campos necesarios no estén vacíos y que readChapters sea un número válido
    if (title && link && !isNaN(readChapters)) {
        // Actualiza el manga existente en la lista si editIndex es válido
        if (editIndex >= 0) {
            if (isSearch){
                resultados[editIndex].image = image;
                resultados[editIndex].title = title;
                resultados[editIndex].link = link;
                resultados[editIndex].readChapters = readChapters;
                resultados[editIndex].favorite = favorite;
                resultados[editIndex].dayAdded = originalDayAdded; 
            }else if(random){
                mangaList[randomIndex].image = image;
                mangaList[randomIndex].title = title;
                mangaList[randomIndex].link = link;
                mangaList[randomIndex].readChapters = readChapters;
                mangaList[randomIndex].favorite = favorite;
                mangaList[randomIndex].dayAdded = originalDayAdded;
            }else{
                mangaList[editIndex].image = image;
                mangaList[editIndex].title = title;
                mangaList[editIndex].link = link;
                mangaList[editIndex].readChapters = readChapters;
                mangaList[editIndex].favorite = favorite;
                mangaList[editIndex].dayAdded = originalDayAdded; // Mantiene el valor original de dayAdded
            }
        }

        saveManga();
        //cargar si
        if(isSearch){
            cargarMangas(resultados);
        }else if(random){
            cargarMangas([mangaList[randomIndex]]);
        }else{
            cargarMangas(mangaList);
        }
        // Reinicia los valores del formulario y oculta el contenedor
        limpiarCamposFormulario();
        document.getElementById('editFormContainer').style.display = 'none';
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