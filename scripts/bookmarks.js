// Attach event listener for the import from bookmarks button in the settings dialog
document.getElementById('import-bookmarks').addEventListener('click', openBookmarkDialog);

// Attach event listener for the import selected bookmarks button in the import dialog
document.getElementById('import-selected-button').addEventListener('click', importSelectedBookmarks);

/**
 * Opens the bookmark import dialog and loads the bookmarks.
 * Displays the overlay and loads simulated bookmarks data into the dialog.
 */
function openBookmarkDialog() {
    resetBookmarkTreeContent();
    showImportBookmarkDialog();

    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        if (bookmarkTreeNodes.length > 0) {
            loadBookmarks(bookmarkTreeNodes[0].children, document.getElementById('bookmark-tree'));
        }
        else {
            hideImportBookmarkDialog();
            showModal("modal-no-bookmarks-found");
            console.log("No bookmarks found in the Chrome bookmark tree.");
        }
    });
}

/**
 * Recursively loads bookmarks into the container, creating folder or bookmark elements.
 * 
 * @param {Array} bookmarks - List of bookmark objects to be loaded.
 * @param {HTMLElement} container - Container element where bookmarks should be loaded.
 */
function loadBookmarks(bookmarks, container) {
    bookmarks.forEach(bookmark => {
        if (bookmark.children) {
            const folderElement = createFolderElement(bookmark);
            container.appendChild(folderElement);
            loadBookmarks(bookmark.children, folderElement.querySelector('.folder-children'));
        } else {
            const bookmarkElement = createBookmarkElement(bookmark);
            container.appendChild(bookmarkElement);
        }
    });
}

/**
 * Creates a folder element for the bookmark tree.
 * 
 * @param {Object} bookmark - The bookmark folder object.
 * @returns {HTMLElement} - The created folder element.
 */
function createFolderElement(bookmark) {
    const folder = document.createElement('div');
    folder.classList.add('folder', 'mb-2');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('folder-checkbox', 'mr-2');

    const labelContainer = document.createElement('div');
    labelContainer.classList.add('flex', 'items-center', 'space-x-2', 'cursor-pointer');
    labelContainer.addEventListener('click', (e) => {
        if (e.target !== checkbox){
            toggleFolderVisibility(folder)
        }
    });

    const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    setAttributes(svgIcon, {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    });
    svgIcon.classList.add('folder-icon', 'w-4', 'h-4','mr-2','flex-shrink-0');
    svgIcon.innerHTML = `
        <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path>
    `;

    const label = document.createElement('label');
    label.textContent = bookmark.title;
    label.classList.add('text-xs','font-bold','cursor-pointer','hover:underline');

    const childrenContainer = document.createElement('div');
    childrenContainer.classList.add('folder-children', 'hidden', 'ml-6');
    checkbox.addEventListener('change', () => toggleFolderCheckbox(checkbox, childrenContainer));
    
    labelContainer.appendChild(checkbox);
    labelContainer.appendChild(svgIcon);
    labelContainer.appendChild(label);
    folder.appendChild(labelContainer);
    folder.appendChild(childrenContainer);
    
    return folder;
}

function setAttributes(el, attrs) {
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
};

/**
 * Creates a bookmark element for individual bookmarks.
 * 
 * @param {Object} bookmark - The bookmark object containing title and URL.
 * @returns {HTMLElement} - The created bookmark element.
 */
function createBookmarkElement(bookmark) {
    const bookmarkElement = document.createElement('div');
    bookmarkElement.classList.add('bookmark', 'flex', 'items-center', 'space-x-2', 'mb-2');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('bookmark-checkbox', 'mr-2');

    const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    setAttributes(svgIcon, {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    });
    svgIcon.classList.add('bookmark-icon', 'w-4', 'h-4', 'mr-2', 'flex-shrink-0');
    svgIcon.innerHTML = `
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
    `;

    const label = document.createElement('label');
    label.textContent = bookmark.title.length < 35 ? bookmark.title : bookmark.title.substring(0, 35 - 3) + "...";
    label.setAttribute('title', bookmark.title);
    label.classList.add('text-xs', 'font-medium');

    bookmarkElement.setAttribute('data-url', bookmark.url);

    bookmarkElement.appendChild(checkbox);
    bookmarkElement.appendChild(svgIcon);
    bookmarkElement.appendChild(label);
    
    return bookmarkElement;
}

