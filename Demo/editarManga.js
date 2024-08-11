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
    let linkImagen = document.getElementById("edit-linkImagen").value;
    const numCapitulos = parseFloat(document.getElementById("edit-numCapitulos").value);
    const favorito = document.getElementById("edit-favorito").checked;

    if (editIndex > -1 && !isNaN(numCapitulos)) {
        // Function to check if the image exists
        function checkImageExists(url, callback) {
            const img = new Image();
            img.onload = () => callback(true);
            img.onerror = () => callback(false);
            img.src = url;
        }

        // Fallback logic for linkImagen
        checkImageExists(linkImagen, function(imageExists) {
            if (!imageExists) {
                const linkIcon = link + "/favicon.ico"; // Assuming the icon is at this path
                checkImageExists(linkIcon, function(iconExists) {
                    if (!iconExists) {
                        linkImagen = "../public/notfoundicon.jpg";
                    } else {
                        linkImagen = linkIcon;
                    }
                    // Update the manga after determining the correct image
                    updateManga();
                });
            } else {
                // If the original image exists, update the manga
                updateManga();
            }
        });

        function updateManga() {
            const manga = mangas[editIndex];
            manga.nombre = nombre;
            manga.link = link;
            manga.linkImagen = linkImagen;
            manga.favorito = favorito;

            // Primero se comprueba que los capitulos han cambiado, luego se reasignan si lo han hecho
            if (manga.numCapitulos !== numCapitulos) {
                manga.ultimaLectura = new Date().toISOString();
            }
            manga.numCapitulos = numCapitulos;

            actualizarLista();
            document.getElementById("edit-modal").style.display = "none";
        }
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