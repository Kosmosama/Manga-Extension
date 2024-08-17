// Esto debe ser añadido al botón de la estrella para alternar entre favorito/no favorito
function alternarFavorito(manga) {
    manga.favorito = !manga.favorito;
    actualizarLista();
}

// Esto debe ser añadido al botón de eliminar manga
function eliminarManga(manga) {
    mangas = mangas.filter(m => m !== manga);
    actualizarLista();
}

// Esto debe ser añadido al botón de edición de manga, y editar la función para que use un formulario, no prompts
function editarManga(manga) {
    const nuevoNombre = prompt("Nuevo nombre:", manga.nombre);
    const nuevoLink = prompt("Nuevo link:", manga.link);
    const nuevoLinkImagen = prompt("Nuevo link imagen:", manga.linkImagen);
    const nuevoNumCapitulos = parseFloat(prompt("Nuevo número de capítulos:", manga.numCapitulos));
    const nuevoFavorito = confirm("¿Es favorito?");

    manga.nombre = nuevoNombre;
    manga.link = nuevoLink;
    manga.linkImagen = nuevoLinkImagen;
    manga.numCapitulos = nuevoNumCapitulos;
    manga.favorito = nuevoFavorito;

    actualizarLista();
}
