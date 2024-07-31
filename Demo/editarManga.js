let editIndex = -1;

function abrirFormularioEdicion(index) {
    editIndex = index;
    const manga = mangas[index];

    document.getElementById("edit-nombre").value = manga.nombre;
    document.getElementById("edit-link").value = manga.link;
    document.getElementById("edit-linkImagen").value = manga.linkImagen;
    document.getElementById("edit-numCapitulos").value = manga.numCapitulos;
    document.getElementById("edit-favorito").checked = manga.favorito;

    document.getElementById("edit-modal").style.display = "block";
}

document.getElementById("edit-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const nombre = document.getElementById("edit-nombre").value;
    const link = document.getElementById("edit-link").value;
    const linkImagen = document.getElementById("edit-linkImagen").value;
    const numCapitulos = parseFloat(document.getElementById("edit-numCapitulos").value);
    const favorito = document.getElementById("edit-favorito").checked;

    if (editIndex > -1 && !isNaN(numCapitulos)) {
        mangas[editIndex] = {
            nombre: nombre,
            link: link,
            linkImagen: linkImagen,
            numCapitulos: numCapitulos,
            favorito: favorito
        };
        cargarListaMangas();
        document.getElementById("edit-modal").style.display = "none";
    } else {
        alert("Todos los campos son necesarios y el número de capítulos debe ser un número válido.");
    }
});

document.getElementById("close-modal").onclick = function() {
    document.getElementById("edit-modal").style.display = "none";
}

document.getElementById("cancel-edit").onclick = function() {
    document.getElementById("edit-modal").style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("edit-modal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
}