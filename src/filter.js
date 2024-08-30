//#TODO Make it so that it works with addManga, editManga and settings
document.getElementById('menuBtn').addEventListener('click', showFiltersDialog);
document.getElementById('closeFiltersDialog').addEventListener('click', hideFiltersDialog);
document.getElementById('overlay').addEventListener('click', hideFiltersDialog);

function showFiltersDialog(event) {
    event.stopPropagation();

    const button = document.getElementById('menuBtn');  
    const filtersDialog = document.getElementById('filtersDialog');
    const overlay = document.getElementById('overlay');

    if (filtersDialog.classList.contains('shown-form') && button.contains(event.target)) {
        hideFiltersDialog();
    } else {
        filtersDialog.classList.add('shown-form');
        filtersDialog.classList.remove('translate-x-full');
        filtersDialog.classList.add('translate-x-0');

        // Show the overlay
        overlay.classList.remove('hidden');
        overlay.classList.add('block');
    }
}

function hideFiltersDialog() {
    const filtersDialog = document.getElementById('filtersDialog');
    const overlay = document.getElementById('overlay');

    filtersDialog.classList.remove('shown-form');
    filtersDialog.classList.add('translate-x-full');
    filtersDialog.classList.remove('translate-x-0');

    // Hide the overlay
    overlay.classList.remove('block');
    overlay.classList.add('hidden');
}

// Search bar

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