// Opciones de busqueda
document.getElementById('sortOption').addEventListener('change', actualizarLista);

// Ascendente / Descendente
document.getElementById('sortOrder').addEventListener('change', actualizarLista);

function actualizarLista() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    let resultados = mangas.filter(manga => manga.nombre.toLowerCase().includes(query));
    
    const sortOption = document.getElementById('sortOption').value;
    const sortOrder = document.getElementById('sortOrder').value;
  
    resultados = ordenarMangas(resultados, sortOption, sortOrder);
  
    cargarListaMangas(resultados);
}

function ordenarMangas(array, criterio, orden) {
    return array.sort((a, b) => {
        let comparison = 0;
        
        switch (criterio) {
            case 'favoritos':
                comparison = b.favorito - a.favorito;
                break;
            case 'alfabetico':
                comparison = a.nombre.localeCompare(b.nombre);
                break;
            case 'capitulos':
                comparison = a.numCapitulos - b.numCapitulos;
                break;
        }
    
        return orden === 'ascendente' ? comparison : -comparison;
    });
}