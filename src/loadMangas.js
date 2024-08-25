// Function to handle image loading errors
function handleImageError(event) {
    const imgElement = event.target;
    imgElement.onerror = null;

    // Apply random image
    imgElement.src = getRandomImage();
}

function getRandomImage() {
    const randomIndex = Math.floor(Math.random() * 4);
    return `../public/logos/${randomIndex}.webp`;
}

// Function to load all mangas from an array
function loadMangas(inputList) {
    const mangaListContainer = document.getElementById('mangaListContainer');
    mangaListContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();

    inputList.forEach((manga) => {
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
        );
        mangaDiv.dataset.title = manga.title;

        mangaDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full overflow-hidden mr-2">
                <img src="${manga.image}" alt="Cover" class="w-full h-full object-cover">
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

        // Error event listener to images
        const imgElement = mangaDiv.querySelector('img');
        imgElement.addEventListener('error', handleImageError);

        fragment.appendChild(mangaDiv);
    });

    mangaListContainer.appendChild(fragment);
}

// Event delegation for handling manga item interactions
document.getElementById("mangaListContainer").addEventListener("click", (event) => {
    const mangaItem = event.target.closest('.manga-item');
    if (!mangaItem) return;

    const mangaTitle = mangaItem.dataset.title;
    const manga = mangaList.find(m => m.title === mangaTitle);

    if (event.target.id === 'fav') {
        handleFavoriteToggle(manga);
    } else if (event.target.id === 'delete') {
        handleMangaDeletion(manga);
    } else if (event.target.id === 'edit') {
        handleMangaEdition(manga);
    } else if (event.target.id === 'addCap') {
        handleAddChapter(manga);
    }
});
