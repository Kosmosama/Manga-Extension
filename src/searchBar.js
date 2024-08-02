document.addEventListener('DOMContentLoaded', function() {
    const searchBar = document.getElementById('searchBar');
    searchBar.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const resultados = mangaList.filter(manga => manga.title.toLowerCase().includes(query));
        cargarMangas(resultados);
    });
});
