document.getElementById('getRandomManga').addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * mangaList.length);
    const randomManga = [mangaList[randomIndex]];

    cargarMangas(randomManga);
})