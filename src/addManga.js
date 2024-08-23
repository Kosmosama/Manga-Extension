// Button to add new manga
document.getElementById('addButton').addEventListener('click', function () {
    var formContainer = document.getElementById('formContainer');
    formContainer.style.display = 'flex';
});

// Button to hide form
document.getElementById('cancelButton').addEventListener('click', function () {
    var formContainer = document.getElementById('formContainer');
    formContainer.style.display = 'none';
});

// Submit button for the form
document.getElementById('chapterForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    let image = document.getElementById('image').value || "../public/logos/logo.png";
    const title = document.getElementById('title').value;
    const link = document.getElementById('link').value;
    const readChapters = document.getElementById('readChapters').value;
    const dayAdded = new Date().toLocaleDateString('en-GB');
    const lastRead = new Date().toLocaleDateString('en-GB');
    const favorite = document.getElementById('favorite').checked;

    if (isNameUsed(title)){
        showModal("All the titles must be unique");
        return;
    }

    if (title && link && !isNaN(readChapters)) {
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
    } else {
        showModal("Todos los campos son necesarios y el número de capítulos debe ser un número válido.");
    }
});

function limpiarCamposFormulario() {
    document.getElementById('image').value = '';
    document.getElementById('title').value = '';
    document.getElementById('link').value = '';
    document.getElementById('readChapters').value = '';
    document.getElementById('favorite').checked = false;
}