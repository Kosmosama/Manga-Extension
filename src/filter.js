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
            case 'favoritos': //funca
                comparison = b.favorite - a.favorite;
                break;
            case 'alfabetico'://funca
                comparison = a.title.localeCompare(b.title);
                break;
            case 'capitulos': //je
                comparison = a.totalChapters - b.totalChapters;
                break;
            case 'fechaAdicion': //no sé si funciona bien pq solo tengo como referencia lo q añadí hoy XD
                comparison = new Date(a.dayAdded) - new Date(b.dayAdded);
                break;
            case 'ultimaLectura': //to do
                comparison = new Date(a.lastSeen) - new Date(b.lastSeen);
                break;
        }
    
        return orden === 'ascendente' ? comparison : -comparison;
    });
}