document.getElementById('getRandomManga').addEventListener('click', getRandomManga);

// Function to show a random manga (only)
function getRandomManga() {
    randomIndex = Math.floor(Math.random() * mangaList.length);
    loadMangas([mangaList[randomIndex]]);
}