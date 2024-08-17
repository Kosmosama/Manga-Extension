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
    if (isSearch) {
        // Obtener el título del manga que se está eliminando de `resultados`
        const mangaTitle = resultados[index].title;

        // Eliminar de `resultados`
        resultados.splice(index, 1);

        // Encontrar y eliminar el manga correspondiente en `mangaList`
        const mangaIndexInMangaList = mangaList.findIndex(manga => manga.title === mangaTitle);
        if (mangaIndexInMangaList !== -1) {
            mangaList.splice(mangaIndexInMangaList, 1);
        }
        
        // Guardar y recargar `resultados`
        saveMangas();
        cargarMangas(mangaList);
        isSearch = false;
    } else if (random){
         // Obtener el título del manga que se está eliminando de `resultados`
         const mangaTitle = mangaList[randomIndex].title;

         // Eliminar de `resultados`
         mangaList.splice(randomIndex, 1);
         
         // Guardar y recargar `resultados`
         saveMangas();
         cargarMangas(mangaList);
         random = false;
    } else {
        // Eliminar directamente de `mangaList` si no estás en modo de búsqueda
        mangaList.splice(index, 1);
        saveMangas();
        cargarMangas(mangaList);
    }

    addEventListeners("button[id=delete]", 'click', handleMangaDelete);
}

document.addEventListener('DOMContentLoaded', function() {
    addEventListeners("button[id=delete]", 'click', handleMangaDelete);
    observeDOM(function() {
        addEventListeners("button[id=delete]", 'click', handleMangaDelete);
    });
});