/**
 * Toggles the visibility of the folder's children.
 * 
 * @param {HTMLElement} folder - The folder element whose children are to be toggled.
 */
function toggleFolderVisibility(folder) {
    const childrenContainer = folder.querySelector('.folder-children');
    childrenContainer.classList.toggle('hidden');
}

/**
 * Toggles the state of child checkboxes when a folder's checkbox is changed.
 * 
 * @param {HTMLElement} checkbox - The folder's checkbox element.
 * @param {HTMLElement} childrenContainer - Container holding the folder's children.
 */
function toggleFolderCheckbox(checkbox, childrenContainer) {
    const childCheckboxes = childrenContainer.querySelectorAll('input[type="checkbox"]');
    childCheckboxes.forEach(childCheckbox => {
        childCheckbox.checked = checkbox.checked;
    });
}

/**
 * Updates the folder checkbox based on the state of its child checkboxes.
 * Propagates changes to parent folders recursively.
 * 
 * @param {HTMLElement} folder - The folder element whose checkbox needs to be updated.
 */
function updateFolderAndParents(folder) {
    const folderCheckbox = folder.querySelector('.folder-checkbox');
    const folderChildren = folder.querySelector('.folder-children');

    if (folderChildren) {
        const checkboxes = folderChildren.querySelectorAll('input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);

        folderCheckbox.checked = allChecked;
    }

    const parentFolder = folder.closest('.folder').parentElement.closest('.folder');
    if (parentFolder) {
        updateFolderAndParents(parentFolder);
    }
}

// Updates parent folder checkboxes when child checkboxes change
document.getElementById('bookmark-tree').addEventListener('change', (event) => {
    if (event.target.classList.contains('bookmark-checkbox')) {
        const folder = event.target.closest('.folder');
        if (folder) {
            updateFolderAndParents(folder);
        }
    }
});

/**
 * Collects selected bookmarks and logs them to the console.
 * Gathers all selected bookmarks by checking which checkboxes are selected.
 */
function importSelectedBookmarks() {
    const selectedBookmarks = [];
    const checkedCheckboxes = document.querySelectorAll('.bookmark-checkbox:checked');

    if (checkedCheckboxes.length === 0) {
        closeAllDialogs();
        showModal("modal-no-selected-bookmarks"); //#TODO Add key to translations - Leave for later
        return;
    }
    checkedCheckboxes.forEach(checkbox => {
        const bookmarkElement = checkbox.closest('.bookmark');
        const label = bookmarkElement.querySelector('label');
        selectedBookmarks.push({
            title: label.getAttribute('title'),
            link: bookmarkElement.getAttribute('data-url')
        });
    });

    handleBookmarkToManga(selectedBookmarks);
}

/**
 * Processes the remaining bookmarks for import if the form is in import mode.
 */
function processRemainingBookmarks() {
    const form = document.getElementById('chapterForm');

    const isImportMode = !!form.dataset.importMode;
    const remainingBookmarks = JSON.parse(form.dataset.remainingBookmarks || '[]');

    if (isImportMode && Array.isArray(remainingBookmarks)) {
        handleBookmarkToManga(remainingBookmarks);
    }
}

/**
 * Removes the import-related dataset attributes from the chapter form.
 */
function removeImportDatasets() {
    const form = document.getElementById('chapterForm');

    delete form.dataset.importMode;
    delete form.dataset.remainingBookmarks;
}

/**
 * Handles the current bookmark and prepares the next iteration if more bookmarks exist.
 *
 * @param {Array} remainingBookmarks - The list of remaining bookmarks to process.
 */
function handleBookmarkToManga(remainingBookmarks) {
    closeAllDialogs();

    const form = document.getElementById('chapterForm');
    const firstBookmark = remainingBookmarks.shift();

    fillMangaForm(firstBookmark);

    if (remainingBookmarks.length > 0) {
        form.dataset.importMode = 'true';
        form.dataset.remainingBookmarks = JSON.stringify(remainingBookmarks);
    } else {
        removeImportDatasets();
    }

    showMangaForm(); // Maybe it causes an error with the overlay.
}
