document.addEventListener('DOMContentLoaded', function() {
    // Cargar la lista de mangas al iniciar la extensión
    chrome.storage.local.get('mangaList', function(result) {
        mangaList = result.mangaList || [];
        console.log('Loaded manga list:', mangaList);

        mangaList.forEach(manga => {
          //Lógica para cargar el manga
        });
    });

    // Añadir eventos a los botones y el formulario
    document.getElementById('addButton').addEventListener('click', function() {
        var dropdown = document.getElementById('dropdown');
        dropdown.classList.toggle('hidden');
    });

    document.getElementById('loadChapter').addEventListener('click', function() {
        var formContainer = document.getElementById('formContainer');
        formContainer.style.display = 'flex';
        document.getElementById('dropdown').classList.add('hidden');
    });

    document.getElementById('cancelButton').addEventListener('click', function() {
        var formContainer = document.getElementById('formContainer');
        formContainer.style.display = 'none';
    });

    document.getElementById('chapterForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
        var yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;

        const formMangaValues = {
            image: document.getElementById('image').value,
            title: document.getElementById('title').value,
            readChapters: document.getElementById('readChapters').value,
            totalChapters: document.getElementById('totalChapters').value,
            today: dd + '/' + mm + '/' + yyyy
        };

        // Obtener la lista de mangas guardada anteriormente
        chrome.storage.local.get('mangaList', function(result) {
            mangaList = result.mangaList || [];
            mangaList.push(formMangaValues);

            // Guardar la nueva lista ordenada por fecha
            mangaList.sort((a, b) => new Date(a.today) - new Date(b.today));

            chrome.storage.local.set({ mangaList: mangaList }, function() {
                console.log('Manga list updated and saved to local storage.');
                
                // Actualizar la UI con el nuevo manga
                let mangaItem = document.createElement('div');
                mangaItem.textContent = `${formMangaValues.title} - ${formMangaValues.readChapters}/${formMangaValues.totalChapters}`;
                document.getElementById('mangaListContainer').appendChild(mangaItem);
            });
        });

        document.getElementById('formContainer').style.display = 'none';
    });
});
