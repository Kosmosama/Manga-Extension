let editIndex = -1;
let originalFavoriteStatus = null;
let originalDayAdded = null;

function openEditForm(index) {
    console.log("openEditForm called with index:", index);
    editIndex = index;
    let manga;

    if (random) {
        manga = mangaList[randomIndex];
        console.log("Editing random manga:", manga);
    } else if (isSearch) {
        manga = resultados[index];
        console.log("Editing search result manga:", manga);
    } else {
        manga = mangaList[index];
        console.log("Editing mangaList manga:", manga);
    }

    originalDayAdded = manga.dayAdded;
    originalFavoriteStatus = manga.favorite;
    document.getElementById("editTitle").value = manga.title;
    document.getElementById("editImage").value = manga.image;
    document.getElementById("editLink").value = manga.link;
    document.getElementById("editReadChapters").value = manga.readChapters;
    document.getElementById("editFavorite").checked = manga.favorite;
    document.getElementById("editFormContainer").style.display = "flex";
}

document.getElementById('chapterForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    let image = document.getElementById('image').value || "../public/Logos/icon.jpg";
    const title = document.getElementById('title').value;
    const link = document.getElementById('link').value;
    const readChapters = document.getElementById('readChapters').value;
    const dayAdded = new Date().toLocaleDateString('en-GB');
    const lastRead = new Date().toLocaleDateString('en-GB');
    const favorite = document.getElementById('favorite').checked;

    console.log("Initial form values:", {
        image,
        title,
        link,
        readChapters,
        dayAdded,
        lastRead,
        favorite
    });

    if (title && link && !isNaN(readChapters)) {
        function checkImageExists(url, callback) {
            const img = new Image();
            img.onload = () => callback(true);
            img.onerror = () => callback(false);
            img.src = url;
        }

        checkImageExists(image, function(imageExists) {
            if (!imageExists) {
                const linkIcon = link + "/favicon.ico";
                checkImageExists(linkIcon, function(iconExists) {
                    if (!iconExists) {
                        image = "../public/logos/icon.png";
                    } else {
                        image = linkIcon;
                    }
                    addMangaToList();
                });
            } else {
                addMangaToList();
            }
        });

        function addMangaToList() {
            console.log("Adding manga with final values:", {
                image,
                title,
                link,
                readChapters,
                dayAdded,
                lastRead,
                favorite
            });

            const formMangaValues = {
                image: image,
                title: title,
                link: link,
                readChapters: readChapters,
                dayAdded: dayAdded,
                lastRead: lastRead,
                favorite: favorite
            };

            chrome.storage.local.get('mangaList', function(result) {
                mangaList = result.mangaList || [];
                mangaList.push(formMangaValues);

                mangaList.sort((a, b) => new Date(a.dayAdded) - new Date(b.dayAdded));

                saveManga();
                cargarMangas(mangaList);

                limpiarCamposFormulario();
            });

            document.getElementById('formContainer').style.display = 'none';
        }
    } else {
        alert("Todos los campos son necesarios y el número de capítulos debe ser un número válido.");
    }
});

document.getElementById("saveEdit").onclick = function() {
    if (editIndex !== -1) {
        console.log("Saving edits for index:", editIndex);
        let manga;

        if (random) {
            manga = mangaList[randomIndex];
            console.log("Saving edits to random manga:", manga);
        } else if (isSearch) {
            manga = resultados[editIndex];
            console.log("Saving edits to search result manga:", manga);
        } else {
            manga = mangaList[editIndex];
            console.log("Saving edits to mangaList manga:", manga);
        }

        manga.title = document.getElementById("editTitle").value;
        manga.image = document.getElementById("editImage").value;
        manga.link = document.getElementById("editLink").value;
        manga.readChapters = parseInt(document.getElementById("editReadChapters").value, 10);
        manga.favorite = document.getElementById("editFavorite").checked;
        manga.dayAdded = originalDayAdded;

        console.log("Updated manga details:", manga);

        saveManga();
        if (random) {
            cargarMangas([mangaList[randomIndex]]);
        } else if (isSearch) {
            cargarMangas(resultados);
        } else {
            cargarMangas(mangaList);
        }

        document.getElementById("editFormContainer").style.display = "none";
    }
};

document.getElementById("cancelEdit").onclick = function() {
    console.log("Cancel edit");
    document.getElementById("editFormContainer").style.display = "none";
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded event fired");
    
    // Añadir event listeners solo una vez
    function addEditEventListeners() {
        const editButtons = document.querySelectorAll("button[id=edit]");
        editButtons.forEach(button => {
            button.removeEventListener('click', handleEditClick); // Eliminar listeners existentes
            button.addEventListener('click', handleEditClick);
        });
    }

    function handleEditClick(event) {
        openEditForm(this.getAttribute('data-index'));
    }

    addEditEventListeners();

    observeDOM(function() {
        addEditEventListeners();
    });
});
