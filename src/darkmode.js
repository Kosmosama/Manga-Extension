document.getElementById('darkmode').addEventListener('change', function(event) {
    handleDarkMode(event.target.checked);
    saveCheckbox(event.target.checked);
});
loadCheckbox();

function handleDarkMode(isChecked) {
    const html = document.querySelector('html');
    if (isChecked) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
}

function saveCheckbox(isChecked) {
    chrome.storage.local.set({ darkmode: isChecked });
}

function loadCheckbox() {
    chrome.storage.local.get('darkmode', function(result) {
        const isChecked = result.darkmode;
        document.getElementById('darkmode').checked = isChecked;
        handleDarkMode(isChecked);
    });
}
