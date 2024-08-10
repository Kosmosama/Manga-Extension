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
    if (file && file.name.startsWith('mangas_') && file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedMangas = JSON.parse(e.target.result);
                if (Array.isArray(importedMangas)) {
                    mangas.push(...importedMangas);
                    actualizarLista();
                } else {
                    console.error('The file does not contain a valid array.');
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        };
        reader.readAsText(file);
    } else {
        console.error('Please select a valid mangas_*.json file.');
    }
});