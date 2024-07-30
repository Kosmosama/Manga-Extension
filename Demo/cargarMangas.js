function cargarMangas() {
    const storedMangas = localStorage.getItem('mangas');
    if (storedMangas) {
        mangas = JSON.parse(storedMangas);
    }
    cargarListaMangas();
}

document.addEventListener("DOMContentLoaded", cargarMangas);