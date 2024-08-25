document.getElementById('export').addEventListener('click', handleFileExport);

function handleFileExport() {
    const date = new Date().toISOString().split('T')[0]; // FormDat: YYYY-MM-DD
    const filename = `mangas_${date}.json`;
    const json = JSON.stringify(mangaList, null, 2);
    const blob = new Blob([json], {type: "application/json"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

document.getElementById('import').addEventListener('change', handleFileImport);

function handleFileImport(event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = handleFileLoad;
        reader.readAsText(file);
    } else {
        console.error('Please select a valid JSON file.');
    }
}

function handleFileLoad(e) {
    try {
        const importedMangas = JSON.parse(e.target.result);
        if (Array.isArray(importedMangas) && importedMangas.every(validateMangaObject)) {
            mangaList.push(...importedMangas);
            console.log('Imported mangas:', importedMangas);
            console.log('Current mangas array:', mangaList);
            mangaList.sort((a, b) => new Date(a.dayAdded) - new Date(b.dayAdded));
            
            refreshAndSaveMangas(); 
            // Might not work and need to go back to:
            // actualizarLista();
            // saveMangas();       
        } else {
            console.error('The file does not contain a valid mangas array.');
        }
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
}

// Comprobation so each pushed manga has these keys
function validateMangaObject(obj) {
    const requiredKeys = [
        'dayAdded',
        'lastRead',
        'favorite',
        'image',
        'link',
        'readChapters',
        'title',
    ];

    return requiredKeys.every(key => obj.hasOwnProperty(key));
}