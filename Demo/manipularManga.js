function alternarFavorito(index) {
    mangas[index].favorito = !mangas[index].favorito;
    cargarListaMangas();
  }
  
  function eliminarManga(index) {
    mangas.splice(index, 1);
    cargarListaMangas();
  }
  
  function editarManga(index) {
    const nuevoNombre = prompt("Nuevo nombre:", mangas[index].nombre);
    const nuevoLink = prompt("Nuevo link:", mangas[index].link);
    const nuevoLinkImagen = prompt("Nuevo link imagen:", mangas[index].linkImagen);
    const nuevoNumCapitulos = parseFloat(prompt("Nuevo número de capítulos:", mangas[index].numCapitulos));
    const nuevoFavorito = confirm("¿Es favorito?");
    
    mangas[index] = {
      nombre: nuevoNombre,
      link: nuevoLink,
      linkImagen: nuevoLinkImagen,
      numCapitulos: nuevoNumCapitulos,
      favorito: nuevoFavorito
    };
    cargarListaMangas();
}