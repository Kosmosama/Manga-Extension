document.getElementById('menuBtn').addEventListener('click', showFiltersDialog);
document.getElementById('closeFiltersDialog').addEventListener('click', hideFiltersDialog);
document.addEventListener('click', closeFiltersDialogOutside);


function showFiltersDialog(event) {
    event.stopPropagation();
    const filtersDialog = document.getElementById('filtersDialog');
    filtersDialog.classList.remove('translate-x-full');
    filtersDialog.classList.add('translate-x-0');
}

function hideFiltersDialog() {
    const filtersDialog = document.getElementById('filtersDialog');
    filtersDialog.classList.add('translate-x-full');
    filtersDialog.classList.remove('translate-x-0');
}

function closeFiltersDialogOutside(event) {
    const filtersDialog = document.getElementById('filtersDialog');
    if (!filtersDialog.contains(event.target) && event.target !== document.getElementById('menuBtn')) {
        hideFiltersDialog();
    }
}

// Inicialmente oculta el diálogo
document.getElementById('filtersDialog').classList.add('translate-x-full');

document.getElementById('searchBar').addEventListener('input', loadFilteredMangas);
document.getElementById('deleteSearch').addEventListener('click', handleDeleteSearch);

function handleDeleteSearch() {
    document.getElementById('searchBar').value = "";
    loadFilteredMangas();
}

// Filter option
document.getElementById('sortOption').addEventListener('change', loadFilteredMangas);

// Filter order
document.getElementById('sortOrder').addEventListener('change', loadFilteredMangas);

function loadFilteredMangas() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    let results = mangaList;

    // Filter by searchbar
    if (query) {
        results = results.filter(manga => manga.title.toLowerCase().includes(query));
    }
    
    const sortOption = document.getElementById('sortOption').value;
    const sortOrder = document.getElementById('sortOrder').value;
  
    // Filter by filters
    results = sortMangas(results, sortOption, sortOrder);
  
    loadMangas(results);
}

function sortMangas(array, filterMethod, order) {
    return array.sort((a, b) => {
        let comparison = 0;

        switch (filterMethod) {
            case 'favoritos':
                // Should show favorites first
                comparison = b.favorite - a.favorite;
                break;
            case 'capitulos':
                // Should show most chapters to least
                comparison = b.readChapters - a.readChapters;
                break;
            case 'fechaAdicion':
                // Should show most recent first
                comparison = new Date(b.dayAdded) - new Date(a.dayAdded);
                break;
            case 'ultimaLectura':
                // Should show most recent first
                comparison = new Date(b.lastRead) - new Date(a.lastRead);
                break;
            default:
                // If "filterMethod" is other, should order alphabetically
                comparison = a.title.localeCompare(b.title);
        }

        // In case that two of the comparisons are the same, order alphabetically (e.g., two with the same favorite status)
        if (comparison === 0) {
            comparison = a.title.localeCompare(b.title);
        }

        // Ascending/Descending
        return order === 'ascendente' ? comparison : -comparison;
    });
}