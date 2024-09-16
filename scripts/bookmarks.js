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
            showModal(translate("No bookmarks found in chrome bookmark tree.")); //#TODO Add key to translations - Leave for later
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
    folder.classList.add('folder');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('folder-checkbox');

    const labelContainer = document.createElement('div');
    labelContainer.classList.add('folder-label-container');
    labelContainer.addEventListener('click', () => toggleFolderVisibility(folder));

    const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgIcon.setAttribute('viewBox', '0 0 24 24');
    svgIcon.classList.add('folder-icon');
    svgIcon.innerHTML = `
        <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z" fill="currentColor"/>
    `;

    const label = document.createElement('label');
    label.textContent = bookmark.title;

    const childrenContainer = document.createElement('div');
    childrenContainer.classList.add('folder-children', 'hidden');

    checkbox.addEventListener('change', () => toggleFolderCheckbox(checkbox, childrenContainer));

    labelContainer.appendChild(svgIcon);
    labelContainer.appendChild(label);
    folder.appendChild(checkbox);
    folder.appendChild(labelContainer);
    folder.appendChild(childrenContainer);

    return folder;
}

/**
 * Creates a bookmark element for individual bookmarks.
 * 
 * @param {Object} bookmark - The bookmark object containing title and URL.
 * @returns {HTMLElement} - The created bookmark element.
 */
function createBookmarkElement(bookmark) {
    const bookmarkElement = document.createElement('div');
    bookmarkElement.classList.add('bookmark');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('bookmark-checkbox');

    const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgIcon.setAttribute('viewBox', '0 0 24 24');
    svgIcon.classList.add('bookmark-icon');
    svgIcon.innerHTML = `
        <path d="M6 2c-1.1 0-2 .9-2 2v16l8-4 8 4V4c0-1.1-.9-2-2-2H6z" fill="currentColor"/>
    `;

    const label = document.createElement('label');
    label.textContent = bookmark.title;

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
        showModal("No bookmarks selected."); //#TODO Add key to translations - Leave for later
        return;
    }
    checkedCheckboxes.forEach(checkbox => {
        const bookmarkElement = checkbox.closest('.bookmark');
        selectedBookmarks.push({
            title: bookmarkElement.querySelector('label').textContent,
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