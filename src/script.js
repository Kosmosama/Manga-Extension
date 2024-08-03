var mangaList = []; // Variable global para la lista de mangas
var cargarMangas; // Variable global para la función cargarMangas
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
var yyyy = today.getFullYear();
today = mm + '/' + dd + '/' + yyyy;


document.addEventListener('DOMContentLoaded', function() {
    // Cargar la lista de mangas al iniciar la extensión
    recuperarMangas();

    function recuperarMangas() {
        chrome.storage.local.get('mangaList', function(result) {
            mangaList = result.mangaList || [];
            console.log('Loaded manga list:', mangaList);
            cargarMangas(mangaList);
        });
    }

    cargarMangas = function(mangaList) {
        var mangaListContainer = document.getElementById('mangaListContainer');
        mangaListContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevos elementos
        
        mangaList.forEach(function(manga) {
            var mangaItemHTML = '<div class="relative flex items-center bg-white rounded-full shadow-md p-2 pr-3 w-full mb-2 group">' +
                '<div class="w-8 h-8 rounded-full overflow-hidden mr-2">' +
                    '<img src="' + manga.image + '" alt="Portada" class="w-full h-full object-cover">' +
                '</div>' +
                '<div class="flex-grow">' +
                    '<h3 class="text-xs font-semibold">' + manga.title + '</h3>' +
                    '<p class="text-xs text-gray-500">Chapter ' + manga.readChapters + '/' + manga.totalChapters + '</p>' +
                '</div>' +
                '<div class="text-gray-400 text-base">+</div>' +
                '<button id="edit">Edit</button>'+
                '<button id="delete">Delete</button>'+
                '<div class="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full items-center justify-center hidden group-hover:flex">' +
                    '<span class="text-white text-[0.5rem] font-bold">★</span>' +
                '</div>' +
            '</div>';
            mangaListContainer.innerHTML += mangaItemHTML;
        });
    };

    // Añadir eventos a los botones y el formulario
    document.getElementById('addButton').addEventListener('click', function() {
        var formContainer = document.getElementById('formContainer');
        formContainer.style.display = 'flex';
    });

    document.getElementById('cancelButton').addEventListener('click', function() {
        var formContainer = document.getElementById('formContainer');
        formContainer.style.display = 'none';
    });

    document.getElementById('chapterForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const formMangaValues = {
            image: document.getElementById('image').value,
            title: document.getElementById('title').value,
            readChapters: document.getElementById('readChapters').value,
            totalChapters: document.getElementById('totalChapters').value,
            today: dd + '/' + mm + '/' + yyyy
        };

        // Obtener la lista de mangas guardada anteriormente
        chrome.storage.local.get('mangaList', function(result) {
            var mangaList = result.mangaList || [];
            mangaList.push(formMangaValues);

            // Guardar la nueva lista ordenada por fecha
            mangaList.sort((a, b) => new Date(a.today) - new Date(b.today));

            chrome.storage.local.set({ mangaList: mangaList }, function() {
                console.log('Manga list updated and saved to local storage.');
                
                // Actualizar la UI con el nuevo manga
                cargarMangas(mangaList);
            });
        });

        document.getElementById('formContainer').style.display = 'none';
    });
});
