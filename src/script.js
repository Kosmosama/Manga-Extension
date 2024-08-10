var mangaList = []; // Variable global para la lista de mangas
var cargarMangas; // Variable global para la función cargarMangas
var dayAdded = new Date().toLocaleDateString('en-GB');

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
    
    mangaList.forEach(function(manga, index) {
        var mangaItemHTML = `
            <div class="relative flex items-center bg-white rounded-full shadow-md p-2 pr-3 w-full mb-2 group">
                <div class="w-8 h-8 rounded-full overflow-hidden mr-2">
                    <img src="${manga.image}" alt="Portada" class="w-full h-full object-cover">
                </div>
                <div class="flex-grow">
                    <a class="text-xs font-semibold" href="${manga.link}" target="_blank">${manga.title}</a>
                    <p class="text-xs text-gray-500" data-translate="chapters" data-read="${manga.readChapters}" data-total="${manga.totalChapters}">
                        Capítulo ${manga.readChapters}/${manga.totalChapters}
                    </p>
                </div>
                <button id="edit" data-index="${index}" data-translate="edit">Edit</button>
                <button id="delete" data-index="${index}" data-translate="delete">Delete</button>
                <button id="addCap" data-index="${index}" data-translate="addCap">+1 Chapter</button>
                ${manga.favorite ? `
                <div class="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full items-center justify-center flex">
                    <span id="fav" data-index="${index}" class="text-white text-[0.5rem] font-bold">★</span>
                </div>` : `
                <div class="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full items-center justify-center hidden group-hover:flex">
                    <span id="fav" data-index="${index}" class="text-white text-[0.5rem] font-bold">★</span>
                </div> `}
            </div>`;
    
        mangaListContainer.innerHTML += mangaItemHTML;
    });
    
    changeLanguage(currentLanguage);
    // Añadir eventos de clic a los elementos span#fav después de cargar la lista
    addClickEventToFavElements();
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
        link: document.getElementById('link').value,
        readChapters: document.getElementById('readChapters').value,
        totalChapters: document.getElementById('totalChapters').value,
        dayAdded: dayAdded,
        favorite: false
    };

    // Obtener la lista de mangas guardada anteriormente
    chrome.storage.local.get('mangaList', function(result) {
        mangaList = result.mangaList || [];
        mangaList.push(formMangaValues);

        // Guardar la nueva lista ordenada por fecha
        mangaList.sort((a, b) => new Date(a.dayAdded) - new Date(b.dayAdded));

        saveManga();
            
        // Limpiar los campos del formulario
         limpiarCamposFormulario();
    });

    document.getElementById('formContainer').style.display = 'none';
});

function limpiarCamposFormulario() {
    document.getElementById('image').value = '';
    document.getElementById('title').value = '';
    document.getElementById('link').value = '';
    document.getElementById('readChapters').value = '';
    document.getElementById('totalChapters').value = '';
}

document.addEventListener('DOMContentLoaded', () => {
    // Handler para el evento click
    function handleAddCapClick() {
        const index = this.getAttribute('data-index');
        mangaList[index].totalChapters = parseInt(mangaList[index].totalChapters, 10) + 1;
        mangaList[index].readChapters = parseInt(mangaList[index].readChapters, 10) + 1;
        saveManga();
    }

    // Añadir los event listeners iniciales
    addEventListeners('button#addCap', 'click', handleAddCapClick);

    // Observar cambios en el DOM y volver a añadir los event listeners si se añaden nuevos botones
    observeDOM(() => {
        addEventListeners('button#addCap', 'click', handleAddCapClick);
    });
});

function saveManga(){
    chrome.storage.local.set({ mangaList: mangaList }, function() {
        console.log('Manga list updated and saved to local storage.');
        
        // Actualizar la UI con lo guardado
        cargarMangas(mangaList);})
}