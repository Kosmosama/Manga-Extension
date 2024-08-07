document.addEventListener('DOMContentLoaded', () => {
    const bookmarksContainer = document.getElementById('bookmarksContainer');
    const bookmarksList = document.getElementById('bookmarksList');

    // Función para recorrer el árbol de marcadores
    function traverseBookmarks(bookmarks, parentList) {
        bookmarks.forEach(bookmark => {
            if (bookmark.children) {
                const li = document.createElement('li');
                li.textContent = bookmark.title;
                parentList.appendChild(li);

                const ul = document.createElement('ul');
                li.appendChild(ul);

                traverseBookmarks(bookmark.children, ul);
            } else {
                const li = document.createElement('li');
                li.textContent = bookmark.title;
                parentList.appendChild(li);
            }
        });
    }

    // Obtener los marcadores y recorrer el árbol
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        traverseBookmarks(bookmarkTreeNodes, bookmarksList);
    });
});
