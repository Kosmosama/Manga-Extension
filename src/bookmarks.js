document.addEventListener('DOMContentLoaded', () => {
    const bookmarksList = document.getElementById('bookmarksList');
    const addButton = document.getElementById('addButton');

    // Function to traverse the bookmarks tree
    function traverseBookmarks(bookmarks, parentList, isRoot = false) {
        bookmarks.forEach(bookmark => {
            if (isRoot) {
                // Skip rendering the root folder
                traverseBookmarks(bookmark.children, parentList);
                return;
            }

            const li = document.createElement('li');

            if (bookmark.children) {
                li.classList.add('folder');
                li.innerHTML = `<input type="checkbox" class="folder-checkbox"> ${bookmark.title}`;
                
                const ul = document.createElement('ul');
                ul.style.display = 'none'; // Hide child elements by default
                traverseBookmarks(bookmark.children, ul);
                li.appendChild(ul);

                // Add a click event listener to the folder to toggle visibility of child elements
                li.addEventListener('click', (event) => {
                    if (event.target.tagName.toLowerCase() !== 'input') {
                        ul.style.display = ul.style.display === 'none' ? 'block' : 'none';
                        event.stopPropagation(); // Prevent event from bubbling up to parent elements
                    }
                });

                // Add event listener to the folder checkbox to select/deselect all children
                const folderCheckbox = li.querySelector('.folder-checkbox');
                folderCheckbox.addEventListener('change', () => {
                    const isChecked = folderCheckbox.checked;
                    ul.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                        checkbox.checked = isChecked;
                    });
                });

                parentList.appendChild(li);
            } else {
                li.innerHTML = `<input type="checkbox" class="bookmark-checkbox" data-title="${bookmark.title}" data-url="${bookmark.url}" data-date="${bookmark.dateAdded}"> ${bookmark.title}`;
                parentList.appendChild(li);
            }
        });
    }

    // Get the bookmarks and traverse the tree
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        traverseBookmarks(bookmarkTreeNodes, bookmarksList, true);
    });

    // Add event listener to the add button
    addButton.addEventListener('click', () => {
        const selectedBookmarks = [];
        document.querySelectorAll('.bookmark-checkbox:checked').forEach(checkbox => {
            const title = checkbox.getAttribute('data-title');
            const url = checkbox.getAttribute('data-url');
            const dateAdded = new Date(parseInt(checkbox.getAttribute('data-date')));

            selectedBookmarks.push({
                title,
                url,
                dateAdded
            });
        });

        console.log(selectedBookmarks);
    });
});
