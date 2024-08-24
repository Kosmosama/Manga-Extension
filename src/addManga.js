const date = new Date().toISOString();

// Button to show form
document.getElementById('addButton').addEventListener('click', showAddForm);

function showAddForm() {
    const addFormContainer = document.getElementById('formContainer');
    addFormContainer.style.display = 'flex';
}

// Button to hide form
document.getElementById('cancelButton').addEventListener('click', resetAddForm);

function hideAddForm() {
    const addFormContainer = document.getElementById('formContainer');
    addFormContainer.style.display = 'none';
}

function resetAddForm() {
    resetFormValues();
    hideAddForm();
}

function resetFormValues() {
    document.getElementById('image').value = '';
    document.getElementById('title').value = '';
    document.getElementById('link').value = '';
    document.getElementById('readChapters').value = '';
    document.getElementById('favorite').checked = false;
}

// Button to submit form
document.getElementById('chapterForm').addEventListener('submit', function(event) {
    event.preventDefault();
    addNewManga();
});

function addNewManga() {
    let image = document.getElementById('image').value.trim();   
    const title = document.getElementById('title').value.trim();
    const link = document.getElementById('link').value.trim();
    const readChapters = parseInt(document.getElementById('readChapters').value.trim(), 10);
    const favorite = document.getElementById('favorite').checked;
    const dayAdded = date;
    const lastRead = date;

    image = imageExists({ value: image }) ? image : getRandomImage(); 
    
    if (isNameUsed(title)){
        showModal("All the titles must be unique"); //#TODO Translate
        return;
    }
    if (title && link && !isNaN(readChapters) && readChapters >= 0) {
        const newManga = {
            image: image,
            title: title,
            link: link,
            readChapters: readChapters,
            dayAdded: dayAdded,
            lastRead: lastRead,
            favorite: favorite
        };

        mangaList.push(newManga);
        resetAddForm();
        refreshAndSaveMangas();
    } else {
        showModal("Todos los campos son necesarios y el número de capítulos debe ser un número válido."); //#TODO Translate
    }
}

function getRandomImage() {
    const randomIndex = Math.floor(Math.random() * 4);
    return `../public/logos/${randomIndex}.webp`;
}
function imageExists(input){
    const img = new Image();
    img.src = input.value;
    return img.complete && img.naturalHeight !== 0;
};