let random = false;
let randomIndex;
document.getElementById('getRandomManga').addEventListener('click', () => {
    randomIndex = Math.floor(Math.random() * mangaList.length);
    random = true;
    cargarMangas([mangaList[randomIndex]]);
})
document.getElementById('stopRandomManga').addEventListener('click', ()=>{
    random = false;
    cargarMangas(mangaList);
})