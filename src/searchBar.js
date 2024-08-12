let isSearch = false;
let resultados = [];
document.addEventListener('DOMContentLoaded', function() {

    const searchBar = document.getElementById('searchBar');
    const deleteSearch = document.getElementById('deleteSearch')
    searchBar.addEventListener('input', function() {
        isSearch = true;
        const query = this.value.toLowerCase();
        resultados = mangaList.filter(manga => manga.title.toLowerCase().includes(query));
        cargarMangas(resultados);

        if (resultados == null || resultados == undefined){
            isSearch = false;
        }
    });
    deleteSearch.addEventListener('click', ()=>{
        document.getElementById('searchBar').value = "";
        cargarMangas(mangaList);
        isSearch = false;
    })
    

});
