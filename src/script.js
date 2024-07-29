//ESTO HAY QUE PASARLO A UN ARCHIVO DE AÑADIRMANGA.JS O ALGO ASÍ
let mangaList = [];
let newManga = "";
document.getElementById('addButton').addEventListener('click', function() {
    var dropdown = document.getElementById('dropdown');
    dropdown.classList.toggle('hidden');
});

document.getElementById('loadChapter').addEventListener('click', function() {
    var formContainer = document.getElementById('formContainer');
    formContainer.style.display = 'flex';
    document.getElementById('dropdown').classList.add('hidden');
});

document.getElementById('cancelButton').addEventListener('click', function() {
    var formContainer = document.getElementById('formContainer');
    formContainer.style.display = 'none';
});

document.getElementById('chapterForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;
    // Si haces un console.log acá ves q funciona todo naiz
    const formMangaValues = {
        image: document.getElementById('image').value,
        title: document.getElementById('title').value,
        readChapters: document.getElementById('readChapters').value,
        totalChapters: document.getElementById('totalChapters').value,
        today: dd + '/' + mm + '/' + yyyy

    };
    chrome.storage.sync.set({
        [newManga]: JSON.stringify([...mangaList,formMangaValues].sort((a,b) => a.dd - b.dd ))
    });

    document.getElementById('formContainer').style.display = 'none';
});
