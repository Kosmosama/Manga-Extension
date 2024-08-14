var mangaList = []; // Variable global para la lista de mangas
var cargarMangas; // Variable global para la función cargarMangas
var dayAdded = new Date().toLocaleDateString('en-GB');
var lastRead = new Date().toLocaleDateString('en-GB');

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
    
    mangaListContainer.innerHTML = mangaList.map(function(manga, index) {
        return `
            <div class="relative flex items-center bg-white rounded-full shadow-md p-2 pr-3 w-full mb-2 group">
                <div class="w-8 h-8 rounded-full overflow-hidden mr-2">
                    <img src="${manga.image}" alt="Portada" class="w-full h-full object-cover">
                </div>
                <div class="flex-grow">
                    <a class="text-xs font-semibold" href="${manga.link}" target="_blank">${manga.title}</a>
                    <p class="text-xs text-gray-500" data-translate-key="chapters" data-read="${manga.readChapters}">
                        Capítulo ${manga.readChapters}
                    </p>
                </div>
                <button id="edit" data-index="${index}" data-translate-key="edit">Edit</button>
                <button id="delete" data-index="${index}" data-translate-key="delete">Delete</button>
                <button id="addCap" data-index="${index}" data-translate-key="addCap">+1 Chapter</button>
                ${manga.favorite ? `
                <div class="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full items-center justify-center flex">
                    <span id="fav" data-index="${index}" class="text-white text-[0.5rem] font-bold">★</span>
                </div>` : `
                <div class="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full items-center justify-center hidden group-hover:flex">
                    <span id="fav" data-index="${index}" class="text-white text-[0.5rem] font-bold">★</span>
                </div> `}
            </div>`;
    }).join(''); // Unir todos los elementos generados en una sola cadena
    
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

    let image = document.getElementById('image').value || "../public/Logos/icon.jpg";
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

function limpiarCamposFormulario() {
    document.getElementById('image').value = '';
    document.getElementById('title').value = '';
    document.getElementById('link').value = '';
    document.getElementById('readChapters').value = '';
    document.getElementById('favorite').checked = false;
}

document.addEventListener('DOMContentLoaded', () => {
    // Handler para el evento click
    function handleAddCapClick() {
        const index = this.getAttribute('data-index');
        if (random){
       
        mangaList[randomIndex].readChapters = parseInt(mangaList[randomIndex].readChapters, 10) + 1;
            saveManga();
            cargarMangas([mangaList[randomIndex]])
        }else if (isSearch) {
            const mangaIndexInMangaList = mangaList.findIndex(manga => manga.title === resultados[index].title);
            if (mangaIndexInMangaList !== -1) {
                mangaList[mangaIndexInMangaList].readChapters = parseInt(resultados[index].readChapters, 10) + 1;
                saveManga();
                cargarMangas(resultados);
            }
        }else{
            mangaList[index].readChapters = parseInt(mangaList[index].readChapters, 10) + 1;
    
            saveManga();
            cargarMangas(mangaList);
        }
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
        })
}