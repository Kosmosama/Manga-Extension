function cargarMangas() {
    const storedMangas = localStorage.getItem('mangas');
    if (storedMangas) {
      mangas = JSON.parse(storedMangas);
    }
    cargarListaMangas(mangas);
  }

document.addEventListener("DOMContentLoaded", cargarMangas);