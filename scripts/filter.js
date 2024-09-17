// Attach event listener for DOMContentLoaded to load filter options when the page loads
document.addEventListener("DOMContentLoaded", loadFilterOptions);

// Attach event listener to toggle sort order when the sort order button is clicked
document.getElementById('toggleSortOrder').addEventListener('click', handleToggleSortOrder);

// Attach event listener for search bar input to filter mangas
document.getElementById('searchBar').addEventListener('input', loadFilteredMangas);

// Attach event listener for the delete search button to clear the search bar
document.getElementById('deleteSearch').addEventListener('click', handleDeleteSearch);

// Attach event listener for the favourites-only checkbox in the filter dialog
document.getElementById('favourites-only-checkbox').addEventListener('change', handleLoadAndSave);

// Attach event listener for the current-page-only checkbox in the filter dialog
document.getElementById('currentPage-only-checkbox').addEventListener('change',handleLoadAndSave);

// Attach event listener for the sort option dropdown in the filter dialog
document.getElementById('sortOption').addEventListener('change', handleLoadAndSave);

// Attach event listener to update values on range change
document.getElementById('minChapters').addEventListener('input', function() {
    document.getElementById('minChapterValue').textContent = this.value;
});

// Attach event listener to load filtered mangas when mouse is released on min chapters range
document.getElementById('minChapters').addEventListener('change', function() {
    loadFilteredMangas();
});

// Attach event listener to update values on range change
document.getElementById('maxChapters').addEventListener('input', function() {
    document.getElementById('maxChapterValue').textContent = this.value;
});

// Attach event listener to load filtered mangas when mouse is released on max chapters range
document.getElementById('maxChapters').addEventListener('change', function() {
    loadFilteredMangas();
});

/**
 * Loads the filter options (favorites-only, current-page only, sorting options) from local storage 
 * and updates the UI components (checkboxes and dropdowns) accordingly.
 */
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
        document.getElementById('sortOption').value = filterOptions.sortOption || 'favFirst';
    
        // Set the sortOrder, default to 'ascendente' if not set
        const sortOrder = filterOptions.sortOrder || 'ascendente';
        document.getElementById('toggleSortOrder').dataset.order = sortOrder;
        updateSortOrderDisplay(sortOrder);
    });
}

/**
 * Saves the current filter options (favorites-only, current-page only, sorting options)
 * to the local storage.
 */
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

/**
 * Handles toggling of the sort order between 'ascendente' and 'descendente'.
 * Updates the UI and saves the new sort order to storage.
 */
function handleToggleSortOrder() {
    const currentOrder = document.getElementById('toggleSortOrder').dataset.order || 'ascendente';
    const newOrder = currentOrder === 'ascendente' ? 'descendente' : 'ascendente';
    document.getElementById('toggleSortOrder').dataset.order = newOrder;

    // Update the button's display to reflect the new order
    updateSortOrderDisplay(newOrder);

    // Update the sorting display or icon if needed
    handleLoadAndSave();
}

// Attach event listener for the random manga button in the filter dialog
document.getElementById('getRandomManga').addEventListener('click', getRandomManga);

/**
 * Loads and displays a random manga from the manga list.
 */
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

/**
 * Handles reloading and saving of the filtered mangas and filter options.
 * This is called when filter options change.
 */
function handleLoadAndSave(){
    loadFilteredMangas();
    saveFilterOptions();
}

/**
 * Clears the search bar and reloads the manga list without any search filter.
 */
function handleDeleteSearch() {
    document.getElementById('searchBar').value = "";
    loadFilteredMangas();
}

/**
 * Returns the maximum number of chapters read from the mangaList.
 * 
 * @returns {number} The maximum number of chapters read.
 */
function getMaxChapters() {
    return mangaList.reduce((max, manga) => Math.max(max, manga.readChapters), 1);
}

/**
 * Loads and filters the manga list based on the search query, current page checkbox, 
 * favorites checkbox, min/max chapters ranges and sort options.
 */
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
    const minChapters = +document.getElementById('minChapters').value;
    const maxChapters = +document.getElementById('maxChapters').value;

    // Sort and filter the results (await is necessary because sortMangas is async)
    results = await sortMangas(results, sortOption, sortOrder, favOnly, currentPageOnly, minChapters, maxChapters);

    // Load the filtered mangas
    loadMangas(results);
}

/**
 * Sorts the manga array based on the selected filter method, order, 
 * favorites-only, and current-page-only options.
 * 
 * @param {Array} array - The array of mangas to sort.
 * @param {string} filterMethod - The filter method ('favFirst','alphabetically' , 'chaptersRead', 'addDate', 'lastRead').
 * @param {string} order - The sort order ('ascendente' or 'descendente').
 * @param {boolean} favOnly - Whether to only show favorite mangas.
 * @param {boolean} currentPageOnly - Whether to only show mangas on the current page.
 * @param {number} minChapters - The minimum number of chapters a manga should have to be included.
 * @param {number} maxChapters - The maximum number of chapters a manga should have to be included.
 * 
 * @returns {Array} The sorted and filtered array of mangas.
 */
async function sortMangas(array, filterMethod, order, favOnly, currentPageOnly, minChapters, maxChapters) {
    // If currentPageOnly is true, get the current URL and shows only the currentPage mangas.
    if (currentPageOnly) {
        const currentUrl = new URL(await getCurrentTabURL());
        const mangasInURL = array.filter(manga => manga.link.startsWith(currentUrl.origin));

        if (mangasInURL.length > 0) {
            array = mangasInURL;
        }
    }

    // Only show favorites if favourites-only-checkbox is checked
    if (favOnly) {
        array = array.filter(manga => manga.favorite);
    }

    // Filter based on chapter count
    array = array.filter(manga => manga.readChapters >= minChapters && manga.readChapters <= maxChapters);

    // Sort the array based on the filterMethod and sortOrder
    return array.sort((a, b) => {
        let comparison = 0;

        switch (filterMethod) {
            case 'favFirst':
            // Should show favorites first
                comparison = b.favorite - a.favorite;
                break;
            case 'chaptersRead':
             // Should show most chapters to least
                comparison = b.readChapters - a.readChapters;
                break;
            case 'addDate':
                // Should show most recent first
                comparison = new Date(b.dayAdded) - new Date(a.dayAdded);
                break;
            case 'lastRead':
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