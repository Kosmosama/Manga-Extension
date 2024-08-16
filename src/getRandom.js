let random = false;
let randomIndex;

// Function to show a random manga (only)
function getRandomManga() {
    randomIndex = Math.floor(Math.random() * mangaList.length);
    random = true;
    cargarMangas([mangaList[randomIndex]]);
}

// Function to stop random manga mode
function stopRandomManga() {
    random = false;
    cargarMangas(mangaList);
}

document.getElementById('getRandomManga').addEventListener('click', getRandomManga);
document.getElementById('stopRandomManga').addEventListener('click', stopRandomManga);