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
                comparison = b.favorite - a.favorite;
                break;
            case 'capitulos':
                comparison = a.readChapters - b.readChapters;
                break;
            case 'fechaAdicion':
                comparison = new Date(a.dayAdded) - new Date(b.dayAdded);
                break;
            case 'ultimaLectura':
                comparison = new Date(a.lastRead) - new Date(b.lastRead);
                break;
        }

        // If the primary comparison is the same, sort alphabetically by 'nombre'
        if (comparison === 0) {
            comparison = a.title.localeCompare(b.title);
        }

        return orden === 'ascendente' ? comparison : -comparison;
    });
}