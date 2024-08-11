let editIndex = -1;
let originalFavoriteStatus = null;
let originalDayAdded = null;

function openEditForm(index) {
    editIndex = index;
    const manga = mangaList[index];

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
        // Function to check if the image exists
        function checkImageExists(url, callback) {
            const img = new Image();
            img.onload = () => callback(true);
            img.onerror = () => callback(false);
            img.src = url;
        }

        // Fallback logic
        checkImageExists(image, function(imageExists) {

            if (!imageExists) {
                const linkIcon = link + "/favicon.ico";  // Assuming the icon is at this path
                checkImageExists(linkIcon, function(iconExists) {

                    if (!iconExists) {
                        image = "../public/logos/icon.png";
                    } else {
                        image = linkIcon;
                    }
                    // After determining the correct image, add the manga
                    addMangaToList();
                });
            } else {
                // If the original image exists, add the manga
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

            // Obtener la lista de mangas guardada anteriormente
            chrome.storage.local.get('mangaList', function(result) {
                mangaList = result.mangaList || [];
                mangaList.push(formMangaValues);

                // Guardar la nueva lista ordenada por fecha
                mangaList.sort((a, b) => new Date(a.dayAdded) - new Date(b.dayAdded));

                saveManga();
                cargarMangas(mangaList);
                
                // Limpiar los campos del formulario
                limpiarCamposFormulario();
            });

            document.getElementById('formContainer').style.display = 'none';
        }
    } else {
        alert("Todos los campos son necesarios y el número de capítulos debe ser un número válido.");
    }
});

document.getElementById("cancelEdit").onclick = function() {
    document.getElementById("editFormContainer").style.display = "none";
}

document.addEventListener('DOMContentLoaded', function() {
    addEventListeners("button[id=edit]", 'click', function() {
        openEditForm(this.getAttribute('data-index'));
    });
    observeDOM(function() {
        addEventListeners("button[id=edit]", 'click', function() {
            openEditForm(this.getAttribute('data-index'));
        });
    });
});
