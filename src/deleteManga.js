function eventListeners() {
    var mangaDeleteButton = document.querySelectorAll("button[id=delete]");
    mangaDeleteButton.forEach(function(mangaBtn, index) {
        // Asigna el índice como un atributo de datos
        mangaBtn.setAttribute('data-index', index);

        // Elimina cualquier evento previo para evitar duplicados
        mangaBtn.removeEventListener('click', handleMangaDelete);
        mangaBtn.addEventListener('click', handleMangaDelete);
    });
}

function handleMangaDelete(event) {
    var index = event.target.getAttribute('data-index');
    console.log(index);
    confirmDelete(index); // Llama a la función de confirmación
}

function confirmDelete(index) {
    const confirmDiv = document.getElementById('confirmationDialog');
    confirmDiv.style.display = 'flex';

    const cancelConfirm = document.getElementById('cancelConfirm');
    const confirm = document.getElementById('confirm');

    cancelConfirm.onclick = function() {
        confirmDiv.style.display = 'none';
    };

    confirm.onclick = function() {
        eliminarManga(index);
        confirmDiv.style.display = 'none';
    };
}

function eliminarManga(index) {
    mangaList.splice(index, 1); // Elimina solo un elemento en la posición 'index'
    cargarMangas(mangaList);
    // Vuelve a agregar los event listeners para actualizar los índices
    eventListeners();
    chrome.storage.local.set({ mangaList: mangaList }, function() {
        console.log('Manga list updated and saved to local storage.');
    });
}

// Observador de mutaciones para detectar cambios en el DOM
const mutationObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
            eventListeners();
        }
    });
});

// Configuración del observador para observar todos los cambios en el DOM
mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
});

// Llamada inicial para agregar event listeners a los botones que ya están presentes en el DOM
document.addEventListener('DOMContentLoaded', function() {
    eventListeners();
});
