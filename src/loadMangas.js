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
            'flex',
            'flex-col',
            'sm:flex-row',
            'items-start',
            'sm:items-center',
            'bg-primary-card',
            'dark:bg-primary-card-dark',
            'rounded-lg',
            'p-4',
            'ml-4',
            'shadow-lg',
            'transform',
            'transition-all',
            'hover:scale-[1.02]',
            "manga-item"
        );
        mangaDiv.dataset.title = manga.title;

        mangaDiv.innerHTML = `
            <div class="flex items-center mb-2 sm:mb-0" data-id="43">
                <button class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 mr-2" id="fav">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="fav" class="lucide lucide-star h-4 w-4 ${manga.favorite ? 'fill-yellow-400' : ''}">
                        <polygon id="fav" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span class="sr-only" id="favorite-status">${manga.favorite ? 'Remove from favorites' : 'Add to favorites'}</span>
                </button>
                <div class="relative group" id="image-container">
                    <img id="manga-image" src="${manga.image}" alt="${manga.title}" class="w-16 h-16 rounded-full">
                    <div class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" id="edit">
                        <button class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3" id="edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen h-4 w-4 text-white" id="edit">
                                <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
                            </svg>
                            <span class="sr-only" id="edit">Edit manga</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="flex-grow ml-0 sm:ml-4 mb-2 sm:mb-0" id="manga-details">
                <a href="${manga.link}" class="text-lg font-semibold" id="manga-title" target="_blank">${manga.title}</a>
                <p class="text-sm text-secondary-dates dark:text-secondary-dates-dark flex items-center" id="manga-date">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye h-3 w-3 mr-1" id="eye-icon">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    ${manga.lastRead}
                </p>
            </div>
            <div class="flex items-center space-x-1 ml-0 sm:ml-4" id="chapter-controls">
                <button class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3" id="removeCap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus h-3 w-3" id="removeCap">
                        <path d="M5 12h14"></path>
                    </svg>
                    <span class="sr-only" id="decrease-label">Decrease chapter count</span>
                </button>
                <span class="text-sm font-medium w-16 text-center" id="chapter-count">Ch. ${manga.readChapters}</span>
                <button class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3" id="addCap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus h-3 w-3" id="addCap">
                        <path id="addCap" d="M5 12h14"></path><path d="M12 5v14"></path>
                    </svg>
                    <span class="sr-only" id="increase-label">Increase chapter count</span>
                </button>
                <button class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3" id="delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 h-4 w-4 text-delete-base dark:text-delete-base-dark" id="delete">
                        <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line>
                    </svg>
                    <span class="sr-only" id="delete">Delete manga</span>
                </button>
            </div>
        `;

        // Error event listener to handle image loading errors
        const imgElement = mangaDiv.querySelector('#manga-image');
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
    }else if (event.target.id === 'edit') {
        handleMangaEdition(manga);
    } else if (event.target.id === 'addCap') {
        handleAddChapter(manga);
    }else if (event.target.id === 'removeCap') {
        handleRemoveCap(manga);
    }
});
