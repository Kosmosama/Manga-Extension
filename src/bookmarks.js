document.addEventListener('DOMContentLoaded', () => {
    const bookmarksList = document.getElementById('bookmarksList');
    const addButton = document.getElementById('addButton');
    const formContainer = document.getElementById('editFormContainer');
    const editForm = document.getElementById('editForm');
    var lastRead = new Date().toLocaleDateString('en-GB');
    let selectedBookmarks = [];
    let currentBookmarkIndex = 0;

    // Function to traverse the bookmarks tree
    function traverseBookmarks(bookmarks, parentList, isRoot = false) {
        bookmarks.forEach(bookmark => {
            if (isRoot) {
                traverseBookmarks(bookmark.children, parentList);
                return;
            }

            const li = document.createElement('li');

            if (bookmark.children) {
                li.classList.add('folder');
                li.innerHTML = `<input type="checkbox" class="folder-checkbox"> ${bookmark.title}`;
                
                const ul = document.createElement('ul');
                ul.style.display = 'none';
                traverseBookmarks(bookmark.children, ul);
                li.appendChild(ul);

                li.addEventListener('click', (event) => {
                    if (event.target.tagName.toLowerCase() !== 'input') {
                        ul.style.display = ul.style.display === 'none' ? 'block' : 'none';
                        event.stopPropagation();
                    }
                });

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

    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        traverseBookmarks(bookmarkTreeNodes, bookmarksList, true);
    });

    addButton.addEventListener('click', () => {
        selectedBookmarks = [];
        document.querySelectorAll('.bookmark-checkbox:checked').forEach(checkbox => {
            const title = checkbox.getAttribute('data-title');
            const url = checkbox.getAttribute('data-url');
            const dateAdded = new Date(parseInt(checkbox.getAttribute('data-date')));

            selectedBookmarks.push({ title, url, dateAdded });
        });

        if (selectedBookmarks.length > 0) {
            currentBookmarkIndex = 0;
            showFormForBookmark(currentBookmarkIndex);
        }
    });

    function showFormForBookmark(index) {
        if (index >= selectedBookmarks.length) {
            formContainer.style.display = 'none';
            return;
        }
    
        const bookmark = selectedBookmarks[index];
        formContainer.style.display = 'flex';
    
        document.getElementById('editTitle').value = bookmark.title;
        document.getElementById('editLink').value = bookmark.url;
        document.getElementById('editReadChapters').value = '';
        document.getElementById('editImage').value = '';
        document.getElementById('editFavorite').checked = false; // Mostrar el estado del checkbox
    }
    

    editForm.addEventListener('submit', function(event) {
        event.preventDefault();
    
        const bookmarkform = {
            image: document.getElementById('editImage').value,
            title: document.getElementById('editTitle').value,
            link: document.getElementById('editLink').value,
            readChapters: document.getElementById('editReadChapters').value,
            dayAdded: selectedBookmarks[currentBookmarkIndex].dateAdded,
            lastRead: lastRead,
            favorite: document.getElementById('editFavorite').checked
        };
    
        chrome.storage.local.get('mangaList', function(result) {
            const mangaList = result.mangaList || [];
            mangaList.push(bookmarkform);
            chrome.storage.local.set({ mangaList }, () => {
                currentBookmarkIndex++;
                showFormForBookmark(currentBookmarkIndex);
            });
        });
    });
    
    document.getElementById('cancelEdit').addEventListener('click', function() {
        formContainer.style.display = 'none';
    });
});