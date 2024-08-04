// La lista empieza vacia realmente, ésto es una prueba hasta que tengamos hecha la carga desde json
let mangas = [];

// Muestra todos los mangas de la lista en un div (Sin el formato que queremos actualmente)
function cargarListaMangas(resultados) {
    const listaMangasDiv = document.getElementById("lista-mangas");
    listaMangasDiv.innerHTML = ""; // Limpiar resultados anteriores
  
    resultados.forEach((manga, index) => {
        const mangaDiv = document.createElement("div");
        mangaDiv.innerHTML = `
            <h3>${manga.nombre}</h3>
            <p>Link: <a href="${manga.link}">${manga.link}</a></p>
            <img src="${manga.linkImagen}" alt="${manga.nombre}" style="width:100px;">
            <p>Número de capítulos: ${manga.numCapitulos}</p>
            <p>Fecha de Adición: ${new Date(manga.fechaAdicion).toLocaleString()}</p>
            Última Lectura: ${new Date(manga.ultimaLectura).toLocaleString()}
            <p>Favorito: ${manga.favorito ? 'Sí' : 'No'}</p>
            <button onclick="alternarFavorito(${index})">Alternar Favorito</button>
            <button onclick="eliminarManga(${index})">Eliminar Manga</button>
            <button onclick="abrirFormularioEdicion(${index})">Editar Manga</button>
        `;
        listaMangasDiv.appendChild(mangaDiv);
    });
}