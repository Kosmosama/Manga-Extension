var cargarMangas; // Variable global para la función cargarMangas
var dayAdded = new Date().toLocaleDateString('en-GB');
var lastRead = new Date().toLocaleDateString('en-GB');

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
                        ${translations[language]['chapters'].replace('{read}', manga.readChapters)}
                    </p>
                </div>
                <button id="edit" data-index="${index}" data-translate-key="edit">${translations[language]['edit']}</button>
                <button id="delete" data-index="${index}" data-translate-key="delete">${translations[language]['delete']}</button>
                <button id="addCap" data-index="${index}" data-translate-key="addCap">${translations[language]['addCap']}</button>
                ${manga.favorite ? `
                <div class="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full items-center justify-center flex">
                    <span id="fav" data-index="${index}" class="text-white text-[0.5rem] font-bold">★</span>
                </div>` : `
                <div class="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full items-center justify-center hidden group-hover:flex">
                    <span id="fav" data-index="${index}" class="text-white text-[0.5rem] font-bold">★</span>
                </div>`}
            </div>`;
    }).join('');
    
    // Llamar a translatePage para traducir los elementos recién generados
    translatePage(language, translations);
    
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