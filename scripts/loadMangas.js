// Attach event listener so the blur is initialized when the html is loaded
document.addEventListener('DOMContentLoaded', initializeBlur);

// Attach event listener to handle blur :onScroll:
document.getElementById('scrollContainer').addEventListener('scroll', handleBlur);

/**
 * Handles image loading errors by setting a fallback image depending on the current theme (dark or light mode).
 * 
 * @param {Event} event - The event object containing the target element that triggered the error.
 */
function handleImageError(event) {
    const imgElement = event.target;
    imgElement.onerror = null;

    const isDarkMode = document.documentElement.classList.contains("dark");

    imgElement.src = isDarkMode 
        ? '../public/fallback-images/dark-mode-fallback.svg' 
        : '../public/fallback-images/light-mode-fallback.svg';
}

/**
 * Initializes the bottom blur element based on the length of the manga list.
 * If the list contains more than 3 items, the opacity of the bottom blur is set
 * (removes the 'opacity-0' class) after a short delay.
 */
function initializeBlur(){
    const bottomBlur = document.getElementById('bottomBlur');
    setTimeout(()=>{
        if (mangaList.length > 3){
            bottomBlur.classList.remove('opacity-0')
        }
    },100)
}

/**
 * Updates the opacity of top and bottom blur elements based on the scroll position 
 * of the manga container. It hides the top blur when scrolled to the top and 
 * the bottom blur when scrolled to the bottom.
 */
function handleBlur() {
    const bottomBlur = document.getElementById('bottomBlur');
    const topBlur = document.getElementById('topBlur');
    const mangaListElement = document.getElementById('scrollContainer'); 

    const scrollTop = mangaListElement.scrollTop;
    const scrollHeight = mangaListElement.scrollHeight;
    const fullHeight  = scrollTop + mangaListElement.clientHeight;

    scrollTop === 0 ? topBlur.classList.add('opacity-0') : topBlur.classList.remove('opacity-0');
    fullHeight >= scrollHeight ? bottomBlur.classList.add('opacity-0') :  bottomBlur.classList.remove('opacity-0');
}

/**
 * Dynamically loads a list of manga objects into the DOM and renders them as interactive elements.
 * Each manga item includes controls for favorite, edit, delete, and chapter update actions.
 * 
 * @param {Array<Object>} inputList - An array of manga objects to be loaded.
 */
function loadMangas(inputList, batchSize = 3) {
    const mangaListContainer = document.getElementById('mangaListContainer');
    mangaListContainer.innerHTML = '';
    
    let currentIndex = 0;

    function loadBatch() {
        const fragment = document.createDocumentFragment();
        const endIndex = Math.min(currentIndex + batchSize, inputList.length);

        for (let i = currentIndex; i < endIndex; i++) {
            const manga = inputList[i];
            const mangaDiv = document.createElement("div");
            mangaDiv.classList.add(
                'flex',
                'flex-col',
                'sm:flex-row',
                'items-start',
                'sm:items-center',
                'bg-light-primary',
                'dark:bg-dark-primary',
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
            <div class="flex items-center" data-id="43">
                <button class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 mr-2" id="fav">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="fav" class="lucide transition-colors duration-200 ${manga.favorite ? "hover:fill-light-red" : "hover:fill-yellow-400"} h-4 w-4 ${manga.favorite ? 'fill-yellow-400' : 'fill-transparent'}">
                        <polygon id="fav" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                </button>
            <div class="relative group" id="image-container">
                <img id="manga-image" src="${manga.image}" alt="${manga.title}" class="w-16 h-16 object-cover rounded-full">
                <div class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" id="edit">
                    <button class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3" id="edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen h-4 w-4 text-white" id="edit">
                            <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
                        </svg>
                        <span class="sr-only" id="edit">Edit manga</span>
                    </button>
                </div>
            </div>

            </div>
            <div class="flex-grow ml-0 sm:ml-4 mb-2 sm:mb-0" id="manga-details">
                <a href="${manga.link}" class="group text-lg font-semibold text-wrap flex items-center" id="manga-title" target="_blank">
                    <p title="${manga.title}" class="hover:underline hover:scale-105 transition-transform duration-200">
                        ${manga.title.length < 20 ? manga.title : manga.title.substring(0, 22 - 3) + "..."}
                    </p>
                </a>
                <p class="text-sm text-light-secondary-text dark:text-dark-secondary-text flex items-center" id="manga-date">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye h-3 w-3 mr-1" id="eye-icon">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    ${manga.lastRead}
                </p>
            </div>
            <div class="flex items-center space-x-1 ml-0 sm:ml-4" id="chapter-controls">
                <button class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border hover:text-light-secondary-text dark:hover:text-dark-secondary-text border-light-border dark:border-dark-border hover:bg-light-secondary dark:hover:bg-dark-secondary h-9 rounded-md px-3" id="removeCap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus h-3 w-3" id="removeCap">
                        <path d="M5 12h14"></path>
                    </svg>
                </button>
                <span class="text-sm font-medium w-16 text-center" id="chapter-count">Ch. ${manga.readChapters}</span>
                <button class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border hover:text-light-secondary-text dark:hover:text-dark-secondary-text border-light-border dark:border-dark-border hover:bg-light-secondary dark:hover:bg-dark-secondary h-9 rounded-md px-3" id="addCap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus h-3 w-3" id="addCap">
                        <path id="addCap" d="M5 12h14"></path><path d="M12 5v14"></path>
                    </svg>
                </button>
                <button class="text-light-red hover:text-dark-red inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none h-9 rounded-md px-3" id="delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" id="delete">
                        <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line>
                    </svg>
                </button>
            </div>
        `;
            // Error event listener to handle image loading errors
            const imgElement = mangaDiv.querySelector('#manga-image');
            imgElement.addEventListener('error', handleImageError);

            fragment.appendChild(mangaDiv);
        }

        mangaListContainer.appendChild(fragment);
        currentIndex += batchSize;

        // If there's more to load, schedule the next batch
        if (currentIndex < inputList.length) {
            setTimeout(loadBatch, 0);
        }
    }
    handleBlur();
    // Start loading the first batch
    loadBatch();
}

/**
 * Event delegation for handling manga item interactions such as favorite toggle, deletion, editing, 
 * and chapter update (increase or decrease).
 * 
 * @param {Event} event - The event object triggered by a user interaction.
 */
document.getElementById("mangaListContainer").addEventListener("click", (event) => {
    const mangaItem = event.target.closest('.manga-item');
    if (!mangaItem) return;

    const mangaTitle = mangaItem.dataset.title;
    const manga = mangaList.find(m => m.title === mangaTitle);

    // Traverse up the DOM tree to find the relevant svg button
    let targetElement = event.target;
    
    // Check if the target is a path or child of svg, navigate to the parent svg if necessary
    if (targetElement.tagName === 'path' || targetElement.tagName === 'polygon') {
        targetElement = targetElement.closest('svg');
    }

    switch (targetElement.id) {
        case 'fav':
            handleFavoriteToggle(manga);
            break;
        case 'delete':
            handleMangaDeletion(manga);
            break;
        case 'edit':
            handleMangaEdition(manga);
            break;
        case 'addCap':
            handleChapterUpdate(manga, '+');
            break;
        case 'removeCap':
            handleChapterUpdate(manga, '-');
            break;
    }
});

