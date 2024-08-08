function guardarMangas() {
    localStorage.setItem('mangas', JSON.stringify(mangas));
    if (isAuthorized) {
        saveToDrive();
    }
}

window.addEventListener("beforeunload", guardarMangas);