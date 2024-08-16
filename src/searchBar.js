let isSearch = false;
let resultados = [];
let searchBar = null;
let deleteSearch = null;

function handleSearchInput() {
    isSearch = true;
    const query = searchBar.value.toLowerCase();
    resultados = mangaList.filter(manga => manga.titleLower.includes(query));
    cargarMangas(resultados);

    if (resultados.length === mangaList.length) {
        isSearch = false;
    }
}

function handleDeleteSearch() {
    if (searchBar.value === "") return; 

    searchBar.value = "";
    cargarMangas(mangaList);
    isSearch = false;
}

function initializeEventListeners() {
    searchBar = document.getElementById('searchBar');
    deleteSearch = document.getElementById('deleteSearch');
    
    searchBar.addEventListener('input', handleSearchInput);
    deleteSearch.addEventListener('click', handleDeleteSearch);
}

document.addEventListener('DOMContentLoaded', function() {
    mangaList.forEach(manga => {
        manga.titleLower = manga.title.toLowerCase();
    });
    initializeEventListeners();
});
