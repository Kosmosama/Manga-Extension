function addEventListeners(selector, event, handler) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element, index) => {
        element.setAttribute('data-index', index);
        element.removeEventListener(event, handler);
        element.addEventListener(event, handler);
    });
}

function observeDOM(callback) {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                callback();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
