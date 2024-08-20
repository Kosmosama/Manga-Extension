document.getElementById('addButton').addEventListener('click', function () {
    var formContainer = document.getElementById('formContainer');
    formContainer.style.display = 'flex';
});

document.getElementById('cancelButton').addEventListener('click', function () {
    var formContainer = document.getElementById('formContainer');
    formContainer.style.display = 'none';
});

document.getElementById('chapterForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    let image = document.getElementById('image').value || "../public/logos/icon.png";
    const title = document.getElementById('title').value;
    const link = document.getElementById('link').value;
    const readChapters = document.getElementById('readChapters').value;
    const dayAdded = new Date().toLocaleDateString('en-GB');
    const lastRead = new Date().toLocaleDateString('en-GB');
    const favorite = document.getElementById('favorite').checked;

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
                const linkIcon = 'http://www.google.com/s2/favicons?domain=' + link;  // Assuming the icon is at this path
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

                saveMangas();
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

function limpiarCamposFormulario() {
    document.getElementById('image').value = '';
    document.getElementById('title').value = '';
    document.getElementById('link').value = '';
    document.getElementById('readChapters').value = '';
    document.getElementById('favorite').checked = false;
}

function handleAddCapClick(manga) {
    if (random) {
        mangaList[randomIndex].readChapters = parseInt(mangaList[randomIndex].readChapters, 10) + 1;
        saveMangas();
        cargarMangas([mangaList[randomIndex]]);
    } else if (isSearch) {
        manga.readChapters = parseInt(manga.readChapters, 10) + 1;
        saveMangas();
        cargarMangas(resultados);
    } else {
        manga.readChapters = parseInt(manga.readChapters, 10) + 1;
        saveMangas();
        cargarMangas(mangaList);
    }
}

