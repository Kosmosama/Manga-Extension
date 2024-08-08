function cargarMangas() {
    if (isAuthorized) {
        loadFromDrive();
    } else {
        const storedMangas = localStorage.getItem('mangas');
        if (storedMangas) {
            mangas = JSON.parse(storedMangas);
        }
        actualizarLista(); // Aplicar filtros y ordenamiento al cargar los datos
    }
}

document.addEventListener("DOMContentLoaded", cargarMangas);