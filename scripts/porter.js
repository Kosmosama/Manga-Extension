// Attach event listener for the export button in the settings dialog
document.getElementById('export').addEventListener('click', handleFileExport);

// Attach event listener for the import area in the settings dialog
document.getElementById('import').addEventListener('change', handleFileImport);

/**
 * Handles the file export by converting the manga list into a JSON file
 * and triggering a download in the browser.
 */
function handleFileExport() {
    const date = new Date().toLocaleString();
    const filename = `mangas_${date}.json`;
    const json = JSON.stringify(mangaList, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Handles the file import event, reads the selected file, and processes it
 * if it is a valid JSON file.
 * 
 * @param {Event} event - The file input change event containing the selected file.
 */
function handleFileImport(event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = handleFileLoad;
        reader.readAsText(file);
    } else {
        //#TODO Create modal to say non valid file type or something like that
        console.error('Not a JSON file.');
    }
}

/**
 * Processes the loaded file, parses the JSON, validates its contents, 
 * and appends the valid mangas to the current list.
 * 
 * @param {ProgressEvent<FileReader>} event - The file load event containing the file data.
 */
function handleFileLoad(event) {
    try {
        const importedMangas = JSON.parse(event.target.result);
        if (Array.isArray(importedMangas) && importedMangas.every(validateMangaObject)) {
            mangaList.push(...importedMangas);
            console.log('Imported mangas:', importedMangas);
            console.log('Current mangas array:', mangaList);
            mangaList.sort((a, b) => new Date(a.dayAdded) - new Date(b.dayAdded));

            refreshAndSaveMangas();   
        } else {
            //#TODO Create modal to say non valid file or something like that
            console.error('The file does not contain a valid mangas array.');
        }
    } catch (error) {
        //#TODO Create modal to say that an error occurred or something like that
        console.error('Error parsing JSON:', error);
    }
}

/**
 * Validates that the given object contains all the required keys for a manga entry.
 * 
 * @param {Object} obj - The object to validate.
 * @returns {boolean} - Returns `true` if the object has all required manga keys, `false` otherwise.
 */
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