document.getElementById('export').addEventListener('click', exportar);

function exportar() {
    const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const filename = `mangas_${date}.json`;
    const json = JSON.stringify(mangas, null, 2);
    const blob = new Blob([json], {type: "application/json"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

document.getElementById('import').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedMangas = JSON.parse(e.target.result);
                if (Array.isArray(importedMangas) && importedMangas.every(validateMangaObject)) {
                    mangas.push(...importedMangas);
                    console.log('Imported mangas:', importedMangas);
                    console.log('Current mangas array:', mangas);
                } else {
                    console.error('The file does not contain a valid mangas array.');
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        };
        reader.readAsText(file);
    } else {
        console.error('Please select a valid JSON file.');
    }
});

// Comprobation so each pushed manga has these keys
function validateMangaObject(obj) {
    const requiredKeys = [
        'nombre',
        'link',
        'linkImagen',
        'numCapitulos',
        'favorito',
        'fechaAdicion',
        'ultimaLectura'
    ];

    return requiredKeys.every(key => obj.hasOwnProperty(key));
}