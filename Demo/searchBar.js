document.getElementById('searchBar').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const resultados = mangas.filter(manga => manga.nombre.toLowerCase().includes(query));
    cargarListaMangas(resultados);
});