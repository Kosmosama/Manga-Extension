document.getElementById('add-manga-button').onclick = function() {
    const nombre = prompt("Nombre del manga:");
    const link = prompt("Link del manga:");
    const linkImagen = prompt("Link de la imagen del manga:");
    const numCapitulos = parseFloat(prompt("Número de capítulos:"));
    const favorito = confirm("¿Es favorito?");
    
    if (nombre && link && linkImagen && !isNaN(numCapitulos)) {
        anadirManga(nombre, link, linkImagen, numCapitulos, favorito);
    } else {
        alert("Todos los campos son necesarios y el número de capítulos debe ser un número válido.");
    }
};

function anadirManga(nombre, link, linkImagen, numCapitulos, favorito) {
    const nuevoManga = {
      nombre: nombre,
      link: link,
      linkImagen: linkImagen,
      numCapitulos: numCapitulos,
      favorito: favorito
    };
    mangas.push(nuevoManga);
    cargarListaMangas();
}