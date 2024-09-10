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

        // Set the currentPage only checkbox state, default to unchecked if not set
        document.getElementById('currentPage-only-checkbox').checked =!!filterOptions.currentPage;

        // Set the sortOption dropdown value, default to a sensible fallback if not set
        document.getElementById('sortOption').value = filterOptions.sortOption || 'favoritos';
    
        // Set the sortOrder, default to 'ascendente' if not set
        const sortOrder = filterOptions.sortOrder || 'ascendente';
        document.getElementById('toggleSortOrder').dataset.order = sortOrder;
        updateSortOrderDisplay(sortOrder);
    });
}

// Save filter options
function saveFilterOptions() {
    const filterOptions = {
        favOnly: document.getElementById('favourites-only-checkbox').checked,
        currentPage: document.getElementById('currentPage-only-checkbox').checked,
        sortOption: document.getElementById('sortOption').value,
        sortOrder: document.getElementById('toggleSortOrder').dataset.order || 'ascendente'
    };

    chrome.storage.local.set({ filterOptions: filterOptions }, function() {
        if (chrome.runtime.lastError) {
            console.error('Error saving filter options:', chrome.runtime.lastError);
        }
    });
}

// Toggle sort order
document.getElementById('toggleSortOrder').addEventListener('click', handleToggleSortOrder);

function handleToggleSortOrder() {
    const currentOrder = document.getElementById('toggleSortOrder').dataset.order || 'ascendente';
    const newOrder = currentOrder === 'ascendente' ? 'descendente' : 'ascendente';
    document.getElementById('toggleSortOrder').dataset.order = newOrder;

    // Update the button's display to reflect the new order
   updateSortOrderDisplay(newOrder);

    // Update the sorting display or icon if needed
    handleLoadAndSave();
}

document.getElementById('getRandomManga').addEventListener('click', getRandomManga);

// Function to show a random manga (only)
function getRandomManga() {
    randomIndex = Math.floor(Math.random() * mangaList.length);
    loadMangas([mangaList[randomIndex]]);
}

/**
 * Updates the display of the sort order button and icon based on the given order.
 *
 * @param {string} order - The sort order. It can be either 'ascendente' or 'descendente'.
 */
function updateSortOrderDisplay(order) {
    const sortIcon = document.getElementById('sortIcon');
    if (order === 'ascendente') {
        sortIcon.classList.remove('scale-y-[-1]');
        sortIcon.classList.add('scale-y-1');
    } else {
        sortIcon.classList.remove('scale-y-1');
        sortIcon.classList.add('scale-y-[-1]');
    }
}


// Search bar
document.getElementById('searchBar').addEventListener('input', loadFilteredMangas);
document.getElementById('deleteSearch').addEventListener('click', handleDeleteSearch);

function handleLoadAndSave(){
    loadFilteredMangas();
    saveFilterOptions();
}

function handleDeleteSearch() {
    document.getElementById('searchBar').value = "";
    loadFilteredMangas();
}

// Favourites only checkbox
document.getElementById('favourites-only-checkbox').addEventListener('change', handleLoadAndSave);

document.getElementById('currentPage-only-checkbox').addEventListener('change',handleLoadAndSave);

// Filter option
document.getElementById('sortOption').addEventListener('change', handleLoadAndSave);

async function loadFilteredMangas() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    let results = mangaList;

    // Filter by searchbar
    if (query) {
        results = results.filter(manga => manga.title.toLowerCase().includes(query));
    }

    const currentPageOnly = document.getElementById('currentPage-only-checkbox').checked;
    const favOnly = document.getElementById('favourites-only-checkbox').checked;
    const sortOption = document.getElementById('sortOption').value;
    const sortOrder = document.getElementById('toggleSortOrder').dataset.order || 'ascendente';

    // Sort and filter the results (await is necessary because sortMangas is async)
    results = await sortMangas(results, sortOption, sortOrder, favOnly, currentPageOnly);

    // Load the filtered mangas
    loadMangas(results);
}

async function sortMangas(array, filterMethod, order, favOnly, currentPageOnly) {
    let currentUrl = null;

    // If currentPageOnly is true, get the current URL and shows only the currentPage mangas.
    if (currentPageOnly) {
        currentUrl = new URL(await getCurrentTabURL());
        array = array.filter(manga => manga.link.startsWith(currentUrl.origin));
    }
    // Only show favorites if favourites-only-checkbox is checked
    if (favOnly) {
        array = array.filter(manga => manga.favorite);
    }

    // Sort the array based on the filterMethod and sortOrder
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

        // Return sorted result based on ascending/descending order
        return order === 'ascendente' ? comparison : -comparison;
    });
}