function cargarMangas(mangaList) {
    const mangaListContainer = document.getElementById('mangaListContainer');
    mangaListContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();

    mangaList.forEach((manga) => {
        const mangaDiv = document.createElement("div");
        mangaDiv.classList.add(
            'relative',
            'flex',
            'items-center',
            'bg-white',
            'rounded-full',
            'shadow-md',
            'p-2',
            'pr-3',
            'w-full',
            'mb-2',
            'group',
            "manga-item"
        ); // All css classes except "manga-item", which is important for document fragmentation
        mangaDiv.dataset.title = manga.title;

        mangaDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full overflow-hidden mr-2">
                <img src="${manga.image}" alt="Portada" class="w-full h-full object-cover">
            </div>
            <div class="flex-grow">
                <a class="text-xs font-semibold" href="${manga.link}" target="_blank">${manga.title}</a>
                <p class="text-xs text-gray-500">${translate("chapters")} ${manga.readChapters}</p>
            </div>
            <button id="edit">${translate("edit")}</button>
            <button id="delete">${translate("delete")}</button>
            <button id="addCap">${translate("addCap")}</button>
            <div class="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full items-center justify-center ${manga.favorite ? 'flex' : 'hidden group-hover:flex'}">
                <span id="fav" class="text-white text-[0.5rem] font-bold">★</span>
            </div>
        `;
        
        fragment.appendChild(mangaDiv);
    });

    mangaListContainer.appendChild(fragment);
}

document.getElementById("mangaListContainer").addEventListener("click", (event) => {
    const mangaItem = event.target.closest('.manga-item');
    if (!mangaItem) return;

    const mangaTitle = mangaItem.dataset.title;
    const manga = mangaList.find(m => m.title === mangaTitle);

    if (event.target.id === 'fav') {
        const favo = event.target.closest('#fav');
        changeFavorite(favo, manga);
    } else if (event.target.id === 'delete') {
        handleMangaDelete(manga);
    } else if (event.target.id === 'edit') {
        openEditForm(manga);
    } else if (event.target.id === 'addCap') {
        handleAddCapClick(manga);
    }
});



