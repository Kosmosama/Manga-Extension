function guardarMangas() {
    localStorage.setItem('mangas', JSON.stringify(mangas));
}

window.addEventListener("beforeunload", guardarMangas);