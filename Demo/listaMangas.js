let mangas = [];

// Muestra todos los mangas de la lista en un div (Sin el formato que queremos actualmente)
function cargarListaMangas(resultados) {
    const listaMangasDiv = document.getElementById("lista-mangas");
    listaMangasDiv.innerHTML = ""; // Limpiar resultados anteriores
  
    const fragment = document.createDocumentFragment();
    
    resultados.forEach((manga) => {
        const mangaDiv = document.createElement("div");
        mangaDiv.classList.add('manga-item');
        mangaDiv.dataset.nombre = manga.nombre; // Usado para identificar el manga

        mangaDiv.innerHTML = `
            <h3>${manga.nombre}</h3>
            <p>Link: <a href="${manga.link}">${manga.link}</a></p>
            <img src="${manga.linkImagen}" alt="${manga.nombre}" style="width:100px;">
            <p>Número de capítulos: ${manga.numCapitulos}</p>
            <p>Fecha de Adición: ${new Date(manga.fechaAdicion).toLocaleString()}</p>
            Última Lectura: ${new Date(manga.ultimaLectura).toLocaleString()}
            <p>Favorito: ${manga.favorito ? 'Sí' : 'No'}</p>
            <button class="toggle-fav">Alternar Favorito</button>
            <button class="delete-manga">Eliminar Manga</button>
            <button class="edit-manga">Editar Manga</button>
        `;

        fragment.appendChild(mangaDiv);
    });

    listaMangasDiv.appendChild(fragment);
}

document.getElementById("lista-mangas").addEventListener("click", (event) => {
    const mangaItem = event.target.closest('.manga-item');
    if (!mangaItem) return;

    const mangaNombre = mangaItem.dataset.nombre;
    const manga = mangas.find(m => m.nombre === mangaNombre);

    if (event.target.classList.contains('toggle-fav')) {
        alternarFavorito(manga);
    } else if (event.target.classList.contains('delete-manga')) {
        eliminarManga(manga);
    } else if (event.target.classList.contains('edit-manga')) {
        editarManga(manga);
    }
});