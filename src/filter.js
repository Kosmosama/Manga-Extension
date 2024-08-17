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
            case 'favoritos':
                comparison = b.favorito - a.favorito;
                break;
            case 'capitulos':
                comparison = a.numCapitulos - b.numCapitulos;
                break;
            case 'fechaAdicion':
                comparison = new Date(a.fechaAdicion) - new Date(b.fechaAdicion);
                break;
            case 'ultimaLectura':
                comparison = new Date(a.ultimaLectura) - new Date(b.ultimaLectura);
                break;
        }

        // If the primary comparison is the same, sort alphabetically by 'nombre'
        if (comparison === 0) {
            comparison = a.nombre.localeCompare(b.nombre);
        }

        return orden === 'ascendente' ? comparison : -comparison;
    });
}