let favorite = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM completamente cargado y analizado');
    
    // Función para agregar el evento de clic a los elementos span con id fav
    function addClickEventToFavElements() {
        const favSpans = document.querySelectorAll('span#fav');
        console.log('Elementos fav encontrados:', favSpans.length);
        
        favSpans.forEach(favo => {
            favo.addEventListener('click', function() {
                console.log('Elemento clicado:', favo);
                favorite = true;
                changeFavorite(favo);
            });
        });
    }
    
    // Agregar eventos de clic a los elementos span existentes
    addClickEventToFavElements();

    // Observar cambios en el DOM
    const favObserver = new MutationObserver(function(mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                console.log('Se detectaron cambios en el DOM');
                addClickEventToFavElements();
            }
        }
    });

    // Configurar el observer para observar el cuerpo del documento
    favObserver.observe(document.body, { childList: true, subtree: true });
});

function changeFavorite(favo) {
    console.log('changeFavorite llamado con el elemento:', favo.parentElement);
    
    const parentDiv = favo.parentElement;
    
    // Remueve la clase 'group-hover:flex' si existe
    if (parentDiv.classList.contains('group-hover:flex')) {
        console.log('Clase group-hover:flex encontrada. Eliminando...');
        parentDiv.classList.remove('group-hover:flex');
        parentDiv.classList.remove('hidden');

        console.log('Añadiendo la clase flex');
        parentDiv.classList.add('flex');
    } else {
        parentDiv.classList.remove('flex')
        parentDiv.classList.add('group-hover:flex')
        parentDiv.classList.add('hidden')

    }
    
    // Añade la clase 'flex'
    
}

// Prueba para asegurarse de que el DOM está completamente cargado y el script se ejecuta correctamente
console.log('Script cargado');
