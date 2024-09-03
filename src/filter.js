// Load filter options
document.addEventListener("DOMContentLoaded", loadFilterOptions);

function loadFilterOptions() {
    chrome.storage.local.get({ filterOptions: {} }, function(result) {
        if (chrome.runtime.lastError) {
            console.error('Error loading filter options:', chrome.runtime.lastError);
            return;
        }

        const filterOptions = result.filterOptions;

        // Set the checkbox state, default to unchecked if not set
        document.getElementById('favourites-only-checkbox').checked = !!filterOptions.favOnly;

        // Set the sortOption dropdown value, default to a sensible fallback if not set
        document.getElementById('sortOption').value = filterOptions.sortOption || 'favoritos';

        // Set the sortOrder dropdown value, default to a sensible fallback if not set
        document.getElementById('sortOrder').value = filterOptions.sortOrder || 'ascendente';
    });
}

// Save filter options
function saveFilterOptions() {
    const filterOptions = {
        favOnly: document.getElementById('favourites-only-checkbox').checked,
        sortOption: document.getElementById('sortOption').value,
        sortOrder: document.getElementById('sortOrder').value
    };

    chrome.storage.local.set({ filterOptions: filterOptions }, function() {
        if (chrome.runtime.lastError) {
            console.error('Error saving filter options:', chrome.runtime.lastError);
        }
    });
}

// Search bar
document.getElementById('searchBar').addEventListener('input', loadFilteredMangas);
document.getElementById('deleteSearch').addEventListener('click', handleDeleteSearch);

function handleDeleteSearch() {
    document.getElementById('searchBar').value = "";
    loadFilteredMangas();
}

// Favourites only checkbox
document.getElementById('favourites-only-checkbox').addEventListener('change', function() {
    loadFilteredMangas();
    saveFilterOptions();
});

// Filter option
document.getElementById('sortOption').addEventListener('change', function() {
    loadFilteredMangas();
    saveFilterOptions();
});

// Filter order
document.getElementById('sortOrder').addEventListener('change', function() {
    loadFilteredMangas();
    saveFilterOptions();
});

function loadFilteredMangas() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    let results = mangaList;

    // Filter by searchbar
    if (query) {
        results = results.filter(manga => manga.title.toLowerCase().includes(query));
    }
    
    const favOnly = document.getElementById('favourites-only-checkbox').checked;
    const sortOption = document.getElementById('sortOption').value;
    const sortOrder = document.getElementById('sortOrder').value;
  
    // Filter by filters
    results = sortMangas(results, sortOption, sortOrder, favOnly);
  
    loadMangas(results);
}

function sortMangas(array, filterMethod, order, favOnly) {
    // Only show not favourites if favourites-only-checkbox isn't checked
    if (favOnly) {
        array = array.filter(manga => manga.favorite);
    }

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