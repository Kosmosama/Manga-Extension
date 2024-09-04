// Add event listeners to buttons for opening and closing the bookmark dialog and importing selected bookmarks
document.getElementById('importBookmarksBtn').addEventListener('click', openBookmarkDialog);
document.getElementById('cancelBtn').addEventListener('click', closeBookmarkDialog);
document.getElementById('importSelectedBtn').addEventListener('click', importSelectedBookmarks);

/**
 * Opens the bookmark import dialog and loads the bookmarks.
 * This function displays the overlay containing the bookmark import dialog.
 * It then loads the simulated bookmarks data into the dialog.
 */
function openBookmarkDialog() {
    document.getElementById('importOverlay').classList.remove('hidden'); // Show the dialog overlay

    // Simulated bookmarks data. Replace this with chrome.bookmarks.getTree in a real extension.
    const bookmarks = [
        {
            "id": "1",
            "title": "Bookmarks Bar",
            "children": [
                {
                    "id": "2",
                    "title": "Google",
                    "url": "https://www.google.com"
                },
                {
                    "id": "3",
                    "title": "YouTube",
                    "url": "https://www.youtube.com"
                },
                {
                    "id": "4",
                    "title": "Web Dev Resources",
                    "children": [
                        {
                            "id": "5",
                            "title": "MDN Web Docs",
                            "url": "https://developer.mozilla.org"
                        },
                        {
                            "id": "6",
                            "title": "Stack Overflow",
                            "url": "https://stackoverflow.com"
                        }
                    ]
                },
                {
                    "id": "7",
                    "title": "News",
                    "children": [
                        {
                            "id": "8",
                            "title": "BBC News",
                            "url": "https://www.bbc.com/news"
                        },
                        {
                            "id": "9",
                            "title": "CNN",
                            "url": "https://www.cnn.com"
                        },
                        {
                            "id": "10",
                            "title": "Tech News",
                            "children": [
                                {
                                    "id": "11",
                                    "title": "The Verge",
                                    "url": "https://www.theverge.com"
                                },
                                {
                                    "id": "12",
                                    "title": "TechCrunch",
                                    "url": "https://techcrunch.com"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ];

    // Load bookmarks into the dialog's bookmark tree container
    loadBookmarks(bookmarks[0].children, document.getElementById('bookmarkTree'));
}

/**
 * Closes the bookmark import dialog and clears the bookmark tree.
 * This function hides the overlay and clears any bookmarks that were previously loaded into the dialog.
 */
function closeBookmarkDialog() {
    document.getElementById('importOverlay').classList.add('hidden'); // Hide the dialog overlay
    document.getElementById('bookmarkTree').innerHTML = ''; // Clear any loaded bookmarks from the tree
}

/**
 * Recursively loads bookmarks into the container.
 * Creates folder elements for bookmark folders and individual bookmark elements for single bookmarks.
 * 
 * @param {Array} bookmarks - List of bookmark objects to be loaded.
 * @param {HTMLElement} container - The container element where bookmarks should be loaded.
 */
function loadBookmarks(bookmarks, container) {
    bookmarks.forEach(bookmark => {
        if (bookmark.children) {
            // If the bookmark has children, it's a folder, so create a folder element
            const folderElement = createFolderElement(bookmark);
            container.appendChild(folderElement);
            // Recursively load the child bookmarks within this folder
            loadBookmarks(bookmark.children, folderElement.querySelector('.folder-children'));
        } else {
            // If the bookmark has no children, it's a single bookmark, so create a bookmark element
            const bookmarkElement = createBookmarkElement(bookmark);
            container.appendChild(bookmarkElement);
        }
    });
}

/**
 * Creates a folder element for the bookmark tree.
 * This function generates the HTML structure for a folder, including a checkbox, label, and icon.
 * 
 * @param {Object} bookmark - The bookmark folder object.
 * @returns {HTMLElement} - The created folder element.
 */
function createFolderElement(bookmark) {
    const folder = document.createElement('div');
    folder.classList.add('folder'); // Apply the folder class for styling

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('folder-checkbox'); // Apply the folder-checkbox class for styling

    // Create a container for the folder label (this will be clickable to toggle visibility)
    const labelContainer = document.createElement('div');
    labelContainer.classList.add('folder-label-container');
    labelContainer.addEventListener('click', () => toggleFolder(folder)); // Add click event to toggle folder visibility

    // SVG icon for the folder (you may use inline SVG for more control over styling)
    const svgIcon = document.createElement('img');
    svgIcon.src = 'folder.svg';  // Ensure the SVG is available at this path
    svgIcon.alt = 'Folder';      // Alt text for accessibility
    svgIcon.classList.add('folder-icon'); // Apply the folder-icon class for styling

    const label = document.createElement('label');
    label.textContent = bookmark.title; // Set the folder's title as the label text

    // Container for child bookmarks (initially hidden)
    const childrenContainer = document.createElement('div');
    childrenContainer.classList.add('folder-children', 'hidden'); // Apply classes for styling and initially hide

    // Synchronize the checkbox state with child checkboxes
    checkbox.addEventListener('change', () => toggleFolderCheckbox(checkbox, childrenContainer));

    // Append all the created elements together to form the folder structure
    labelContainer.appendChild(svgIcon);
    labelContainer.appendChild(label);
    folder.appendChild(checkbox);
    folder.appendChild(labelContainer);
    folder.appendChild(childrenContainer);

    return folder; // Return the complete folder element
}

/**
 * Creates a bookmark element for individual bookmarks.
 * This function generates the HTML structure for a bookmark, including a checkbox and label.
 * 
 * @param {Object} bookmark - The bookmark object containing title and URL.
 * @returns {HTMLElement} - The created bookmark element.
 */
function createBookmarkElement(bookmark) {
    const bookmarkElement = document.createElement('div');
    bookmarkElement.classList.add('bookmark'); // Apply the bookmark class for styling

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('bookmark-checkbox'); // Apply the bookmark-checkbox class for styling

    const label = document.createElement('label');
    label.textContent = bookmark.title; // Set the bookmark's title as the label text

    // Store the bookmark's URL in a data attribute for easy retrieval later
    bookmarkElement.setAttribute('data-url', bookmark.url);

    // Append checkbox and label to the bookmark element
    bookmarkElement.appendChild(checkbox);
    bookmarkElement.appendChild(label);

    return bookmarkElement; // Return the complete bookmark element
}

/**
 * Toggles the visibility of the folder's children when the folder is clicked.
 * This function is triggered when a folder label is clicked, and it shows or hides the folder's children.
 * 
 * @param {HTMLElement} folder - The folder element whose children are to be toggled.
 */
function toggleFolder(folder) {
    const childrenContainer = folder.querySelector('.folder-children');
    childrenContainer.classList.toggle('hidden'); // Toggle the 'hidden' class to show/hide children
}

/**
 * Toggles the state of child checkboxes when a folder's checkbox is changed.
 * This function ensures that when a folder checkbox is checked or unchecked, all its child checkboxes follow suit.
 * 
 * @param {HTMLElement} checkbox - The folder's checkbox element.
 * @param {HTMLElement} childrenContainer - The container holding the folder's children.
 */
function toggleFolderCheckbox(checkbox, childrenContainer) {
    const childCheckboxes = childrenContainer.querySelectorAll('input[type="checkbox"]');
    // Iterate over all child checkboxes and set their checked state to match the parent folder checkbox
    childCheckboxes.forEach(childCheckbox => {
        childCheckbox.checked = checkbox.checked;
    });
}

/**
 * Updates the parent folder's checkbox based on the state of child checkboxes.
 * This event listener ensures that a folder's checkbox reflects the state of its child checkboxes (all checked or not).
 */
document.getElementById('bookmarkTree').addEventListener('change', (event) => {
    if (event.target.classList.contains('bookmark-checkbox')) {
        // Find the closest folder that contains the checkbox
        const folder = event.target.closest('.folder');
        if (folder) {
            const folderCheckbox = folder.querySelector('.folder-checkbox');
            const siblingCheckboxes = folder.querySelectorAll('.bookmark-checkbox');
            // Check if all sibling checkboxes are checked
            const allChecked = Array.from(siblingCheckboxes).every(cb => cb.checked);
            folderCheckbox.checked = allChecked; // Update the folder checkbox state
        }
    }
});

/**
 * Collects selected bookmarks and logs them to the console.
 * This function can be modified to perform actions like saving or exporting the selected bookmarks.
 * It gathers all selected bookmarks by checking which checkboxes are checked.
 */
function importSelectedBookmarks() {
    const selectedBookmarks = [];
    // Select all checked checkboxes within bookmarks
    const checkedCheckboxes = document.querySelectorAll('.bookmark-checkbox:checked');
    
    // Collect data from selected bookmarks
    checkedCheckboxes.forEach(checkbox => {
        const bookmarkElement = checkbox.closest('.bookmark');
        selectedBookmarks.push({
            title: bookmarkElement.querySelector('label').textContent,
            url: bookmarkElement.getAttribute('data-url')
        });
    });

    console.log(selectedBookmarks);  // Log the selected bookmarks to the console (for demonstration)

    // Close the dialog after importing
    closeBookmarkDialog();
}
