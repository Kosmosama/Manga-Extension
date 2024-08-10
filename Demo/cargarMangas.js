function cargarMangas() {
    const storedMangas = localStorage.getItem('mangas');
    if (storedMangas) {
        mangas = JSON.parse(storedMangas);
    }
    actualizarLista();
}

document.addEventListener("DOMContentLoaded", cargarMangas);