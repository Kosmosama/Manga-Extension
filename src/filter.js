// Opciones de busqueda
document.getElementById('sortOption').addEventListener('change', actualizarLista);

// Ascendente / Descendente
document.getElementById('sortOrder').addEventListener('change', actualizarLista);

function actualizarLista() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    let resultados = mangaList.filter(manga => manga.title.toLowerCase().includes(query));
    
    const sortOption = document.getElementById('sortOption').value;
    const sortOrder = document.getElementById('sortOrder').value;
  
    resultados = ordenarMangas(resultados, sortOption, sortOrder);
  
    cargarMangas(resultados);
}

function ordenarMangas(array, criterio, orden) {
    return array.sort((a, b) => {
        let comparison = 0;
        
        switch (criterio) {
            case 'favoritos': //To do
                comparison = b.favorito - a.favorito;
                break;
            case 'alfabetico'://funca
                comparison = a.title.localeCompare(b.title);
                break;
            case 'capitulos': //je
                comparison = a.totalChapters - b.totalChapters;
                break;
            case 'fechaAdicion': //no sé si funciona bien pq solo tengo como referencia lo q añadí hoy XD
                comparison = new Date(a.fechaAdicion) - new Date(b.fechaAdicion);
                break;
            case 'ultimaLectura': //to do
                comparison = new Date(a.ultimaLectura) - new Date(b.ultimaLectura);
                break;
        }
    
        return orden === 'ascendente' ? comparison : -comparison;
    });
}