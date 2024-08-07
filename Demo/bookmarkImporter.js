document.getElementById('bookmark-upload').addEventListener('change', handleFileSelect);
document.getElementById('discard-bookmarks').addEventListener('click', discardBookmarks);
document.getElementById('add-selected-bookmarks').addEventListener('click', addSelectedBookmarks);

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const bookmarks = parseBookmarks(doc);
        displayBookmarks(bookmarks);
    };
    reader.readAsText(file);
}

function parseBookmarks(doc) {
    const bookmarks = [];
    const processNode = (node, parentFolder = null) => {
        if (node.tagName === 'DT') {
            const a = node.querySelector('A');
            if (a) {
                const name = a.textContent;
                const url = a.getAttribute('HREF');
                const addDate = new Date(parseInt(a.getAttribute('ADD_DATE')) * 1000).toISOString();
                const manga = {
                    nombre: name.replace(/\(\d+\)/, '').trim(),
                    link: url,
                    numCapitulos: parseInt(name.match(/\((\d+)\)/)?.[1] || 0),
                    linkImagen: null,
                    ultimaLectura: new Date().toISOString(),
                    fechaAdicion: addDate
                };
                bookmarks.push({ manga, parentFolder });
            }
            const h3 = node.querySelector('H3');
            if (h3) {
                const folderName = h3.textContent;
                const folder = { name: folderName, children: [] };
                bookmarks.push({ folder, parentFolder });
                node.querySelectorAll('DL > p > DT').forEach(childNode => {
                    processNode(childNode, folder);
                });
            }
        }
    };
    doc.querySelectorAll('DL > p > DT').forEach(node => processNode(node));
    return bookmarks;
}

function displayBookmarks(bookmarks) {
    const container = document.getElementById('bookmark-container');
    container.innerHTML = '';
    const folders = bookmarks.filter(b => b.folder);
    folders.forEach(f => {
        const folderElem = document.createElement('div');
        const folderHeader = document.createElement('h3');
        folderHeader.textContent = `${f.folder.name} - Title`;
        const selectAllBtn = document.createElement('button');
        selectAllBtn.textContent = 'Select all';
        selectAllBtn.addEventListener('click', () => {
            const checkboxes = folderElem.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = true);
        });
        folderElem.appendChild(folderHeader);
        folderElem.appendChild(selectAllBtn);
        f.folder.children.forEach(b => {
            const bookmarkElem = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.bookmark = b.manga; // Store bookmark data in the checkbox element
            bookmarkElem.appendChild(checkbox);
            const span = document.createElement('span');
            span.textContent = b.manga.nombre;
            bookmarkElem.appendChild(span);
            folderElem.appendChild(bookmarkElem);
        });
        container.appendChild(folderElem);
    });
    document.getElementById('bookmark-actions').style.display = 'block';
}

function discardBookmarks() {
    document.getElementById('bookmark-container').innerHTML = '';
    document.getElementById('bookmark-actions').style.display = 'none';
}

function addSelectedBookmarks() {
    const selectedBookmarks = [];
    document.querySelectorAll('#bookmark-container input[type="checkbox"]:checked').forEach(checkbox => {
        selectedBookmarks.push(checkbox.bookmark);
    });
    selectedBookmarks.forEach(bookmark => anadirManga(bookmark));
    discardBookmarks();
}
