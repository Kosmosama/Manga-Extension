document.addEventListener('DOMContentLoaded', function() {
    const searchBar = document.getElementById('searchBar');
    const deleteSearch = document.getElementById('deleteSearch')
    searchBar.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const resultados = mangaList.filter(manga => manga.title.toLowerCase().includes(query));
        cargarMangas(resultados);
    });
    deleteSearch.addEventListener('click', ()=>{
        document.getElementById('searchBar').value = "";
        cargarMangas(mangaList);
    })
    

});
